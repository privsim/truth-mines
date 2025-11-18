#!/bin/bash
# Copy graph data from project root to web/public/ for Vite dev server

echo "Copying graph data to web/public/..."

# Copy dist/ folder
cp -r ../dist public/
echo "✓ Copied dist/"

# Copy nodes/ folder
cp -r ../nodes public/
echo "✓ Copied nodes/"

# Optional: Copy edges/ if needed for direct access
# cp -r ../edges public/
# echo "✓ Copied edges/"

echo ""
echo "Graph data ready for local development!"
echo "Run: npm run dev"
