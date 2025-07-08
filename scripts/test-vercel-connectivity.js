#!/usr/bin/env node

console.log("🧪 Testando conectividade com Vercel...\n")

async function testVercelConnectivity() {
  const possibleURLs = [
    "https://v0-volaron-project.vercel.app",
    "https://volaron-project.vercel.app",
    "https://v0-volaron-project-exzos.vercel.app",
    "https://volaron-store.vercel.app",
  ]

  console.log("🔍 Testando URLs possíveis...\n")

  for (const url of possibleURLs) {
    try {
      console.log(`📡 Testando: ${url}`)

      const response = await fetch(url, {
        method: "HEAD",
        timeout: 5000,
      })

      if (response.ok) {
        console.log(`✅ ATIVA: ${url}`)
        console.log(`   Status: ${response.status}`)
        console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers), null, 2)}`)

        // Esta é provavelmente a URL correta
        console.log(`\n🎯 URL ENCONTRADA: ${url}`)
        console.log(`\n🔧 Configure esta variável:`)
        console.log(`   VERCEL_FRONTEND_URL=${url}`)

        return url
      } else {
        console.log(`❌ Inativa: ${url} (Status: ${response.status})`)
      }
    } catch (error) {
      console.log(`❌ Erro: ${url} - ${error.message}`)
    }

    console.log("") // Linha em branco
  }

  console.log("⚠️  Nenhuma URL padrão encontrada ativa")
  console.log("💡 Verifique manualmente no dashboard da Vercel")
}

// Função para configurar automaticamente
async function autoConfigureURL(url) {
  const { execSync } = require("child_process")

  try {
    // Configurar no Railway
    execSync(`railway variables set VERCEL_FRONTEND_URL="${url}"`, { stdio: "ignore" })
    console.log("✅ Configurado no Railway!")

    // Adicionar ao .env
    const fs = require("fs")
    fs.appendFileSync(".env", `\nVERCEL_FRONTEND_URL=${url}\n`)
    console.log("✅ Adicionado ao .env!")
  } catch (error) {
    console.log("⚠️  Configure manualmente:")
    console.log(`   railway variables set VERCEL_FRONTEND_URL="${url}"`)
    console.log(`   echo "VERCEL_FRONTEND_URL=${url}" >> .env`)
  }
}

// Executar teste
testVercelConnectivity().then((foundURL) => {
  if (foundURL) {
    console.log("\n🚀 Próximos passos:")
    console.log("1. ✅ URL do Vercel encontrada")
    console.log("2. ✅ Configure a variável de ambiente")
    console.log("3. ✅ Continue com a migração")
  } else {
    console.log("\n📋 Próximos passos manuais:")
    console.log("1. 🌐 Acesse https://vercel.com/dashboard")
    console.log("2. 🔍 Encontre o projeto v0-volaron-project")
    console.log("3. 📋 Copie a URL de produção")
    console.log('4. ⚙️  Configure: railway variables set VERCEL_FRONTEND_URL="[URL]"')
  }
})
