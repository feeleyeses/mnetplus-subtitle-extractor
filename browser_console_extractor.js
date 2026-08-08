/*
 * Mnet Plus Browser Console Subtitle Extractor
 * Personal learning / research use only.
 *
 * Usage:
 * 1. Open the target Mnet Plus video page and make sure you are logged in.
 * 2. Open DevTools -> Console.
 * 3. Paste this whole script and press Enter.
 * 4. It downloads ko, en, zh_CN SRT files.
 */
(async () => {
  const API_BASE = 'https://api.mnetplus.world/media/v1/public';
  const wantedLangs = ['ko', 'en', 'zh_CN'];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function getCookie(name) {
    const prefix = `${name}=`;
    for (const part of document.cookie.split(';')) {
      const item = part.trim();
      if (item.startsWith(prefix)) return decodeURIComponent(item.slice(prefix.length));
    }
    return null;
  }

  function getVideoId() {
    const m = location.pathname.match(/\/videos\/([0-9a-fA-F]{24})(?:\/|$)/);
    if (!m) throw new Error('Could not find a Mnet Plus video ID in this page URL.');
    return m[1].toLowerCase();
  }

  const localePath = location.pathname.match(/\/media\/([^/]+)\/videos\//)?.[1] || 'en';
  const localeMap = {
    'zh-CN': ['zh', 'CN'],
    'zh-TW': ['zh', 'TW'],
    'ko': ['ko', 'KR'],
    'ja': ['ja', 'JP'],
    'en': ['en', 'US'],
  };
  const [langCode, countryCode] = localeMap[localePath] || ['en', 'US'];

  const deviceId = getCookie('mnet-unique-id') || crypto.randomUUID();
  const browserName = getCookie('mnet-browser-name') || 'Chrome';
  const accessToken = getCookie('_mnet_atk');

  if (!accessToken) {
    throw new Error(
      'No Mnet Plus access token (_mnet_atk) was found. Please log in to Mnet Plus in this browser, refresh this video page, and run the script again.'
    );
  }

  const commonHeaders = {
    'Accept': '*/*',
    'X-Lang-Country': `${langCode}:${countryCode}`,
    'X-User-Agent': `${langCode}:${countryCode}::WEB:${browserName}:::${deviceId}`,
    'Authorization': `Bearer ${accessToken}`,
  };

  async function apiGet(url, retries = 3) {
    let last;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: commonHeaders,
          cache: 'no-store',
          credentials: 'include',
        });
        if (!res.ok) {
          let body = '';
          try { body = await res.text(); } catch {}
          throw new Error(`HTTP ${res.status} ${res.statusText}${body ? `\n${body.slice(0, 500)}` : ''}`);
        }
        return await res.json();
      } catch (e) {
        last = e;
        if (i + 1 < retries) await sleep(700 * (i + 1));
      }
    }
    throw last;
  }

  function srtTime(seconds) {
    const msTotal = Math.max(0, Math.round(Number(seconds) * 1000));
    const h = Math.floor(msTotal / 3600000);
    const m = Math.floor((msTotal % 3600000) / 60000);
    const s = Math.floor((msTotal % 60000) / 1000);
    const ms = msTotal % 1000;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  function toSrt(cues) {
    return cues.map((cue, i) => {
      const end = cue.start + Math.max(cue.duration, 0.001);
      return `${i + 1}\n${srtTime(cue.start)} --> ${srtTime(end)}\n${cue.text}`;
    }).join('\n\n') + '\n';
  }

  function safeName(name) {
    return (name || 'mnetplus-video')
      .replace(/[\\/:*?"<>|]+/g, '_')
      .replace(/[. ]+$/g, '')
      .slice(0, 120) || 'mnetplus-video';
  }

  function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'application/x-subrip;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  const videoId = getVideoId();
  console.log('[Mnet Plus Subs] Reading video metadata...');
  const info = await apiGet(`${API_BASE}/guests/videos/${videoId}`);
  const caption = info.videoCaption || {};
  const captionId = caption.videoCaptionId;
  if (!captionId) throw new Error('This video does not expose videoCaptionId.');

  const configs = Array.isArray(caption.languageConfigs) ? caption.languageConfigs : [];
  const available = new Set(configs.map((x) => x.language));
  const durationSec = Math.max(1, Math.ceil(Number(info.videoLength || 0) / 1000));
  const baseName = safeName(info.name || videoId);

  console.log('[Mnet Plus Subs] Title:', info.name || videoId);
  console.table(configs.map((x) => ({ language: x.language, label: x.languageLabel, ai: x.aiGeneratedLabel || '' })));

  for (const language of wantedLangs) {
    if (!available.has(language)) {
      console.warn(`[Mnet Plus Subs] ${language} is not available; skipping.`);
      continue;
    }

    console.log(`[Mnet Plus Subs] Downloading ${language}...`);
    const map = new Map();
    let interval = 15;

    for (let second = 0; second <= durationSec + interval; second += interval) {
      const q = new URLSearchParams({ language, displaySecond: String(second) });
      const payload = await apiGet(`${API_BASE}/videos/${videoId}/captions/${captionId}/cues?${q}`);
      const returnedInterval = Number(payload.captionIntervalSecond);
      if (Number.isFinite(returnedInterval) && returnedInterval > 0) interval = returnedInterval;

      const contentMap = payload.contentMap || {};
      for (const item of Object.values(contentMap)) {
        if (!item || item.content == null) continue;
        const start = Number(item.displaySecond);
        const duration = Number(item.displayDurationSecond);
        const text = String(item.content).trim();
        if (!Number.isFinite(start) || !Number.isFinite(duration) || !text) continue;
        map.set(`${start}\u0000${text}`, { start, duration, text });
      }

      if (second % 150 === 0) {
        console.log(`[Mnet Plus Subs] ${language}: ${Math.min(second, durationSec)}/${durationSec}s, ${map.size} cues`);
      }
    }

    const cues = [...map.values()].sort((a, b) => a.start - b.start || a.duration - b.duration || a.text.localeCompare(b.text));
    const filename = `${baseName}.${language}.srt`;
    downloadText(filename, toSrt(cues));
    console.log(`[Mnet Plus Subs] Saved ${cues.length} cues -> ${filename}`);
    await sleep(600);
  }

  console.log('[Mnet Plus Subs] Done. Check your browser Downloads folder.');
})().catch((err) => {
  console.error('[Mnet Plus Subs] FAILED:', err);
  alert(`Mnet Plus subtitle download failed:\n\n${err?.message || err}`);
});
