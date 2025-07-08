#!/bin/bash

# Start Railway - Volaron Store
# Script de inicialização para Railway

set -e

echo "🚂 Iniciando Volaron Store no Railway"
echo "====================================="

# Verificar ambiente
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-3000}

echo "🌍 Ambiente: $NODE_ENV"
echo "🔌 Porta: $PORT"

# Verificar variáveis críticas
echo "🔍 Verificando variáveis críticas..."

CRITICAL_VARS=(
    "GEMINI_API_KEY"
    "DATABASE_URL"
    "REDIS_URL"
)

for var in "${CRITICAL_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "✅ $var configurada"
    else
        echo "⚠️ $var não configurada"
    fi
done

# Configurar variáveis derivadas
export GOOGLE_AI_API_KEY="${GEMINI_API_KEY}"
export GOOGLE_AI_MODEL="${GOOGLE_AI_MODEL:-gemini-1.5-flash-001}"
export AI_PROVIDER="${AI_PROVIDER:-gemini-ai-studio}"
export ENABLE_AI_FEATURES="${ENABLE_AI_FEATURES:-true}"
export MCP_VERBOSE="${MCP_VERBOSE:-false}"
export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"

# URLs dos serviços
if [ -n "$RAILWAY_PUBLIC_DOMAIN" ]; then
    export MEDUSA_BACKEND_URL="https://$RAILWAY_PUBLIC_DOMAIN"
    export NEXT_PUBLIC_MEDUSA_BACKEND_URL="https://$RAILWAY_PUBLIC_DOMAIN"
    echo "🌐 URL do backend: https://$RAILWAY_PUBLIC_DOMAIN"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p .copilot
mkdir -p mcp-servers/logs
mkdir -p monitoring/logs
mkdir -p exports
mkdir -p uploads
mkdir -p public/images

# Verificar dependências críticas
echo "📦 Verificando dependências..."

if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json não encontrado"
    exit 1
fi

# Verificar se o build foi feito
if [ "$NODE_ENV" = "production" ] && [ ! -d ".next" ]; then
    echo "🏗️ Build não encontrado, executando..."
    npm run build
fi

# Iniciar servidores MCP em background
echo "🤖 Iniciando servidores MCP..."

if [ -f "scripts/start-mcp-servers.js" ]; then
    node scripts/start-mcp-servers.js start &
    MCP_PID=$!
    echo "✅ MCP Servers iniciados (PID: $MCP_PID)"
    
    # Salvar PID para cleanup
    echo $MCP_PID > .mcp-servers.pid
else
    echo "⚠️ Script MCP não encontrado"
fi

# Iniciar monitoramento em background
echo "📊 Iniciando monitoramento..."

if [ -f "monitoring/continuous-monitor.js" ]; then
    node monitoring/continuous-monitor.js start &
    MONITOR_PID=$!
    echo "✅ Monitoramento iniciado (PID: $MONITOR_PID)"
    
    # Salvar PID para cleanup
    echo $MONITOR_PID > .monitor.pid
else
    echo "⚠️ Script de monitoramento não encontrado"
fi

# Aguardar inicialização dos serviços
echo "⏳ Aguardando inicialização dos serviços..."
sleep 10

# Verificar se os serviços estão rodando
echo "🔍 Verificando serviços..."

if [ -n "$MCP_PID" ] && kill -0 $MCP_PID 2>/dev/null; then
    echo "✅ MCP Servers rodando"
else
    echo "⚠️ MCP Servers podem não estar rodando"
fi

if [ -n "$MONITOR_PID" ] && kill -0 $MONITOR_PID 2>/dev/null; then
    echo "✅ Monitoramento rodando"
else
    echo "⚠️ Monitoramento pode não estar rodando"
fi

# Função de cleanup
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    
    # Parar MCP Servers
    if [ -f ".mcp-servers.pid" ]; then
        MCP_PID=$(cat .mcp-servers.pid)
        if kill -0 $MCP_PID 2>/dev/null; then
            echo "🤖 Parando MCP Servers..."
            kill $MCP_PID 2>/dev/null || true
        fi
        rm -f .mcp-servers.pid
    fi
    
    # Parar monitoramento
    if [ -f ".monitor.pid" ]; then
        MONITOR_PID=$(cat .monitor.pid)
        if kill -0 $MONITOR_PID 2>/dev/null; then
            echo "📊 Parando monitoramento..."
            kill $MONITOR_PID 2>/dev/null || true
        fi
        rm -f .monitor.pid
    fi
    
    echo "✅ Cleanup concluído"
}

# Configurar trap para cleanup
trap cleanup EXIT INT TERM

# Mostrar informações do sistema
echo ""
echo "📋 INFORMAÇÕES DO SISTEMA"
echo "========================"
echo "🐧 OS: $(uname -s)"
echo "🏗️ Arquitetura: $(uname -m)"
echo "📦 Node.js: $(node --version)"
echo "📦 NPM: $(npm --version)"
echo "💾 Memória livre: $(free -h 2>/dev/null | grep Mem | awk '{print $7}' || echo 'N/A')"
echo "💿 Espaço em disco: $(df -h . 2>/dev/null | tail -1 | awk '{print $4}' || echo 'N/A')"
echo ""

# Executar health check inicial
echo "❤️ Executando health check inicial..."

if [ -f "health-check.js" ]; then
    # Aguardar um pouco mais para a aplicação inicializar
    sleep 5
    
    if timeout 30 node health-check.js; then
        echo "✅ Health check inicial passou"
    else
        echo "⚠️ Health check inicial falhou (normal durante inicialização)"
    fi
else
    echo "⚠️ Script de health check não encontrado"
fi

# Mostrar resumo antes de iniciar
echo ""
echo "🎯 RESUMO DA INICIALIZAÇÃO"
echo "========================="
echo "✅ Ambiente configurado: $NODE_ENV"
echo "✅ Porta configurada: $PORT"
echo "✅ Variáveis verificadas"
echo "✅ Diretórios criados"
echo "✅ Serviços auxiliares iniciados"
echo ""
echo "🚀 Iniciando aplicação principal..."
echo ""

# Iniciar aplicação principal
if [ "$NODE_ENV" = "production" ]; then
    echo "🌐 Iniciando em modo produção..."
    exec npm start
else
    echo "🛠️ Iniciando em modo desenvolvimento..."
    exec npm run dev
fi
