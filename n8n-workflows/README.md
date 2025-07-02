# N8N Workflows para Volaron Store

Esta pasta contém workflows N8N pré-configurados para automação e integração com IA no seu e-commerce.

## 🚀 Workflows Disponíveis

### 1. **Order Automation** (`order-automation.json`)
Automatiza o processamento de pedidos com IA:
- ✅ Detecta pedidos VIP (acima de R$ 5.000)
- ✅ Gera mensagens personalizadas com IA
- ✅ Envia emails VIP automaticamente
- ✅ Cria recomendações de produtos baseadas no histórico
- ✅ Atualiza metadados do cliente

### 2. **AI Chatbot** (`chatbot-ai.json`)
Chat inteligente 24/7 para atendimento:
- ✅ Responde perguntas sobre produtos
- ✅ Busca produtos relevantes
- ✅ Usa contexto do cliente para personalização
- ✅ Registra conversas para análise

### 3. **Product SEO Optimizer** (`product-seo-optimizer.json`)
Otimização automática de SEO:
- ✅ Roda a cada 6 horas
- ✅ Gera meta títulos e descrições com IA
- ✅ Cria palavras-chave relevantes
- ✅ Atualiza índice de busca MeiliSearch

### 4. **Component Generator** (`component-generator.json`)
Gerador de componentes React com IA:
- ✅ Cria componentes completos com TypeScript
- ✅ Gera testes unitários automaticamente
- ✅ Cria stories do Storybook
- ✅ Segue melhores práticas

## 📋 Como Importar os Workflows

1. **Acesse o N8N:**
   ```
   URL: https://n8n-automation-production-6e02.up.railway.app
   Login: admin
   Senha: volaron2025
   ```

2. **Importe cada workflow:**
   - Clique em "Workflows" no menu lateral
   - Clique em "Add workflow" → "Import from File"
   - Selecione o arquivo JSON do workflow
   - Clique em "Import"

3. **Configure as credenciais necessárias:**

### Credenciais Medusa API
```
Nome: Medusa API
Tipo: HTTP Header Auth
Header Name: x-medusa-access-token
Header Value: [Seu API Token do Medusa Admin]
```

### Credenciais Ollama
```
Nome: Ollama API
Tipo: HTTP Request
Base URL: http://ollama.railway.internal:11434
```

### Credenciais MeiliSearch
```
Nome: MeiliSearch
Tipo: HTTP Header Auth
Header Name: Authorization
Header Value: Bearer tnc6835yxnmm91q051495xshq74jlkzo
```

## 🔧 Variáveis de Ambiente

Certifique-se que estas variáveis estão configuradas no N8N:

```env
MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
N8N_WEBHOOK_URL=https://n8n-automation-production-6e02.up.railway.app
MEILISEARCH_API_KEY=tnc6835yxnmm91q051495xshq74jlkzo
```

## 🧪 Testando os Workflows

### Teste do Order Automation:
```bash
curl -X POST https://n8n-automation-production-6e02.up.railway.app/webhook/medusa/order-created \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "id": "order_123",
      "total": 5500,
      "email": "cliente@example.com",
      "customer_id": "cust_123"
    }
  }'
```

### Teste do Chatbot:
```bash
curl -X POST https://n8n-automation-production-6e02.up.railway.app/webhook/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Quais produtos vocês têm em promoção?",
    "session_id": "session_123"
  }'
```

### Teste do Component Generator:
```bash
curl -X POST https://n8n-automation-production-6e02.up.railway.app/webhook/generate/component \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Um card de produto com imagem, título, preço e botão de compra",
    "component_type": "ProductCard",
    "style_framework": "TailwindCSS"
  }'
```

## 📊 Monitoramento

- Acesse o painel de execuções no N8N para ver o histórico
- Configure notificações de erro no workflow
- Use o webhook de logging para análise

## 🆘 Troubleshooting

### Erro de Credenciais
- Verifique se todas as credenciais estão configuradas
- Teste as credenciais individualmente no N8N

### Webhook não responde
- Verifique se o workflow está ativo
- Confirme a URL do webhook está correta
- Cheque os logs de execução

### IA não responde
- Confirme que o Ollama está rodando
- Verifique se o modelo está instalado
- Teste a conexão interna: `http://ollama.railway.internal:11434`

## 🚀 Próximos Passos

1. Ative os workflows necessários
2. Configure as credenciais
3. Teste cada workflow
4. Monitore as execuções
5. Ajuste prompts de IA conforme necessário

---

**Precisa de ajuda?** Entre em contato com o suporte técnico ou consulte a documentação do N8N.
