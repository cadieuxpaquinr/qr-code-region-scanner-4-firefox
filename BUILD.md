# Build instructions

This add-on has no compilation, transpilation, bundling, or minification step.
Every source file (`background.js`, `content.js`, `scan-core.js`, `select.js`,
`select.html`, `options.js`, `options.html`, `manifest.json`, `icons/icon.svg`)
is plain, hand-written code shipped exactly as-is. "Building" only means zipping
these files with `manifest.json` at the archive root.

## Build environment

- Operating system: any (Linux, macOS, or Windows). Developed and tested on
  Ubuntu Linux.
- Required program: Info-ZIP `zip` 3.0 or later, plus a POSIX shell (`/bin/sh`).
  - Debian/Ubuntu: `sudo apt-get install zip`
  - macOS: `zip` is preinstalled.
  - Windows: use WSL, Git Bash, or install Info-ZIP.
- No Node.js, npm, or network access is required to build the add-on.

## Build steps

From the project root:

```
./build.sh
```

This produces `web-ext-artifacts/qr_region_scanner-<version>.zip`. The files
inside that archive are byte-for-byte the same source files included in this
package. That zip is exactly what is uploaded to AMO.

## Third-party library: jsQR

`vendor/jsqr.js` is the open-source jsQR library (MIT), version 1.4.0, included
unmodified. It is the only bundled/machine-generated file, and it is a
third-party open-source library.

Provenance and verification:

- Project: https://github.com/cozmo/jsQR
- Published distribution: https://unpkg.com/jsqr@1.4.0/dist/jsQR.js
- SHA-256: `bc40c8a15196236b2314db0856f72ca0b49980cd5413b8c852a7349f5fee0859`

Confirm the vendored copy matches the published release:

```
sha256sum vendor/jsqr.js
curl -sSL https://unpkg.com/jsqr@1.4.0/dist/jsQR.js | sha256sum
```

Both commands print the SHA-256 above.

To rebuild jsQR from its own source instead of using the published file:

- Requirements: Node.js 18 LTS or later and npm 9 or later.
- Steps:
  ```
  git clone --branch v1.4.0 --depth 1 https://github.com/cozmo/jsQR
  cd jsQR
  npm ci
  npm run build
  ```
  The result is `dist/jsQR.js`.

## Source repository

https://github.com/cadieuxpaquinr/qr-code-region-scanner-4-firefox
