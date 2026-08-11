# Mnet Plus Subtitle Downloader v1.0.0

First stable public release.

## Highlights

- Automatically detects subtitle tracks available for the current Mnet Plus video.
- Supports both official and AI-generated subtitle tracks.
- Exports selected tracks as standard UTF-8 `.srt` files.
- Supports generating multiple subtitle tracks in one session.
- Keeps generated subtitles in temporary tab-local cache until the user saves or clears them.
- Supports individual save, multi-select save, multi-select delete, and clear-all.
- Keeps prepared subtitles available if a browser/system Save As dialog is cancelled.
- Clears temporary subtitle cache when switching to another Mnet Plus video.
- English and Simplified Chinese popup interface.
- First-run language selection based on Chrome UI language (`zh-CN` → Simplified Chinese, all other UI languages → English).
- Manual language preference is remembered locally.
- Localized subtitle-language labels in the popup.
- Fallback content-script injection when the popup cannot reach an already-open Mnet Plus tab after extension reload.
- Concept C extension identity: subtitle bubble + `CC` + `//`, intentionally distinct from the official Mnet Plus logo.

## Privacy and permissions

The extension does not operate a developer-owned backend and does not send subtitle contents, authentication credentials, or browsing history to the developer.

Requested extension permissions:

- `activeTab` — communicate with the Mnet Plus video tab opened by the user.
- `storage` — remember only the selected interface language.
- `scripting` — inject the local content script as a fallback if Chrome has not attached it to an already-open supported tab after an extension reload.

Host access is limited to Mnet Plus web and API domains used by the extension.

## Scope

This extension exports subtitle tracks already available to the signed-in user. It does not download video streams and does not bypass DRM, subscriptions, paywalls, geographic restrictions, or other access controls.

This is an unofficial project and is not affiliated with, endorsed by, or sponsored by Mnet Plus or CJ ENM.

## Installation

Until a Chrome Web Store version is available:

1. Download the v1.0.0 extension ZIP.
2. Extract it to a permanent folder.
3. Open `chrome://extensions/`.
4. Enable **Developer mode**.
5. Choose **Load unpacked**.
6. Select the extracted folder containing `manifest.json`.

## Release package

The Chrome-ready ZIP should contain `manifest.json` at the root, along with `popup.html`, `popup.js`, `content.js`, and the `icons/` directory.

See `CHANGELOG.md`, `PRIVACY.md`, and `docs/CHROME_WEB_STORE_LISTING.md` for additional release and store information.
