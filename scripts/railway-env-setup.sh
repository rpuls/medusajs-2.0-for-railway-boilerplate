#!/bin/bash

# Script para configurar variáveis de ambiente no Railway
# Volaron Store - Configuração automatizada

set -e

echo "🔧 RAILWAY ENVIRONMENT SETUP"
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

# Função para definir variável se não existir
set_var_if_not_exists() {
    local var_name="$1"
    local var_value="$2"
    local description="$3"
    
    if railway variables | grep -q "^$var_name"; then
        log_info "$var_name já configurada"
    else
        log_info "Configurando $var_name: $description"
        echo "$var_value" | railway variables set "$var_name"
        log_success "$var_name configurada"
    fi
}

# Variáveis essenciais do sistema
log_info "1. Configurando variáveis do sistema..."

set_var_if_not_exists "NODE_ENV" "production" "Ambiente de execução"
set_var_if_not_exists "HOST" "0.0.0.0" "Host da aplicação"
set_var_if_not_exists "PORT" "3000" "Porta da aplicação"

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

set_var_if_not_exists "ENABLE_GEMINI_AI" "true" "Habilitar Gemini AI"
set_var_if_not_exists "AI_PROVIDER" "gemini-ai-studio" "Provedor de IA"
set_var_if_not_exists "GOOGLE_AI_MODEL" "gemini-1.5-flash-001" "Modelo do Gemini"
set_var_if_not_exists "ENABLE_AI_FEATURES" "true" "Habilitar recursos de IA"

# Variáveis de MCP
log_info "4. Configurando variáveis de MCP..."

set_var_if_not_exists "MCP_VERBOSE" "false" "Logs verbosos do MCP"
set_var_if_not_exists "MCP_AUTO_RESTART" "true" "Auto-restart dos servidores MCP"
set_var_if_not_exists "MCP_HEALTH_CHECK_INTERVAL" "30000" "Intervalo de health check MCP"
set_var_if_not_exists "MCP_MAX_RESTARTS" "3" "Máximo de restarts MCP"
set_var_if_not_exists "MCP_LOG_LEVEL" "info" "Nível de log MCP"

# Variáveis de monitoramento
log_info "5. Configurando variáveis de monitoramento..."

set_var_if_not_exists "MONITOR_ENABLED" "true" "Habilitar monitoramento"
set_var_if_not_exists "MONITOR_INTERVAL" "60000" "Intervalo de monitoramento"
set_var_if_not_exists "HEALTH_CHECK_TIMEOUT" "10000" "Timeout do health check"

# Variáveis de performance
log_info "6. Configurando variáveis de performance..."

set_var_if_not_exists "NEXT_TELEMETRY_DISABLED" "1" "Desabilitar telemetria Next.js"
set_var_if_not_exists "RAILWAY_HEALTHCHECK_TIMEOUT_SEC" "300" "Timeout do health check Railway"

# URLs dos serviços (baseadas no padrão Railway)
log_info "7. Configurando URLs dos serviços..."

set_var_if_not_exists "MEDUSA_BACKEND_URL" "https://backend-production-c461d.up.railway.app" "URL do backend Medusa"
set_var_if_not_exists "STOREFRONT_URL" "https://storefront-production-bd8d.up.railway.app" "URL do storefront"
set_var_if_not_exists "MEILISEARCH_HOST" "https://meilisearch-production-010d.up.railway.app" "URL do MeiliSearch"
set_var_if_not_exists "MINIO_ENDPOINT" "https://bucket-production-5a5e.up.railway.app" "URL do MinIO"
set_var_if_not_exists "N8N_URL" "https://n8n-automation-production-6e02.up.railway.app" "URL do n8n"

# CORS configurações
log_info "8. Configurando CORS..."

ADMIN_CORS="https://storefront-production-bd8d.up.railway.app,http://localhost:7001"
STORE_CORS="https://storefront-production-bd8d.up.railway.app,http://localhost:8000"
AUTH_CORS="https://backend-production-c461d.up.railway.app,https://backend.railway.internal"

set_var_if_not_exists "ADMIN_CORS" "$ADMIN_CORS" "CORS para admin"
set_var_if_not_exists "STORE_CORS" "$STORE_CORS" "CORS para store"
set_var_if_not_exists "AUTH_CORS" "$AUTH_CORS" "CORS para auth"

# Verificar variáveis críticas que precisam ser configuradas manualmente
log_info "9. Verificando variáveis críticas..."

CRITICAL_VARS=(
    "GEMINI_API_KEY:Chave da API do Gemini AI"
    "DATABASE_URL:URL do banco PostgreSQL"
    "REDIS_URL:URL do Redis"
    "MEILISEARCH_API_KEY:Chave da API do MeiliSearch"
    "MINIO_ACCESS_KEY:Chave de acesso do MinIO"
    "MINIO_SECRET_KEY:Chave secreta do MinIO"
)

missing_critical=0
for var_info in "${CRITICAL_VARS[@]}"; do
    var_name="${var_info%%:*}"
    var_desc="${var_info##*:}"
    
    if railway variables | grep -q "^$var_name"; then
        log_success "$var_name configurada"
    else
        log_error "$var_name NÃO configurada - $var_desc"
        ((missing_critical++))
    fi
done

echo ""
log_info "📊 RESUMO DA CONFIGURAÇÃO"
echo "========================"

if [ $missing_critical -eq 0 ]; then
    log_success "✅ Todas as variáveis críticas estão configuradas!"
    log_info "🚀 Pronto para fazer deploy"
else
    log_warning "⚠️ $missing_critical variável(is) crítica(s) precisam ser configuradas manualmente"
    log_info "Configure as variáveis em falta no Railway Dashboard:"
    log_info "https://railway.app/dashboard"
fi

echo ""
log_info "🔍 Para verificar todas as variáveis:"
log_info "railway variables"
echo ""
log_info "🚀 Para fazer deploy:"
log_info "railway deploy"

# Salvar configuração atual
log_info "💾 Salvando configuração atual..."
railway variables > "railway-variables-$(date +%Y%m%d-%H%M%S).txt"
log_success "Configuração salva"

echo ""
if [ $missing_critical -eq 0 ]; then
    log_success "🎉 Configuração concluída com sucesso!"
    exit 0
else
    log_warning "⚠️ Configuração parcialmente concluída"
    exit 1
fi
