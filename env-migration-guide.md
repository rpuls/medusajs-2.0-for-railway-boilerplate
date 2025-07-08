# Guia de Migração: Vertex AI → Gemini AI Studio

## Variáveis de Ambiente - ANTES (Vertex AI)
\`\`\`env
# Railway (backend) - REMOVER
VERTEX_PROJECT_ID=volaron-store
VERTEX_REGION=us-central1
VERTEX_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
VERTEX_MODEL=gemini-1.5-flash-001
ENABLE_VERTEX_AI=true
GOOGLE_APPLICATION_CREDENTIALS=/app/vertex-credentials.json
GOOGLE_CLOUD_PROJECT=volaron-store
\`\`\`

## Variáveis de Ambiente - DEPOIS (Gemini AI Studio)
\`\`\`env
# Railway (backend) - ADICIONAR
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
GEMINI_MODEL=gemini-1.5-flash
ENABLE_GEMINI_AI=true

# Vercel (frontend) - ADICIONAR
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_AI_PROVIDER=gemini-ai-studio
\`\`\`

## Dependências - Atualizar package.json
\`\`\`json
{
  "dependencies": {
    // REMOVER
    // "@google-cloud/aiplatform": "^3.x.x",
    // "google-auth-library": "^9.x.x",
    
    // ADICIONAR
    "@google/generative-ai": "^0.2.1"
  }
}
\`\`\`

## Checklist de Migração
- [ ] Instalar nova dependência: \`npm install @google/generative-ai\`
- [ ] Remover dependências antigas: \`npm uninstall @google-cloud/aiplatform google-auth-library\`
- [ ] Atualizar variáveis de ambiente no Railway
- [ ] Atualizar variáveis de ambiente no Vercel
- [ ] Testar todas as funcionalidades
- [ ] Monitorar rate limits (15 RPM)
- [ ] Verificar logs de erro
