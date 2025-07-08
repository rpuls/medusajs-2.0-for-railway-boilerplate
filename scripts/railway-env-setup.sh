#!/bin/bash

# Railway Environment Setup - Volaron Store
# Configuração de variáveis de ambiente específicas

set -e

echo "🔧 Railway Environment Setup"
echo "============================"

# Verificar se está conectado ao Railway
if ! railway status &> /dev/null; then
    echo "❌ Não conectado ao Railway"
    echo "🔗 Execute: railway link -p 39f18594-7d52-49ea-b7c3-be245e8d66f2"
    exit 1
fi

# Função para verificar se variável existe
check_var() {
    local var_name=$1
    if railway variables | grep -q "^$var_name"; then
        echo "✅ $var_name já configurada"
        return 0
    else
        echo "❌ $var_name não encontrada"
        return 1
    fi
}

# Função para configurar variável via Railway CLI
set_var() {
    local var_name=$1
    local var_value=$2
    local var_description=$3
    
    echo "⚙️ Configurando $var_name..."
    echo "   Descrição: $var_description"
    
    # Usar railway variables para abrir interface
    echo "🔧 Abra o painel de variáveis e adicione:"
    echo "   Nome: $var_name"
    echo "   Valor: $var_value"
    echo ""
    read -p "Pressione Enter após configurar a variável..."
}

echo "🔍 Verificando variáveis essenciais..."

# Variáveis essenciais já configuradas (baseado na saída fornecida)
CONFIGURED_VARS=(
    "GEMINI_API_KEY"
    "DATABASE_URL"
    "REDIS_URL"
    "NODE_ENV"
    "RAILWAY_PUBLIC_DOMAIN"
    "MEDUSA_ADMIN_EMAIL"
    "MEDUSA_ADMIN_PASSWORD"
    "JWT_SECRET"
    "COOKIE_SECRET"
)

for var in "${CONFIGURED_VARS[@]}"; do
    check_var "$var"
done

# Verificar variáveis derivadas necessárias
echo ""
echo "🔧 Configurando variáveis derivadas..."

# Variáveis que podem estar faltando
DERIVED_VARS=(
    "GOOGLE_AI_API_KEY:${GEMINI_API_KEY}:Chave da API do Google AI (cópia da Gemini)"
    "GOOGLE_AI_MODEL:gemini-1.5-flash-001:Modelo do Google AI"
    "AI_PROVIDER:gemini-ai-studio:Provedor de IA"
    "ENABLE_AI_FEATURES:true:Habilitar recursos de IA"
    "MCP_VERBOSE:false:Logs verbosos do MCP"
    "NEXT_TELEMETRY_DISABLED:1:Desabilitar telemetria do Next.js"
    "MEDUSA_BACKEND_URL:https://backend-production-c461d.up.railway.app:URL do backend Medusa"
    "STOREFRONT_URL:https://storefront-production-bd8d.up.railway.app:URL do storefront"
    "MEILISEARCH_URL:https://meilisearch-production-010d.up.railway.app:URL do MeiliSearch"
    "N8N_URL:https://n8n-automation-production-6e02.up.railway.app:URL do N8N"
)

for var_config in "${DERIVED_VARS[@]}"; do
    IFS=':' read -r var_name var_value var_desc <<< "$var_config"
    
    if ! check_var "$var_name"; then
        echo "📝 Variável sugerida: $var_name"
        echo "   Valor sugerido: $var_value"
        echo "   Descrição: $var_desc"
        echo ""
    fi
done

# Verificar configurações específicas do MCP
echo ""
echo "🤖 Verificando configurações MCP..."

MCP_VARS=(
    "MCP_AUTO_RESTART:true:Auto-restart dos servidores MCP"
    "MCP_HEALTH_CHECK_INTERVAL:30000:Intervalo de health check (ms)"
    "MCP_MAX_RESTARTS:3:Máximo de restarts automáticos"
    "MCP_LOG_LEVEL:info:Nível de log do MCP"
)

for var_config in "${MCP_VARS[@]}"; do
    IFS=':' read -r var_name var_value var_desc <<< "$var_config"
    
    if ! check_var "$var_name"; then
        echo "🔧 Configuração MCP sugerida: $var_name = $var_value"
    fi
done

# Verificar configurações de monitoramento
echo ""
echo "📊 Verificando configurações de monitoramento..."

