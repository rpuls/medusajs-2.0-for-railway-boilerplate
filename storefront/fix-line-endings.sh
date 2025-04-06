#!/bin/bash

# Fix line endings in bin scripts
find ./node_modules/.bin -type f -exec sed -i '' 's/\r$//' {} \;

# Fix line endings in package.json
sed -i '' 's/\r$//' package.json

echo "Line endings fixed!"
