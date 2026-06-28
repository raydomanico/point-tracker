#!/bin/bash
# 1. Clear out any stale, old archive builds
rm -f ./roof-tracker-extension.zip
rm -rf ./dist-ext

# 2. Initialize a clean, pristine temporary environment directory
mkdir ./dist-ext

# 3. Copy your live development assets straight into the staging area
cp index.html script.js style.css background.js icon.png manifest.json ./dist-ext/

# 4. Create a clean flat ZIP without folder nesting using the -j (junk paths) flag
# This extracts the files directly from the directory without nesting folders!
zip -j roof-tracker-extension.zip ./dist-ext/*

# 5. Destroy the temporary staging directory safely
rm -rf ./dist-ext

echo "Success! Pristine root-level extension archive generated flawlessly."