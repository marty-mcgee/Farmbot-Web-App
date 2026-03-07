#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper in ~/project/src/bin..."

# Use the correct home directory path
PROJECT_BIN="/home/render/project/src/bin"
mkdir -p "$PROJECT_BIN"
WRAPPER_PATH="$PROJECT_BIN/bunx"

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

# Add to PATH
export PATH="$PROJECT_BIN:$PATH"

# Verify
echo "✅ bunx wrapper created at: $WRAPPER_PATH"
ls -la "$WRAPPER_PATH"
echo "✅ Which bunx: $(which bunx)"
echo "✅ bunx version: $(bunx --version)"

# Execute the main build command
exec "$@"