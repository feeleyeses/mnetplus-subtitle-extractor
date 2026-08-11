# Mnet Plus Subtitle Downloader

**Simple subtitle export for Mnet Plus.**

Download official and AI-generated subtitle tracks from Mnet Plus videos and export them as standard UTF-8 `.srt` files.

**No cookie copying. No HAR files. No developer tools.**

**Install the extension and start downloading.**

[简体中文](README.zh-CN.md)

> **Recommended: Chrome extension.** The project is not currently published on the Chrome Web Store. For now, install it manually from this repository.

## Features

- Automatically detects the current Mnet Plus video.
- Detects the subtitle tracks actually available for that video instead of using a fixed language list.
- Shows official and AI-generated subtitle tracks.
- English / Simplified Chinese extension interface with automatic first-run language selection based on Chrome UI language.
- Localized subtitle-language names that follow the extension interface language.
- Leaves all subtitle tracks unselected by default.
- Generates one or multiple selected subtitle tracks as SRT.
- De-duplicates and sorts subtitle cues by time.
- Keeps generated subtitle files in temporary in-page cache before saving.
- Supports individual save, multi-select save, multi-select delete, and clear-all.
- If a system Save As dialog is cancelled, the generated subtitle remains available for another save attempt.
- Clears the previous video's temporary cache when switching to another Mnet Plus video.
- Automatically injects its page helper when needed, which makes locally updated builds more reliable on already-open Mnet Plus tabs.

Different videos can expose completely different subtitle sets. One video may provide Korean, English, Japanese, Simplified Chinese and Traditional Chinese, while another may provide only some of them. The extension always follows the subtitle configuration returned for the current video.

---

## Installation

### Option 1 — Load the Chrome extension manually (recommended)

1. On this repository page, choose **Code → Download ZIP**.
2. Extract the ZIP to a permanent folder. Do not delete or move the `extension/` folder after loading it into Chrome.
3. Open:

```text
chrome://extensions/
```

4. Turn on **Developer mode**.
5. Click **Load unpacked**.
6. Select the repository's:

```text
extension/
```

7. Optionally pin **Mnet Plus Subtitle Downloader** to the Chrome toolbar.

When the repository is updated, replace your local extension files and click **Reload** on `chrome://extensions/`.

### Option 2 — Chrome Web Store

**Not currently available.** Whether this project will be published on the Chrome Web Store is still being evaluated.

If a store version is released later, this section will be replaced with the official store link. Manual installation will remain useful for development and testing builds.

---

## Usage

1. Sign in to Mnet Plus normally.
2. Open a Mnet Plus video that your account can normally access.
3. Click **Mnet Plus Subtitle Downloader** in the Chrome toolbar.
4. The extension detects the subtitle tracks available for the current video.
5. Select the language(s) you want. Nothing is selected by default.
6. Click **Generate selected subtitles**.
7. Generated subtitles appear in the **Prepared subtitles** temporary resource area.
8. Save a single subtitle, save multiple selected subtitles, delete selected resources, or clear all temporary resources.

### Interface language

The extension currently supports only:

- English
- 简体中文 (Simplified Chinese)

On first use, a Chrome UI language of `zh-CN` defaults to Simplified Chinese. All other Chrome UI languages default to English. You can always change the interface from the fixed **Language** menu. Once manually changed, the preference is remembered locally.

### Temporary cache

Generating a subtitle and saving it are separate actions. Generated SRT files are temporarily stored in the **current video tab**, so cancelling a browser or system Save As dialog does not require generating the subtitle again.

The cache is cleared when you:

- refresh the current video page;
- close the current tab;
- close the browser; or
- switch the same tab to another Mnet Plus video.

Save any subtitle you want to keep before one of those actions.

---

## What the extension does

During normal use, the extension works only on matching Mnet Plus media pages. It:

- identifies the current video and its subtitle configuration;
- uses the Mnet Plus session already present in your browser to request subtitle data that your account can access;
- converts subtitle cues selected by you into SRT;
- temporarily keeps generated subtitle files in the current video tab; and
- saves an SRT to your computer only when you explicitly choose to save it.

