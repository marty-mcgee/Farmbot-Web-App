#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper..."

# Real bun binary location
REAL_BUN="/home/render/.bun/bin/bun"
echo "Real bun binary at: $REAL_BUN"

# ONLY use home directory (writable)
mkdir -p ~/bin
WRAPPER_PATH="$HOME/bin/bunx"

# Create wrapper script in HOME (not /opt/render/bin)
cat > "$WRAPPER_PATH" << 'EOF'
#!/bin/bash
exec /home/render/.bun/bin/bun x "$@"
EOF

# Make it executable
chmod +x "$WRAPPER_PATH"

# Add home bin to PATH
export PATH="$HOME/bin:$PATH"

# Verify
echo "✅ bunx wrapper created at: $(which bunx)"
echo "✅ bunx version: $(bunx --version)"

# Execute main build
exec "$@"