# 🚀 Guia de Migração: Vertex AI → Gemini AI Studio

## Opção 1: Migração Automática Completa (Recomendada)

\`\`\`bash
# 1. Tornar scripts executáveis
chmod +x scripts/*.js

# 2. Executar migração completa
node scripts/migrate-dependencies.js

# 3. Atualizar variáveis de ambiente
node scripts/update-env-vars.js

# 4. Verificar migração
node scripts/verify-migration.js
\`\`\`

## Opção 2: Usando Makefile (Mais Seguro)

\`\`\`bash
# Migração completa com backup
make full-migration

# Ou migração rápida
make safe-migration

# Verificar status
make status
\`\`\`

## Opção 3: Usando NPM Scripts

\`\`\`bash
# Adicionar scripts ao package.json (copiar de package-scripts-update.json)

# Executar migração
npm run migrate:full

# Ou migração rápida
npm run migrate:quick
\`\`\`

## Opção 4: Manual (Passo a Passo)

\`\`\`bash
# 1. Backup
cp package.json package.json.backup
cp .env .env.backup

# 2. Remover dependências antigas
npm uninstall @google-cloud/aiplatform google-auth-library

# 3. Instalar nova dependência
npm install @google/generative-ai

# 4. Verificar instalação
npm list @google/generative-ai

# 5. Testar importação
node -e "console.log(require('@google/generative-ai'))"
\`\`\`

## Verificação Pós-Migração

\`\`\`bash
# Verificar dependências
npm list --depth=0 | grep google

# Testar nova dependência
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
console.log('✅ GoogleGenerativeAI importada com sucesso');
"

# Verificar se antigas foram removidas
node -e "
try { 
  require('@google-cloud/aiplatform'); 
  console.log('⚠️ Dependência antiga ainda presente'); 
} catch(e) { 
  console.log('✅ Dependência antiga removida'); 
}
"
\`\`\`

## Atualização de Variáveis de Ambiente

### Railway (Backend)
1. Acesse https://railway.app/dashboard
2. Selecione projeto Volaron
3. Variables → Environment Variables
4. **REMOVER:**
   - VERTEX_PROJECT_ID
   - VERTEX_REGION
   - VERTEX_SERVICE_ACCOUNT_JSON
   - GOOGLE_APPLICATION_CREDENTIALS
5. **ADICIONAR:**
   - GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
   - GEMINI_MODEL=gemini-1.5-flash
   - ENABLE_GEMINI_AI=true

### Vercel (Frontend)
1. Acesse https://vercel.com/dashboard
2. Selecione projeto Volaron
3. Settings → Environment Variables
4. **ADICIONAR:**
   - NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
   - NEXT_PUBLIC_AI_PROVIDER=gemini-ai-studio

## Troubleshooting

### Erro: "Cannot find module '@google/generative-ai'"
\`\`\`bash
npm install @google/generative-ai --save
npm cache clean --force
\`\`\`

### Erro: "Module not found" após migração
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Restaurar backup em caso de erro
\`\`\`bash
cp package.json.backup package.json
cp .env.backup .env
npm install
\`\`\`

## Checklist Final

- [ ] ✅ @google/generative-ai instalada
- [ ] ✅ Dependências antigas removidas
- [ ] ✅ Variáveis de ambiente atualizadas
- [ ] ✅ Aplicação testada localmente
- [ ] ✅ Deploy realizado
- [ ] ✅ Monitoramento ativo
- [ ] ✅ Backups removidos (após confirmação)

## Comandos de Limpeza (Após Sucesso)

\`\`\`bash
# Remover backups
rm -f package.json.backup .env.backup .env.gemini-template

# Limpar cache
npm cache clean --force

# Otimizar dependências
npm dedupe
npm audit fix
\`\`\`
