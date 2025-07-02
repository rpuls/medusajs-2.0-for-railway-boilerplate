#!/bin/bash

echo "🚀 Setting up Volaron Medusa MCP Server"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the services/medusa-mcp directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "🔧 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual values:"
    echo "   - MEDUSA_BACKEND_URL"
    echo "   - MEDUSA_API_KEY"
    echo "   - MCP_SECRET_KEY"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Run 'npm start' to start the server"
    echo "3. Or run 'npm run dev' for development mode"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi