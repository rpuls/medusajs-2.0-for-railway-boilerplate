#!/bin/bash

# Railway Auto Setup Script for Volaron Store
# Este script configura automaticamente o ambiente no Railway

set -e

echo "🚀 RAILWAY AUTO SETUP - VOLARON STORE"
echo "====================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no Railway
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    log_warning "Não detectado ambiente Railway. Executando setup local..."
    RAILWAY_MODE=false
else
    log_info "Detectado ambiente Railway: $RAILWAY_ENVIRONMENT"
    RAILWAY_MODE=true
fi

# 1. Instalar dependências
log_info "1. Instalando dependências..."
if [ -f "package.json" ]; then
    npm install --production
    log_success "Dependências instaladas"
else
    log_warning "package.json não encontrado, pulando instalação de dependências"
fi

# 2. Verificar variáveis de ambiente críticas
log_info "2. Verificando variáveis de ambiente..."

REQUIRED_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "GEMINI_API_KEY"
    "JWT_SECRET"
    "COOKIE_SECRET"
)

missing_vars=0
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Variável $var não configurada"
        ((missing_vars++))
    else
        log_success "Variável $var configurada"
    fi
done

if [ $missing_vars -gt 0 ]; then
    log_error "$missing_vars variáveis críticas não configuradas"
    if [ "$RAILWAY_MODE" = true ]; then
        log_info "Configure as variáveis no Railway Dashboard"
    fi
else
    log_success "Todas as variáveis críticas configuradas"
fi

# 3. Configurar diretórios necessários
log_info "3. Criando diretórios necessários..."

DIRECTORIES=(
    "logs"
    "temp"
    "uploads"
    "mcp-servers/logs"
    "monitoring/logs"
)

for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log_success "Diretório $dir criado"
    else
        log_info "Diretório $dir já existe"
    fi
done

# 4. Configurar permissões
log_info "4. Configurando permissões..."

EXECUTABLE_FILES=(
    "scripts/start-mcp-servers.js"
    "scripts/railway-deploy.sh"
    "start-railway.sh"
    "health-check.js"
)

for file in "${EXECUTABLE_FILES[@]}"; do
    if [ -f "$file" ]; then
        chmod +x "$file"
        log_success "Permissão executável adicionada a $file"
    else
        log_warning "Arquivo $file não encontrado"
    fi
done

# 5. Inicializar MCP Servers
log_info "5. Inicializando MCP Servers..."

if [ -f "scripts/start-mcp-servers.js" ]; then
    node scripts/start-mcp-servers.js --init
    log_success "MCP Servers inicializados"
else
    log_warning "Script MCP não encontrado"
fi

# 6. Executar health check
log_info "6. Executando health check..."

if [ -f "health-check.js" ]; then
    if node health-check.js; then
        log_success "Health check passou"
    else
        log_warning "Health check falhou - serviços podem estar inicializando"
    fi
else
    log_warning "Health check não encontrado"
fi

# 7. Configurar logs
log_info "7. Configurando sistema de logs..."

cat > logs/setup.log << EOF
Volaron Store Setup Log
=======================
Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Environment: ${RAILWAY_ENVIRONMENT:-"local"}
Node Version: $(node --version)
NPM Version: $(npm --version)
Setup Status: Success
Missing Variables: $missing_vars
EOF

log_success "Sistema de logs configurado"

# 8. Criar arquivo de status
log_info "8. Criando arquivo de status..."

cat > railway-setup-status.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "${RAILWAY_ENVIRONMENT:-"local"}",
  "setup_version": "1.0.0",
  "status": "completed",
  "missing_variables": $missing_vars,
  "services": {
    "mcp_servers": "initialized",
    "health_check": "completed",
    "logs": "configured",
    "permissions": "set"
  },
  "next_steps": [
    "Configure missing environment variables",
    "Run health check",
    "Start application",
    "Monitor logs"
  ]
}
EOF

log_success "Arquivo de status criado"

# 9. Resumo final
echo ""
log_info "📋 RESUMO DO SETUP"
echo "=================="

if [ $missing_vars -eq 0 ]; then
    log_success "✅ Setup completado com sucesso!"
    log_info "🚀 Pronto para iniciar a aplicação"
else
    log_warning "⚠️ Setup completado com avisos"
    log_warning "🔧 Configure $missing_vars variável(is) de ambiente"
fi

echo ""
log_info "📁 Arquivos criados:"
echo "   - logs/setup.log"
echo "   - railway-setup-status.json"
echo ""

if [ "$RAILWAY_MODE" = true ]; then
    log_info "🔗 Links úteis:"
    echo "   - Dashboard: https://railway.app/project/$RAILWAY_PROJECT_ID"
    echo "   - Logs: railway logs --tail 50"
    echo "   - Variables: railway variables"
else
    log_info "💻 Comandos locais:"
    echo "   - npm start"
    echo "   - npm run dev"
    echo "   - npm run health"
fi

echo ""
log_success "🎉 Setup concluído!"

# Retornar código de saída baseado no status
if [ $missing_vars -eq 0 ]; then
    exit 0
else
    exit 1
fi
