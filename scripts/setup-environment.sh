#!/bin/bash

# Setup Environment - Volaron Store
# Configuração completa do ambiente de desenvolvimento

set -e

echo "🚀 Configurando ambiente Volaron Store..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    error "Execute este script na raiz do projeto"
    exit 1
fi

log "Verificando dependências do sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Instale Node.js 18+ primeiro"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

log "Node.js $(node -v) ✅"

# Verificar npm
if ! command -v npm &> /dev/null; then
    error "npm não encontrado"
    exit 1
fi

log "npm $(npm -v) ✅"

# Instalar dependências do projeto
log "Instalando dependências do projeto..."
npm install

# Detectar caminho do Gemini CLI
GEMINI_PATH="./node_modules/.bin/gemini"
if command -v gemini &> /dev/null; then
    GEMINI_PATH=$(which gemini)
    log "Gemini CLI encontrado em: $GEMINI_PATH"
elif [ -f "./node_modules/.bin/gemini" ]; then
    log "Gemini CLI local encontrado: $GEMINI_PATH"
else
    warn "Gemini CLI não encontrado. Usando 'gemini' como padrão"
    GEMINI_PATH="gemini"
fi

# Criar diretórios necessários
log "Criando estrutura de diretórios..."
mkdir -p .copilot
mkdir -p mcp-servers/logs
mkdir -p exports
mkdir -p docs/generated
mkdir -p scripts/generated

# Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    log "Criando arquivo .env.local..."
    cat > .env.local << EOF
# Volaron Store - Environment Variables
# Gerado automaticamente em $(date)

# === GEMINI AI CONFIGURATION ===
GEMINI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
GOOGLE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
GOOGLE_AI_MODEL=gemini-1.5-flash-001
GEMINI_MODEL=gemini-1.5-flash-001

# === GEMINI CLI CONFIGURATION ===
GEMINI_CLI_PATH=$GEMINI_PATH
GEMINI_CLI_TIMEOUT=30000
GEMINI_CLI_MAX_TOKENS=8192
GEMINI_CLI_TEMPERATURE=0.7

# === MCP CONFIGURATION ===
MCP_VERBOSE=true
MCP_LOG_LEVEL=info
MCP_AUTO_RESTART=true
MCP_MAX_RESTARTS=3
MCP_HEALTH_CHECK_INTERVAL=30000
MCP_CONNECTION_TIMEOUT=10000
MCP_RETRY_ATTEMPTS=3

# === PROJECT CONFIGURATION ===
NODE_ENV=development
PROJECT_NAME=volaron-store
PROJECT_VERSION=1.0.0
COPILOT_AUTO_MODE=false
COPILOT_VOICE_ENABLED=true

# === RAILWAY BACKEND ===
MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app

# === DATABASE ===
DATABASE_URL=postgresql://postgres:password@localhost:5432/medusa-store
ANALYTICS_DB_URL=postgresql://postgres:password@localhost:5432/medusa-store

# === REDIS ===
REDIS_URL=redis://localhost:6379

# === STORAGE ===
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=volaron-media

# === SEARCH ===
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=masterKey

# === ANALYTICS ===
ANALYTICS_ENABLED=true

# === DEVELOPMENT ===
CHOKIDAR_USEPOLLING=true
RUNNING_IN_DOCKER=false
ENABLE_EXPERIMENTAL_FEATURES=true

EOF
    log ".env.local criado com configurações padrão"
else
    log ".env.local já existe"
fi

log "🎉 Configuração concluída com sucesso!"
echo ""
echo -e "${BLUE}📋 Próximos passos:${NC}"
echo "1. Revisar .env.local e ajustar se necessário"
echo "2. Executar: npm run dev"
echo "3. Acessar: http://localhost:3000"
echo ""
echo -e "${GREEN}✨ Ambiente Volaron Store configurado!${NC}"
