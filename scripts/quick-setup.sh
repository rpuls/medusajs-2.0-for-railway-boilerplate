#!/bin/bash

# Quick Setup - Versão simplificada
echo "🚀 Setup rápido Volaron Store..."

# Criar diretórios
mkdir -p .copilot mcp-servers/logs exports

# Instalar dependências básicas
npm install @google/generative-ai

# Criar .env.local básico
cat > .env.local << 'EOF'
GEMINI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
GOOGLE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
GOOGLE_AI_MODEL=gemini-1.5-flash-001
MCP_VERBOSE=true
NODE_ENV=development
MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
ANALYTICS_DB_URL=postgresql://postgres:password@localhost:5432/medusa-store
EOF

echo "✅ Setup básico concluído!"
echo "Execute: npm run dev"
