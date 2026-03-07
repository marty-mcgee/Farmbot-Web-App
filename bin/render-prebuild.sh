#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper in /var/tmp/bin..."

# Use /var/tmp/bin (always writable)
mkdir -p /var/tmp/bin
WRAPPER_PATH="/var/tmp/bin/bunx"

# Real bun binary
REAL_BUN="/home/render/.bun/bin/bun"
echo "Real bun binary at: $REAL_BUN"

# Create wrapper
cat > "$WRAPPER_PATH" << 'EOF'
#!/bin/bash
exec /home/render/.bun/bin/bun x "$@"
EOF

chmod +x "$WRAPPER_PATH"

# Add to PATH
export PATH="/var/tmp/bin:$PATH"

# Verify
echo "✅ bunx wrapper at: $(which bunx)"
bunx --version

exec "$@"