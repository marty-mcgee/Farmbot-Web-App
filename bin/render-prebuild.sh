#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper in home directory..."

# Real bun binary
REAL_BUN="/home/render/.bun/bin/bun"
echo "Real bun binary at: $REAL_BUN"

# Use ONLY home/bin (writable)
mkdir -p ~/bin
WRAPPER_PATH="$HOME/bin/bunx"

# Remove any old wrapper
rm -f "$WRAPPER_PATH"

# Create the wrapper script
cat > "$WRAPPER_PATH" << EOF
#!/bin/bash
exec $REAL_BUN x "\$@"
EOF

# Make it executable
chmod +x "$WRAPPER_PATH"

# Add to PATH (home/bin first)
export PATH="$HOME/bin:$PATH"

# Verify
echo "✅ bunx wrapper created at: $(which bunx)"
bunx --version

# Now run the actual build commands passed in
exec "$@"