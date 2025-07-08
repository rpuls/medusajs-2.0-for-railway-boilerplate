#!/bin/bash

# Volaron Store - Script de Inicialização Railway
# Este script configura e inicia todos os serviços necessários

set -e  # Parar em caso de erro

echo "🚂 Iniciando Volaron Store no Railway..."
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar variáveis de ambiente obrigatórias
check_env_vars() {
    log_info "Verificando variáveis de ambiente..."
    
    required_vars=(
        "GOOGLE_GENERATIVE_AI_API_KEY"
        "DATABASE_URL"
        "REDIS_URL"
        "MEILISEARCH_HOST"
        "MEILISEARCH_MASTER_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Variáveis de ambiente obrigatórias não encontradas:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    log_success "Todas as variáveis de ambiente estão configuradas"
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    
    if [ -f "package.json" ]; then
        npm ci --production
        log_success "Dependências instaladas com sucesso"
    else
        log_error "package.json não encontrado"
        exit 1
    fi
}

# Executar migrações do banco
run_migrations() {
    log_info "Executando migrações do banco de dados..."
    
    # Verificar se o banco está acessível
    if ! npm run db:check > /dev/null 2>&1; then
        log_warning "Banco de dados não está acessível, tentando novamente em 10s..."
        sleep 10
    fi
    
    # Executar migrações
    if npm run db:migrate; then
        log_success "Migrações executadas com sucesso"
    else
        log_error "Falha nas migrações do banco"
        exit 1
    fi
}

# Inicializar serviços MCP
start_mcp_servers() {
    log_info "Iniciando servidores MCP..."
    
    # Verificar se o diretório existe
    if [ -d "mcp-servers" ]; then
        # Iniciar servidores em background
        node mcp-servers/gemini-ai-server.js &
        MCP_GEMINI_PID=$!
        
        node mcp-servers/analytics-server.js &
        MCP_ANALYTICS_PID=$!
        
        node mcp-servers/volaron-store-server.js &
        MCP_STORE_PID=$!
        
        # Salvar PIDs para cleanup posterior
        echo "$MCP_GEMINI_PID" > /tmp/mcp-gemini.pid
        echo "$MCP_ANALYTICS_PID" > /tmp/mcp-analytics.pid
        echo "$MCP_STORE_PID" > /tmp/mcp-store.pid
        
        log_success "Servidores MCP iniciados"
    else
        log_warning "Diretório mcp-servers não encontrado, pulando..."
    fi
}

# Verificar saúde dos serviços
health_check() {
    log_info "Verificando saúde dos serviços..."
    
    # Aguardar serviços iniciarem
    sleep 5
    
    # Verificar API de IA
    if curl -f -s "http://localhost:${PORT:-3000}/api/ai/health" > /dev/null; then
        log_success "API de IA está funcionando"
    else
        log_warning "API de IA não está respondendo"
    fi
    
    # Verificar MedusaJS
    if curl -f -s "http://localhost:${PORT:-3000}/health" > /dev/null; then
        log_success "MedusaJS está funcionando"
    else
        log_warning "MedusaJS não está respondendo"
    fi
}

# Configurar monitoramento
setup_monitoring() {
    log_info "Configurando monitoramento..."
    
    if [ -f "monitoring/continuous-monitor.js" ]; then
        node monitoring/continuous-monitor.js &
        MONITOR_PID=$!
        echo "$MONITOR_PID" > /tmp/monitor.pid
        log_success "Monitoramento iniciado"
    else
        log_warning "Sistema de monitoramento não encontrado"
    fi
}

# Função de cleanup
cleanup() {
    log_info "Executando cleanup..."
    
    # Parar serviços MCP
    if [ -f "/tmp/mcp-gemini.pid" ]; then
        kill $(cat /tmp/mcp-gemini.pid) 2>/dev/null || true
        rm -f /tmp/mcp-gemini.pid
    fi
    
    if [ -f "/tmp/mcp-analytics.pid" ]; then
        kill $(cat /tmp/mcp-analytics.pid) 2>/dev/null || true
        rm -f /tmp/mcp-analytics.pid
    fi
    
    if [ -f "/tmp/mcp-store.pid" ]; then
        kill $(cat /tmp/mcp-store.pid) 2>/dev/null || true
        rm -f /tmp/mcp-store.pid
    fi
    
    # Parar monitoramento
    if [ -f "/tmp/monitor.pid" ]; then
        kill $(cat /tmp/monitor.pid) 2>/dev/null || true
        rm -f /tmp/monitor.pid
    fi
    
    log_success "Cleanup concluído"
}

# Configurar trap para cleanup
trap cleanup EXIT INT TERM

# Iniciar aplicação principal
start_main_app() {
    log_info "Iniciando aplicação principal..."
    
    # Definir porta
    export PORT=${PORT:-3000}
    
    log_info "Aplicação será iniciada na porta $PORT"
    
    # Iniciar aplicação
    if [ -f "dist/index.js" ]; then
        # Produção - código compilado
        node dist/index.js
    elif [ -f "index.js" ]; then
        # Desenvolvimento
        node index.js
    else
        # Usar npm start como fallback
        npm start
    fi
}

# Função principal
main() {
    log_info "Iniciando processo de deploy..."
    
    # Executar etapas
    check_env_vars
    install_dependencies
    run_migrations
    start_mcp_servers
    setup_monitoring
    health_check
    
    log_success "Todos os serviços foram iniciados com sucesso!"
    log_info "Volaron Store está rodando em: http://localhost:${PORT:-3000}"
    log_info "Health Check: http://localhost:${PORT:-3000}/api/ai/health"
    log_info "Admin: http://localhost:${PORT:-3000}/admin"
    
    # Iniciar aplicação principal (isso vai bloquear)
    start_main_app
}

# Executar função principal
main "$@"
