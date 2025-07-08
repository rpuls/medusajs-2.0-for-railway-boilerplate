#!/bin/bash

# Script para configurar variáveis de ambiente no Railway
# Volaron Store - Configuração automatizada

set -e

echo "⚙️ Configurando variáveis de ambiente no Railway"
echo "============================"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Verificar se Railway CLI está disponível
if ! command -v railway &> /dev/null; then
    log_error "Railway CLI não encontrado"
    log_info "Instale com: npm install -g @railway/cli"
    exit 1
fi

# Verificar autenticação
if ! railway whoami &> /dev/null; then
    log_error "Não autenticado no Railway"
    log_info "Execute: railway login"
    exit 1
fi

log_info "Configurando variáveis de ambiente para Volaron Store..."

# Função para definir variável
set_var() {
    local key=$1
    local value=$2
    echo "Setting $key..."
    railway variables set "$key=$value"
}

# Variáveis essenciais do sistema
log_info "1. Configurando variáveis do sistema..."

set_var "NODE_ENV" "production"
set_var "HOST" "0.0.0.0"
set_var "PORT" "3000"

# Variáveis de segurança
log_info "2. Configurando variáveis de segurança..."

if ! railway variables | grep -q "^JWT_SECRET"; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo "$JWT_SECRET" | railway variables set "JWT_SECRET"
    log_success "JWT_SECRET gerado e configurado"
else
    log_info "JWT_SECRET já configurada"
fi

if ! railway variables | grep -q "^COOKIE_SECRET"; then
    COOKIE_SECRET=$(openssl rand -hex 32)
    echo "$COOKIE_SECRET" | railway variables set "COOKIE_SECRET"
    log_success "COOKIE_SECRET gerado e configurado"
else
    log_info "COOKIE_SECRET já configurada"
fi

# Variáveis de IA
log_info "3. Configurando variáveis de IA..."

set_var "GOOGLE_GENERATIVE_AI_API_KEY" "AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc"
set_var "GEMINI_MODEL" "gemini-1.5-flash-001"
set_var "ENABLE_GEMINI_AI" "true"
set_var "AI_PROVIDER" "gemini-ai-studio"

# URLs dos serviços (baseadas no padrão Railway)
log_info "4. Configurando URLs dos serviços..."

set_var "MEDUSA_BACKEND_URL" "https://backend-production-c461d.up.railway.app"
set_var "STOREFRONT_URL" "https://storefront-production-bd8d.up.railway.app"
set_var "MEILISEARCH_HOST" "https://meilisearch-production-010d.up.railway.app"
set_var "MINIO_ENDPOINT" "https://bucket-production-5a5e.up.railway.app"
set_var "N8N_URL" "https://n8n-automation-production-6e02.up.railway.app"

# Volaron específico
log_info "5. Configurando variáveis específicas do Volaron..."

set_var "VOLARON_STORE_NAME" "Volaron"
set_var "VOLARON_PRIMARY_COLOR" "#1a4d2e"
set_var "VOLARON_SECONDARY_COLOR" "#ff6b35"

# MCP e Monitoramento
log_info "6. Configurando variáveis de MCP e Monitoramento..."

set_var "MCP_AUTO_RESTART" "true"
set_var "MCP_HEALTH_CHECK_INTERVAL" "30000"
set_var "MCP_MAX_RESTARTS" "3"
set_var "MCP_LOG_LEVEL" "info"
set_var "MONITOR_ENABLED" "true"
set_var "MONITOR_INTERVAL" "60000"

# Performance
log_info "7. Configurando variáveis de performance..."

set_var "HEALTH_CHECK_TIMEOUT" "10000"
set_var "NEXT_TELEMETRY_DISABLED" "1"

echo "✅ Variáveis de ambiente configuradas!"
