#!/bin/bash

# Volaron Store - Railway Startup Script
# Este script inicializa todos os serviços necessários no Railway

set -e  # Parar em caso de erro

echo "🚂 Iniciando Volaron Store no Railway..."
echo "================================================"

# Função para log com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar ambiente
log "📋 Verificando ambiente..."

if [ -z "$RAILWAY_ENVIRONMENT" ]; then
    log "⚠️  RAILWAY_ENVIRONMENT não definida, assumindo 'production'"
    export RAILWAY_ENVIRONMENT="production"
fi

log "🌍 Ambiente: $RAILWAY_ENVIRONMENT"
log "🏠 Diretório: $(pwd)"
log "👤 Usuário: $(whoami)"

# Verificar Node.js
if command_exists node; then
    log "✅ Node.js: $(node --version)"
else
    log "❌ Node.js não encontrado!"
    exit 1
fi

# Verificar npm
if command_exists npm; then
    log "✅ npm: $(npm --version)"
else
    log "❌ npm não encontrado!"
    exit 1
fi

# Verificar variáveis de ambiente essenciais
log "🔐 Verificando variáveis de ambiente..."

required_vars=(
    "DATABASE_URL"
    "GOOGLE_GENERATIVE_AI_API_KEY"
)

optional_vars=(
    "REDIS_URL"
    "MINIO_ENDPOINT"
    "MEILISEARCH_HOST"
    "HOST"
    "PORT"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log "❌ Variável obrigatória não definida: $var"
        exit 1
    else
        log "✅ $var definida"
    fi
done

for var in "${optional_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log "⚠️  Variável opcional não definida: $var"
    else
        log "✅ $var definida"
    fi
done

# Configurar PORT padrão se não definida
if [ -z "$PORT" ]; then
    export PORT=3000
    log "🔧 PORT definida como padrão: $PORT"
fi

# Configurar HOST padrão se não definida
if [ -z "$HOST" ]; then
    export HOST="0.0.0.0"
    log "🔧 HOST definida como padrão: $HOST"
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    log "📦 Instalando dependências..."
    npm ci --production
    log "✅ Dependências instaladas"
else
    log "✅ Dependências já instaladas"
fi

# Verificar se é um projeto MedusaJS
if [ -f "medusa-config.js" ] || [ -f "medusa-config.ts" ]; then
    log "🛍️  Projeto MedusaJS detectado"
    
    # Executar migrações se necessário
    if command_exists medusa; then
        log "🔄 Executando migrações do banco..."
        medusa migrations run || log "⚠️  Erro nas migrações (continuando...)"
    fi
    
    # Iniciar servidor MedusaJS
    log "🚀 Iniciando servidor MedusaJS..."
    exec npm start
    
elif [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then
    log "⚡ Projeto Next.js detectado"
    
    # Build se necessário
    if [ ! -d ".next" ]; then
        log "🔨 Fazendo build do Next.js..."
        npm run build
    fi
    
    # Iniciar servidor Next.js
    log "🚀 Iniciando servidor Next.js..."
    exec npm start
    
else
    log "🔧 Projeto Node.js genérico detectado"
    
    # Verificar se existe script de start
    if npm run | grep -q "start"; then
        log "🚀 Iniciando aplicação..."
        exec npm start
    elif [ -f "index.js" ]; then
        log "🚀 Iniciando index.js..."
        exec node index.js
    elif [ -f "server.js" ]; then
        log "🚀 Iniciando server.js..."
        exec node server.js
    elif [ -f "app.js" ]; then
        log "🚀 Iniciando app.js..."
        exec node app.js
    else
        log "❌ Não foi possível determinar como iniciar a aplicação"
        log "📋 Arquivos disponíveis:"
        ls -la
        exit 1
    fi
fi

# Este ponto não deveria ser alcançado devido ao exec acima
log "❌ Erro: script não deveria chegar aqui"
exit 1
