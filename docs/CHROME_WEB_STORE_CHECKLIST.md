# Chrome Web Store release checklist

This document is a release-preparation checklist for **Mnet Plus Subtitle Downloader**.

## Single purpose

**Single purpose statement**

> Export subtitle tracks that are already available to the signed-in user on Mnet Plus as standard SRT files.

Keep this wording narrow. The extension does not download video, bypass access controls, archive subtitles remotely, or add unrelated browser features.

## Manifest permissions

Current permissions:

- `activeTab` — lets the popup interact with the currently active Mnet Plus video tab after the user invokes the extension.
- `storage` — stores only the user's interface-language preference (`English` or `简体中文`).
- `scripting` — provides a fallback that injects the packaged `content.js` into the active supported Mnet Plus page when the normal content-script connection is missing.

Current host permissions:

- `https://mnetplus.world/*` — required for supported Mnet Plus video pages.
- `https://api.mnetplus.world/*` — required for Mnet Plus metadata and subtitle requests used by the current video.

Do not add broader permissions unless a shipped feature genuinely requires them.

## Privacy practices

Use [PRIVACY.md](../PRIVACY.md) as the public privacy policy.

Dashboard disclosures should remain consistent with actual behavior:

- no developer-operated backend;
- no analytics or advertising SDK;
- no sale or sharing of user data;
- no remote subtitle archive;
- authentication/session data is used only within the browser to request Mnet Plus resources the user can already access;
- subtitle contents are not sent to the developer;
- the only extension preference stored with `chrome.storage.local` is interface language.

If behavior changes, update both the extension and privacy disclosures before publishing an update.

## Store listing copy

### Name

`Mnet Plus Subtitle Downloader`

### Short description

`Simple subtitle export for Mnet Plus.`

### Suggested detailed description

Mnet Plus Subtitle Downloader exports subtitle tracks already available on the current Mnet Plus video as standard UTF-8 SRT files.

The extension automatically detects the subtitle languages provided by each video, including official and AI-generated tracks when available. Select one or more tracks, generate them locally in the current tab, then save them individually or in a batch.

Key features:

- Detects subtitle tracks available for the current video.
- Supports official and AI-generated subtitle tracks.
- Exports standard UTF-8 SRT files.
- Supports English and Simplified Chinese interface languages.
- Keeps generated subtitle resources temporarily in the current tab so a cancelled Save As dialog does not force regeneration.
- Does not download video streams or bypass DRM, subscriptions, geographic restrictions, or other access controls.
- Does not require users to copy cookies, authorization tokens, or HAR files.

This is an unofficial project and is not affiliated with, endorsed by, or sponsored by Mnet Plus or CJ ENM.

## Required visual assets

Before submission, prepare the following using the approved **Concept C** identity only:

- 128×128 extension icon inside the packaged extension;
- at least one store screenshot showing the real extension UI;
- small promotional image required by the current Chrome Web Store listing form;
- optional larger promotional assets if desired later.

Do not use the Mnet Plus official logo as the extension icon or imply official affiliation.

For the 128×128 icon, follow Chrome Web Store guidance and keep sufficient transparent padding around the actual mark.

## Package review

Before creating the store ZIP:

1. Confirm the extension loads without errors from `chrome://extensions/`.
2. Test at least one English Mnet Plus URL and one `zh-CN` URL.
3. Verify first-run UI language behavior:
   - Chrome UI `zh-CN` → Simplified Chinese;
   - all other Chrome UI languages → English.
4. Verify manual language selection persists.
5. Verify available subtitle tracks are detected dynamically.
6. Generate and save at least one official track and one AI-generated track when available.
7. Verify a cancelled Save As dialog does not remove the prepared subtitle.
8. Verify refresh/tab close/video switch clears temporary subtitle cache as documented.
9. Confirm no remote scripts, `eval`, or remotely hosted executable logic are used.
10. Confirm the ZIP contains only files required for the extension release.

## Submission order

1. Register/verify the Chrome Web Store developer account.
2. Create a release ZIP containing the extension files only.
3. Upload the ZIP as a new item.
4. Complete Store Listing fields.
5. Complete Privacy practices, single-purpose statement, and permission justifications.
6. Upload required images.
7. Choose distribution settings.
8. Submit for review.

## Final consistency check

The following must tell the same story:

- actual extension behavior;
- `manifest.json` permissions;
- Store Listing description;
- Privacy practices dashboard answers;
- `PRIVACY.md`;
- README usage and limitation notes.

Any contradiction can slow review or cause rejection.
