# v1.0 Release Checklist

This document tracks the final steps required before publishing **Mnet Plus Subtitle Downloader v1.0.0**.

## Current status

The extension functionality and public documentation are largely ready for a first public release.

Completed:

- Chrome Manifest V3 extension
- Automatic subtitle-track detection per video
- Official / AI-generated track labels
- SRT generation
- Temporary generated-subtitle cache
- Individual save
- Multi-select save
- Multi-select delete
- Clear-all action
- English / Simplified Chinese interface
- First-run language selection based on Chrome UI language
- Manual language preference persistence
- Localized subtitle-language labels
- Localized Mnet Plus URL support
- Content-script injection fallback
- English / Simplified Chinese README files
- Privacy policy
- Contribution guide
- Chrome Web Store preparation notes
- Permission review and removal of the unused `downloads` permission
- Original Concept C visual identity: subtitle bubble + `CC` + `//`

## Required before v1.0.0

### 1. Add the final icon files to GitHub

The final binary PNG files must exist in:

```text
extension/icons/icon16.png
extension/icons/icon32.png
extension/icons/icon48.png
extension/icons/icon128.png
```

Use the approved Concept C toolbar icons with rounded transparent corners and high visual occupancy.

Do not use an `M`, `M+`, play-button mark, or artwork that imitates the official Mnet Plus logo.

### 2. Add icon references to `extension/manifest.json`

After the PNG files are present, add both the top-level `icons` object and `action.default_icon` mappings.

Do not merge icon paths before the files exist in the repository.

### 3. Final manual test

Test at least:

- one `/media/en/videos/...` page;
- one `/media/zh-CN/videos/...` page;
- one video with multiple subtitle tracks;
- English UI;
- Simplified Chinese UI;
- manual language switching;
- subtitle generation;
- individual save;
- multi-select save;
- multi-select delete;
- clear-all;
- cancelling a system Save As dialog and saving again;
- extension reload while an existing Mnet Plus video tab remains open.

### 4. Set release version

When the icon files and final test are complete:

```json
"version": "1.0.0"
```

Move the relevant items from `[Unreleased]` in `CHANGELOG.md` into a dated `[1.0.0]` section.

### 5. Build the release ZIP

The Chrome Web Store ZIP should contain the contents of `extension/` only, with `manifest.json` at the ZIP root.

Do not include:

- repository-level legacy scripts;
- Python tooling;
- PowerShell / batch tooling;
- Git metadata;
- screenshots not used by the extension;
- temporary development files.

### 6. GitHub Release

Create a Git tag and release:

```text
v1.0.0
```

Suggested title:

```text
Mnet Plus Subtitle Downloader v1.0.0
```

Attach the final extension ZIP.

## Chrome Web Store assets

Keep these assets outside the extension runtime package unless specifically needed by the store listing:

- store icon 128×128;
- small promotional tile 440×280;
- real product screenshots;
- optional promotional image.

A real screenshot must show the actual extension UI. Do not submit a mockup as if it were a real product screenshot.

## Privacy / permission boundary

Current requested permissions:

- `activeTab` — interact with the active Mnet Plus page after user action;
- `storage` — remember the selected interface language;
- `scripting` — inject `content.js` as a fallback if the page receiver is missing.

Current host access:

- `https://mnetplus.world/*`
- `https://api.mnetplus.world/*`

The extension has no developer-operated backend and does not send cookies, authorization credentials, browsing history, or subtitle contents to the developer.

## User action required before release

The repository connector used during development cannot reliably upload binary PNG assets. The repository owner must manually upload or commit the approved Concept C PNG icon files before v1.0.0 is finalized.
