#!/bin/bash

# Script de inicialização para Railway - Volaron Store
# Este script configura e inicia todos os serviços necessários

set -e

echo "🚂 RAILWAY STARTUP - VOLARON STORE"
echo "=================================="

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🔄 $1${NC}"; }

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para aguardar um serviço ficar disponível
wait_for_service() {
    local service_name="$1"
    local check_command="$2"
    local max_attempts=30
    local attempt=1

    log_step "Aguardando $service_name ficar disponível..."

    while [ $attempt -le $max_attempts ]; do
        if eval "$check_command" >/dev/null 2>&1; then
            log_success "$service_name está disponível!"
            return 0
        fi

        log_info "Tentativa $attempt/$max_attempts - $service_name ainda não disponível"
        sleep 2
        ((attempt++))
    done

    log_error "$service_name não ficou disponível após $max_attempts tentativas"
    return 1
}

# Verificar variáveis de ambiente essenciais
check_environment() {
    log_step "Verificando variáveis de ambiente..."

    local required_vars=(
        "NODE_ENV"
        "HOST"
        "PORT"
    )

    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variáveis obrigatórias não configuradas: ${missing_vars[*]}"
        return 1
    fi

    # Configurar valores padrão
    export NODE_ENV="${NODE_ENV:-production}"
    export HOST="${HOST:-0.0.0.0}"
    export PORT="${PORT:-3000}"

    log_success "Variáveis de ambiente verificadas"
    log_info "NODE_ENV: $NODE_ENV"
    log_info "HOST: $HOST"
    log_info "PORT: $PORT"
}

# Verificar dependências do sistema
check_dependencies() {
    log_step "Verificando dependências do sistema..."

    if ! command_exists node; then
        log_error "Node.js não encontrado"
        return 1
    fi

    if ! command_exists npm; then
        log_error "npm não encontrado"
        return 1
    fi

    local node_version=$(node --version)
    local npm_version=$(npm --version)

    log_success "Node.js: $node_version"
    log_success "npm: $npm_version"
}

# Instalar dependências se necessário
install_dependencies() {
    log_step "Verificando dependências do projeto..."

    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        log_info "Instalando dependências..."
        npm ci --only=production --silent
        log_success "Dependências instaladas"
    else
        log_success "Dependências já instaladas"
    fi
}

# Configurar permissões de arquivos
setup_permissions() {
    log_step "Configurando permissões..."

    # Tornar scripts executáveis
    find scripts -name "*.sh" -type f -exec chmod +x {} \; 2>/dev/null || true
    chmod +x health-check.js 2>/dev/null || true

    log_success "Permissões configuradas"
}

# Verificar conectividade com serviços externos
check_external_services() {
    log_step "Verificando conectividade com serviços externos..."

    # Verificar Gemini AI se configurado
    if [ -n "$GEMINI_API_KEY" ]; then
        log_info "Verificando Gemini AI..."
        if curl -s --max-time 10 "https://generativelanguage.googleapis.com/v1beta/models" \
           -H "x-goog-api-key: $GEMINI_API_KEY" >/dev/null 2>&1; then
            log_success "Gemini AI acessível"
        else
            log_warning "Gemini AI pode não estar acessível"
        fi
    fi

    # Verificar banco de dados se configurado
    if [ -n "$DATABASE_URL" ]; then
        log_info "Banco de dados configurado"
        log_success "DATABASE_URL presente"
    else
        log_warning "DATABASE_URL não configurada"
    fi

    # Verificar Redis se configurado
    if [ -n "$REDIS_URL" ]; then
        log_info "Redis configurado"
        log_success "REDIS_URL presente"
    else
        log_warning "REDIS_URL não configurada"
    fi
}

# Inicializar serviços MCP se habilitados
start_mcp_servers() {
    if [ "$MCP_AUTO_START" = "true" ] && [ -f "scripts/start-mcp-servers.js" ]; then
        log_step "Iniciando servidores MCP..."
        
        # Iniciar MCP servers em background
        node scripts/start-mcp-servers.js start &
        MCP_PID=$!
        
        log_success "Servidores MCP iniciados (PID: $MCP_PID)"
        
        # Salvar PID para cleanup posterior
        echo $MCP_PID > .mcp-servers.pid
    else
        log_info "Servidores MCP não habilitados ou script não encontrado"
    fi
}

# Inicializar monitoramento se habilitado
start_monitoring() {
    if [ "$MONITOR_ENABLED" = "true" ] && [ -f "monitoring/continuous-monitor.js" ]; then
        log_step "Iniciando monitoramento..."
        
        # Iniciar monitoramento em background
        node monitoring/continuous-monitor.js start &
        MONITOR_PID=$!
        
        log_success "Monitoramento iniciado (PID: $MONITOR_PID)"
        
        # Salvar PID para cleanup posterior
        echo $MONITOR_PID > .monitor.pid
    else
        log_info "Monitoramento não habilitado ou script não encontrado"
    fi
}

# Executar health check inicial
initial_health_check() {
    log_step "Executando health check inicial..."
    
    if [ -f "health-check.js" ]; then
        if node health-check.js; then
            log_success "Health check inicial passou"
        else
            log_warning "Health check inicial falhou, mas continuando..."
        fi
    else
        log_info "Script de health check não encontrado"
    fi
}

# Função de cleanup para parar serviços em background
cleanup() {
    log_info "Executando cleanup..."
    
    # Parar servidores MCP
    if [ -f ".mcp-servers.pid" ]; then
        local mcp_pid=$(cat .mcp-servers.pid)
        if kill -0 "$mcp_pid" 2>/dev/null; then
            log_info "Parando servidores MCP (PID: $mcp_pid)..."
            kill -TERM "$mcp_pid" 2>/dev/null || true
        fi
        rm -f .mcp-servers.pid
    fi
    
    # Parar monitoramento
    if [ -f ".monitor.pid" ]; then
        local monitor_pid=$(cat .monitor.pid)
        if kill -0 "$monitor_pid" 2>/dev/null; then
            log_info "Parando monitoramento (PID: $monitor_pid)..."
            kill -TERM "$monitor_pid" 2>/dev/null || true
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
    
    # Verificar se existe um arquivo de entrada específico
    if [ -f "index.js" ]; then
        ENTRY_FILE="index.js"
    elif [ -f "server.js" ]; then
        ENTRY_FILE="server.js"
    elif [ -f "app.js" ]; then
        ENTRY_FILE="app.js"
    else
        log_error "Arquivo de entrada não encontrado"
        return 1
    fi
    
    log_info "Arquivo de entrada: $ENTRY_FILE"
    log_info "Iniciando em $HOST:$PORT..."
    
    # Iniciar aplicação
    exec node "$ENTRY_FILE"
}

# Função principal
main() {
    log_info "Iniciando Volaron Store..."
    log_info "Timestamp: $(date)"
    log_info "Ambiente: $NODE_ENV"
    echo ""
    
    # Executar verificações e configurações
    check_environment || exit 1
    check_dependencies || exit 1
    install_dependencies || exit 1
    setup_permissions
    check_external_services
    
    echo ""
    log_info "Configuração concluída. Iniciando serviços..."
    echo ""
    
    # Iniciar serviços auxiliares
    start_mcp_servers
    start_monitoring
    
    # Health check inicial
    initial_health_check
    
    echo ""
    log_success "🎉 Todos os serviços configurados!"
    log_info "Iniciando aplicação principal..."
    echo ""
    
    # Iniciar aplicação principal (este comando não retorna)
    start_main_application
}

# Verificar se está sendo executado diretamente
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
