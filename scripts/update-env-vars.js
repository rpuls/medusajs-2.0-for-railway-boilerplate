#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log("🔧 Assistente de Atualização de Variáveis de Ambiente\n")

// Mapeamento de variáveis antigas para novas
const envMigrationMap = {
  // Variáveis a serem removidas
  remove: [
    "VERTEX_PROJECT_ID",
    "VERTEX_REGION",
    "VERTEX_SERVICE_ACCOUNT_JSON",
    "VERTEX_MODEL",
    "ENABLE_VERTEX_AI",
    "GOOGLE_APPLICATION_CREDENTIALS",
    "GOOGLE_CLOUD_PROJECT",
  ],
  // Variáveis a serem adicionadas
  add: [
    {
      key: "GOOGLE_GENERATIVE_AI_API_KEY",
      value: "AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc",
      description: "API Key do Gemini AI Studio",
    },
    {
      key: "GEMINI_MODEL",
      value: "gemini-1.5-flash",
      description: "Modelo Gemini a ser usado",
    },
    {
      key: "ENABLE_GEMINI_AI",
      value: "true",
      description: "Habilitar integração Gemini AI",
    },
  ],
}

// Função para processar arquivo .env
function processEnvFile(filePath) {
  console.log(`\n📝 Processando ${filePath}...`)

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚪ ${filePath} não existe, criando...`)
    fs.writeFileSync(filePath, "# Gemini AI Studio Configuration\n")
  }

  let content = fs.readFileSync(filePath, "utf8")
  let modified = false

  // Remover variáveis antigas
  envMigrationMap.remove.forEach((varName) => {
    const regex = new RegExp(`^${varName}=.*$`, "gm")
    if (regex.test(content)) {
      console.log(`  🗑️  Removendo: ${varName}`)
      content = content.replace(regex, `# REMOVED: ${varName} (migrated to Gemini AI Studio)`)
      modified = true
    }
  })

  // Adicionar variáveis novas
  envMigrationMap.add.forEach(({ key, value, description }) => {
    const regex = new RegExp(`^${key}=`, "gm")
    if (!regex.test(content)) {
      console.log(`  ➕ Adicionando: ${key}`)
      content += `\n# ${description}\n${key}=${value}\n`
      modified = true
    } else {
      console.log(`  ✅ ${key} já existe`)
    }
  })

  if (modified) {
    // Fazer backup
    fs.writeFileSync(`${filePath}.backup`, fs.readFileSync(filePath))
    console.log(`  💾 Backup criado: ${filePath}.backup`)

    // Salvar arquivo atualizado
    fs.writeFileSync(filePath, content)
    console.log(`  ✅ ${filePath} atualizado`)
  } else {
    console.log(`  ⚪ ${filePath} não precisou de alterações`)
  }

  return modified
}

// Função para gerar template de variáveis
function generateEnvTemplate() {
  const templatePath = ".env.gemini-template"

  console.log(`\n📋 Gerando template: ${templatePath}`)

  let template = `# Gemini AI Studio Configuration Template
# Generated on ${new Date().toISOString()}

# ===========================================
# GEMINI AI STUDIO - NEW CONFIGURATION
# ===========================================

`

  envMigrationMap.add.forEach(({ key, value, description }) => {
    template += `# ${description}\n${key}=${value}\n\n`
  })

  template += `# ===========================================
# REMOVED VARIABLES (Vertex AI Legacy)
# ===========================================
# These variables are no longer needed:

`

  envMigrationMap.remove.forEach((varName) => {
    template += `# ${varName}=<removed>\n`
  })

  template += `
# ===========================================
# DEPLOYMENT SPECIFIC VARIABLES
# ===========================================

# Railway (Backend)
# Add these to your Railway environment variables:
# GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
# GEMINI_MODEL=gemini-1.5-flash
# ENABLE_GEMINI_AI=true

# Vercel (Frontend)  
# Add these to your Vercel environment variables:
# NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
# NEXT_PUBLIC_AI_PROVIDER=gemini-ai-studio
`

  fs.writeFileSync(templatePath, template)
  console.log(`  ✅ Template criado: ${templatePath}`)
}

// Função para verificar Railway/Vercel
function showDeploymentInstructions() {
  console.log("\n🚀 INSTRUÇÕES PARA DEPLOY:\n")

  console.log("📦 RAILWAY (Backend):")
  console.log("  1. Acesse: https://railway.app/dashboard")
  console.log("  2. Selecione seu projeto Volaron")
  console.log("  3. Vá em Variables > Environment Variables")
  console.log("  4. REMOVA as variáveis antigas:")
  envMigrationMap.remove.forEach((varName) => {
    console.log(`     - ${varName}`)
  })
  console.log("  5. ADICIONE as novas variáveis:")
  envMigrationMap.add.forEach(({ key, value }) => {
    console.log(`     + ${key}=${value}`)
  })

  console.log("\n🌐 VERCEL (Frontend):")
  console.log("  1. Acesse: https://vercel.com/dashboard")
  console.log("  2. Selecione seu projeto Volaron")
  console.log("  3. Vá em Settings > Environment Variables")
  console.log("  4. ADICIONE as variáveis:")
  console.log("     + NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash")
  console.log("     + NEXT_PUBLIC_AI_PROVIDER=gemini-ai-studio")

  console.log("\n⚠️  IMPORTANTE:")
  console.log("  • Redeploy necessário após mudanças")
  console.log("  • Teste em ambiente de desenvolvimento primeiro")
  console.log("  • Monitor rate limits (15 RPM no free tier)")
  console.log("")
}

// Função principal
async function updateEnvironmentVariables() {
  console.log("🎯 Iniciando atualização de variáveis de ambiente...\n")

  // Arquivos .env para processar
  const envFiles = [".env", ".env.local", ".env.development", ".env.production"]

  let totalModified = 0

  envFiles.forEach((file) => {
    if (processEnvFile(file)) {
      totalModified++
    }
  })

  // Gerar template
  generateEnvTemplate()

  // Mostrar instruções de deploy
  showDeploymentInstructions()

  console.log(`\n📊 RESUMO:`)
  console.log(`  • Arquivos modificados: ${totalModified}`)
  console.log(`  • Variáveis removidas: ${envMigrationMap.remove.length}`)
  console.log(`  • Variáveis adicionadas: ${envMigrationMap.add.length}`)
  console.log(`  • Template gerado: .env.gemini-template`)

  console.log("\n✅ Atualização de variáveis concluída!")
  console.log("📋 Próximos passos:")
  console.log("  1. Revisar arquivos .env modificados")
  console.log("  2. Atualizar variáveis no Railway e Vercel")
  console.log("  3. Testar aplicação localmente")
  console.log("  4. Fazer deploy e monitorar")

  rl.close()
}

// Executar atualização
updateEnvironmentVariables().catch((error) => {
  console.error("💥 Erro durante atualização:", error)
  rl.close()
  process.exit(1)
})
