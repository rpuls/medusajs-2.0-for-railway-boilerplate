#!/usr/bin/env node

const { execSync } = require("child_process")

console.log("⚡ Deploy Rápido Volaron Store\n")

async function quickDeploy() {
  const steps = [
    {
      name: "Verificar Railway",
      command: "railway status",
      description: "Verificando status do projeto Railway",
    },
    {
      name: "Deploy Backend",
      command: "railway up --detach",
      description: "Fazendo deploy do backend no Railway",
    },
    {
      name: "Aguardar Deploy",
      command: "sleep 60",
      description: "Aguardando deploy completar (60s)",
    },
    {
      name: "Verificar Saúde",
      command: "curl -f https://backend-production-c461d.up.railway.app/health",
      description: "Verificando saúde do backend",
      optional: true,
    },
  ]

  for (const step of steps) {
    console.log(`🔄 ${step.description}...`)

    try {
      if (step.command === "sleep 60") {
        console.log("   ⏳ Aguardando 60 segundos...")
        await new Promise((resolve) => setTimeout(resolve, 60000))
      } else {
        execSync(step.command, { stdio: "inherit" })
      }
      console.log(`   ✅ ${step.name} - Concluído`)
    } catch (error) {
      if (step.optional) {
        console.log(`   ⚠️  ${step.name} - Opcional, continuando...`)
      } else {
        console.error(`   ❌ ${step.name} - Falhou:`, error.message)
        throw error
      }
    }
    console.log("")
  }

  console.log("🎉 Deploy rápido concluído!")
  console.log("\n📋 Próximos passos:")
  console.log("1. Configure variáveis no Vercel Dashboard")
  console.log("2. Faça deploy do frontend: vercel --prod")
  console.log("3. Teste as funcionalidades AI")
  console.log("4. Monitore logs e métricas")
}

quickDeploy().catch((error) => {
  console.error("💥 Erro no deploy:", error)
  process.exit(1)
})
