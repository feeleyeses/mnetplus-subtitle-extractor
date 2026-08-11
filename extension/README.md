# Mnet Plus Subtitle Downloader — Chrome Extension

[简体中文](README.zh-CN.md)

This is the primary Chrome extension maintained by the project. It uses **Manifest V3**.

> Current status: available for manual installation from GitHub. It is **not currently published on the Chrome Web Store**, and store publication is still being evaluated.

## Manual installation

1. Download or clone the full repository.
2. Extract it to a permanent folder and keep the `extension/` directory in place.
3. Open `chrome://extensions/` in Chrome.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select this repository's `extension/` folder.
7. Optionally pin the extension to the Chrome toolbar.

After updating local extension files, click **Reload** on `chrome://extensions/`.

## Interface language

The extension supports:

- English
- 简体中文 (Simplified Chinese)

On first use, Chrome UI language `zh-CN` defaults to Simplified Chinese. Every other Chrome UI language defaults to English. The **Language** button always remains visible in English so users can find the language switch easily. A manual choice is stored locally and reused next time.

Subtitle-language names and AI-generated labels follow the selected interface language.

## Usage

1. Sign in to Mnet Plus normally.
2. Open a Mnet Plus video your account can normally access.
3. Click **Mnet Plus Subtitle Downloader** in the toolbar.
4. The extension reads the subtitle tracks actually available for that video.
5. Nothing is selected by default. Choose the subtitle language(s) you need.
6. Click **Generate selected subtitles**.
7. The extension retrieves, de-duplicates, sorts, and converts subtitle cues to SRT.
8. Generated files appear in the **Prepared subtitles** temporary resource area.
9. Save individually, save multiple selected files, delete selected resources, or clear all.

## Temporary subtitle cache

The extension works with Chrome's **Ask where to save each file before downloading** setting.

Generating and saving are separate actions. If you cancel the system Save As dialog, the generated subtitle remains available as long as the temporary cache still exists.

The cache is cleared when you:

- refresh the current video page;
- close the current tab;
- close the browser; or
- switch the same tab to another Mnet Plus video.

When the video ID changes, the extension also clears the previous video's cache to prevent files from different videos being mixed together.

## Subtitle tracks

The extension does not assume a fixed language list. It reads the current video's subtitle configuration and may show tracks such as `ko`, `en`, `ja`, `zh_CN`, `zh_TW`, `id`, or others depending on that video.

If Mnet Plus marks a track as AI-generated, the extension displays that status. All tracks remain unselected until the user chooses them.

## Reliability fallback

The extension normally uses a content script on Mnet Plus media pages. If the popup cannot reach the active page helper—for example after a local extension reload while the tab was already open—it can inject `content.js` into the supported page and retry automatically.

This requires the Manifest V3 `scripting` permission and is limited to supported Mnet Plus pages.

## Implemented features

- Manifest V3
- Mnet Plus media-page content script
- Browser toolbar popup
- English / Simplified Chinese interface
- Chrome UI language detection on first use
- Persistent manual language preference
- Localized subtitle-language labels
- Automatic video and subtitle-track detection
- AI-generated subtitle labels
- No default subtitle selection
- Multi-track generation
- Progress display
- SRT conversion
- Temporary per-video tab cache
- Individual save
- Multi-select save
- Multi-select delete
- Clear-all with in-popup confirmation
- Re-save after cancelling the system Save As dialog
- Automatic cache cleanup when the video ID changes
- Automatic content-script injection fallback

## Security and boundaries

The extension uses the signed-in Mnet Plus session already present in the browser to request subtitle data for the current video.

It does **not**:

- provide or host video/subtitle content;
- download video streams;
- bypass DRM, subscriptions, paywalls, geographic restrictions, or other access controls;
- grant access to content the user's account cannot normally access;
- ask the user to manually provide cookies, authorization tokens, or HAR files;
- send authentication information to the developer; or
- put authentication information into exported SRT files.

Do not share cookies, authorization tokens, or other session credentials in public issues, screenshots, or logs.

This extension is unofficial and is not affiliated with Mnet Plus or CJ ENM. See the repository root README and `PRIVACY.md` for the full usage, privacy, and copyright notes.

## Chrome Web Store

There is currently no store version. Whether the extension will be published on the Chrome Web Store is still being evaluated.

Before a store release, the project still plans to complete or verify:

- final extension icon assets;
- final Manifest permission review;
- Chrome Web Store listing copy;
- store screenshots and visual assets;
- release ZIP packaging; and
- final privacy disclosure review.

Until then, use the `extension/` directory from this repository as the source of truth.