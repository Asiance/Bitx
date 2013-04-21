#!/usr/bin/env bash

echo "Creating BITX package..."

version=$(sed -ne '/"version":/s/.*"\([^"]*\)".*/\1/p' app/manifest.json)

zip -r store/packages/bitx-v$version.zip ./app/* -x@bin/exclude.lst

echo "Done!":