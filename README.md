# QR Region Scanner

A Firefox extension that scans a QR code from a region you select on the current page
and opens its URL in a new tab.

## Usage

1. Press the keyboard shortcut (default `Ctrl+1`, or `Alt+1` on Windows), or click the toolbar button
   and choose "Scan a region".
2. Drag a rectangle over the QR code. Press `Escape` to cancel.
3. The extension decodes the QR code and:
   - opens the value in a new tab if it is an `http`/`https` URL, or
   - copies the value to the clipboard and shows a notification otherwise.

If no QR code is found in the selection, a notification says so.

On regular web pages the selection is drawn directly over the page. On pages Firefox does not let
extensions draw on (its built-in PDF viewer, reader mode, and similar), the extension screenshots
the tab and opens a small window where you make the same selection on the captured image.

## Settings

Click the toolbar button and choose "Settings". The same page opens from the Add-ons
page, gear menu, Preferences. It has two sections:

- **Scanner**: change the scan shortcut, or turn it off.
- **Appearance**: follow the system light or dark theme, or force one of them.

To turn the shortcut off without opening the settings, tick "Disable shortcut" in the
toolbar menu. This releases the key combination, so Firefox and other add-ons can use
it. Unticking gives you the same combination back, not the default.

You can also change the shortcut from the Add-ons page gear menu, Manage Extension
Shortcuts.

## Install (temporary)

1. Open `about:debugging` in Firefox.
2. Choose "This Firefox", then "Load Temporary Add-on".
3. Select the `manifest.json` file in this folder.

This add-on is currently under review on
[addons.mozilla.org](https://addons.mozilla.org/) (Firefox Add-ons). Once approved,
you will be able to install it from there like any other Firefox add-on, with
automatic updates.

## Permissions

- `activeTab`: capture and scan only the current tab when you trigger a scan.
- `notifications`: report results and errors.
- `clipboardWrite`: copy non-URL codes to the clipboard.
- `storage`: remember the theme choice and the shortcut you had before disabling it.

## Limitation

A Firefox extension can only screenshot the visible content of the current tab.
It cannot capture the browser's own interface, other windows, or the desktop.
A few fully privileged pages (`about:` pages and addons.mozilla.org) cannot be captured at all;
scanning there reports "This page cannot be captured."

## Report a bug

Found a problem? Please
[open an issue on GitHub](https://github.com/cadieuxpaquinr/qr-code-region-scanner-4-firefox/issues).

## Roadmap

This add-on targets Firefox only. There is no intention of porting it to Chrome,
Edge, Safari, or any other browser.

## Support

Please do not buy me a coffee. If this add-on is useful to you, donate to the
[Mozilla Foundation](https://www.mozillafoundation.org/en/?form=donate-header) instead.

## Credits

Uses [jsQR](https://github.com/cozmo/jsQR) (MIT) for decoding, vendored in `vendor/jsqr.js`.
