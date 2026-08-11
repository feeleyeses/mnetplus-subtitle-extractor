# Chrome Web Store Listing Copy

Use this file as the source of truth when filling the Chrome Web Store Dashboard.

## Product name

**Mnet Plus Subtitle Downloader**

## Short description

**Simple subtitle export for Mnet Plus.**

## Detailed description

Mnet Plus Subtitle Downloader is an unofficial Chrome extension for exporting subtitle tracks already available to the signed-in user on Mnet Plus.

The extension detects the subtitle tracks available for the current video, lets you choose the languages you need, generates standard UTF-8 SRT files, and keeps generated subtitles temporarily available before you save them.

### Features

- Detects the subtitle tracks actually available for the current Mnet Plus video.
- Supports both official and AI-generated subtitle tracks when provided by Mnet Plus.
- Exports selected tracks as standard `.srt` files.
- Supports generating multiple subtitle tracks.
- Supports individual save, multi-select save, multi-select delete, and clear-all.
- Keeps generated subtitles temporarily available in the current video tab, so cancelling a system Save As dialog does not require generating the subtitle again.
- English and Simplified Chinese interface.
- On first use, Simplified Chinese Chrome UI (`zh-CN`) defaults to Simplified Chinese; all other Chrome UI languages default to English.
- Manual language selection is remembered locally.

### Privacy

The extension does not operate a developer-owned backend and does not send your cookies, authorization credentials, browsing history, or subtitle contents to the developer.

The extension uses the Mnet Plus session already present in your browser only to request subtitle data that your account can normally access.

The only extension preference stored with `chrome.storage.local` is the selected interface language.

### Important limitations

- The extension exports subtitles only; it does not download video streams.
- It does not bypass DRM, subscriptions, paywalls, geographic restrictions, or other technical access controls.
- It cannot provide subtitle tracks that Mnet Plus does not expose for the current video.
- Mnet Plus may change its web APIs, which can temporarily affect compatibility.

This is an unofficial project and is not affiliated with, endorsed by, or sponsored by Mnet Plus or CJ ENM.

## Single purpose

**Export subtitle tracks that are already available to the user on the current Mnet Plus video as SRT files.**

## Permission justifications

### `activeTab`

Used to communicate with the active Mnet Plus video tab after the user opens the extension, so the extension can identify the current video and interact with the page context required for subtitle export.

### `storage`

Used only to remember the user's selected interface language (`English` or `Simplified Chinese`).

### `scripting`

Used as a fallback to inject the extension's local `content.js` into a supported Mnet Plus media page if the existing page receiver is missing, for example after the extension is reloaded while an older Mnet Plus tab remains open.

### Host access: `https://mnetplus.world/*`

Required to run and communicate with the extension on supported Mnet Plus media pages.

### Host access: `https://api.mnetplus.world/*`

Required to request video metadata and subtitle cue data from Mnet Plus services for the current video.

## Data-use answers

Use these answers only if the extension behavior remains unchanged.

- Sells user data: **No**
- Uses user data for advertising: **No**
- Uses user data for creditworthiness or lending: **No**
- Transfers user data to unrelated third parties: **No**
- Uses user data for purposes unrelated to the extension's single purpose: **No**
- Developer-operated backend: **No**
- Analytics / tracking: **No**
- Remote code execution: **No**

The extension communicates directly with Mnet Plus services needed to retrieve subtitle data.

## Suggested category

Choose the closest available productivity / tools category in the current Chrome Web Store Dashboard.

## Suggested language support

- English — primary listing language
- Simplified Chinese — localized listing if the Dashboard supports it

## Visual assets

Approved identity: **Concept C**

- subtitle / caption bubble;
- `CC` initials;
- `//` recognition mark;
- black / near-black base;
- hot-pink accent;
- no official Mnet Plus `M` or `M+` logo imitation.

Use real product screenshots for the store listing. Promotional artwork may be stylized, but must not imply that the extension is an official Mnet Plus product.

## Support / contact

Until a separate support site exists, use the GitHub repository and Issue tracker.

## Privacy policy

Use the public URL of the repository's `PRIVACY.md` when submitting the listing, unless a dedicated hosted privacy-policy page is created later.
