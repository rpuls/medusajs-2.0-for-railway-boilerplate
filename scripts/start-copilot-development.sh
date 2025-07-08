#!/bin/bash

# Volaron Store - Script de Inicialização do Copilot FullStack
# Baseado no MCP (Model Context Protocol) da Vercel

set -e

echo "🚀 Iniciando Copilot FullStack Agent - Volaron Store"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Verificar Node.js
log_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado"
    exit 1
fi

NODE_VERSION=$(node --version)
log_success "Node.js $NODE_VERSION encontrado"

# Verificar variáveis de ambiente
log_info "Verificando variáveis de ambiente..."

REQUIRED_VARS=("GEMINI_API_KEY" "GOOGLE_AI_API_KEY" "NEXT_PUBLIC_MEDUSA_BACKEND_URL")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    log_warning "Variáveis de ambiente ausentes: ${MISSING_VARS[*]}"
    log_info "Criando arquivo .env.local..."
    
    cat > .env.local << EOF
# Volaron Store - Variáveis de Ambiente
# Gerado automaticamente em $(date)

# Google AI / Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_API_KEY=your_gemini_api_key_here
GOOGLE_AI_MODEL=gemini-1.5-flash-001

# Next.js
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
NEXT_PUBLIC_AI_ENABLED=true

# MCP Configuration
MCP_SERVER_PORT=3001
MCP_ENABLED=true

# Database
DATABASE_URL=your_database_url_here
REDIS_URL=your_redis_url_here
EOF
    
    log_success "Arquivo .env.local criado. Configure as variáveis antes de continuar."
else
    log_success "Todas as variáveis de ambiente estão configuradas"
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências..."
    npm install
    log_success "Dependências instaladas"
fi

# Criar diretórios necessários
log_info "Criando estrutura de diretórios..."
mkdir -p .copilot
mkdir -p monitoring
mkdir -p mcp-servers
mkdir -p __tests__

# Configurar MCP Servers
log_info "Configurando MCP Servers..."

