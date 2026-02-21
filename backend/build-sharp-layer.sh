#!/bin/bash
set -e

echo "🔧 Enabling ARM64 emulation..."
docker run --privileged --rm tonistiigi/binfmt --install arm64

echo "🧹 Cleaning previous build..."
sudo rm -rf sharp-layer sharp-layer-arm64.zip
mkdir -p sharp-layer/nodejs

echo "📦 Building Sharp for linux/arm64..."
docker run --rm \
  --platform linux/arm64 \
  -v "$PWD/sharp-layer/nodejs:/nodejs" \
  node:24-slim \
  bash -c "
    apt-get update -qq &&
    apt-get install -y -qq python3 make g++ &&
    cd /nodejs &&
    npm init -y &&
    npm install sharp &&
    chmod -R 755 /nodejs &&
    echo '✅ Installed packages:' &&
    ls node_modules/
  "

echo "🔍 Verifying sharp..."
if [ ! -d "sharp-layer/nodejs/node_modules/sharp" ]; then
  echo "❌ Sharp not found — build failed"
  exit 1
fi

echo "🗜️ Creating zip..."
cd sharp-layer
zip -r ../sharp-layer-arm64.zip nodejs/
cd ..

rm -rf sharp-layer

echo ""
echo "✅ Build complete!"
echo "📦 Size: $(du -sh sharp-layer-arm64.zip | cut -f1)"
echo ""
echo "📋 Installed packages:"
ls sharp-layer/nodejs/node_modules/