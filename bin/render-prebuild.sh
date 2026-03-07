#!/bin/bash
set -e

echo "🔧 Render pre-build: Creating bunx wrapper..."

# Real bun binary location
REAL_BUN="/home/render/.bun/bin/bun"
echo "Real bun binary at: $REAL_BUN"

# Create bin directory if needed
mkdir -p ~/bin

# Create wrapper script (not symlink)
cat > ~/bin/bunx << EOF
#!/bin/bash
exec $REAL_BUN x "\$@"
EOF

# Make it executable
chmod +x ~/bin/bunx

echo "Created wrapper script at: ~/bin/bunx"
echo "Wrapper contents:"
cat ~/bin/bunx

# Add to PATH
export PATH="$HOME/bin:$PATH"
echo "PATH is now: $PATH"

# Verify
echo "Testing bunx wrapper:"
bunx --version

# Execute main build
exec "$@"