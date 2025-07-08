const { spawn } = require("child_process")
const { testAllEndpoints } = require("./test-endpoints")

// Função para executar comando e capturar output
function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Executando: ${command} ${args.join(" ")}`)

    const process = spawn(command, args, { stdio: "inherit" })

    process.on("close", (code) => {
      if (code === 0) {
        console.log(`✅ ${command} executado com sucesso`)
        resolve(code)
      } else {
        console.log(`❌ ${command} falhou com código ${code}`)
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    process.on("error", (error) => {
      console.log(`❌ Erro ao executar ${command}: ${error.message}`)
      reject(error)
    })
  })
}

// Função para aguardar
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Função principal de deploy e monitoramento
async function deployAndMonitor() {
  console.log("🚀 DEPLOY E MONITORAMENTO VOLARON STORE")
  console.log("======================================")
  console.log("")

  try {
    // 1. Verificar status atual
    console.log("📊 1. Verificando status atual...")
    await runCommand("railway", ["status"])
    console.log("")

    // 2. Fazer deploy
    console.log("🚀 2. Iniciando deploy...")
    await runCommand("railway", ["deploy"])
    console.log("")

    // 3. Aguardar um pouco para o deploy se estabilizar
    console.log("⏱️ 3. Aguardando deploy se estabilizar (60s)...")
    await sleep(60000)

    // 4. Verificar logs
    console.log("📋 4. Verificando logs recentes...")
    await runCommand("railway", ["logs", "--tail", "20"])
    console.log("")

    // 5. Testar endpoints
    console.log("🔍 5. Testando endpoints...")
    const testResults = await testAllEndpoints()
    console.log("")

    // 6. Monitoramento contínuo (opcional)
    console.log("👁️ 6. Iniciando monitoramento contínuo...")
    console.log("   (Pressione Ctrl+C para parar)")

    let monitorCount = 0
    const maxMonitorCycles = 10 // Monitorar por 10 ciclos (10 minutos)

    const monitorInterval = setInterval(async () => {
      monitorCount++
      console.log(`\n🔄 Ciclo de monitoramento ${monitorCount}/${maxMonitorCycles}`)

      try {
        // Verificar logs de erro
        await runCommand("railway", ["logs", "--tail", "5"])

        // Testar endpoint principal
        const { testEndpoint } = require("./test-endpoints")
        await testEndpoint("Backend Health", "https://backend-production-c461d.up.railway.app", "/health")
      } catch (error) {
        console.log(`⚠️ Erro no monitoramento: ${error.message}`)
      }

      if (monitorCount >= maxMonitorCycles) {
        clearInterval(monitorInterval)
        console.log("\n✅ Monitoramento concluído")
        console.log("🎉 Deploy finalizado com sucesso!")

        // Resumo final
        console.log("\n📋 RESUMO FINAL:")
        console.log("===============")
        console.log("✅ Deploy realizado")
        console.log("✅ Endpoints testados")
        console.log("✅ Monitoramento concluído")
        console.log("\n🔗 URLs importantes:")
        console.log("Backend: https://backend-production-c461d.up.railway.app")
        console.log("Storefront: https://storefront-production-bd8d.up.railway.app")
        console.log("Admin: https://backend-production-c461d.up.railway.app/admin")
      }
    }, 60000) // A cada 1 minuto
  } catch (error) {
    console.error("❌ Erro durante deploy:", error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  deployAndMonitor().catch(console.error)
}

module.exports = { deployAndMonitor }
