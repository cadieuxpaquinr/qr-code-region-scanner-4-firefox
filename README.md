# QR Region Scanner

A Firefox extension that scans a QR code from a region you select on the current page
and opens its URL in a new tab.

## Usage

1. Press the keyboard shortcut (default `Ctrl+Shift+Y`) or click the toolbar button.
2. Drag a rectangle over the QR code on the page. Press `Escape` to cancel.
3. The extension decodes the QR code and:
   - opens the value in a new tab if it is an `http`/`https` URL, or
   - copies the value to the clipboard and shows a notification otherwise.

If no QR code is found in the selection, a notification says so.

## Settings

Open the extension's options (Add-ons page, gear menu, Preferences) to change the shortcut.
You can also change it from the Add-ons page gear menu, Manage Extension Shortcuts.

## Install (temporary)

1. Open `about:debugging` in Firefox.
2. Choose "This Firefox", then "Load Temporary Add-on".
3. Select the `manifest.json` file in this folder.

## Permissions

- `activeTab`: capture and scan only the current tab when you trigger a scan.
- `notifications`: report results and errors.
- `clipboardWrite`: copy non-URL codes to the clipboard.

## Limitation

A Firefox extension can only screenshot the visible content of the current web page.
It cannot capture the browser's own interface, other windows, or the desktop.

## Credits

Uses [jsQR](https://github.com/cozmo/jsQR) (MIT) for decoding, vendored in `vendor/jsqr.js`.
