#!/usr/bin/env node

const { execSync } = require("child_process")

console.log("🔍 Buscando URL do projeto Vercel...\n")

async function findVercelURL() {
  try {
    // Verificar se Vercel CLI está instalado
    try {
      execSync("vercel --version", { stdio: "ignore" })
    } catch (error) {
      console.log("📦 Instalando Vercel CLI...")
      execSync("npm install -g vercel", { stdio: "inherit" })
    }

    // Tentar obter informações do projeto
    console.log("📋 Listando projetos Vercel...")

    try {
      const output = execSync("vercel ls --json", { encoding: "utf8" })
      const projects = JSON.parse(output)

      // Procurar projeto volaron
      const volaronProject = projects.find((p) => p.name.includes("volaron") || p.name.includes("v0-volaron"))

      if (volaronProject) {
        console.log("✅ Projeto encontrado!")
        console.log(`📍 Nome: ${volaronProject.name}`)
        console.log(`🌐 URL: https://${volaronProject.url}`)
        console.log(`📅 Criado: ${new Date(volaronProject.createdAt).toLocaleString("pt-BR")}`)

        // Configurar variável automaticamente
        const frontendUrl = `https://${volaronProject.url}`

        console.log("\n🔧 Configurando variável de ambiente...")

        // Tentar configurar no Railway
        try {
          execSync(`railway variables set VERCEL_FRONTEND_URL="${frontendUrl}"`, { stdio: "ignore" })
          console.log("✅ Variável VERCEL_FRONTEND_URL configurada no Railway!")
        } catch (error) {
          console.log("⚠️  Não foi possível configurar automaticamente no Railway")
          console.log("💡 Configure manualmente:")
          console.log(`   railway variables set VERCEL_FRONTEND_URL="${frontendUrl}"`)
        }

        // Adicionar ao .env local
        try {
          const fs = require("fs")
          const envContent = fs.readFileSync(".env", "utf8").catch(() => "")

          if (!envContent.includes("VERCEL_FRONTEND_URL")) {
            fs.appendFileSync(".env", `\nVERCEL_FRONTEND_URL=${frontendUrl}\n`)
            console.log("✅ Variável adicionada ao .env local!")
          }
        } catch (error) {
          console.log("💡 Adicione ao seu .env:")
          console.log(`   VERCEL_FRONTEND_URL=${frontendUrl}`)
        }

        return frontendUrl
      } else {
        console.log("❌ Projeto Volaron não encontrado na lista")
        console.log("📋 Projetos disponíveis:")
        projects.forEach((p) => {
          console.log(`   • ${p.name} - https://${p.url}`)
        })
      }
    } catch (error) {
      console.log("⚠️  Erro ao listar projetos via CLI")
      console.log("💡 Tente manualmente:")
      console.log("   1. Acesse https://vercel.com/dashboard")
      console.log('   2. Procure pelo projeto "v0-volaron-project"')
      console.log("   3. Copie a URL de produção")
    }
  } catch (error) {
    console.error("❌ Erro:", error.message)
  }
}

// URLs mais prováveis baseadas no padrão Vercel
function suggestPossibleURLs() {
  console.log("\n💡 URLs mais prováveis baseadas no padrão Vercel:")

  const possibleURLs = [
    "https://v0-volaron-project.vercel.app",
    "https://volaron-project.vercel.app",
    "https://v0-volaron-project-exzos.vercel.app",
    "https://volaron-store.vercel.app",
  ]

  possibleURLs.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url}`)
  })

  console.log("\n🔍 Para verificar qual está ativa:")
  possibleURLs.forEach((url) => {
    console.log(`   curl -I ${url}`)
  })
}

// Executar busca
findVercelURL().then(() => {
  suggestPossibleURLs()

  console.log("\n📋 RESUMO:")
  console.log("1. ✅ Verifique a URL encontrada")
  console.log("2. ✅ Configure no Railway se não foi automático")
  console.log("3. ✅ Teste a conectividade")
  console.log("4. ✅ Continue com o próximo passo da migração")
})