MONITOR_VARS=(
    "MONITOR_ENABLED:true:Habilitar monitoramento contínuo"
    "MONITOR_INTERVAL:60000:Intervalo de monitoramento (ms)"
    "MONITOR_ALERT_WEBHOOK:${RAILWAY_WEBHOOK_URL:-}:Webhook para alertas"
    "HEALTH_CHECK_TIMEOUT:10000:Timeout para health checks (ms)"
)

for var_config in "${MONITOR_VARS[@]}"; do
    IFS=':' read -r var_name var_value var_desc <<< "$var_config"
    
    if ! check_var "$var_name"; then
        echo "📈 Configuração de monitoramento sugerida: $var_name = $var_value"
    fi
done

# Verificar URLs e endpoints
echo ""
echo "🌐 Verificando URLs e endpoints..."

# Obter informações atuais do Railway
CURRENT_DOMAIN=$(railway variables | grep "RAILWAY_PUBLIC_DOMAIN " | awk '{print $3}' || echo "")

if [ -n "$CURRENT_DOMAIN" ]; then
    echo "✅ Domínio atual: $CURRENT_DOMAIN"
    
    # Testar conectividade
    echo "🧪 Testando conectividade..."
    if curl -f -s "https://$CURRENT_DOMAIN/health" > /dev/null 2>&1; then
        echo "✅ Endpoint /health respondendo"
    else
        echo "⚠️ Endpoint /health não responde (normal se ainda não deployado)"
    fi
else
    echo "⚠️ Domínio não encontrado"
fi

# Criar arquivo de configuração para referência
echo ""
echo "📄 Criando arquivo de referência..."

cat > railway-env-reference.md << EOF
# Railway Environment Variables - Volaron Store

## Variáveis Essenciais (Já Configuradas)
- GEMINI_API_KEY: Chave da API do Gemini AI
- DATABASE_URL: URL do PostgreSQL
- REDIS_URL: URL do Redis
- NODE_ENV: Ambiente (production)
- RAILWAY_PUBLIC_DOMAIN: Domínio público do Railway

## Variáveis Derivadas Sugeridas
- GOOGLE_AI_API_KEY: \${GEMINI_API_KEY}
- GOOGLE_AI_MODEL: gemini-1.5-flash-001
- AI_PROVIDER: gemini-ai-studio
- ENABLE_AI_FEATURES: true
- MCP_VERBOSE: false
- NEXT_TELEMETRY_DISABLED: 1

## URLs dos Serviços
- Backend: https://backend-production-c461d.up.railway.app
- Storefront: https://storefront-production-bd8d.up.railway.app
- MeiliSearch: https://meilisearch-production-010d.up.railway.app
- N8N: https://n8n-automation-production-6e02.up.railway.app

## Configurações MCP
- MCP_AUTO_RESTART: true
- MCP_HEALTH_CHECK_INTERVAL: 30000
- MCP_MAX_RESTARTS: 3
- MCP_LOG_LEVEL: info

## Configurações de Monitoramento
- MONITOR_ENABLED: true
- MONITOR_INTERVAL: 60000
- HEALTH_CHECK_TIMEOUT: 10000

## Como Configurar
1. Execute: railway variables
2. Adicione as variáveis necessárias
3. Faça deploy: railway up

## Verificar Configuração
\`\`\`bash
railway variables
railway status
railway logs --tail 20
\`\`\`
EOF

echo "✅ Arquivo de referência criado: railway-env-reference.md"

# Resumo final
echo ""
echo "🎯 RESUMO DA CONFIGURAÇÃO"
echo "========================"
echo "✅ Variáveis essenciais verificadas"
echo "📝 Arquivo de referência criado"
echo "🔧 Para configurar variáveis: railway variables"
echo "🚀 Para deploy: railway up"
echo "📊 Para monitorar: railway logs --follow"
echo ""
echo "🔗 Links úteis:"
echo "   Dashboard: https://railway.app/project/39f18594-7d52-49ea-b7c3-be245e8d66f2"
echo "   Documentação: https://docs.railway.app"
echo ""

# Verificar se tudo está pronto para deploy
echo "🏁 Verificação final..."

READY_FOR_DEPLOY=true

# Verificar arquivos essenciais
REQUIRED_FILES=(
    "package.json"
    "scripts/railway-auto-setup.sh"
    "mcp-servers/config.json"
    "start-railway.sh"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file não encontrado"
        READY_FOR_DEPLOY=false
    fi
done

if [ "$READY_FOR_DEPLOY" = true ]; then
    echo ""
    echo "🎉 PRONTO PARA DEPLOY!"
    echo "Execute: railway up"
else
    echo ""
    echo "⚠️ Alguns arquivos estão faltando"
    echo "Verifique os arquivos listados acima"
fi
