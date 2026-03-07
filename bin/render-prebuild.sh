#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper in /home/render/bin..."

# Use home directory bin (definitely writable)
mkdir -p /home/render/bin
WRAPPER_PATH="/home/render/bin/bunx"

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

# Add home bin to PATH (this is the key line)
export PATH="/home/render/bin:$PATH"

# Verify
echo "✅ bunx wrapper created at: $WRAPPER_PATH"
echo "✅ Current PATH: $PATH"
echo "✅ Which bunx: $(which bunx)"
echo "✅ bunx version: $(bunx --version)"

# Execute the main build command
exec "$@"