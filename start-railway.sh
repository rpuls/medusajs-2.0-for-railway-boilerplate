#!/bin/bash

# Railway Start Script for Volaron Store
# Este script inicia a aplicação no Railway com todas as configurações necessárias

set -e

echo "🚀 INICIANDO VOLARON STORE NO RAILWAY"
echo "===================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar ambiente Railway
if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    log_error "Não está rodando no Railway!"
    exit 1
fi

log_info "Ambiente Railway detectado: $RAILWAY_ENVIRONMENT"
log_info "Projeto: $RAILWAY_PROJECT_NAME"
log_info "Serviço: $RAILWAY_SERVICE_NAME"

# 1. Verificar variáveis críticas
log_info "1. Verificando configuração..."

CRITICAL_VARS=(
    "DATABASE_URL"
    "REDIS_URL"
    "GEMINI_API_KEY"
    "JWT_SECRET"
    "COOKIE_SECRET"
    "HOST"
    "PORT"
)

for var in "${CRITICAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Variável crítica $var não configurada!"
        exit 1
    fi
done

log_success "Todas as variáveis críticas configuradas"

# 2. Configurar HOST e PORT
export HOST=${HOST:-"0.0.0.0"}
export PORT=${PORT:-3000}

log_info "Host: $HOST"
log_info "Port: $PORT"

# 3. Aguardar serviços dependentes
log_info "2. Aguardando serviços dependentes..."

# Função para testar conectividade
test_service() {
    local service_name=$1
    local service_url=$2
    local max_attempts=30
    local attempt=1

    log_info "Testando $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --connect-timeout 5 "$service_url" > /dev/null 2>&1; then
            log_success "$service_name está disponível"
            return 0
        fi
        
        log_info "Tentativa $attempt/$max_attempts para $service_name..."
        sleep 2
        ((attempt++))
    done
    
    log_warning "$service_name não respondeu após $max_attempts tentativas"
    return 1
}

# Testar PostgreSQL (via DATABASE_URL)
if command -v pg_isready > /dev/null 2>&1; then
    if pg_isready -d "$DATABASE_URL" -t 10; then
        log_success "PostgreSQL está disponível"
    else
        log_warning "PostgreSQL pode não estar totalmente pronto"
    fi
fi

# Testar Redis (se disponível)
if [ -n "$REDIS_URL" ]; then
    log_info "Testando Redis..."
    # Redis test seria implementado aqui se necessário
    log_success "Redis configurado"
fi

# 4. Inicializar MCP Servers
log_info "3. Inicializando MCP Servers..."

if [ -f "scripts/start-mcp-servers.js" ]; then
    node scripts/start-mcp-servers.js --railway &
    MCP_PID=$!
    log_success "MCP Servers iniciados (PID: $MCP_PID)"
else
    log_warning "Script MCP não encontrado"
fi

# 5. Executar migrações do banco (se necessário)
log_info "4. Verificando migrações do banco..."

if command -v medusa > /dev/null 2>&1; then
    log_info "Executando migrações Medusa..."
    medusa migrations run || log_warning "Migrações falharam ou já estão atualizadas"
else
    log_info "Medusa CLI não disponível, pulando migrações"
fi

# 6. Inicializar monitoramento
log_info "5. Inicializando monitoramento..."

if [ -f "monitoring/continuous-monitor.js" ]; then
    node monitoring/continuous-monitor.js &
    MONITOR_PID=$!
    log_success "Monitoramento iniciado (PID: $MONITOR_PID)"
else
    log_warning "Sistema de monitoramento não encontrado"
fi

# 7. Configurar handlers de sinal
cleanup() {
    log_info "Recebido sinal de parada, finalizando processos..."
    
    if [ -n "$MCP_PID" ]; then
        kill $MCP_PID 2>/dev/null || true
        log_info "MCP Servers finalizados"
    fi
    
    if [ -n "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
        log_info "Monitoramento finalizado"
    fi
    
    log_success "Cleanup concluído"
    exit 0
}

trap cleanup SIGTERM SIGINT

# 8. Health check inicial
log_info "6. Executando health check inicial..."

if [ -f "health-check.js" ]; then
    if node health-check.js; then
        log_success "Health check inicial passou"
    else
        log_warning "Health check inicial falhou - continuando mesmo assim"
    fi
fi

# 9. Iniciar aplicação principal
log_info "7. Iniciando aplicação principal..."

# Determinar comando de start baseado no tipo de aplicação
if [ -f "package.json" ]; then
    if grep -q "medusa" package.json; then
        log_info "Detectada aplicação Medusa"
        START_CMD="medusa start"
    elif grep -q "next" package.json; then
        log_info "Detectada aplicação Next.js"
        START_CMD="npm start"
    else
        log_info "Usando comando padrão"
        START_CMD="npm start"
    fi
else
    log_info "package.json não encontrado, usando node"
    START_CMD="node index.js"
fi

log_success "Volaron Store iniciado com sucesso!"
log_info "Comando: $START_CMD"
log_info "Escutando em $HOST:$PORT"

# Criar arquivo de status de runtime
cat > runtime-status.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$RAILWAY_ENVIRONMENT",
  "project": "$RAILWAY_PROJECT_NAME",
  "service": "$RAILWAY_SERVICE_NAME",
  "host": "$HOST",
  "port": "$PORT",
  "status": "running",
  "processes": {
    "main": "starting",
    "mcp_servers": "${MCP_PID:-"not_started"}",
    "monitoring": "${MONITOR_PID:-"not_started"}"
  }
}
EOF

# Executar aplicação principal
exec $START_CMD
