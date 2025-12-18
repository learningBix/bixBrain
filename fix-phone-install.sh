#!/bin/bash

echo "🔧 Fixing USB Debugging Installation Issue"
echo "=========================================="

# Check if device is connected
echo "📱 Checking connected devices..."
adb devices

echo ""
echo "🗑️  Attempting to uninstall existing app..."
# Try different uninstall methods
adb uninstall com.bixbrain
adb shell pm uninstall com.bixbrain
adb shell pm uninstall --user 0 com.bixbrain

echo ""
echo "🧹 Cleaning build cache..."
cd android
./gradlew clean
cd ..

echo ""
echo "🔨 Building fresh APK..."
cd android
./gradlew assembleDebug
cd ..

echo ""
echo "📦 Installing app on phone..."
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

echo ""
echo "🚀 Launching app..."
adb shell am start -n com.bixbrain/com.bixbrain.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

echo ""
echo "✅ Done! Check your phone for the app."
