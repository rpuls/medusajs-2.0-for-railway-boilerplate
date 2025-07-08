#!/bin/bash

# Volaron Store - Railway Startup Script
# Este script inicializa todos os serviços necessários no Railway

set -e  # Exit on any error

echo "🚂 Iniciando Volaron Store no Railway..."
echo "Timestamp: $(date)"

# Função para log com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    log "❌ Node.js não encontrado!"
    exit 1
fi

log "✅ Node.js version: $(node --version)"
log "✅ NPM version: $(npm --version)"

# Verificar variáveis de ambiente essenciais
log "🔍 Verificando variáveis de ambiente..."

required_vars=(
    "NODE_ENV"
    "PORT"
    "DATABASE_URL"
    "GEMINI_API_KEY"
    "NEXT_PUBLIC_MEDUSA_BACKEND_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    else
        log "✅ $var configurada"
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    log "❌ Variáveis de ambiente faltando: ${missing_vars[*]}"
    log "⚠️  Continuando com valores padrão..."
fi

# Configurar valores padrão
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export NEXT_TELEMETRY_DISABLED=1

log "🔧 Configuração do ambiente:"
log "   NODE_ENV: $NODE_ENV"
log "   PORT: $PORT"

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    log "❌ package.json não encontrado!"
    exit 1
fi

# Instalar dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
    log "📦 Instalando dependências..."
    npm ci --production
    log "✅ Dependências instaladas"
else
    log "✅ Dependências já instaladas"
fi

# Verificar se o build existe, se não, fazer build
if [ ! -d ".next" ] && [ -f "next.config.js" ]; then
    log "🏗️  Fazendo build da aplicação..."
    npm run build
    log "✅ Build concluído"
fi

# Iniciar servidores MCP se existirem
if [ -d "mcp-servers" ]; then
    log "🤖 Iniciando servidores MCP..."
    
    # Tornar scripts executáveis
    chmod +x mcp-servers/*.js 2>/dev/null || true
    
    # Iniciar servidores em background
    if [ -f "mcp-servers/volaron-store-server.js" ]; then
        nohup node mcp-servers/volaron-store-server.js > mcp-servers/logs/volaron-store.log 2>&1 &
        log "✅ Volaron Store MCP Server iniciado"
    fi
    
    if [ -f "mcp-servers/gemini-ai-server.js" ]; then
        nohup node mcp-servers/gemini-ai-server.js > mcp-servers/logs/gemini-ai.log 2>&1 &
        log "✅ Gemini AI MCP Server iniciado"
    fi
    
    # Aguardar servidores iniciarem
    sleep 3
fi

# Executar migrações de banco se necessário
if command_exists npx && [ -f "package.json" ]; then
    if grep -q "medusa" package.json; then
        log "🗄️  Executando migrações do Medusa..."
        npx medusa migrations run || log "⚠️  Migrações falharam, continuando..."
    fi
fi

# Verificar saúde dos serviços
log "🏥 Verificando saúde dos serviços..."

# Health check básico
health_check() {
    local service_name=$1
    local check_command=$2
    
    if eval "$check_command" >/dev/null 2>&1; then
        log "✅ $service_name: Saudável"
        return 0
    else
        log "❌ $service_name: Com problemas"
        return 1
    fi
}

# Verificar se a porta está livre
if command_exists lsof; then
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
        log "⚠️  Porta $PORT já está em uso"
        # Tentar matar processo na porta
        lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
fi

# Função de cleanup
cleanup() {
    log "🧹 Executando cleanup..."
    
    # Matar processos MCP
    pkill -f "mcp-servers" 2>/dev/null || true
    
    # Limpar arquivos temporários
    rm -rf /tmp/volaron-* 2>/dev/null || true
    
    log "✅ Cleanup concluído"
}

# Registrar função de cleanup para execução na saída
trap cleanup EXIT

# Criar diretórios de log se não existirem
mkdir -p logs mcp-servers/logs monitoring/logs

# Iniciar monitoramento em background
if [ -f "monitoring/continuous-monitor.js" ]; then
    log "📊 Iniciando monitoramento contínuo..."
    nohup node monitoring/continuous-monitor.js > monitoring/logs/monitor.log 2>&1 &
fi

# Verificar se é uma aplicação Next.js ou Medusa
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    log "🚀 Iniciando aplicação Next.js..."
    
    # Verificar se existe script start
    if npm run | grep -q "start"; then
        exec npm start
    else
        exec npx next start -p $PORT
    fi
    
elif [ -f "medusa-config.js" ] || grep -q "medusa" package.json; then
    log "🚀 Iniciando servidor Medusa..."
    
    if npm run | grep -q "start"; then
        exec npm start
    else
        exec npx medusa start
    fi
    
else
    log "🚀 Iniciando aplicação Node.js..."
    
    # Tentar diferentes pontos de entrada
    if [ -f "server.js" ]; then
        exec node server.js
    elif [ -f "index.js" ]; then
        exec node index.js
    elif [ -f "app.js" ]; then
        exec node app.js
    elif npm run | grep -q "start"; then
        exec npm start
    else
        log "❌ Não foi possível determinar como iniciar a aplicação"
        exit 1
    fi
fi
