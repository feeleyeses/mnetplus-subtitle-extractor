# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- English / Simplified Chinese extension interface.
- First-run interface language selection based on Chrome UI language (`zh-CN` → Simplified Chinese, all other UI languages → English).
- Persistent manual language preference using `chrome.storage.local`.
- Fixed **Language** switch in the popup.
- Localized subtitle-language names and AI-generated labels in the extension UI.
- Automatic content-script injection fallback when the popup cannot reach the active Mnet Plus page.
- Support for localized Mnet Plus media routes such as `/media/en/videos/...` and `/media/zh-CN/videos/...`.
- English and Simplified Chinese project documentation.
- English and Simplified Chinese extension-specific documentation.
- Privacy policy and release-preparation documentation.

### Fixed

- Fixed popup connection failures after locally reloading the extension while a Mnet Plus tab was already open.
- Fixed subtitle-track labels remaining in English when the extension interface was switched to Simplified Chinese.
- Improved compatibility with localized Mnet Plus video URLs.

## [0.1.0] - 2026-08-12

### Added

- Chrome extension for Mnet Plus subtitle export.
- Automatic detection of subtitle tracks available for the current video.
- Support for official and AI-generated subtitle tracks.
- Standard UTF-8 SRT export.
- Temporary in-page cache for generated subtitles.
- Individual save, multi-select save, multi-select delete, and clear-all actions.
- Cache reset when switching to another Mnet Plus video.
- Tampermonkey userscript alternative.
- Legacy console, Python, PowerShell, and batch-script research tools.
