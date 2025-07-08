const axios = require("axios")

// Configuração dos endpoints para teste
const ENDPOINTS = {
  backend: "https://backend-production-c461d.up.railway.app",
  storefront: "https://storefront-production-bd8d.up.railway.app",
  meilisearch: "https://meilisearch-production-010d.up.railway.app",
  minio: "https://bucket-production-5a5e.up.railway.app",
  n8n: "https://n8n-automation-production-6e02.up.railway.app",
}

// Função para testar um endpoint
async function testEndpoint(name, url, path = "/health") {
  try {
    console.log(`🔍 Testando ${name}...`)

    const response = await axios.get(`${url}${path}`, {
      timeout: 10000,
      validateStatus: (status) => {
        return status < 500 // Aceita qualquer status < 500
      },
    })

    console.log(`✅ ${name}: ${response.status} - ${response.statusText}`)
    return { name, url, status: response.status, success: true }
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.log(`⏱️ ${name}: Timeout (pode estar inicializando)`)
    } else if (error.response) {
      console.log(`⚠️ ${name}: ${error.response.status} - ${error.response.statusText}`)
    } else {
      console.log(`❌ ${name}: ${error.message}`)
    }

    return { name, url, status: error.response?.status || 0, success: false, error: error.message }
  }
}

// Função principal
async function testAllEndpoints() {
  console.log("🚀 TESTANDO ENDPOINTS DO VOLARON STORE")
  console.log("=====================================")
  console.log("")

  const results = []

  // Testar endpoints básicos
  for (const [name, url] of Object.entries(ENDPOINTS)) {
    const result = await testEndpoint(name, url)
    results.push(result)
    console.log("")
  }

  // Testar endpoints específicos do backend
  console.log("🔍 Testando endpoints específicos do backend...")

  const backendTests = [
    { path: "/admin", description: "Admin Panel" },
    { path: "/store", description: "Store API" },
    { path: "/api/ai/health", description: "AI Health Check" },
    { path: "/api/copilot/health", description: "Copilot Health" },
  ]

  for (const test of backendTests) {
    const result = await testEndpoint(`Backend ${test.description}`, ENDPOINTS.backend, test.path)
    results.push(result)
    console.log("")
  }

  // Resumo dos resultados
  console.log("📊 RESUMO DOS TESTES")
  console.log("===================")

  const successful = results.filter((r) => r.success).length
  const total = results.length

  console.log(`✅ Sucessos: ${successful}/${total}`)
  console.log(`❌ Falhas: ${total - successful}/${total}`)

  if (successful === total) {
    console.log("🎉 Todos os serviços estão funcionando!")
  } else {
    console.log("⚠️ Alguns serviços podem estar inicializando...")
  }

  // Salvar resultados
  const report = {
    timestamp: new Date().toISOString(),
    total_tests: total,
    successful_tests: successful,
    success_rate: ((successful / total) * 100).toFixed(2) + "%",
    results: results,
  }

  require("fs").writeFileSync("endpoint-test-results.json", JSON.stringify(report, null, 2))
  console.log("📄 Relatório salvo em: endpoint-test-results.json")

  return report
}

// Executar se chamado diretamente
if (require.main === module) {
  testAllEndpoints().catch(console.error)
}

module.exports = { testAllEndpoints, testEndpoint }
