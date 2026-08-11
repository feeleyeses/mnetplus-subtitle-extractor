# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- English / Simplified Chinese extension interface.
- First-run interface language selection based on Chrome UI language.
- Persistent manual language preference using `chrome.storage.local`.
- Localized subtitle language labels in the extension UI.
- Automatic content-script injection fallback when the extension cannot reach the active Mnet Plus page.
- Bilingual project documentation.
- Privacy policy and release-preparation documentation.

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
