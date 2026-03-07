#!/bin/bash
# bin/render-prebuild.sh
set -e

echo "🔧 Render pre-build: Setting up bunx..."

# Create bin directory if it doesn't exist
mkdir -v -p /opt/render/project/src/bin

# Create bunx symlink pointing to bun
ln -sf $(which bun) /opt/render/project/src/bin/bunx

# Add to PATH for this session
export PATH="/opt/render/project/src/bin:$PATH"

# Verify
echo "✅ bunx is now at: $(which bunx)"
bunx --version

# Execute the main build command passed as arguments
exec "$@"