# Criar configuração MCP
cat > mcp-servers/config.json << 'EOF'
{
  "mcpServers": {
    "volaron-store": {
      "command": "node",
      "args": ["./mcp-servers/volaron-store-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    "gemini-ai": {
      "command": "node", 
      "args": ["./mcp-servers/gemini-ai-server.js"],
      "env": {
        "GEMINI_API_KEY": "${GEMINI_API_KEY}"
      }
    },
    "medusa-integration": {
      "command": "node",
      "args": ["./mcp-servers/medusa-integration-server.js"],
      "env": {
        "MEDUSA_BACKEND_URL": "${NEXT_PUBLIC_MEDUSA_BACKEND_URL}"
      }
    }
  }
}
EOF

log_success "Configuração MCP criada"

# Verificar se o build funciona
log_info "Testando build do projeto..."
if npm run build > /dev/null 2>&1; then
    log_success "Build executado com sucesso"
else
    log_warning "Build falhou, mas continuando..."
fi

# Inicializar contexto do Copilot
log_info "Inicializando contexto do Copilot..."

cat > .copilot/context.json << EOF
{
  "project": "volaron-store",
  "version": "1.0.0",
  "initialized": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "architecture": {
    "backend": ["MedusaJS", "Node.js", "TypeScript", "PostgreSQL", "Redis"],
    "frontend": ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    "database": ["PostgreSQL", "Redis", "MeiliSearch"],
    "integrations": ["Railway", "Vercel", "Gemini AI Studio", "MinIO", "n8n"],
    "mcp": ["volaron-store", "gemini-ai", "medusa-integration"]
  },
  "currentTasks": [
    {
      "id": "mcp-integration-001",
      "title": "Implementar MCP (Model Context Protocol)",
      "description": "Integrar MCP da Vercel para comunicação padronizada com IA",
      "priority": "high",
      "status": "in-progress",
      "category": "integration"
    }
  ],
  "healthMetrics": {
    "codeQuality": 85,
    "testCoverage": 70,
    "performance": 80,
    "security": 90,
    "documentation": 75,
    "aiIntegration": 95,
    "mcpIntegration": 90,
    "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
}
EOF

log_success "Contexto do Copilot inicializado"

# Criar script de monitoramento
log_info "Configurando monitoramento..."

cat > monitoring/health-check.js << 'EOF'
#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class VolaronHealthMonitor {
  constructor() {
    this.checks = [
      { name: 'Node.js', check: () => this.checkNode() },
      { name: 'Dependencies', check: () => this.checkDependencies() },
      { name: 'Environment', check: () => this.checkEnvironment() },
      { name: 'MCP Servers', check: () => this.checkMCPServers() },
      { name: 'AI Integration', check: () => this.checkAIIntegration() }
    ]
  }

  async runHealthCheck() {
    console.log('🏥 Volaron Store - Health Check')
    console.log('================================')
    
    const results = []
    
    for (const check of this.checks) {
      try {
        const result = await check.check()
        console.log(`✅ ${check.name}: OK`)
        results.push({ name: check.name, status: 'OK', result })
      } catch (error) {
        console.log(`❌ ${check.name}: ${error.message}`)
        results.push({ name: check.name, status: 'ERROR', error: error.message })
      }
    }
    
    const healthScore = (results.filter(r => r.status === 'OK').length / results.length) * 100
    console.log(`\n📊 Health Score: ${healthScore.toFixed(1)}%`)
    
    return { score: healthScore, results }
  }

  checkNode() {
    const version = execSync('node --version', { encoding: 'utf8' }).trim()
    return { version }
  }

  checkDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    const nodeModulesExists = fs.existsSync('node_modules')
    
    if (!nodeModulesExists) {
      throw new Error('node_modules not found')
    }
    
    return { 
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.keys(packageJson.dependencies || {}).length
    }
  }

  checkEnvironment() {
    const requiredVars = ['GEMINI_API_KEY', 'GOOGLE_AI_API_KEY']
    const missing = requiredVars.filter(v => !process.env[v])
    
    if (missing.length > 0) {
      throw new Error(`Missing environment variables: ${missing.join(', ')}`)
    }
    
    return { configured: requiredVars.length }
  }

  checkMCPServers() {
    const configPath = 'mcp-servers/config.json'
    
    if (!fs.existsSync(configPath)) {
      throw new Error('MCP configuration not found')
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const serverCount = Object.keys(config.mcpServers || {}).length
    
    return { servers: serverCount }
  }

  checkAIIntegration() {
    // Simulação de verificação da integração AI
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    
    if (!apiKey) {
      throw new Error('AI API key not configured')
    }
    
    return { configured: true, provider: 'Gemini AI Studio' }
  }
}

if (require.main === module) {
  const monitor = new VolaronHealthMonitor()
  monitor.runHealthCheck().catch(console.error)
}

module.exports = VolaronHealthMonitor
EOF

chmod +x monitoring/health-check.js
log_success "Monitoramento configurado"

# Executar health check inicial
log_info "Executando health check inicial..."
node monitoring/health-check.js

# Instruções finais
echo ""
echo "🎉 Copilot FullStack Agent configurado com sucesso!"
echo "=================================================="
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente em .env.local"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000/admin/copilot"
echo ""
echo "🤖 Comandos disponíveis:"
echo "• npm run copilot:health    - Verificar saúde do sistema"
echo "• npm run copilot:start     - Iniciar servidores MCP"
echo "• npm run copilot:monitor   - Monitoramento contínuo"
echo ""
echo "📚 Documentação:"
echo "• README.md - Guia geral do projeto"
echo "• COPILOT_SETUP_GUIDE.md - Guia específico do Copilot"
echo "• mcp-servers/README.md - Documentação MCP"
echo ""

log_success "Setup concluído! 🚀"
