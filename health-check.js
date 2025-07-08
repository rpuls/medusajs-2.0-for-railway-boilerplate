const http = require("http")
const https = require("https")

class HealthChecker {
  constructor() {
    this.port = process.env.PORT || 3000
    this.host = process.env.HOST || "localhost"
    this.timeout = 10000 // 10 segundos
    this.checks = [
      { name: "main-app", path: "/api/copilot/health" },
      { name: "gemini-ai", path: "/api/ai/health" },
      { name: "basic-health", path: "/health" },
    ]
  }

  async checkEndpoint(check) {
    return new Promise((resolve) => {
      const options = {
        hostname: this.host,
        port: this.port,
        path: check.path,
        method: "GET",
        timeout: this.timeout,
        headers: {
          "User-Agent": "HealthChecker/1.0",
        },
      }

      const protocol = this.port === 443 ? https : http
      const startTime = Date.now()

      const req = protocol.request(options, (res) => {
        const responseTime = Date.now() - startTime
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          const result = {
            name: check.name,
            path: check.path,
            status: res.statusCode >= 200 && res.statusCode < 300 ? "healthy" : "unhealthy",
            statusCode: res.statusCode,
            responseTime,
            timestamp: new Date().toISOString(),
          }

          // Tentar parsear resposta JSON
          try {
            result.data = JSON.parse(data)
          } catch {
            result.data = data.substring(0, 200) // Primeiros 200 caracteres
          }

          resolve(result)
        })
      })

      req.on("error", (error) => {
        resolve({
          name: check.name,
          path: check.path,
          status: "unhealthy",
          error: error.message,
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        })
      })

      req.on("timeout", () => {
        req.destroy()
        resolve({
          name: check.name,
          path: check.path,
          status: "unhealthy",
          error: "Timeout",
          responseTime: this.timeout,
          timestamp: new Date().toISOString(),
        })
      })

      req.end()
    })
  }

  async runHealthCheck() {
    console.log(`🏥 Executando health check em ${this.host}:${this.port}`)
    console.log("================================================")

    const results = []
    let allHealthy = true

    for (const check of this.checks) {
      const result = await this.checkEndpoint(check)
      results.push(result)

      const status = result.status === "healthy" ? "✅" : "❌"
      const time = result.responseTime ? `(${result.responseTime}ms)` : ""

      console.log(`${status} ${result.name}: ${result.path} ${time}`)

      if (result.error) {
        console.log(`   Erro: ${result.error}`)
        allHealthy = false
      } else if (result.statusCode) {
        console.log(`   Status: ${result.statusCode}`)
        if (result.statusCode >= 400) {
          allHealthy = false
        }
      }

      // Mostrar dados da resposta se disponível
      if (result.data && typeof result.data === "object") {
        if (result.data.status) {
          console.log(`   Resposta: ${result.data.status}`)
        }
        if (result.data.services) {
          console.log(`   Serviços: ${Object.keys(result.data.services).length}`)
        }
      }
    }

    // Verificar serviços do sistema
    console.log("\n🔧 Verificando serviços do sistema...")

    // Verificar MCP Servers
    const mcpStatus = this.checkMCPServers()
    console.log(`${mcpStatus.healthy ? "✅" : "❌"} MCP Servers: ${mcpStatus.message}`)

    // Verificar monitoramento
    const monitorStatus = this.checkMonitoring()
    console.log(`${monitorStatus.healthy ? "✅" : "❌"} Monitoramento: ${monitorStatus.message}`)

    // Verificar variáveis de ambiente críticas
    console.log("\n🔍 Verificando variáveis de ambiente...")
    const envStatus = this.checkEnvironmentVariables()

    for (const [varName, status] of Object.entries(envStatus)) {
      const icon = status ? "✅" : "❌"
      console.log(`${icon} ${varName}: ${status ? "Configurada" : "Não configurada"}`)
    }

    // Resumo final
    console.log("\n📊 RESUMO DO HEALTH CHECK")
    console.log("=========================")

    const healthyCount = results.filter((r) => r.status === "healthy").length
    const totalCount = results.length

    console.log(`Endpoints: ${healthyCount}/${totalCount} saudáveis`)
    console.log(`MCP Servers: ${mcpStatus.healthy ? "OK" : "Problema"}`)
    console.log(`Monitoramento: ${monitorStatus.healthy ? "OK" : "Problema"}`)
    console.log(`Timestamp: ${new Date().toISOString()}`)

    // Salvar resultado
    const healthReport = {
      timestamp: new Date().toISOString(),
      overall: allHealthy && mcpStatus.healthy && monitorStatus.healthy,
      endpoints: results,
      system: {
        mcp: mcpStatus,
        monitoring: monitorStatus,
        environment: envStatus,
      },
      summary: {
        healthyEndpoints: healthyCount,
        totalEndpoints: totalCount,
        systemServices: mcpStatus.healthy && monitorStatus.healthy,
      },
    }

    try {
      const fs = require("fs")
      const path = require("path")

      // Criar diretório se não existir
      const logsDir = path.join(process.cwd(), "monitoring", "logs")
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }

      const reportFile = path.join(logsDir, `health-check-${Date.now()}.json`)
      fs.writeFileSync(reportFile, JSON.stringify(healthReport, null, 2))
      console.log(`\n📄 Relatório salvo: ${reportFile}`)
    } catch (error) {
      console.log(`\n⚠️ Erro ao salvar relatório: ${error.message}`)
    }

    return healthReport.overall
  }

  checkMCPServers() {
    const fs = require("fs")

    try {
      // Verificar se arquivo PID existe
      if (fs.existsSync(".mcp-servers.pid")) {
        const pid = Number.parseInt(fs.readFileSync(".mcp-servers.pid", "utf8").trim())

        // Verificar se processo está rodando
        try {
          process.kill(pid, 0) // Não mata, apenas verifica
          return { healthy: true, message: `Rodando (PID: ${pid})` }
        } catch {
          return { healthy: false, message: "Processo não encontrado" }
        }
      } else {
        return { healthy: false, message: "Arquivo PID não encontrado" }
      }
    } catch (error) {
      return { healthy: false, message: `Erro: ${error.message}` }
    }
  }

  checkMonitoring() {
    const fs = require("fs")

    try {
      // Verificar se arquivo PID existe
      if (fs.existsSync(".monitor.pid")) {
        const pid = Number.parseInt(fs.readFileSync(".monitor.pid", "utf8").trim())

        // Verificar se processo está rodando
        try {
          process.kill(pid, 0) // Não mata, apenas verifica
          return { healthy: true, message: `Rodando (PID: ${pid})` }
        } catch {
          return { healthy: false, message: "Processo não encontrado" }
        }
      } else {
        return { healthy: false, message: "Arquivo PID não encontrado" }
      }
    } catch (error) {
      return { healthy: false, message: `Erro: ${error.message}` }
    }
  }

  checkEnvironmentVariables() {
    const criticalVars = ["NODE_ENV", "PORT", "GEMINI_API_KEY", "DATABASE_URL", "REDIS_URL"]

    const status = {}

    for (const varName of criticalVars) {
      status[varName] = !!process.env[varName]
    }

    return status
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const checker = new HealthChecker()

  checker
    .runHealthCheck()
    .then((isHealthy) => {
      console.log(`\n${isHealthy ? "✅" : "❌"} Health check ${isHealthy ? "PASSOU" : "FALHOU"}`)
      process.exit(isHealthy ? 0 : 1)
    })
    .catch((error) => {
      console.error(`\n❌ Erro no health check: ${error.message}`)
      process.exit(1)
    })
}

module.exports = HealthChecker
