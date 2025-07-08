const http = require("http")
const https = require("https")

/**
 * Health Check Script para Volaron Store
 * Verifica a saúde de todos os serviços críticos
 */

class HealthChecker {
  constructor() {
    this.services = {
      main_app: {
        name: "Aplicação Principal",
        url: `http://localhost:${process.env.PORT || 3000}/health`,
        timeout: 5000,
      },
      ai_api: {
        name: "API de IA",
        url: `http://localhost:${process.env.PORT || 3000}/api/ai/health`,
        timeout: 10000,
      },
      database: {
        name: "Banco de Dados",
        url: process.env.DATABASE_URL,
        timeout: 5000,
      },
      redis: {
        name: "Redis Cache",
        url: process.env.REDIS_URL,
        timeout: 3000,
      },
      meilisearch: {
        name: "MeiliSearch",
        url: `${process.env.MEILISEARCH_HOST}/health`,
        timeout: 5000,
      },
    }

    this.results = {}
    this.startTime = Date.now()
  }

  // Fazer requisição HTTP com timeout
  async makeRequest(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith("https")
      const client = isHttps ? https : http

      const req = client.get(url, { timeout }, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            data: data,
            headers: res.headers,
          })
        })
      })

      req.on("timeout", () => {
        req.destroy()
        reject(new Error("Request timeout"))
      })

      req.on("error", (err) => {
        reject(err)
      })

      req.setTimeout(timeout)
    })
  }

  // Verificar um serviço específico
  async checkService(serviceKey) {
    const service = this.services[serviceKey]
    const startTime = Date.now()

    try {
      console.log(`🔍 Verificando ${service.name}...`)

      if (serviceKey === "database" || serviceKey === "redis") {
        // Para banco e Redis, apenas verificar se a URL existe
        const isHealthy = !!service.url

        this.results[serviceKey] = {
          name: service.name,
          status: isHealthy ? "healthy" : "unhealthy",
          responseTime: Date.now() - startTime,
          error: isHealthy ? null : "URL não configurada",
        }
      } else {
        // Para APIs HTTP
        const response = await this.makeRequest(service.url, service.timeout)

        const isHealthy = response.statusCode >= 200 && response.statusCode < 300

        this.results[serviceKey] = {
          name: service.name,
          status: isHealthy ? "healthy" : "unhealthy",
          statusCode: response.statusCode,
          responseTime: Date.now() - startTime,
          error: null,
        }
      }

      console.log(`✅ ${service.name}: ${this.results[serviceKey].status}`)
    } catch (error) {
      this.results[serviceKey] = {
        name: service.name,
        status: "unhealthy",
        responseTime: Date.now() - startTime,
        error: error.message,
      }

      console.log(`❌ ${service.name}: ${error.message}`)
    }
  }

  // Verificar todos os serviços
  async checkAllServices() {
    console.log("🏥 Iniciando Health Check do Volaron Store...")
    console.log("=".repeat(50))

    const serviceKeys = Object.keys(this.services)

    // Verificar serviços em paralelo
    await Promise.all(serviceKeys.map((key) => this.checkService(key)))

    return this.generateReport()
  }

  // Gerar relatório final
  generateReport() {
    const totalTime = Date.now() - this.startTime
    const healthyServices = Object.values(this.results).filter((r) => r.status === "healthy")
    const unhealthyServices = Object.values(this.results).filter((r) => r.status === "unhealthy")

    const overallStatus = unhealthyServices.length === 0 ? "healthy" : "unhealthy"

    const report = {
      timestamp: new Date().toISOString(),
      overall_status: overallStatus,
      total_check_time: `${totalTime}ms`,
      services_checked: Object.keys(this.services).length,
      healthy_services: healthyServices.length,
      unhealthy_services: unhealthyServices.length,
      details: this.results,
      environment: {
        node_version: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
      },
    }

    // Exibir resumo
    console.log("\n📊 RESUMO DO HEALTH CHECK")
    console.log("=".repeat(50))
    console.log(`Status Geral: ${overallStatus === "healthy" ? "✅ SAUDÁVEL" : "❌ PROBLEMAS DETECTADOS"}`)
    console.log(`Serviços Verificados: ${report.services_checked}`)
    console.log(`Serviços Saudáveis: ${report.healthy_services}`)
    console.log(`Serviços com Problemas: ${report.unhealthy_services}`)
    console.log(`Tempo Total: ${report.total_check_time}`)

    if (unhealthyServices.length > 0) {
      console.log("\n🚨 SERVIÇOS COM PROBLEMAS:")
      unhealthyServices.forEach((service) => {
        console.log(`  - ${service.name}: ${service.error}`)
      })
    }

    console.log("\n📋 DETALHES COMPLETOS:")
    Object.values(this.results).forEach((service) => {
      const statusIcon = service.status === "healthy" ? "✅" : "❌"
      console.log(`  ${statusIcon} ${service.name} (${service.responseTime}ms)`)
      if (service.error) {
        console.log(`    Erro: ${service.error}`)
      }
    })

    return report
  }

  // Verificar continuamente
  async startContinuousCheck(interval = 30000) {
    console.log(`🔄 Iniciando monitoramento contínuo (intervalo: ${interval / 1000}s)`)

    const check = async () => {
      try {
        await this.checkAllServices()
      } catch (error) {
        console.error("Erro no health check:", error)
      }

      setTimeout(check, interval)
    }

    await check()
  }
}

// Executar health check se chamado diretamente
if (require.main === module) {
  const checker = new HealthChecker()

  const args = process.argv.slice(2)
  const isContinuous = args.includes("--continuous") || args.includes("-c")
  const interval = args.find((arg) => arg.startsWith("--interval="))?.split("=")[1] || 30000

  if (isContinuous) {
    checker.startContinuousCheck(Number.parseInt(interval))
  } else {
    checker
      .checkAllServices()
      .then((report) => {
        // Sair com código de erro se houver problemas
        const exitCode = report.overall_status === "healthy" ? 0 : 1
        process.exit(exitCode)
      })
      .catch((error) => {
        console.error("Erro fatal no health check:", error)
        process.exit(1)
      })
  }
}

module.exports = HealthChecker
