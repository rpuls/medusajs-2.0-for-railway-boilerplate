# 🔍 Como Encontrar a URL do Frontend Vercel

## Método 1: Dashboard Vercel (Recomendado)

### Passo 1: Acessar Dashboard
1. Acesse: https://vercel.com/dashboard
2. Faça login com sua conta (exzos)

### Passo 2: Localizar Projeto
1. Procure pelo projeto "v0-volaron-project" na lista
2. Clique no projeto

### Passo 3: Encontrar URL
Na página do projeto, você verá:
- **Production URL**: Esta é a URL principal (ex: `https://v0-volaron-project.vercel.app`)
- **Preview URLs**: URLs de preview para branches

## Método 2: Vercel CLI

\`\`\`bash
# Instalar Vercel CLI (se não tiver)
npm install -g vercel

# Fazer login
vercel login

# Listar projetos e URLs
vercel ls

# Ou ver detalhes do projeto específico
vercel inspect v0-volaron-project
\`\`\`

## Método 3: Através do Git

Se você fez deploy via Git, a URL geralmente segue o padrão:
- **Formato**: `https://[nome-do-projeto].vercel.app`
- **Seu caso**: `https://v0-volaron-project.vercel.app`

## Configuração da Variável

Depois de encontrar a URL, configure:

\`\`\`bash
# No Railway
railway variables set VERCEL_FRONTEND_URL=https://v0-volaron-project.vercel.app

# Ou no arquivo .env local
echo "VERCEL_FRONTEND_URL=https://v0-volaron-project.vercel.app" >> .env
