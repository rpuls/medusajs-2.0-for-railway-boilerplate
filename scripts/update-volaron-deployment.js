#!/usr/bin/env node

const { execSync } = require("child_process")

console.log("🚀 Atualizando Deployment - Volaron Store\n")

// Configurações específicas do Volaron para Railway (Backend)
const railwayVolaronConfig = {
  // Variáveis de negócio
  VOLARON_STORE_NAME: "Volaron",
  VOLARON_STORE_TAGLINE: "Tudo em utilidades domésticas!",
  VOLARON_PRIMARY_COLOR: "#1a4d2e",
  VOLARON_SECONDARY_COLOR: "#ff6b35",
  VOLARON_DELIVERY_REGION: "16100-16199",
  VOLARON_BUSINESS_HOURS: "08:00-18:00",
  VOLARON_PHONE: "(18) 3636-1234",

  // AI Configuration
  GOOGLE_GENERATIVE_AI_API_KEY: "AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc",
  GEMINI_MODEL: "gemini-1.5-flash",
  ENABLE_GEMINI_AI: "true",
  AI_PROVIDER: "gemini-ai-studio",

  // E-commerce AI específico
  AI_PRODUCT_DESCRIPTION_MAX_WORDS: "300",
  AI_SEO_TITLE_MAX_CHARS: "60",
  AI_META_DESCRIPTION_MAX_CHARS: "160",
  AI_CHATBOT_CONTEXT: "volaron-ecommerce",
  AI_RECOMMENDATION_COUNT: "5",
  AI_CONTENT_LANGUAGE: "pt-BR",
  AI_BUSINESS_CONTEXT: "utilidades-domesticas-jardinagem",
  AI_RATE_LIMIT_RPM: "15",
  AI_REQUEST_TIMEOUT: "30000",
  AI_CACHE_TTL: "3600",

  // MedusaJS específico
  MEDUSA_ADMIN_EMAIL: "admin@volaron.com.br",
  MEDUSA_ADMIN_PASSWORD: "VolaronAdmin2024!",
  STORE_CORS: "http://localhost:8000,https://volaron-store.vercel.app",
  ADMIN_CORS: "http://localhost:7001,https://volaron-admin.vercel.app",
}

// Configurações para Vercel (Frontend)
const vercelVolaronConfig = {
  // Públicas - Negócio
  NEXT_PUBLIC_STORE_NAME: "Volaron",
  NEXT_PUBLIC_STORE_TAGLINE: "Tudo em utilidades domésticas!",
  NEXT_PUBLIC_PRIMARY_COLOR: "#1a4d2e",
  NEXT_PUBLIC_SECONDARY_COLOR: "#ff6b35",
  NEXT_PUBLIC_DELIVERY_REGION: "16100-16199",
  NEXT_PUBLIC_BUSINESS_HOURS: "08:00-18:00",
  NEXT_PUBLIC_PHONE: "(18) 3636-1234",

  // Públicas - AI
  NEXT_PUBLIC_GEMINI_MODEL: "gemini-1.5-flash",
  NEXT_PUBLIC_AI_PROVIDER: "gemini-ai-studio",
  NEXT_PUBLIC_AI_ENABLED: "true",
  NEXT_PUBLIC_CHATBOT_ENABLED: "true",
  NEXT_PUBLIC_RECOMMENDATIONS_ENABLED: "true",

  // URLs
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: "https://backend-production-c461d.up.railway.app",
  NEXT_PUBLIC_STOREFRONT_URL: "https://storefront-production-bd8d.up.railway.app",
}

