# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-08-13

### Added

- Chrome-standard internationalization resources under `_locales/en` and `_locales/zh_CN`.
- Localized extension name, description, and toolbar title through `__MSG_...__` manifest placeholders.
- English and Simplified Chinese locale resources for popup UI copy and subtitle-language labels.

### Changed

- Migrated popup user-facing strings out of the JavaScript source and into Chrome locale resource files.
- Kept the in-extension **Language** menu so users can manually switch between English and Simplified Chinese regardless of Chrome UI language.
- Updated the packaging workflow to validate and include `_locales` in Chrome-ready ZIP artifacts.
- Bumped the extension version to `1.1.0`.

## [1.0.0] - 2026-08-12

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
- Chrome Web Store listing copy and permission justifications.
- v1.0 release checklist.
- Approved original **Concept C** visual identity: subtitle bubble + `CC` + `//`, deliberately distinct from the official Mnet Plus logo.
- Final extension icon assets for 16, 32, 48, and 128 px.

### Changed

- Updated the extension description to **“Simple subtitle export for Mnet Plus.”**
- Reduced extension permissions by removing the unused `downloads` permission.
- Prepared a larger-visual-weight Concept C toolbar icon set for better readability at 16–18 px.
- Updated the extension manifest to version `1.0.0` and wired the final icon assets into both extension and toolbar icon fields.

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
