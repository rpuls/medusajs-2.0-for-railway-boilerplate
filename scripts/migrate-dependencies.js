#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Iniciando migração de dependências: Vertex AI → Gemini AI Studio\n")

// Função para executar comandos com log
function runCommand(command, description) {
  console.log(`📦 ${description}...`)
  try {
    execSync(command, { stdio: "inherit" })
    console.log(`✅ ${description} - Concluído\n`)
    return true
  } catch (error) {
    console.error(`❌ Erro em: ${description}`)
    console.error(error.message)
    return false
  }
}

// Função para fazer backup do package.json
function backupPackageJson() {
  const packagePath = path.join(process.cwd(), "package.json")
  const backupPath = path.join(process.cwd(), "package.json.backup")

  if (fs.existsSync(packagePath)) {
    fs.copyFileSync(packagePath, backupPath)
    console.log("💾 Backup do package.json criado: package.json.backup\n")
    return true
  }
  return false
}

// Função para verificar dependências atuais
function checkCurrentDependencies() {
  console.log("🔍 Verificando dependências atuais...\n")

  const packagePath = path.join(process.cwd(), "package.json")
  if (!fs.existsSync(packagePath)) {
    console.error("❌ package.json não encontrado!")
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

  const oldDeps = ["@google-cloud/aiplatform", "google-auth-library"]

  const newDeps = ["@google/generative-ai"]

  console.log("📋 Status das dependências:")

  oldDeps.forEach((dep) => {
    if (dependencies[dep]) {
      console.log(`  🔴 ${dep}: ${dependencies[dep]} (será removida)`)
    } else {
      console.log(`  ⚪ ${dep}: não instalada`)
    }
  })

  newDeps.forEach((dep) => {
    if (dependencies[dep]) {
      console.log(`  🟢 ${dep}: ${dependencies[dep]} (já instalada)`)
    } else {
      console.log(`  🟡 ${dep}: será instalada`)
    }
  })

  console.log("")
  return true
}

// Função principal de migração
async function migrateDependencies() {
  console.log("🎯 Executando migração de dependências...\n")

  // 1. Fazer backup
  if (!backupPackageJson()) {
    console.error("❌ Falha ao criar backup. Abortando migração.")
    return false
  }

  // 2. Verificar dependências atuais
  if (!checkCurrentDependencies()) {
    return false
  }

  // 3. Remover dependências antigas
  console.log("🗑️  Removendo dependências antigas...")
  const oldDependencies = ["@google-cloud/aiplatform", "google-auth-library"]

  for (const dep of oldDependencies) {
    if (!runCommand(`npm uninstall ${dep}`, `Removendo ${dep}`)) {
      console.warn(`⚠️  Falha ao remover ${dep}, continuando...`)
    }
  }

  // 4. Instalar nova dependência
  console.log("📥 Instalando nova dependência...")
  if (!runCommand("npm install @google/generative-ai", "Instalando @google/generative-ai")) {
    console.error("❌ Falha crítica na instalação. Restaurando backup...")

    // Restaurar backup em caso de erro
    const backupPath = path.join(process.cwd(), "package.json.backup")
    const packagePath = path.join(process.cwd(), "package.json")

    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, packagePath)
      runCommand("npm install", "Restaurando dependências do backup")
    }

    return false
  }

  // 5. Verificar instalação
  console.log("🔍 Verificando instalação...")
  try {
    require("@google/generative-ai")
    console.log("✅ @google/generative-ai instalada e funcionando corretamente\n")
  } catch (error) {
    console.error("❌ Erro ao verificar instalação:", error.message)
    return false
  }

  // 6. Limpar cache
  runCommand("npm audit fix --force", "Corrigindo vulnerabilidades")
  runCommand("npm dedupe", "Otimizando dependências")

  console.log("🎉 Migração de dependências concluída com sucesso!\n")

  // 7. Mostrar próximos passos
  console.log("📋 Próximos passos:")
  console.log("  1. Atualizar variáveis de ambiente")
  console.log("  2. Testar integração com Gemini AI Studio")
  console.log("  3. Remover backup: rm package.json.backup")
  console.log("  4. Commit das mudanças\n")

  return true
}

// Executar migração
migrateDependencies().catch((error) => {
  console.error("💥 Erro durante migração:", error)
  process.exit(1)
})
