#!/bin/bash

# Script de verificação da configuração Railway
# Verifica se todas as variáveis estão configuradas corretamente

set -e

echo "🔍 VERIFICAÇÃO DA CONFIGURAÇÃO RAILWAY"
echo "====================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se uma variável existe
check_variable() {
    local var_name=$1
    local expected_value=$2
    
    if railway variables | grep -q "^║ $var_name"; then
        local current_value=$(railway variables | grep "^║ $var_name" | awk -F'│' '{print $2}' | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
        
        if [ -n "$current_value" ] && [ "$current_value" != "" ]; then
            echo -e "${GREEN}✅ $var_name${NC}: $current_value"
            return 0
        else
            echo -e "${RED}❌ $var_name${NC}: VAZIO"
            if [ -n "$expected_value" ]; then
                echo -e "   ${YELLOW}💡 Valor sugerido: $expected_value${NC}"
            fi
            return 1
        fi
    else
        echo -e "${RED}❌ $var_name${NC}: NÃO ENCONTRADA"
        if [ -n "$expected_value" ]; then
            echo -e "   ${YELLOW}💡 Valor sugerido: $expected_value${NC}"
        fi
        return 1
    fi
}

# Verificar conexão com Railway
echo -e "${BLUE}🔗 Verificando conexão com Railway...${NC}"
if ! railway status &> /dev/null; then
    echo -e "${RED}❌ Não conectado ao Railway${NC}"
    echo "Execute: railway link -p 39f18594-7d52-49ea-b7c3-be245e8d66f2"
    exit 1
fi
echo -e "${GREEN}✅ Conectado ao Railway${NC}"
echo ""

# Lista de variáveis críticas para verificar
echo -e "${BLUE}🔍 Verificando variáveis críticas...${NC}"
echo ""

CRITICAL_VARS=(
    "HOST:0.0.0.0"
    "NODE_ENV:production"
    "DATABASE_URL:"
    "REDIS_URL:"
    "GEMINI_API_KEY:"
    "MEILISEARCH_HOST:https://meilisearch-production-010d.up.railway.app"
    "MINIO_ENDPOINT:https://bucket-production-5a5e.up.railway.app"
    "JWT_SECRET:"
    "COOKIE_SECRET:"
)

failed_checks=0

for var_info in "${CRITICAL_VARS[@]}"; do
    IFS=':' read -r var_name expected_value <<< "$var_info"
    if ! check_variable "$var_name" "$expected_value"; then
        ((failed_checks++))
    fi
done

echo ""

# Verificar URLs dos serviços
echo -e "${BLUE}🌐 Verificando URLs dos serviços...${NC}"

SERVICES=(
    "Backend:https://backend-production-c461d.up.railway.app"
    "Storefront:https://storefront-production-bd8d.up.railway.app"
    "MeiliSearch:https://meilisearch-production-010d.up.railway.app"
    "MinIO:https://bucket-production-5a5e.up.railway.app"
    "N8N:https://n8n-automation-production-6e02.up.railway.app"
)

for service_info in "${SERVICES[@]}"; do
    IFS=':' read -r service_name service_url <<< "$service_info"
    echo -e "${YELLOW}🔗 $service_name${NC}: $service_url"
    
    # Testar conectividade (opcional)
    if command -v curl &> /dev/null; then
        if curl -s --head --request GET "$service_url" | grep "200\|301\|302" > /dev/null; then
            echo -e "   ${GREEN}✅ Acessível${NC}"
        else
            echo -e "   ${YELLOW}⚠️ Pode estar inicializando...${NC}"
        fi
    fi
done

echo ""

# Resumo da verificação
if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}🎉 CONFIGURAÇÃO COMPLETA!${NC}"
    echo -e "${GREEN}✅ Todas as variáveis críticas estão configuradas${NC}"
    echo ""
    echo -e "${BLUE}🚀 PRÓXIMOS PASSOS:${NC}"
    echo "1. railway deploy"
    echo "2. railway logs --tail 50"
    echo "3. Testar endpoints da API"
else
    echo -e "${RED}⚠️ CONFIGURAÇÃO INCOMPLETA${NC}"
    echo -e "${RED}❌ $failed_checks variável(is) precisam ser configuradas${NC}"
    echo ""
    echo -e "${YELLOW}🔧 AÇÕES NECESSÁRIAS:${NC}"
    echo "1. Configure as variáveis marcadas como ❌"
    echo "2. Use o Railway Dashboard para editar"
    echo "3. Execute este script novamente"
fi

# Criar arquivo de status
cat > railway-status.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project_id": "39f18594-7d52-49ea-b7c3-be245e8d66f2",
  "failed_checks": $failed_checks,
  "status": $([ $failed_checks -eq 0 ] && echo '"ready"' || echo '"needs_configuration"'),
  "services": {
    "backend": "https://backend-production-c461d.up.railway.app",
    "storefront": "https://storefront-production-bd8d.up.railway.app",
    "meilisearch": "https://meilisearch-production-010d.up.railway.app",
    "minio": "https://bucket-production-5a5e.up.railway.app",
    "n8n": "https://n8n-automation-production-6e02.up.railway.app"
  }
}
EOF

echo ""
echo -e "${BLUE}📄 Status salvo em: railway-status.json${NC}"

# Links úteis
echo ""
echo -e "${BLUE}🔗 LINKS ÚTEIS:${NC}"
echo "Dashboard: https://railway.app/project/39f18594-7d52-49ea-b7c3-be245e8d66f2"
echo "Backend Service: https://railway.app/project/39f18594-7d52-49ea-b7c3-be245e8d66f2/service/25b5a6f8-29e4-48d6-a229-3a61e1e34843"
echo "Logs: railway logs --tail 50"
echo "Deploy: railway deploy"
