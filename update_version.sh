#!/bin/bash

# Update version code and name in build.gradle
sed -i '' 's/versionCode 13/versionCode 15/' android/app/build.gradle
sed -i '' 's/versionName "2.2"/versionName "2.3"/' android/app/build.gradle

echo "Version updated to:"
grep -A 1 "versionCode" android/app/build.gradle | head -2

# Build debug APK
cd android
./gradlew :app:assembleDebug

echo "Build completed!"


