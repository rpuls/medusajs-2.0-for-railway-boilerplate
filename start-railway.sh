#!/bin/bash

# Script de inicialização para Railway - Volaron Store
# Este script configura e inicia todos os serviços necessários

set -e  # Parar em caso de erro

echo "🚂 Iniciando Volaron Store no Railway..."
echo "📅 $(date)"
echo "🌍 Environment: ${NODE_ENV:-production}"

# Função para log colorido
log_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Verificar variáveis de ambiente essenciais
check_env_vars() {
    log_info "Verificando variáveis de ambiente..."
    
    local required_vars=(
        "NODE_ENV"
        "PORT"
        "DATABASE_URL"
        "GOOGLE_GENERATIVE_AI_API_KEY"
        "NEXT_PUBLIC_BACKEND_URL"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_error "Variáveis de ambiente obrigatórias não encontradas:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    log_success "Todas as variáveis de ambiente estão configuradas"
}

# Verificar conectividade com serviços externos
check_external_services() {
    log_info "Verificando conectividade com serviços externos..."
    
    # Verificar banco de dados
    if [[ -n "$DATABASE_URL" ]]; then
        log_info "Testando conexão com banco de dados..."
        if node -e "
            const { Client } = require('pg');
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            client.connect()
                .then(() => { console.log('✅ Database OK'); client.end(); })
                .catch(err => { console.error('❌ Database Error:', err.message); process.exit(1); });
        "; then
            log_success "Banco de dados conectado"
        else
            log_error "Falha na conexão com banco de dados"
            exit 1
        fi
    fi
    
    # Verificar Google AI API
    if [[ -n "$GOOGLE_GENERATIVE_AI_API_KEY" ]]; then
        log_info "Testando Google Generative AI API..."
        if curl -s -f "https://generativelanguage.googleapis.com/v1beta/models?key=$GOOGLE_GENERATIVE_AI_API_KEY" > /dev/null; then
            log_success "Google AI API conectada"
        else
            log_warning "Google AI API pode estar indisponível"
        fi
    fi
    
    # Verificar Redis (se configurado)
    if [[ -n "$REDIS_URL" ]]; then
        log_info "Testando conexão com Redis..."
        if redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
            log_success "Redis conectado"
        else
            log_warning "Redis pode estar indisponível"
        fi
    fi
}

# Preparar diretórios necessários
setup_directories() {
    log_info "Criando diretórios necessários..."
    
    local dirs=(
        "logs"
        "tmp"
        "uploads"
        ".copilot"
        "mcp-servers/logs"
        "monitoring/logs"
        "exports"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        log_info "Diretório criado: $dir"
    done
    
    log_success "Diretórios configurados"
}

# Instalar dependências se necessário
install_dependencies() {
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        log_info "Instalando dependências..."
        npm ci --only=production --silent
        log_success "Dependências instaladas"
    else
        log_info "Dependências já estão atualizadas"
    fi
}

# Executar migrações de banco de dados
run_migrations() {
    if [[ -f "prisma/schema.prisma" ]] || [[ -d "migrations" ]]; then
        log_info "Executando migrações de banco de dados..."
        
        if command -v prisma &> /dev/null; then
            npx prisma migrate deploy
            log_success "Migrações Prisma executadas"
        elif [[ -d "migrations" ]]; then
            # Executar migrações customizadas se existirem
            for migration in migrations/*.sql; do
                if [[ -f "$migration" ]]; then
                    log_info "Executando migração: $(basename "$migration")"
                    psql "$DATABASE_URL" -f "$migration"
                fi
            done
            log_success "Migrações customizadas executadas"
        fi
    else
        log_info "Nenhuma migração encontrada"
    fi
}

# Inicializar serviços MCP
start_mcp_servers() {
    if [[ -d "mcp-servers" ]] && [[ -f "mcp-servers/start-mcp-servers.js" ]]; then
        log_info "Iniciando servidores MCP..."
        
        # Iniciar servidores MCP em background
        node mcp-servers/start-mcp-servers.js &
        MCP_PID=$!
        
        # Aguardar inicialização
        sleep 5
        
        if kill -0 $MCP_PID 2>/dev/null; then
            log_success "Servidores MCP iniciados (PID: $MCP_PID)"
            echo $MCP_PID > .copilot/mcp.pid
        else
            log_warning "Falha ao iniciar servidores MCP"
        fi
    else
        log_info "Servidores MCP não encontrados"
    fi
}

# Inicializar monitoramento
start_monitoring() {
    if [[ -f "monitoring/continuous-monitor.js" ]]; then
        log_info "Iniciando monitoramento contínuo..."
        
        # Iniciar monitoramento em background
        node monitoring/continuous-monitor.js &
        MONITOR_PID=$!
        
        # Aguardar inicialização
        sleep 3
        
        if kill -0 $MONITOR_PID 2>/dev/null; then
            log_success "Monitoramento iniciado (PID: $MONITOR_PID)"
            echo $MONITOR_PID > .copilot/monitor.pid
        else
            log_warning "Falha ao iniciar monitoramento"
        fi
    else
        log_info "Monitoramento não configurado"
    fi
}

# Função de limpeza ao sair
cleanup() {
    log_info "Executando limpeza..."
    
    # Parar servidores MCP
    if [[ -f ".copilot/mcp.pid" ]]; then
        MCP_PID=$(cat .copilot/mcp.pid)
        if kill -0 $MCP_PID 2>/dev/null; then
            kill $MCP_PID
            log_info "Servidores MCP parados"
        fi
        rm -f .copilot/mcp.pid
    fi
    
    # Parar monitoramento
    if [[ -f ".copilot/monitor.pid" ]]; then
        MONITOR_PID=$(cat .copilot/monitor.pid)
        if kill -0 $MONITOR_PID 2>/dev/null; then
            kill $MONITOR_PID
            log_info "Monitoramento parado"
        fi
        rm -f .copilot/monitor.pid
    fi
    
    log_info "Limpeza concluída"
}

# Configurar trap para limpeza
trap cleanup EXIT INT TERM

# Health check endpoint
setup_health_check() {
    log_info "Configurando health check..."
    
    # Criar arquivo de health check se não existir
    if [[ ! -f "health-check.js" ]]; then
        cat > health-check.js << 'EOF'
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Health check passed');
    process.exit(0);
  } else {
    console.error(`❌ Health check failed: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error(`❌ Health check error: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
EOF
    fi
    
    log_success "Health check configurado"
}

# Função principal
main() {
    log_info "=== Iniciando Volaron Store ==="
    
    # Executar verificações e configurações
    check_env_vars
    setup_directories
    install_dependencies
    check_external_services
    run_migrations
    setup_health_check
    
    # Iniciar serviços auxiliares
    start_mcp_servers
    start_monitoring
    
    # Aguardar um pouco para estabilizar
    sleep 2
    
    log_success "=== Configuração concluída ==="
    log_info "Iniciando aplicação principal..."
    
    # Determinar comando de inicialização baseado no tipo de aplicação
    if [[ -f "next.config.js" ]] || [[ -f "next.config.mjs" ]]; then
        # Aplicação Next.js
        log_info "Detectada aplicação Next.js"
        if [[ "$NODE_ENV" == "production" ]]; then
            exec npm start
        else
            exec npm run dev
        fi
    elif [[ -f "package.json" ]] && grep -q "medusa" package.json; then
        # Aplicação MedusaJS
        log_info "Detectada aplicação MedusaJS"
        if [[ "$NODE_ENV" == "production" ]]; then
            exec npm run start
        else
            exec npm run dev
        fi
    else
        # Aplicação Node.js genérica
        log_info "Detectada aplicação Node.js"
        if [[ -f "dist/index.js" ]]; then
            exec node dist/index.js
        elif [[ -f "build/index.js" ]]; then
            exec node build/index.js
        elif [[ -f "index.js" ]]; then
            exec node index.js
        else
            log_error "Não foi possível determinar o ponto de entrada da aplicação"
            exit 1
        fi
    fi
}

# Executar função principal
main "$@"
