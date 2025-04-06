#!/bin/bash

# Make the script executable
chmod +x fix-dependencies.sh

# Install common dependencies that might be missing
echo "Installing common dependencies..."
yarn add react-country-flag @headlessui/react @medusajs/ui-preset tailwindcss-radix clsx class-variance-authority lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-accordion @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-avatar @radix-ui/react-label @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slider @floating-ui/react

# Fix line endings in bin scripts
echo "Fixing line endings in bin scripts..."
find ./node_modules/.bin -type f -exec sed -i '' 's/\r$//' {} \; 2>/dev/null || true

echo "Dependencies installation complete!"