## What the extension does not do

- It does **not** provide, host, or bundle Mnet Plus videos or subtitle files.
- It does **not** download video streams.
- It does **not** bypass DRM, subscriptions, paywalls, geographic restrictions, or other technical access controls.
- It does **not** grant access to content that your account cannot normally access.
- It does **not** require you to manually copy cookies or authorization tokens.
- It does **not** require HAR uploads.
- It does **not** send your authentication credentials to the developer.
- It does **not** build or provide a public subtitle archive.
- It does **not** automatically crawl unrelated videos or bulk-download an entire catalog.

This is an **unofficial project** and is not affiliated with, endorsed by, or sponsored by Mnet Plus or CJ ENM.

---

## Privacy

The extension is designed to minimize the handling and exposure of authentication information.

- You do not need to export HAR files.
- You do not need to manually copy cookies or authorization tokens.
- The extension uses the existing Mnet Plus session in the current browser tab only to communicate with Mnet Plus services required for subtitle retrieval.
- Authentication information, browsing history, and subtitle contents are not sent to the developer or to a developer-operated server.
- Generated subtitle files remain temporary in the current video tab unless you explicitly save them locally.
- The only extension preference currently stored with `chrome.storage.local` is the selected interface language.

See [PRIVACY.md](PRIVACY.md) for the full privacy statement.

Never post screenshots, issue reports, or logs containing cookies, authorization tokens, or other session credentials.

---

## Limitations

- The extension can export only subtitle tracks that Mnet Plus exposes for the current video.
- A video with no available subtitle configuration cannot be exported by this tool.
- Mnet Plus internal web APIs may change and can temporarily break the extension.
- The extension does not download video content.
- Temporary generated subtitles must be saved before their tab cache is cleared.

---

## FAQ

### Why are no subtitles shown?

The current video may not expose subtitle tracks, or Mnet Plus may have changed its internal subtitle API. Confirm that the video itself offers captions first.

### Why does the extension say it cannot detect the page?

Make sure you are on a Mnet Plus video page. If you have just updated the extension locally, reload the extension from `chrome://extensions/` and try again. Current builds can also inject the page helper on demand when a matching tab does not already have it.

### Why did my generated subtitles disappear?

Generated subtitles are temporary resources stored in the current video tab. Refreshing the page, closing the tab or browser, or switching that tab to another Mnet Plus video clears them.

### I cancelled the Save As dialog. Do I need to generate the subtitle again?

No. If the page is still open and the temporary cache has not been cleared, reopen the extension and save the prepared subtitle again.

### Why do different videos show different languages?

Subtitle availability is defined by each Mnet Plus video. The extension does not force a fixed set of languages.

---

## Alternative: Tampermonkey userscript

The repository still includes:

```text
mnetplus_subtitle_downloader.user.js
```

It is a previously validated Tampermonkey implementation that adds a subtitle download entry directly to Mnet Plus video pages. Development focus is now on the Chrome extension, but the userscript remains available as an alternative.

---

## Development / legacy tools

The repository also contains tools created during API research and debugging:

- `browser_console_extractor.js` — DevTools Console version
- `mnetplus_subs.py` — experimental Python CLI
- `download_subtitles.ps1` / `download_subtitles.bat` — experimental Windows launchers

These methods may not reuse the browser's active Mnet Plus session as reliably as the extension, so they are **not recommended for normal users**.

Extension-specific notes are available in `extension/README.md`.

---

## Usage and copyright notice

This project is intended primarily for personal learning, language study, accessibility research, subtitle research, and technical learning.

- Videos, subtitles, programs, trademarks, and related intellectual property belong to their respective rights holders.
- Use the tool only with content you are normally authorized to access.
- Do not use it to create unauthorized subtitle archives, resell subtitle files, or mass-republish protected content.
- You are responsible for ensuring that your use complies with applicable service terms, local law, and third-party rights.
- This project grants no rights to Mnet Plus or other third-party content, programs, subtitles, or trademarks.

## License

Source code in this repository is licensed under the [MIT License](LICENSE). The license applies only to this project's source code and does not grant rights to any third-party content.