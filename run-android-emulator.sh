#!/bin/bash

# React Native Android Emulator Runner
# This script starts the emulator and runs the React Native app

echo "🚀 Starting Android emulator and React Native app..."

# Kill any existing emulator
echo "📱 Stopping any existing emulator..."
adb emu kill 2>/dev/null || true

# Start emulator with proper settings
echo "📱 Starting emulator with increased storage..."
/Users/nikhilagrawal/Library/Android/sdk/emulator/emulator -avd Medium_Phone_API_35 -memory 4096 -partition-size 8192 -no-snapshot-load &

# Wait for emulator to boot
echo "⏳ Waiting for emulator to boot (this may take 1-2 minutes)..."
sleep 60

# Check if emulator is ready
echo "🔍 Checking if emulator is ready..."
adb wait-for-device

# Clear any existing app installations
echo "🧹 Clearing any existing app installations..."
adb uninstall com.bixbrain 2>/dev/null || true
adb uninstall com.bixapp 2>/dev/null || true

# Clear cache
echo "🧹 Clearing cache..."
adb shell pm trim-caches 999999M

# Run the React Native app
echo "📱 Running React Native app..."
npx react-native run-android

# If the app doesn't launch automatically, launch it manually
echo "🚀 Launching app manually if needed..."
adb shell am start -n com.bixbrain/.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

echo "✅ Setup complete! Your app should be running on the emulator."
