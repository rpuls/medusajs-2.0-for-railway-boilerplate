# 🤖 Copilot FullStack Agent - Guia de Configuração

## Visão Geral

O **Copilot FullStack Agent** é um assistente de desenvolvimento inteligente para o projeto Volaron Store, baseado no **MCP (Model Context Protocol)** da Vercel e integrado com **Gemini AI Studio**.

## 🏗️ Arquitetura

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Copilot FullStack Agent                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend Interface  │  Backend Orchestrator  │  MCP Layer  │
│  ┌─────────────────┐ │  ┌──────────────────┐  │ ┌─────────┐ │
│  │ Chat Interface  │ │  │ Task Manager     │  │ │ Volaron │ │
│  │ Health Dashboard│ │  │ Code Generator   │  │ │ Server  │ │
│  │ Roadmap View    │ │  │ Project Analyzer │  │ │         │ │
│  │ Quick Actions   │ │  │ Health Monitor   │  │ ├─────────┤ │
│  └─────────────────┘ │  └──────────────────┘  │ │ Gemini  │ │
└─────────────────────────────────────────────────│ Server  │─┤
                                                  │         │ │
┌─────────────────────────────────────────────────├─────────┤ │
│                External Integrations            │ Medusa  │ │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│ Server  │ │
│  │Railway  │ │Vercel   │ │MedusaJS │ │n8n     ││         │ │
│  │Backend  │ │Frontend │ │E-commerce│ │Workflow││         │ │
│  └─────────┘ └─────────┘ └─────────┘ └────────┘└─────────┘ │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 🚀 Instalação Rápida

### 1. Executar Setup Automático

\`\`\`bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/exzosdigital/volaron-project
cd volaron-project

# Executar setup completo
npm run copilot:setup
\`\`\`

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` criado automaticamente:

\`\`\`env
# Google AI / Gemini
GEMINI_API_KEY=sua_api_key_aqui
GOOGLE_AI_API_KEY=sua_api_key_aqui
GOOGLE_AI_MODEL=gemini-1.5-flash-001

# Next.js
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://backend-production-c461d.up.railway.app
NEXT_PUBLIC_AI_ENABLED=true

# MCP Configuration
MCP_SERVER_PORT=3001
MCP_ENABLED=true
\`\`\`

### 3. Iniciar Desenvolvimento

\`\`\`bash
# Instalar dependências
npm install

# Iniciar servidores MCP
npm run mcp:start

# Iniciar aplicação
npm run dev
\`\`\`

### 4. Acessar Copilot

Abra seu navegador em: `http://localhost:3000/admin/copilot`

## 🔧 Configuração Manual

### Dependências MCP

