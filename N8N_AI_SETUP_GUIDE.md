# 🚀 Guia de Configuração N8N + IA

## ✅ Status da Implementação

### 1. **Backend Medusa**
- ✅ Webhook subscriber configurado e ativado
- ✅ API de integração com IA criada
- ✅ Variáveis de ambiente configuradas
- 🔄 Deploy em andamento...

### 2. **N8N Automation**
- ✅ Serviço instalado e rodando
- ✅ 4 workflows criados e prontos para importar
- ✅ Integração com Ollama (IA local)

### 3. **IA Local (Ollama)**
- ✅ Ollama instalado
- ✅ Open WebUI disponível
- ⏳ Aguardando configuração de modelos

## 📌 Próximos Passos

### 1. **Acessar N8N e Importar Workflows**

```bash
URL: https://n8n-automation-production-6e02.up.railway.app
Login: admin
Senha: volaron2025
```

**Workflows para importar:**
1. `backend/n8n-workflows/order-automation.json` - Processamento de pedidos
2. `backend/n8n-workflows/chatbot-ai.json` - Chat inteligente
3. `backend/n8n-workflows/component-generator.json` - Gerador de componentes
4. `backend/n8n-workflows/product-seo-optimizer.json` - Otimização SEO

**Como importar:**
1. No N8N, vá em "Workflows" > "Import from File"
2. Selecione cada arquivo JSON
3. Ative o workflow clicando no switch

### 2. **Configurar Modelos de IA**

Acesse: https://open-webui-production-7371.up.railway.app

```bash
# No terminal do Ollama (via Railway):
ollama pull llama3.1        # Modelo geral (7GB)
ollama pull codellama       # Para código (4GB)
ollama pull mistral         # Alternativa rápida (4GB)
```

### 3. **Integrar Componentes no Storefront**

Adicione ao seu layout principal (`storefront/src/app/layout.tsx`):

```tsx
import { AIAssistant } from '@/components/ai-assistant';
import { SmartChat, ChatProvider } from '@/components/smart-chat';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ChatProvider>
          {children}
          <AIAssistant />
          <SmartChat />
        </ChatProvider>
      </body>
    </html>
  );
}
```

### 4. **Configurar Credenciais no N8N**

No N8N, vá em "Credentials" e adicione:

#### **Medusa API**
- Type: `Header Auth`
- Header Name: `x-publishable-api-key`
- Header Value: `[copie de seu admin Medusa]`

#### **Medusa Admin API**
- Type: `Header Auth`
- Header Name: `Authorization`
- Header Value: `Bearer [seu-token-admin]`

#### **GitHub** (opcional, para component generator)
- Type: `OAuth2`
- Ou use Personal Access Token

### 5. **Testar Integrações**

#### **Teste 1: Webhook de Pedido**
1. Crie um pedido teste no storefront
2. Verifique no N8N se o webhook foi recebido
3. O workflow deve processar automaticamente

#### **Teste 2: Chat com IA**
1. Abra o storefront
2. Clique no ícone de chat (canto inferior esquerdo)
3. Digite: "Olá, preciso de ajuda"
4. O bot deve responder

#### **Teste 3: AI Assistant**
1. Abra um produto no admin
2. Clique no botão AI Assistant (canto inferior direito)
3. Selecione "Melhorar Descrição"
4. A IA deve gerar uma nova descrição

## 🔧 Variáveis de Ambiente

Certifique-se que estas variáveis estão configuradas no Railway:

### **Backend Medusa**
```env
N8N_WEBHOOK_URL=https://n8n-automation-production-6e02.up.railway.app
N8N_WEBHOOK_SECRET=medusa_webhook_volaron_2025
N8N_API_KEY=n8n_api_volaron_2025
OLLAMA_API_URL=http://ollama.railway.internal:11434
AI_MODEL=llama3.1
ENABLE_AI_FEATURES=true
```

### **Storefront**
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n-automation-production-6e02.up.railway.app
```

## 🎯 Casos de Uso Prontos

### 1. **E-commerce Inteligente**
- ✅ Chat 24/7 com IA
- ✅ Descrições otimizadas automaticamente
- ✅ Recomendações personalizadas
- ✅ Detecção de fraude

### 2. **Automação Operacional**
- ✅ Processamento automático de pedidos
- ✅ Emails personalizados
- ✅ Alertas de estoque baixo
- ✅ Relatórios automáticos

### 3. **Desenvolvimento Acelerado**
- ✅ Geração de componentes React
- ✅ Testes automatizados
- ✅ Deploy automático
- ✅ Code review com IA

## 📊 Monitoramento

### **N8N Dashboard**
- Execuções: Ver histórico de workflows
- Logs: Debugar problemas
- Métricas: Performance e uso

### **Railway Logs**
```bash
railway logs -s backend
railway logs -s n8n-automation
railway logs -s ollama
```

### **Testes de Carga**
- N8N suporta até 100 execuções/minuto
- Ollama: 10-20 requests/minuto (depende do modelo)
- Para escalar: adicione workers no N8N

## 🚨 Troubleshooting

### **Problema: Webhooks não chegam no N8N**
- Verifique se o backend reiniciou após configuração
- Teste webhook manual: `curl -X POST https://n8n-automation.../webhook/test`

### **Problema: IA não responde**
- Verifique se Ollama está rodando: `railway logs -s ollama`
- Teste direto: `curl http://ollama.railway.internal:11434/api/tags`

### **Problema: Chat não aparece**
- Verifique console do browser
- Confirme variáveis de ambiente no storefront

## 🎉 Parabéns!

Seu e-commerce agora tem:
- 🤖 IA integrada em toda a plataforma
- 🔄 Automação completa de processos
- 💬 Atendimento inteligente 24/7
- 🚀 Desenvolvimento acelerado com IA

## 📞 Suporte

- Documentação N8N: https://docs.n8n.io
- Documentação Medusa: https://docs.medusajs.com
- Issues: https://github.com/exzosdigital/exzosvega/issues

---

**Criado com ❤️ pela equipe Exzos Digital**