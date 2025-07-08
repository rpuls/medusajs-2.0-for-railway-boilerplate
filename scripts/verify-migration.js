#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando migração de dependências...\n")

// Função para verificar se uma dependência está instalada
function checkDependency(depName) {
  try {
    require.resolve(depName)
    return { installed: true, version: require(`${depName}/package.json`).version }
  } catch (error) {
    return { installed: false, error: error.message }
  }
}

// Função para verificar package.json
function checkPackageJson() {
  const packagePath = path.join(process.cwd(), "package.json")

  if (!fs.existsSync(packagePath)) {
    console.error("❌ package.json não encontrado!")
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
  const allDeps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  }

  console.log("📦 Análise do package.json:")

  // Verificar dependências antigas (devem estar ausentes)
  const oldDeps = ["@google-cloud/aiplatform", "google-auth-library"]
  oldDeps.forEach((dep) => {
    if (allDeps[dep]) {
      console.log(`  ❌ ${dep}: ${allDeps[dep]} (DEVE SER REMOVIDA)`)
    } else {
      console.log(`  ✅ ${dep}: removida corretamente`)
    }
  })

  // Verificar nova dependência (deve estar presente)
  const newDeps = ["@google/generative-ai"]
  newDeps.forEach((dep) => {
    if (allDeps[dep]) {
      console.log(`  ✅ ${dep}: ${allDeps[dep]} (instalada corretamente)`)
    } else {
      console.log(`  ❌ ${dep}: NÃO ENCONTRADA (deve ser instalada)`)
    }
  })

  console.log("")
  return true
}

// Função para testar importação
function testImports() {
  console.log("🧪 Testando importações...\n")

  // Testar nova dependência
  console.log("📥 Testando @google/generative-ai...")
  const geminiCheck = checkDependency("@google/generative-ai")

  if (geminiCheck.installed) {
    console.log(`  ✅ @google/generative-ai v${geminiCheck.version} - OK`)

    // Testar importação específica
    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai")
      console.log("  ✅ GoogleGenerativeAI class - OK")
    } catch (error) {
      console.log(`  ❌ Erro na importação: ${error.message}`)
    }
  } else {
    console.log(`  ❌ @google/generative-ai - NÃO INSTALADA`)
    console.log(`     Erro: ${geminiCheck.error}`)
  }

  // Verificar se dependências antigas foram removidas
  console.log("\n🗑️  Verificando remoção de dependências antigas...")

  const oldDeps = ["@google-cloud/aiplatform", "google-auth-library"]
  oldDeps.forEach((dep) => {
    const check = checkDependency(dep)
    if (check.installed) {
      console.log(`  ⚠️  ${dep} v${check.version} - AINDA INSTALADA (deve ser removida)`)
    } else {
      console.log(`  ✅ ${dep} - removida corretamente`)
    }
  })

  console.log("")
}

// Função para verificar arquivos de configuração
function checkConfigFiles() {
  console.log("⚙️  Verificando arquivos de configuração...\n")

  const configFiles = [
    { path: ".env", required: false },
    { path: ".env.local", required: false },
    { path: ".env.example", required: false },
    { path: "next.config.js", required: false },
    { path: "next.config.mjs", required: false },
  ]

  configFiles.forEach(({ path: filePath, required }) => {
    if (fs.existsSync(filePath)) {
      console.log(`  📄 ${filePath} - encontrado`)

      // Verificar conteúdo para variáveis antigas
      const content = fs.readFileSync(filePath, "utf8")

      const oldVars = [
        "VERTEX_PROJECT_ID",
        "VERTEX_REGION",
        "VERTEX_SERVICE_ACCOUNT_JSON",
        "GOOGLE_APPLICATION_CREDENTIALS",
      ]

      const newVars = ["GOOGLE_GENERATIVE_AI_API_KEY"]

      oldVars.forEach((varName) => {
        if (content.includes(varName)) {
          console.log(`    ⚠️  Contém variável antiga: ${varName}`)
        }
      })

      newVars.forEach((varName) => {
        if (content.includes(varName)) {
          console.log(`    ✅ Contém nova variável: ${varName}`)
        }
      })
    } else if (required) {
      console.log(`  ❌ ${filePath} - OBRIGATÓRIO, mas não encontrado`)
    } else {
      console.log(`  ⚪ ${filePath} - não encontrado (opcional)`)
    }
  })

  console.log("")
}

// Função para gerar relatório
function generateReport() {
  console.log("📊 RELATÓRIO DE MIGRAÇÃO\n")
  console.log("=".repeat(50))

  checkPackageJson()
  testImports()
  checkConfigFiles()

  console.log("📋 PRÓXIMAS AÇÕES RECOMENDADAS:")
  console.log("  1. ✅ Atualizar variáveis de ambiente")
  console.log("  2. ✅ Testar funcionalidades da aplicação")
  console.log("  3. ✅ Executar testes automatizados")
  console.log("  4. ✅ Fazer deploy em ambiente de teste")
  console.log("  5. ✅ Monitorar logs de erro")
  console.log("")

  console.log("🔗 Links úteis:")
  console.log("  • Gemini AI Studio: https://makersuite.google.com/")
  console.log("  • Documentação: https://ai.google.dev/docs")
  console.log("  • Rate Limits: 15 requests/minute (free tier)")
  console.log("")
}

// Executar verificação
generateReport()
