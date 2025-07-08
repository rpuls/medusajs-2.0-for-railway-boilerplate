#!/bin/bash

# Railway Auto Setup - Volaron Store
# Setup automático para execução no Railway

set -e

echo "🔧 Railway Auto Setup - Volaron Store"
echo "====================================="

# Verificar ambiente
if [ "$NODE_ENV" = "production" ]; then
    echo "🚀 Ambiente: PRODUÇÃO"
else
    echo "🛠️ Ambiente: DESENVOLVIMENTO"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p .copilot
mkdir -p mcp-servers/logs
mkdir -p monitoring/logs
mkdir -p exports
mkdir -p uploads
mkdir -p public/images

# Configurar permissões
echo "🔐 Configurando permissões..."
chmod +x scripts/*.sh 2>/dev/null || true
chmod +x mcp-servers/*.js 2>/dev/null || true

# Verificar dependências essenciais
echo "📦 Verificando dependências..."

REQUIRED_PACKAGES=(
    "@google/generative-ai"
    "@modelcontextprotocol/sdk"
    "next"
    "react"
)

for package in "${REQUIRED_PACKAGES[@]}"; do
    if npm list "$package" &>/dev/null; then
        echo "✅ $package instalado"
    else
        echo "❌ $package não encontrado"
        echo "📥 Instalando $package..."
        npm install "$package" --save
    fi
done

# Verificar variáveis de ambiente críticas
echo "🔍 Verificando variáveis de ambiente..."

CRITICAL_VARS=(
    "NODE_ENV"
    "PORT"
)

for var in "${CRITICAL_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "✅ $var = ${!var}"
    else
        echo "⚠️ $var não definida"
    fi
done

# Configurar variáveis derivadas
echo "⚙️ Configurando variáveis derivadas..."

export NEXT_TELEMETRY_DISABLED=1
export AI_PROVIDER=${AI_PROVIDER:-"gemini-ai-studio"}
export GOOGLE_AI_MODEL=${GOOGLE_AI_MODEL:-"gemini-1.5-flash-001"}
export MCP_VERBOSE=${MCP_VERBOSE:-"false"}

# Criar arquivo de configuração MCP se não existir
if [ ! -f "mcp-servers/config.json" ]; then
    echo "📝 Criando configuração MCP..."
    cat > mcp-servers/config.json << 'EOF'
{
  "mcpServers": {
    "volaron-store": {
      "command": "node",
      "args": ["./mcp-servers/volaron-store-server.js"],
      "env": {
        "NODE_ENV": "production",
        "MEDUSA_BACKEND_URL": "https://backend-production-c461d.up.railway.app",
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "gemini-ai": {
      "command": "node",
      "args": ["./mcp-servers/gemini-ai-server.js"],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}",
        "GOOGLE_AI_MODEL": "gemini-1.5-flash-001",
        "NODE_ENV": "production"
      }
    },
    "analytics": {
      "command": "node",
      "args": ["./mcp-servers/analytics-server.js"],
      "env": {
        "NODE_ENV": "production",
        "ANALYTICS_DB_URL": "${DATABASE_URL}"
      }
    }
  },
  "settings": {
    "autoRestart": true,
    "healthCheckInterval": 30000,
    "logLevel": "info",
    "maxRestarts": 3
  }
}
EOF
fi

# Criar arquivo de health check
echo "❤️ Criando health check..."
cat > health-check.js << 'EOF'
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/copilot/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Health check passou');
    process.exit(0);
  } else {
    console.log(`❌ Health check falhou: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log(`❌ Health check erro: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
EOF

# Criar script de inicialização
echo "🚀 Criando script de inicialização..."
cat > start-railway.sh << 'EOF'
#!/bin/bash

echo "🚂 Iniciando Volaron Store no Railway"
echo "===================================="

# Verificar porta
PORT=${PORT:-3000}
echo "🔌 Porta: $PORT"

# Verificar variáveis críticas
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️ GEMINI_API_KEY não configurada"
fi

# Iniciar servidores MCP em background
echo "🤖 Iniciando servidores MCP..."
node scripts/start-mcp-servers.js start &
MCP_PID=$!

# Aguardar um pouco para MCP inicializar
sleep 5

# Iniciar aplicação principal
echo "🚀 Iniciando aplicação principal..."
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi

# Cleanup ao sair
trap "kill $MCP_PID 2>/dev/null" EXIT
EOF

chmod +x start-railway.sh

# Verificar se tudo está configurado
echo "🔍 Verificação final..."

if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json não encontrado"
fi

if [ -f "next.config.mjs" ]; then
    echo "✅ next.config.mjs encontrado"
else
    echo "⚠️ next.config.mjs não encontrado"
fi

# Limpar cache se necessário
if [ "$NODE_ENV" = "production" ]; then
    echo "🧹 Limpando cache de desenvolvimento..."
    rm -rf .next/cache 2>/dev/null || true
    rm -rf node_modules/.cache 2>/dev/null || true
fi

echo ""
echo "✅ Setup automático concluído!"
echo "🚀 Pronto para inicializar no Railway"
echo ""
echo "📊 Próximos passos:"
echo "   1. Verificar variáveis de ambiente"
echo "   2. Executar build"
echo "   3. Iniciar aplicação"
EOF

chmod +x scripts/railway-auto-setup.sh
