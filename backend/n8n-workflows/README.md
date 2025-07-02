# N8N Workflows para Volaron Store

Este diretório contém workflows pré-configurados para automação da loja usando N8N.

## 🚀 Como Importar

1. Acesse seu N8N: https://n8n-automation-production-6e02.up.railway.app
2. Vá em "Workflows" > "Import from File"
3. Selecione o arquivo JSON desejado

## 📋 Workflows Disponíveis

### 1. order-automation.json
- **Descrição**: Automação completa de pedidos
- **Recursos**:
  - Notificação por email ao cliente
  - Atualização de estoque
  - Análise de fraude com IA
  - Integração com sistemas de entrega

### 2. product-ai-enhancement.json
- **Descrição**: Melhoria de produtos com IA
- **Recursos**:
  - Geração automática de descrições
  - Otimização de SEO
  - Análise de precificação
  - Sugestões de cross-sell

### 3. customer-engagement.json
- **Descrição**: Engajamento inteligente de clientes
- **Recursos**:
  - Email marketing personalizado
  - Carrinho abandonado
  - Programa de fidelidade
  - Análise de comportamento

### 4. inventory-management.json
- **Descrição**: Gestão inteligente de estoque
- **Recursos**:
  - Alertas de estoque baixo
  - Previsão de demanda
  - Reposição automática
  - Relatórios de movimento

### 5. storefront-automation.json
- **Descrição**: Automação do desenvolvimento
- **Recursos**:
  - Deploy automático
  - Geração de componentes
  - Testes automatizados
  - Otimização de performance

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

Adicione estas variáveis ao seu backend Medusa:

```env
# N8N Integration
N8N_WEBHOOK_URL=https://n8n-automation-production-6e02.up.railway.app
N8N_WEBHOOK_SECRET=medusa_webhook_volaron_2025
N8N_API_KEY=your_n8n_api_key

# AI Integration
OLLAMA_API_URL=http://ollama.railway.internal:11434
AI_MODEL=llama3.1
ENABLE_AI_FEATURES=true
```

### Credenciais N8N

Configure estas credenciais no N8N:

1. **Medusa API**:
   - Type: Header Auth
   - Name: Medusa API
   - Header Name: `x-publishable-api-key`
   - Header Value: `[sua API key]`

2. **Ollama AI**:
   - Type: HTTP Request
   - Base URL: `http://ollama.railway.internal:11434`

3. **Email (SMTP)**:
   - Configure com suas credenciais SMTP

## 🎯 Casos de Uso

### E-commerce Inteligente
- Recomendações personalizadas baseadas em histórico
- Previsão de churn e ações preventivas
- Otimização dinâmica de preços
- Análise de sentimento em reviews

### Automação Operacional
- Processamento automático de pedidos
- Gestão inteligente de estoque
- Relatórios automatizados
- Integração com transportadoras

### Marketing Automatizado
- Campanhas personalizadas
- Recuperação de carrinho abandonado
- Programa de fidelidade gamificado
- Social media automation

### Desenvolvimento Ágil
- CI/CD automatizado
- Geração de código com IA
- Testes automatizados
- Deploy sem downtime

## 📊 Métricas e Monitoramento

Cada workflow inclui:
- Logging detalhado
- Métricas de performance
- Alertas de erro
- Dashboard de acompanhamento

## 🤝 Suporte

- Documentação N8N: https://docs.n8n.io
- MedusaJS: https://docs.medusajs.com
- Issues: https://github.com/exzosdigital/volaron-store/issues