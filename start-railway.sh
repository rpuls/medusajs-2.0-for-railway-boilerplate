#!/bin/bash

# Script de inicialização para Railway
# Volaron Store - Startup automático com monitoramento

set -e

echo "🚂 VOLARON STORE - RAILWAY STARTUP"
echo "=================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🔄 $1${NC}"; }

# Configurações
export NODE_ENV=${NODE_ENV:-production}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-3000}
export ENABLE_GEMINI_AI=${ENABLE_GEMINI_AI:-true}
export MCP_VERBOSE=${MCP_VERBOSE:-false}

# Informações do ambiente
log_info "Ambiente: $NODE_ENV"
log_info "Host: $HOST"
log_info "Porta: $PORT"
log_info "Railway Environment: ${RAILWAY_ENVIRONMENT:-local}"
log_info "Railway Project: ${RAILWAY_PROJECT_NAME:-unknown}"

# Verificar dependências críticas
check_dependencies() {
    log_step "Verificando dependências críticas..."
    
    # Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        log_success "Node.js: $node_version"
    else
        log_error "Node.js não encontrado"
        exit 1
    fi
    
    # NPM
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        log_success "NPM: $npm_version"
    else
        log_error "NPM não encontrado"
        exit 1
    fi
    
    # Package.json
    if [ -f "package.json" ]; then
        log_success "package.json encontrado"
    else
        log_error "package.json não encontrado"
        exit 1
    fi
}

# Verificar variáveis de ambiente
check_environment() {
    log_step "Verificando variáveis de ambiente..."
    
    local required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "GEMINI_API_KEY"
        "JWT_SECRET"
        "COOKIE_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var}" ]; then
            log_success "✓ $var"
        else
            missing_vars+=("$var")
            log_warning "✗ $var não configurada"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variáveis críticas não configuradas: ${missing_vars[*]}"
        log_warning "Aplicação pode não funcionar corretamente"
    else
        log_success "Todas as variáveis críticas configuradas"
    fi
}

# Preparar ambiente
prepare_environment() {
    log_step "Preparando ambiente..."
    
    # Criar diretórios necessários
    local dirs=(
        "logs"
        "temp"
        "uploads"
        "mcp-servers/logs"
        "monitoring/logs"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_success "Diretório criado: $dir"
        fi
    done
    
    # Configurar permissões
    chmod +x scripts/*.sh 2>/dev/null || true
    chmod +x scripts/*.js 2>/dev/null || true
    
    log_success "Ambiente preparado"
}

# Instalar dependências se necessário
install_dependencies() {
    log_step "Verificando dependências do projeto..."
    
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log_info "Instalando dependências..."
        npm ci --production
        log_success "Dependências instaladas"
    else
        log_success "Dependências já instaladas"
    fi
}

# Iniciar servidores MCP
start_mcp_servers() {
    log_step "Iniciando servidores MCP..."
    
    if [ -f "scripts/start-mcp-servers.js" ]; then
        # Iniciar em background
        node scripts/start-mcp-servers.js start &
        local mcp_pid=$!
        echo $mcp_pid > .mcp-servers.pid
        
        # Aguardar inicialização
        sleep 5
        
        if kill -0 $mcp_pid 2>/dev/null; then
            log_success "Servidores MCP iniciados (PID: $mcp_pid)"
        else
            log_warning "Falha ao iniciar servidores MCP"
        fi
    else
        log_warning "Script de MCP não encontrado"
    fi
}

# Iniciar monitoramento
start_monitoring() {
    log_step "Iniciando monitoramento..."
    
    if [ "$MONITOR_ENABLED" = "true" ] && [ -f "monitoring/continuous-monitor.js" ]; then
        # Iniciar em background
        node monitoring/continuous-monitor.js start &
        local monitor_pid=$!
        echo $monitor_pid > .monitor.pid
        
        # Aguardar inicialização
        sleep 3
        
        if kill -0 $monitor_pid 2>/dev/null; then
            log_success "Monitoramento iniciado (PID: $monitor_pid)"
        else
            log_warning "Falha ao iniciar monitoramento"
        fi
    else
        log_info "Monitoramento desabilitado ou não disponível"
    fi
}

# Health check inicial
initial_health_check() {
    log_step "Executando health check inicial..."
    
    if [ -f "health-check.js" ]; then
        # Aguardar aplicação inicializar
        sleep 10
        
        if node health-check.js; then
            log_success "Health check inicial passou"
        else
            log_warning "Health check inicial falhou - aplicação pode estar inicializando"
        fi
    else
        log_warning "Health check não disponível"
    fi
}

# Função de cleanup
cleanup() {
    log_info "Executando cleanup..."
    
    # Parar servidores MCP
    if [ -f ".mcp-servers.pid" ]; then
        local mcp_pid=$(cat .mcp-servers.pid)
        if kill -0 $mcp_pid 2>/dev/null; then
            log_info "Parando servidores MCP (PID: $mcp_pid)..."
            kill $mcp_pid
        fi
        rm -f .mcp-servers.pid
    fi
    
    # Parar monitoramento
    if [ -f ".monitor.pid" ]; then
        local monitor_pid=$(cat .monitor.pid)
        if kill -0 $monitor_pid 2>/dev/null; then
            log_info "Parando monitoramento (PID: $monitor_pid)..."
            kill $monitor_pid
        fi
        rm -f .monitor.pid
    fi
    
    log_info "Cleanup concluído"
}

# Configurar trap para cleanup
trap cleanup EXIT INT TERM

# Iniciar aplicação principal
start_main_application() {
    log_step "Iniciando aplicação principal..."
    
    # Verificar se existe script de start customizado
    if [ -f "scripts/start-app.js" ]; then
        log_info "Usando script de start customizado"
        exec node scripts/start-app.js
    elif npm run start --if-present; then
        log_info "Usando npm start"
        exec npm start
    elif [ -f "index.js" ]; then
        log_info "Usando index.js"
        exec node index.js
    elif [ -f "server.js" ]; then
        log_info "Usando server.js"
        exec node server.js
    else
        log_error "Nenhum script de inicialização encontrado"
        exit 1
    fi
}

# Função principal
main() {
    log_info "Iniciando Volaron Store..."
    echo ""
    
    # Verificações e preparação
    check_dependencies
    check_environment
    prepare_environment
    install_dependencies
    
    echo ""
    log_info "Iniciando serviços auxiliares..."
    
    # Serviços auxiliares
    start_mcp_servers
    start_monitoring
    
    echo ""
    log_info "Tudo pronto! Iniciando aplicação principal..."
    echo ""
    
    # Health check em background
    (sleep 15 && initial_health_check) &
    
    # Iniciar aplicação principal (exec substitui o processo atual)
    start_main_application
}

# Log de início
echo ""
log_success "🎉 Volaron Store Railway Startup"
log_info "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
log_info "PID: $$"
echo ""

# Executar função principal
main "$@"
