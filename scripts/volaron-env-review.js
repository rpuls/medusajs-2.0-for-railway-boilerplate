#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🏪 Revisão de Variáveis de Ambiente - Volaron Store\n")

// Configurações específicas do Volaron Store
const volaronConfig = {
  // Variáveis específicas do negócio
  business: {
    VOLARON_STORE_NAME: "Volaron",
    VOLARON_STORE_TAGLINE: "Tudo em utilidades domésticas!",
    VOLARON_PRIMARY_COLOR: "#1a4d2e", // Verde
    VOLARON_SECONDARY_COLOR: "#ff6b35", // Laranja
    VOLARON_DELIVERY_REGION: "16100-16199", // CEPs Birigui
    VOLARON_BUSINESS_HOURS: "08:00-18:00",
    VOLARON_PHONE: "(18) 3636-1234",
  },

  // Variáveis AI específicas para e-commerce
  ai: {
    // Gemini AI Studio (Novo)
    GOOGLE_GENERATIVE_AI_API_KEY: "AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc",
    GEMINI_MODEL: "gemini-1.5-flash",
    ENABLE_GEMINI_AI: "true",
    AI_PROVIDER: "gemini-ai-studio",

    // Configurações específicas para e-commerce
    AI_PRODUCT_DESCRIPTION_MAX_WORDS: "300",
    AI_SEO_TITLE_MAX_CHARS: "60",
    AI_META_DESCRIPTION_MAX_CHARS: "160",
    AI_CHATBOT_CONTEXT: "volaron-ecommerce",
    AI_RECOMMENDATION_COUNT: "5",
    AI_CONTENT_LANGUAGE: "pt-BR",
    AI_BUSINESS_CONTEXT: "utilidades-domesticas-jardinagem",

    // Rate limiting para e-commerce
    AI_RATE_LIMIT_RPM: "15",
    AI_REQUEST_TIMEOUT: "30000",
    AI_RETRY_ATTEMPTS: "3",
    AI_CACHE_TTL: "3600", // 1 hora para descrições
  },

  // Variáveis removidas (Vertex AI)
  deprecated: [
    "VERTEX_PROJECT_ID",
    "VERTEX_REGION",
    "VERTEX_SERVICE_ACCOUNT_JSON",
    "VERTEX_MODEL",
    "ENABLE_VERTEX_AI",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_CLOUD_PROJECT",
  ],
}

