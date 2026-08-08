#!/usr/bin/env python3
"""Download subtitle cues exposed by Mnet Plus public media APIs and export SRT/JSON.

This utility is intended for personal study/research workflows. It does not
circumvent DRM, authentication, paywalls, or access controls.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

API_BASE = "https://api.mnetplus.world/media/v1/public"
DEFAULT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151 Safari/537.36"
)
VIDEO_ID_RE = re.compile(r"^[0-9a-fA-F]{24}$")


class MnetPlusError(RuntimeError):
    pass


@dataclass(frozen=True)
class Cue:
    start: float
    duration: float
    text: str
    language: str

    @property
    def end(self) -> float:
        return self.start + max(self.duration, 0.001)


def extract_video_id(value: str) -> str:
    value = value.strip()
    if VIDEO_ID_RE.fullmatch(value):
        return value.lower()

    parsed = urllib.parse.urlparse(value)
    parts = [p for p in parsed.path.split("/") if p]
    if "videos" in parts:
        idx = parts.index("videos")
        if idx + 1 < len(parts) and VIDEO_ID_RE.fullmatch(parts[idx + 1]):
            return parts[idx + 1].lower()
    raise MnetPlusError("Could not find a 24-character Mnet Plus video ID in the input.")


def request_json(url: str, *, timeout: float = 20.0, retries: int = 3) -> dict[str, Any]:
    headers = {
        "User-Agent": DEFAULT_UA,
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://mnetplus.world",
        "Referer": "https://mnetplus.world/",
    }
    last_error: Exception | None = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                charset = resp.headers.get_content_charset() or "utf-8"
                return json.loads(resp.read().decode(charset))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
            last_error = exc
            if attempt + 1 < retries:
                time.sleep(0.6 * (attempt + 1))
    raise MnetPlusError(f"Request failed after {retries} attempts: {url}\n{last_error}")


def get_video_info(video_id: str) -> dict[str, Any]:
    return request_json(f"{API_BASE}/guests/videos/{video_id}")


def available_languages(info: dict[str, Any]) -> list[dict[str, Any]]:
    caption = info.get("videoCaption") or {}
    configs = caption.get("languageConfigs") or []
    return [c for c in configs if isinstance(c, dict) and c.get("language")]


def get_caption_id(info: dict[str, Any]) -> str:
    caption = info.get("videoCaption") or {}
    caption_id = caption.get("videoCaptionId")
    if not caption_id:
        raise MnetPlusError("This video does not expose a videoCaptionId in the public video metadata.")
    return str(caption_id)


def get_video_length_seconds(info: dict[str, Any]) -> int:
    value = info.get("videoLength")
    try:
        ms = int(value)
    except (TypeError, ValueError):
        raise MnetPlusError("The public video metadata did not include a valid videoLength.")
    return max(1, (ms + 999) // 1000)


def fetch_cue_window(video_id: str, caption_id: str, language: str, second: int) -> dict[str, Any]:
    query = urllib.parse.urlencode({"language": language, "displaySecond": second})
    url = f"{API_BASE}/videos/{video_id}/captions/{caption_id}/cues?{query}"
    return request_json(url)


def iter_probe_seconds(duration_s: int, interval_s: int) -> Iterable[int]:
    if interval_s <= 0:
        interval_s = 15
    yield from range(0, duration_s + interval_s, interval_s)


def download_language(video_id: str, caption_id: str, language: str, duration_s: int) -> list[Cue]:
    cues: dict[tuple[float, str], Cue] = {}
    interval = 15

    for second in iter_probe_seconds(duration_s, interval):
        payload = fetch_cue_window(video_id, caption_id, language, second)
        try:
            interval = int(payload.get("captionIntervalSecond") or interval)
        except (TypeError, ValueError):
            interval = 15

        content_map = payload.get("contentMap") or {}
        if not isinstance(content_map, dict):
            continue

        for item in content_map.values():
            if not isinstance(item, dict):
                continue
            text = item.get("content")
            if text is None:
                continue
            try:
                start = float(item.get("displaySecond"))
                duration = float(item.get("displayDurationSecond"))
            except (TypeError, ValueError):
                continue
            cue_lang = str(item.get("language") or language)
            cue = Cue(start=start, duration=duration, text=str(text).strip(), language=cue_lang)
            if cue.text:
                cues[(cue.start, cue.text)] = cue

    return sorted(cues.values(), key=lambda c: (c.start, c.end, c.text))


def srt_timestamp(seconds: float) -> str:
    millis = max(0, round(seconds * 1000))
    hours, rem = divmod(millis, 3_600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, ms = divmod(rem, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def to_srt(cues: list[Cue]) -> str:
    blocks: list[str] = []
    for idx, cue in enumerate(cues, 1):
        blocks.append(f"{idx}\n{srt_timestamp(cue.start)} --> {srt_timestamp(cue.end)}\n{cue.text}")
    return "\n\n".join(blocks) + ("\n" if blocks else "")


def safe_filename(name: str) -> str:
    name = re.sub(r"[\\/:*?\"<>|]+", "_", name).strip().strip(".")
    return name[:120] or "mnetplus-video"


def select_languages(configs: list[dict[str, Any]], requested: str) -> list[str]:
    available = [str(c["language"]) for c in configs]
    if requested == "all":
        return available
    wanted = [x.strip() for x in requested.split(",") if x.strip()]
    missing = [x for x in wanted if x not in available]
    if missing:
        raise MnetPlusError(
            f"Unavailable subtitle language(s): {', '.join(missing)}. "
            f"Available: {', '.join(available) or 'none'}"
        )
    return wanted


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Extract subtitle cues exposed by Mnet Plus public video APIs and save them as SRT/JSON."
    )
    p.add_argument("video", help="Mnet Plus video URL or 24-character video ID")
    p.add_argument("--langs", default="all", help="Comma-separated language codes (e.g. ko,en,zh_CN), or 'all'")
    p.add_argument("--out-dir", default="subtitles", help="Output directory (default: subtitles)")
    p.add_argument("--json", action="store_true", help="Also save raw normalized cues as JSON")
    p.add_argument("--list", action="store_true", help="Only list subtitle languages; do not download cues")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        video_id = extract_video_id(args.video)
        info = get_video_info(video_id)
        configs = available_languages(info)
        caption_id = get_caption_id(info)
        duration_s = get_video_length_seconds(info)

        title = str(info.get("name") or video_id)
        print(f"Title: {title}")
        print(f"Video ID: {video_id}")
        print(f"Caption ID: {caption_id}")
        print("Subtitle tracks:")
        for c in configs:
            label = c.get("languageLabel") or c["language"]
            suffix = f" {c.get('aiGeneratedLabel')}" if c.get("aiGeneratedLabel") else ""
            print(f"  {c['language']}: {label}{suffix}")

        if args.list:
            return 0

        langs = select_languages(configs, args.langs)
        out_dir = Path(args.out_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        base = safe_filename(title)

        for lang in langs:
            print(f"Downloading {lang}...", file=sys.stderr)
            cues = download_language(video_id, caption_id, lang, duration_s)
            srt_path = out_dir / f"{base}.{lang}.srt"
            srt_path.write_text(to_srt(cues), encoding="utf-8")
            print(f"Saved {len(cues)} cues -> {srt_path}")

            if args.json:
                json_path = out_dir / f"{base}.{lang}.json"
                json_path.write_text(
                    json.dumps([c.__dict__ for c in cues], ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )
                print(f"Saved JSON -> {json_path}")
        return 0
    except MnetPlusError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
