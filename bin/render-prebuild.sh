#!/bin/bash
set -e

echo "🔧 Render pre-build: Setting up bunx..."

# Find bun location
BUN_PATH=$(which bun)
echo "bun found at: $BUN_PATH"

# Use home directory bin (always writable)
mkdir -p ~/bin
TARGET="$HOME/bin/bunx"

# Remove any existing file and create fresh symlink
rm -f "$TARGET"
ln -sf "$BUN_PATH" "$TARGET"
echo "Created symlink: $TARGET -> $BUN_PATH"

# Add home bin to PATH (BEFORE everything else)
export PATH="$HOME/bin:$PATH"
echo "PATH is now: $PATH"

# Verify bunx works
echo "Testing bunx:"
bunx --version

# Execute main build
exec "$@"