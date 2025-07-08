# Configuração de Variáveis de Ambiente

## Railway (Backend)
\`\`\`env
# Vertex AI Configuration
VERTEX_PROJECT_ID=volaron-store
VERTEX_REGION=us-central1
VERTEX_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"volaron-store",...}'
VERTEX_MODEL=gemini-1.5-flash-001
ENABLE_VERTEX_AI=true

# Google Cloud Authentication
GOOGLE_APPLICATION_CREDENTIALS=/app/vertex-credentials.json
GOOGLE_CLOUD_PROJECT=volaron-store
\`\`\`

## Vercel (Frontend)
\`\`\`env
# Public Vertex AI Configuration
NEXT_PUBLIC_VERTEX_REGION=us-central1
NEXT_PUBLIC_VERTEX_MODEL=gemini-1.5-flash-001
NEXT_PUBLIC_AI_ENABLED=true

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-railway-backend.railway.app
\`\`\`

## Configuração Local (.env.local)
\`\`\`env
# Development Configuration
VERTEX_PROJECT_ID=volaron-store-dev
VERTEX_REGION=us-central1
VERTEX_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
