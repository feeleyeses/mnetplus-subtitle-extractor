# Privacy Policy

[简体中文](PRIVACY.zh-CN.md)

Mnet Plus Subtitle Downloader is an unofficial browser extension that exports subtitle tracks already available to the signed-in user on Mnet Plus.

## Data handling

The extension does not operate a developer-owned backend service and does not send user data to the developer.

During normal use, the extension may access information already present in the current Mnet Plus browser session only as needed to request subtitle data from Mnet Plus services. This may include session authentication information used by the Mnet Plus website itself.

The extension does **not**:

- ask the user to manually copy or upload cookies;
- ask the user to manually copy or upload authorization tokens;
- ask the user to upload HAR files;
- send authentication credentials to the developer;
- send browsing history to the developer;
- send subtitle contents to the developer;
- sell, share, or monetize user data;
- build a remote subtitle archive.

## Local storage

The extension currently stores only the selected interface language in `chrome.storage.local`.

Generated subtitle files are temporarily stored in the current video tab's page memory until the tab is refreshed or closed, the browser is closed, or the tab switches to another Mnet Plus video. Subtitle files are saved to the user's device only when the user explicitly requests a save action.

## Network requests

Subtitle-related network requests are made to Mnet Plus services required for the current video's metadata and subtitle data. The extension does not proxy those requests through a developer-operated server.

## Permissions

The extension requests only permissions needed for its current functionality, including access to the active Mnet Plus tab, local preference storage, file download/save behavior, and script injection fallback for supported Mnet Plus pages.

## Third-party services

Mnet Plus and related services are operated by their respective owners. Their own privacy policies and terms apply independently of this project.

## Changes

If the extension's data handling changes in a future version, this policy will be updated accordingly.

## Contact

For privacy questions or bug reports, please use the GitHub repository issue tracker.
