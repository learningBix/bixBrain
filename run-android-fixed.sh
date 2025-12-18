#!/bin/bash

# Build and install the app (without launching due to package name issue)
echo "Building and installing Android app..."
npx react-native run-android 2>/dev/null || true

# Launch the app with correct package name
echo "Launching app with correct package name..."
adb shell am start -n com.bixbrain/com.bixbrain.MainActivity -a android.intent.action.MAIN -c android.intent.category.LAUNCHER

echo "App launched successfully!"
