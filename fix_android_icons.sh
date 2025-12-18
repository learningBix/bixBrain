#!/bin/bash

# Android icon sizes
declare -A sizes=(
    ["mipmap-mdpi"]="48"
    ["mipmap-hdpi"]="72"
    ["mipmap-xhdpi"]="96"
    ["mipmap-xxhdpi"]="144"
    ["mipmap-xxxhdpi"]="192"
)

# Convert and resize for each density
for density in "${!sizes[@]}"; do
    size=${sizes[$density]}
    echo "Creating ${density} icons (${size}x${size})"
    
    # Create ic_launcher.png
    sips -z $size $size temp_logo.png --out android/app/src/main/res/${density}/ic_launcher.png
    
    # Create ic_launcher_round.png
    sips -z $size $size temp_logo.png --out android/app/src/main/res/${density}/ic_launcher_round.png
done

# Clean up temp file
rm temp_logo.png

echo "Android icons fixed!"

