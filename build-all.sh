#!/bin/bash

echo "🚀 Building iTani Kobs Wallet for all platforms..."

# Build web app
echo "📦 Building web app..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync

# Build Electron apps
echo "🖥️  Building Electron apps..."
npm run build-electron

# Build Android APK
echo "🤖 Building Android APK..."
npx cap build android

# Build iOS IPA (requires macOS)
echo "🍎 Building iOS IPA..."
npx cap build ios

echo "✅ All builds completed!"
echo ""
echo "📁 Generated files:"
echo "  - Web: dist/"
echo "  - Electron: dist-electron/"
echo "  - Android: android/app/build/outputs/apk/"
echo "  - iOS: ios/App/App.xcarchive/ (on macOS)"
echo ""
echo "📋 Next steps:"
echo "  - Test each platform build"
echo "  - Sign and distribute APKs/IPAs"
echo "  - Upload to app stores"