// Função para atualizar Railway
async function updateRailwayConfig() {
  console.log("🚂 Atualizando configuração Railway...")

  try {
    // Verificar se Railway CLI está instalado
    execSync("railway --version", { stdio: "ignore" })
  } catch (error) {
    console.log("  📦 Instalando Railway CLI...")
    execSync("npm install -g @railway/cli", { stdio: "inherit" })
  }

  // Remover variáveis deprecated
  const deprecatedVars = [
    "VERTEX_PROJECT_ID",
    "VERTEX_REGION",
    "VERTEX_SERVICE_ACCOUNT_JSON",
    "VERTEX_MODEL",
    "ENABLE_VERTEX_AI",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_CLOUD_PROJECT",
  ]

  console.log("  🗑️  Removendo variáveis deprecated...")
  deprecatedVars.forEach((varName) => {
    try {
      execSync(`railway variables delete ${varName}`, { stdio: "ignore" })
      console.log(`    ✅ Removido: ${varName}`)
    } catch (error) {
      console.log(`    ⚪ ${varName} não existia`)
    }
  })

  // Adicionar novas variáveis
  console.log("  ➕ Adicionando variáveis do Volaron Store...")
  for (const [key, value] of Object.entries(railwayVolaronConfig)) {
    try {
      execSync(`railway variables set ${key}="${value}"`, { stdio: "ignore" })
      console.log(`    ✅ Configurado: ${key}`)
    } catch (error) {
      console.log(`    ❌ Erro ao configurar ${key}: ${error.message}`)
    }
  }

  console.log("  ✅ Railway configurado para Volaron Store")
}

// Função para atualizar Vercel
async function updateVercelConfig() {
  console.log("▲ Atualizando configuração Vercel...")

  try {
    // Verificar se Vercel CLI está instalado
    execSync("vercel --version", { stdio: "ignore" })
  } catch (error) {
    console.log("  📦 Instalando Vercel CLI...")
    execSync("npm install -g vercel", { stdio: "inherit" })
  }

  // Adicionar variáveis do Volaron
  console.log("  ➕ Adicionando variáveis públicas do Volaron Store...")
  for (const [key, value] of Object.entries(vercelVolaronConfig)) {
    try {
      // Usar echo para passar o valor via stdin
      execSync(`echo "${value}" | vercel env add ${key} production`, { stdio: "ignore" })
      console.log(`    ✅ Configurado: ${key}`)
    } catch (error) {
      console.log(`    ⚠️  ${key} pode já existir ou erro: ${error.message}`)
    }
  }

  console.log("  ✅ Vercel configurado para Volaron Store")
}

// Função para validar configurações
async function validateDeploymentConfig() {
  console.log("🔍 Validando configurações de deployment...")

  // Validar Railway
  try {
    const railwayVars = execSync("railway variables", { encoding: "utf8" })
    console.log("  🚂 Railway - Variáveis configuradas:")

    Object.keys(railwayVolaronConfig).forEach((key) => {
      if (railwayVars.includes(key)) {
        console.log(`    ✅ ${key}`)
      } else {
        console.log(`    ❌ ${key} - FALTANDO`)
      }
    })
  } catch (error) {
    console.log("  ❌ Erro ao validar Railway:", error.message)
  }

  // Validar Vercel
  try {
    const vercelVars = execSync("vercel env ls", { encoding: "utf8" })
    console.log("  ▲ Vercel - Variáveis configuradas:")

    Object.keys(vercelVolaronConfig).forEach((key) => {
      if (vercelVars.includes(key)) {
        console.log(`    ✅ ${key}`)
      } else {
        console.log(`    ❌ ${key} - FALTANDO`)
      }
    })
  } catch (error) {
    console.log("  ❌ Erro ao validar Vercel:", error.message)
  }
}

// Executar atualizações
async function main() {
  try {
    await updateRailwayConfig()
    console.log("")
    await updateVercelConfig()
    console.log("")
    await validateDeploymentConfig()

    console.log("\n🎉 Configuração de deployment atualizada para Volaron Store!")
    console.log("\n📋 Próximos passos:")
    console.log("  1. Executar testes locais específicos")
    console.log("  2. Deploy em ambiente de staging")
    console.log("  3. Validar funcionalidades do e-commerce")
    console.log("  4. Deploy em produção")
  } catch (error) {
    console.error("💥 Erro durante atualização:", error)
    process.exit(1)
  }
}

main()
