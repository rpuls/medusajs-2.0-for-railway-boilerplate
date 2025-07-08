#!/bin/bash

# Script para configurar variável HOST no Railway
# Railway CLI atualizado usa comandos diferentes

set -e

echo "🔧 Configurando variável HOST no Railway"
echo "========================================"

# Verificar se está conectado
if ! railway status &> /dev/null; then
    echo "❌ Não conectado ao Railway"
    echo "🔗 Execute: railway link -p 39f18594-7d52-49ea-b7c3-be245e8d66f2"
    exit 1
fi

echo "🔍 Verificando variáveis atuais..."

# Verificar se HOST já existe
if railway variables | grep -q "^HOST "; then
    echo "✅ HOST já configurada:"
    railway variables | grep "^HOST "
else
    echo "❌ HOST não encontrada"
    echo ""
    echo "🔧 Para configurar HOST, use um destes métodos:"
    echo ""
    echo "MÉTODO 1 - Railway Dashboard (Recomendado):"
    echo "1. Acesse: https://railway.app/project/39f18594-7d52-49ea-b7c3-be245e8d66f2"
    echo "2. Vá em: Settings > Environment > Variables"
    echo "3. Clique em 'New Variable'"
    echo "4. Nome: HOST"
    echo "5. Valor: 0.0.0.0"
    echo "6. Clique em 'Add'"
    echo ""
    echo "MÉTODO 2 - Railway CLI (Novo formato):"
    echo "railway service --help  # Ver comandos disponíveis"
    echo ""
    echo "MÉTODO 3 - Arquivo .env (Para desenvolvimento local):"
    echo "echo 'HOST=0.0.0.0' >> .env"
fi

# Verificar MEILISEARCH_HOST que está vazio
echo ""
echo "🔍 Verificando MEILISEARCH_HOST..."
if railway variables | grep -q "MEILISEARCH_HOST.*│.*│$"; then
    echo "⚠️ MEILISEARCH_HOST está vazio"
    echo "💡 Valor sugerido: https://meilisearch-production-010d.up.railway.app"
    echo ""
    echo "Para configurar MEILISEARCH_HOST:"
    echo "1. Dashboard: https://railway.app/project/39f18594-7d52-49ea-b7c3-be245e8d66f2"
    echo "2. Edite a variável MEILISEARCH_HOST"
    echo "3. Valor: https://meilisearch-production-010d.up.railway.app"
fi

# Verificar outras variáveis que podem estar vazias
echo ""
echo "🔍 Verificando outras variáveis vazias..."

EMPTY_VARS=$(railway variables | grep "│.*│$" | awk -F'│' '{print $1}' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')

if [ -n "$EMPTY_VARS" ]; then
    echo "⚠️ Variáveis vazias encontradas:"
    echo "$EMPTY_VARS"
    echo ""
    echo "💡 Valores sugeridos:"
    echo "MEILISEARCH_HOST = https://meilisearch-production-010d.up.railway.app"
    echo "MINIO_ENDPOINT = https://bucket-production-5a5e.up.railway.app"
    echo "HOST = 0.0.0.0"
fi

# Criar arquivo de configuração
echo ""
echo "📄 Criando arquivo de configuração..."

cat > railway-host-config.md << 'EOF'
# Configuração da Variável HOST - Railway

## Problema
O comando `railway variables set` não existe na versão atual do Railway CLI.

## Soluções

### 1. Railway Dashboard (RECOMENDADO)
