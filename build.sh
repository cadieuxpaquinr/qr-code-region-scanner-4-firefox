#!/bin/sh
#
# Packages the extension into an installable/uploadable zip with manifest.json
# at the archive root. There is no compile, transpile, or bundling step: every
# source file is shipped exactly as written. The only third-party file,
# vendor/jsqr.js, is the unmodified jsQR library (see BUILD.md).

set -eu

cd "$(dirname "$0")"

VERSION=$(grep '"version"' manifest.json | head -1 | cut -d'"' -f4)
DIST="web-ext-artifacts"
OUT="$DIST/qr_region_scanner-$VERSION.zip"

FILES="manifest.json background.js content.js scan-core.js \
select.html select.js options.html options.js \
vendor/jsqr.js icons/icon.svg README.md LICENSE"

mkdir -p "$DIST"
[ -f "$OUT" ] && mv "$OUT" "$OUT.prev"

zip -r -X "$OUT" $FILES

echo "Built $OUT"
