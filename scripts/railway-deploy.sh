#!/bin/bash

# Railway Deploy Script - Volaron Store
# Script para deploy automatizado no Railway

set -e

echo "🚂 Railway Deploy - Volaron Store"
echo "================================="

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado"
    echo "📥 Instalando Railway CLI..."
    npm install -g @railway/cli
fi

# Verificar se está logado
if ! railway whoami &> /dev/null; then
    echo "❌ Não está logado no Railway"
    echo "🔑 Execute: railway login"
    exit 1
fi

# Verificar se está conectado ao projeto
if ! railway status &> /dev/null; then
    echo "❌ Não está conectado ao projeto"
    echo "🔗 Conectando ao projeto..."
    railway link -p 39f18594-7d52-49ea-b7c3-be245e8d66f2
fi

# Verificar variáveis essenciais
echo "🔍 Verificando variáveis de ambiente..."

REQUIRED_VARS=(
    "GEMINI_API_KEY"
    "DATABASE_URL"
    "REDIS_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if railway variables | grep -q "$var"; then
        echo "✅ $var configurada"
    else
        echo "❌ $var não configurada"
        echo "⚠️ Configure com: railway variables"
        exit 1
    fi
done

# Executar testes antes do deploy
echo "🧪 Executando testes..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test || {
        echo "❌ Testes falharam"
        read -p "Continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
fi

# Limpar cache se necessário
echo "🧹 Limpando cache..."
rm -rf .next/cache 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Verificar se há mudanças para commit
if [ -d ".git" ]; then
    if ! git diff --quiet; then
        echo "⚠️ Há mudanças não commitadas"
        read -p "Fazer commit automático? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Deploy automático - $(date '+%Y-%m-%d %H:%M:%S')"
        fi
    fi
fi

# Executar setup automático
echo "⚙️ Executando setup automático..."
if [ -f "scripts/railway-auto-setup.sh" ]; then
    chmod +x scripts/railway-auto-setup.sh
    ./scripts/railway-auto-setup.sh
else
    echo "⚠️ Script de setup não encontrado"
fi

# Deploy
echo "🚀 Iniciando deploy..."
railway up --detach

# Aguardar deploy
echo "⏳ Aguardando deploy..."
sleep 10

# Verificar status do deploy
echo "📊 Verificando status..."
railway status

# Obter URL do projeto
PROJECT_URL=$(railway domain 2>/dev/null || echo "URL não disponível")
echo "🌐 URL do projeto: $PROJECT_URL"

# Executar health check
echo "❤️ Executando health check..."
if [ "$PROJECT_URL" != "URL não disponível" ]; then
    sleep 30 # Aguardar aplicação inicializar
    
    if curl -f -s "$PROJECT_URL/api/copilot/health" > /dev/null; then
        echo "✅ Health check passou"
    else
        echo "⚠️ Health check falhou"
        echo "📋 Verificando logs..."
        railway logs --tail 50
    fi
else
    echo "⚠️ Não foi possível obter URL para health check"
fi

# Mostrar logs recentes
echo "📋 Logs recentes:"
railway logs --tail 20

# Resumo do deploy
echo ""
echo "🎯 RESUMO DO DEPLOY"
echo "=================="
echo "✅ Deploy concluído"
echo "🌐 URL: $PROJECT_URL"
echo "📊 Status: $(railway status | head -1)"
echo "⏰ Horário: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🔗 Links úteis:"
echo "   Dashboard: https://railway.app/project/39f18594-7d52-49ea-b7c3-be245e8d66f2"
echo "   Logs: railway logs --follow"
echo "   Variáveis: railway variables"
echo ""

# Salvar informações do deploy
cat > deploy-info.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "projectId": "39f18594-7d52-49ea-b7c3-be245e8d66f2",
  "url": "$PROJECT_URL",
  "environment": "production",
  "deployedBy": "$(whoami)",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "railwayStatus": "$(railway status | head -1)"
}
EOF

echo "📄 Informações do deploy salvas em: deploy-info.json"
echo "🎉 Deploy concluído com sucesso!"
