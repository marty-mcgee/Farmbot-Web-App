#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper in /tmp/bin..."

# Use /tmp which is definitely writable
mkdir -p /tmp/bin
WRAPPER_PATH="/tmp/bin/bunx"

# Real bun binary
REAL_BUN="/home/render/.bun/bin/bun"
echo "Real bun binary at: $REAL_BUN"

# Remove any existing wrapper
rm -f "$WRAPPER_PATH"

# Create the wrapper script
cat > "$WRAPPER_PATH" << 'EOF'
#!/bin/bash
exec /home/render/.bun/bin/bun x "$@"
EOF

# Make it executable
chmod +x "$WRAPPER_PATH"

# Add /tmp/bin to PATH (first)
export PATH="/tmp/bin:$PATH"

# Verify
echo "✅ bunx wrapper created at: $WRAPPER_PATH"
ls -la "$WRAPPER_PATH"
echo "✅ Which bunx: $(which bunx)"
echo "✅ bunx version: $(bunx --version)"

# Execute the main build command
exec "$@"