// Função para analisar arquivo .env específico do Volaron
function analyzeVolaronEnvFile(filePath) {
  console.log(`📄 Analisando ${filePath} para Volaron Store...`)

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${filePath} não existe - será criado`)
    return createVolaronEnvFile(filePath)
  }

  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split("\n")
  const existingVars = {}

  // Parsear variáveis existentes
  lines.forEach((line) => {
    const match = line.match(/^([^#][^=]+)=(.*)$/)
    if (match) {
      existingVars[match[1].trim()] = match[2].trim()
    }
  })

  console.log("  🔍 Análise de variáveis:")

  // Verificar variáveis deprecated
  let hasDeprecated = false
  volaronConfig.deprecated.forEach((varName) => {
    if (existingVars[varName]) {
      console.log(`    ❌ REMOVER: ${varName}=${existingVars[varName]}`)
      hasDeprecated = true
    }
  })

  if (!hasDeprecated) {
    console.log("    ✅ Nenhuma variável deprecated encontrada")
  }

  // Verificar variáveis de negócio
  console.log("  🏪 Variáveis de negócio:")
  Object.entries(volaronConfig.business).forEach(([key, expectedValue]) => {
    if (existingVars[key]) {
      if (existingVars[key] === expectedValue) {
        console.log(`    ✅ ${key}: correto`)
      } else {
        console.log(`    ⚠️  ${key}: atual="${existingVars[key]}", esperado="${expectedValue}"`)
      }
    } else {
      console.log(`    ➕ ADICIONAR: ${key}=${expectedValue}`)
    }
  })

  // Verificar variáveis AI
  console.log("  🤖 Variáveis AI:")
  Object.entries(volaronConfig.ai).forEach(([key, expectedValue]) => {
    if (existingVars[key]) {
      console.log(`    ✅ ${key}: configurado`)
    } else {
      console.log(`    ➕ ADICIONAR: ${key}=${expectedValue}`)
    }
  })

  return {
    hasDeprecated,
    missingBusiness: Object.keys(volaronConfig.business).filter((key) => !existingVars[key]),
    missingAI: Object.keys(volaronConfig.ai).filter((key) => !existingVars[key]),
  }
}

// Função para criar arquivo .env otimizado para Volaron
function createVolaronEnvFile(filePath) {
  console.log(`  📝 Criando ${filePath} otimizado para Volaron Store...`)

  const envContent = `# Volaron Store - Environment Configuration
# Generated on ${new Date().toISOString()}

# ===========================================
# VOLARON STORE - BUSINESS CONFIGURATION
# ===========================================

${Object.entries(volaronConfig.business)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}

# ===========================================
# GEMINI AI STUDIO - AI CONFIGURATION
# ===========================================

${Object.entries(volaronConfig.ai)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}

# ===========================================
# MEDUSAJS - E-COMMERCE CONFIGURATION
# ===========================================

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/volaron_store

# Redis
REDIS_URL=redis://localhost:6379

# MinIO Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=volaron-media

# MeiliSearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_MASTER_KEY=masterKey

# JWT
JWT_SECRET=your-jwt-secret-here
COOKIE_SECRET=your-cookie-secret-here

# ===========================================
# NEXT.JS - FRONTEND CONFIGURATION
# ===========================================

NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_STORE_NAME=Volaron
NEXT_PUBLIC_PRIMARY_COLOR=#1a4d2e
NEXT_PUBLIC_SECONDARY_COLOR=#ff6b35

# ===========================================
# DEVELOPMENT ONLY
# ===========================================

NODE_ENV=development
LOG_LEVEL=debug
`

  fs.writeFileSync(filePath, envContent)
  console.log(`  ✅ ${filePath} criado com configurações do Volaron Store`)

  return {
    hasDeprecated: false,
    missingBusiness: [],
    missingAI: [],
  }
}

// Função para gerar relatório específico do Volaron
function generateVolaronReport() {
  console.log("📊 RELATÓRIO VOLARON STORE - CONFIGURAÇÃO DE AMBIENTE\n")
  console.log("=".repeat(60))

  const envFiles = [".env", ".env.local", ".env.development", ".env.production"]
  const results = {}

  envFiles.forEach((file) => {
    results[file] = analyzeVolaronEnvFile(file)
    console.log("")
  })

  // Resumo geral
  console.log("📋 RESUMO GERAL:")
  const totalDeprecated = Object.values(results).reduce((sum, r) => sum + (r.hasDeprecated ? 1 : 0), 0)
  const totalMissingBusiness = Object.values(results).reduce((sum, r) => sum + r.missingBusiness.length, 0)
  const totalMissingAI = Object.values(results).reduce((sum, r) => sum + r.missingAI.length, 0)

  console.log(`  • Arquivos com variáveis deprecated: ${totalDeprecated}`)
  console.log(`  • Variáveis de negócio faltando: ${totalMissingBusiness}`)
  console.log(`  • Variáveis AI faltando: ${totalMissingAI}`)

  // Próximos passos específicos
  console.log("\n🎯 PRÓXIMOS PASSOS VOLARON STORE:")
  console.log("  1. ✅ Executar script de atualização automática")
  console.log("  2. ✅ Configurar Railway com variáveis específicas")
  console.log("  3. ✅ Configurar Vercel com variáveis públicas")
  console.log("  4. ✅ Testar funcionalidades específicas do e-commerce")
  console.log("  5. ✅ Validar integração com MedusaJS")

  // Comandos específicos
  console.log("\n💻 COMANDOS PARA EXECUÇÃO:")
  console.log("  node scripts/update-volaron-env.js")
  console.log("  node scripts/test-volaron-integration.js")
  console.log("  node scripts/deploy-volaron-store.js")

  return results
}

// Executar análise
generateVolaronReport()
