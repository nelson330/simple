#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PDF_PATH="$SCRIPT_DIR/catalogo-simple-21-paginas.pdf"
OUTPUT_DIR="$SCRIPT_DIR/revista-pages"

mkdir -p "$OUTPUT_DIR"
pdftoppm \
  -jpeg \
  -r 120 \
  -jpegopt quality=86,optimize=y,progressive=y \
  "$PDF_PATH" \
  "$OUTPUT_DIR/page"

echo "Revista regenerada desde: $PDF_PATH"