\`\`\`bash
# Instalar SDK MCP
npm install @modelcontextprotocol/sdk @vercel/ai-sdk

# Instalar dependências AI
npm install @google/generative-ai ai
\`\`\`

### Estrutura de Diretórios

\`\`\`
volaron-project/
├── .copilot/                 # Contexto e configurações do Copilot
│   ├── context.json         # Contexto do projeto
│   └── config.json          # Configurações
├── mcp-servers/             # Servidores MCP
│   ├── volaron-store-server.js
│   ├── gemini-ai-server.js
│   ├── medusa-integration-server.js
│   └── config.json
├── monitoring/              # Scripts de monitoramento
│   ├── health-check.js
│   └── continuous-monitor.js
├── backend/
│   ├── services/
│   │   ├── copilot-orchestrator.ts
│   │   └── gemini-ai-studio.ts
│   └── api/
│       └── copilot/
│           └── route.ts
└── frontend/
    └── components/
        └── copilot-fullstack-agent.tsx
\`\`\`

## 🎯 Funcionalidades

### 1. **Chat AI Inteligente**
- Processamento de linguagem natural
- Comandos contextuais
- Histórico de conversas
- Sugestões automáticas

### 2. **Geração de Código**
\`\`\`
Comandos disponíveis:
• "gerar componente de produto"
• "criar API para carrinho"
• "refatorar arquivo X"
• "otimizar performance"
\`\`\`

### 3. **Análise de Projeto**
- Métricas de saúde em tempo real
- Análise de dependências
- Detecção de problemas
- Sugestões de melhoria

### 4. **Gerenciamento de Tarefas**
- Roadmap automático
- Priorização inteligente
- Execução automatizada
- Tracking de progresso

### 5. **Monitoramento Contínuo**
- Health checks automáticos
- Alertas proativos
- Métricas de performance
- Relatórios detalhados

## 🔌 Integração MCP

### Servidores Disponíveis

#### 1. **Volaron Store Server**
\`\`\`javascript
// Funcionalidades:
- Análise de produtos
- Gestão de estoque
- Relatórios de vendas
- Integração com MedusaJS
\`\`\`

#### 2. **Gemini AI Server**
\`\`\`javascript
// Funcionalidades:
- Geração de conteúdo
- Análise de texto
- Tradução automática
- Otimização SEO
\`\`\`

#### 3. **Medusa Integration Server**
\`\`\`javascript
// Funcionalidades:
- Gestão de produtos
- Processamento de pedidos
- Gestão de clientes
- Relatórios financeiros
\`\`\`

### Configuração MCP

\`\`\`json
{
  "mcpServers": {
    "volaron-store": {
      "command": "node",
      "args": ["./mcp-servers/volaron-store-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
\`\`\`

## 🎨 Interface do Usuário

### Tabs Principais

1. **Overview** - Visão geral do projeto
2. **Chat AI** - Interface de conversação
3. **Saúde** - Métricas e alertas
4. **Tarefas** - Gerenciamento de tasks
5. **Roadmap** - Planejamento visual

### Ações Rápidas

- 🔍 Analisar Projeto
- 💻 Gerar Componente
- 🏥 Verificar Saúde
- 🎯 Atualizar Roadmap
- 🚀 Executar Migração
- 📊 Relatório Diário

## 📊 Comandos Disponíveis

### NPM Scripts

\`\`\`bash
# Copilot
npm run copilot:health    # Health check
npm run copilot:start     # Iniciar MCP servers
npm run copilot:monitor   # Monitoramento contínuo
npm run copilot:setup     # Setup completo

# MCP
npm run mcp:install       # Instalar dependências MCP
npm run mcp:start         # Iniciar servidores MCP
npm run mcp:test          # Testar conexões

# AI
npm run ai:test           # Testar integração AI
npm run ai:benchmark      # Benchmark de performance

# Migração
npm run migration:execute # Executar migração
npm run migration:verify  # Verificar migração
\`\`\`

### Comandos do Chat

\`\`\`
Análise:
• "analisar projeto atual"
• "verificar saúde do sistema"
• "gerar relatório diário"

Geração de Código:
• "gerar componente de login"
• "criar API para produtos"
• "refatorar componente X"

Tarefas:
• "listar tarefas pendentes"
• "executar tarefa [ID]"
• "criar nova tarefa"

Automação:
• "executar migração"
• "otimizar performance"
• "atualizar dependências"
\`\`\`

## 🔍 Monitoramento

### Health Checks Automáticos

\`\`\`javascript
Verificações incluem:
✅ Node.js e dependências
✅ Variáveis de ambiente
✅ Servidores MCP
✅ Integração AI
✅ Conectividade de rede
✅ Performance da aplicação
\`\`\`

### Métricas Monitoradas

- **Qualidade do Código**: 85%
- **Cobertura de Testes**: 70%
- **Performance**: 80%
- **Segurança**: 90%
- **Documentação**: 75%
- **Integração AI**: 95%

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. **MCP Servers não iniciam**
\`\`\`bash
# Verificar configuração
cat mcp-servers/config.json

# Testar conexão
npm run mcp:test

# Reiniciar servidores
npm run mcp:start
\`\`\`

#### 2. **API Key inválida**
\`\`\`bash
# Verificar variáveis
echo $GEMINI_API_KEY

# Testar API
npm run ai:test
\`\`\`

#### 3. **Build falha**
\`\`\`bash
# Limpar cache
npm run clean

# Reinstalar dependências
npm run reset

# Build novamente
npm run build
\`\`\`

### Logs e Debug

\`\`\`bash
# Logs do Copilot
tail -f .copilot/logs/copilot.log

# Logs MCP
tail -f mcp-servers/logs/mcp.log

# Health check detalhado
npm run copilot:health -- --verbose
\`\`\`

## 🔄 Atualizações

### Atualizar Copilot

\`\`\`bash
# Baixar atualizações
git pull origin main

# Atualizar dependências
npm update

# Re-executar setup
npm run copilot:setup
\`\`\`

### Migração de Versões

\`\`\`bash
# Backup do contexto atual
cp .copilot/context.json .copilot/context.backup.json

# Executar migração
npm run migration:execute

# Verificar migração
npm run migration:verify
\`\`\`

## 📚 Recursos Adicionais

### Documentação

- [MCP Protocol](https://github.com/vercel-labs/mcp-for-next.js)
- [Gemini AI Studio](https://ai.google.dev/)
- [MedusaJS Docs](https://docs.medusajs.com/)
- [Next.js Docs](https://nextjs.org/docs)

### Comunidade

- [Discord Volaron](https://discord.gg/volaron)
- [GitHub Issues](https://github.com/exzosdigital/volaron-project/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/volaron-store)

### Suporte

Para suporte técnico:
1. Verificar [FAQ](./FAQ.md)
2. Executar `npm run copilot:health`
3. Abrir issue no GitHub
4. Contatar suporte: support@volaron.com.br

---

**Desenvolvido com ❤️ pela equipe ExzosDigital**
