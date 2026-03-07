#!/bin/bash
set -e

echo "🔧 Render pre-build: Setting up bunx..."

# Real bun binary location (confirmed)
REAL_BUN="/home/render/.bun/bin/bun"
echo "Real bun binary at: $REAL_BUN"

# Create symlink in home bin
mkdir -p ~/bin
TARGET="$HOME/bin/bunx"

# Remove any existing file/symlink
rm -f "$TARGET"

# Create symlink to the REAL bun binary
ln -sf "$REAL_BUN" "$TARGET"
echo "Created symlink: $TARGET -> $REAL_BUN"

# Add home bin to PATH (BEFORE everything else)
export PATH="$HOME/bin:$PATH"
echo "PATH is now: $PATH"

# Verify bunx works with the real binary
echo "Testing bunx:"
bunx --version

# Execute main build command
exec "$@"