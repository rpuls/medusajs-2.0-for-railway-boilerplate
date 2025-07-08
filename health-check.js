const http = require("http")
const https = require("https")
const { GoogleGenerativeAI } = require("@google/generative-ai")

/**
 * Volaron Store - Health Check Completo
 * Verifica a saúde de todos os serviços críticos
 */

class HealthChecker {
  constructor() {
    this.services = {
      app: { name: "Aplicação Principal", critical: true },
      database: { name: "PostgreSQL", critical: true },
      redis: { name: "Redis Cache", critical: false },
      gemini: { name: "Gemini AI", critical: true },
      minio: { name: "MinIO Storage", critical: false },
      meilisearch: { name: "MeiliSearch", critical: false },
    }

    this.results = {}
    this.startTime = Date.now()
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`

    if (level === "error") {
      console.error(logMessage, data || "")
    } else if (level === "warn") {
      console.warn(logMessage, data || "")
    } else {
      console.log(logMessage, data || "")
    }
  }

  async checkApp() {
    try {
      const port = process.env.PORT || 3000
      const host = process.env.HOST || "localhost"

      const result = await this.makeRequest(`http://${host}:${port}/health`, 5000)

      return {
        status: "healthy",
        response_time: result.responseTime,
        details: {
          port,
          host,
          status_code: result.statusCode,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        details: {
          port: process.env.PORT || 3000,
          host: process.env.HOST || "localhost",
        },
      }
    }
  }

  async checkDatabase() {
    try {
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL não configurada")
      }

      // Simular verificação de banco (em produção, usar cliente real)
      const startTime = Date.now()

      // Parse da URL do banco para verificar conectividade
      const dbUrl = new URL(process.env.DATABASE_URL)
      const isReachable = await this.checkTCPConnection(dbUrl.hostname, Number.parseInt(dbUrl.port) || 5432)

      if (!isReachable) {
        throw new Error("Não foi possível conectar ao banco de dados")
      }

      const responseTime = Date.now() - startTime

      return {
        status: "healthy",
        response_time: responseTime,
        details: {
          host: dbUrl.hostname,
          port: dbUrl.port || 5432,
          database: dbUrl.pathname.substring(1),
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        details: {
          has_url: !!process.env.DATABASE_URL,
        },
      }
    }
  }

  async checkRedis() {
    try {
      if (!process.env.REDIS_URL) {
        return {
          status: "not_configured",
          message: "Redis não configurado (opcional)",
          details: {},
        }
      }

      const startTime = Date.now()
      const redisUrl = new URL(process.env.REDIS_URL)
      const isReachable = await this.checkTCPConnection(redisUrl.hostname, Number.parseInt(redisUrl.port) || 6379)

      if (!isReachable) {
        throw new Error("Não foi possível conectar ao Redis")
      }

      const responseTime = Date.now() - startTime

      return {
        status: "healthy",
        response_time: responseTime,
        details: {
          host: redisUrl.hostname,
          port: redisUrl.port || 6379,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        details: {
          has_url: !!process.env.REDIS_URL,
        },
      }
    }
  }

  async checkGemini() {
    try {
      if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não configurada")
      }

      const startTime = Date.now()
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" })

      // Teste simples
      const result = await model.generateContent("test")
      const response = await result.response

      if (!response.text()) {
        throw new Error("Resposta vazia do Gemini AI")
      }

      const responseTime = Date.now() - startTime

      return {
        status: "healthy",
        response_time: responseTime,
        details: {
          model: "gemini-1.5-flash-001",
          api_key_length: process.env.GOOGLE_GENERATIVE_AI_API_KEY.length,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        details: {
          has_api_key: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        },
      }
    }
  }

  async checkMinIO() {
    try {
      if (!process.env.MINIO_ENDPOINT) {
        return {
          status: "not_configured",
          message: "MinIO não configurado (opcional)",
          details: {},
        }
      }

      const endpoint = process.env.MINIO_ENDPOINT
      const result = await this.makeRequest(`${endpoint}/minio/health/live`, 5000)

      return {
        status: "healthy",
        response_time: result.responseTime,
        details: {
          endpoint,
          bucket: process.env.MINIO_BUCKET || "não configurado",
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        details: {
          endpoint: process.env.MINIO_ENDPOINT || "não configurado",
        },
      }
    }
  }

  async checkMeiliSearch() {
    try {
      if (!process.env.MEILISEARCH_HOST) {
        return {
          status: "not_configured",
          message: "MeiliSearch não configurado (opcional)",
          details: {},
        }
      }

      const host = process.env.MEILISEARCH_HOST
      const result = await this.makeRequest(`${host}/health`, 5000)

      return {
        status: "healthy",
        response_time: result.responseTime,
        details: {
          host,
          has_api_key: !!process.env.MEILISEARCH_API_KEY,
        },
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        details: {
          host: process.env.MEILISEARCH_HOST || "não configurado",
        },
      }
    }
  }

  async makeRequest(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const client = url.startsWith("https") ? https : http

      const req = client.get(url, { timeout }, (res) => {
        const responseTime = Date.now() - startTime

        resolve({
          statusCode: res.statusCode,
          responseTime,
          headers: res.headers,
        })
      })

      req.on("timeout", () => {
        req.destroy()
        reject(new Error(`Timeout após ${timeout}ms`))
      })

      req.on("error", (error) => {
        reject(error)
      })
    })
  }

  async checkTCPConnection(host, port, timeout = 5000) {
    return new Promise((resolve) => {
      const net = require("net")
      const socket = new net.Socket()

      const timer = setTimeout(() => {
        socket.destroy()
        resolve(false)
      }, timeout)

      socket.connect(port, host, () => {
        clearTimeout(timer)
        socket.destroy()
        resolve(true)
      })

      socket.on("error", () => {
        clearTimeout(timer)
        resolve(false)
      })
    })
  }

  async runAllChecks() {
    this.log("info", "🏥 Iniciando health check completo...")

    const checks = [
      { name: "app", fn: () => this.checkApp() },
      { name: "database", fn: () => this.checkDatabase() },
      { name: "redis", fn: () => this.checkRedis() },
      { name: "gemini", fn: () => this.checkGemini() },
      { name: "minio", fn: () => this.checkMinIO() },
      { name: "meilisearch", fn: () => this.checkMeiliSearch() },
    ]

    for (const check of checks) {
      try {
        this.log("info", `Verificando ${this.services[check.name].name}...`)
        this.results[check.name] = await check.fn()

        const result = this.results[check.name]
        const status = result.status === "healthy" ? "✅" : result.status === "not_configured" ? "⚠️" : "❌"

        this.log("info", `${status} ${this.services[check.name].name}: ${result.status}`)

        if (result.response_time) {
          this.log("info", `   Tempo de resposta: ${result.response_time}ms`)
        }

        if (result.error) {
          this.log("warn", `   Erro: ${result.error}`)
        }
      } catch (error) {
        this.results[check.name] = {
          status: "unhealthy",
          error: error.message,
        }
        this.log("error", `❌ ${this.services[check.name].name}: ${error.message}`)
      }
    }

    return this.generateReport()
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime

    const summary = {
      overall_status: this.calculateOverallStatus(),
      timestamp: new Date().toISOString(),
      total_check_time: totalTime,
      services: this.results,
      environment: {
        node_version: process.version,
        platform: process.platform,
        railway_env: process.env.RAILWAY_ENVIRONMENT || "não definido",
        memory_usage: process.memoryUsage(),
      },
    }

    // Log do resumo
    this.log("info", "📊 Resumo do Health Check:")
    this.log("info", `   Status Geral: ${summary.overall_status}`)
    this.log("info", `   Tempo Total: ${totalTime}ms`)
    this.log("info", `   Serviços Verificados: ${Object.keys(this.results).length}`)

    const healthyCount = Object.values(this.results).filter((r) => r.status === "healthy").length
    const unhealthyCount = Object.values(this.results).filter((r) => r.status === "unhealthy").length
    const notConfiguredCount = Object.values(this.results).filter((r) => r.status === "not_configured").length

    this.log("info", `   ✅ Saudáveis: ${healthyCount}`)
    this.log("info", `   ❌ Com problemas: ${unhealthyCount}`)
    this.log("info", `   ⚠️  Não configurados: ${notConfiguredCount}`)

    return summary
  }

  calculateOverallStatus() {
    const criticalServices = Object.keys(this.services).filter((key) => this.services[key].critical)
    const criticalResults = criticalServices.map((key) => this.results[key])

    const unhealthyCritical = criticalResults.filter((r) => r && r.status === "unhealthy").length
    const healthyCritical = criticalResults.filter((r) => r && r.status === "healthy").length

    if (unhealthyCritical > 0) {
      return "unhealthy"
    }

    if (healthyCritical === criticalServices.length) {
      return "healthy"
    }

    return "degraded"
  }
}

// Executar health check se chamado diretamente
if (require.main === module) {
  const checker = new HealthChecker()

  checker
    .runAllChecks()
    .then((report) => {
      console.log("\n" + "=".repeat(50))
      console.log("RELATÓRIO FINAL DE SAÚDE")
      console.log("=".repeat(50))
      console.log(JSON.stringify(report, null, 2))

      // Exit code baseado no status
      const exitCode = report.overall_status === "healthy" ? 0 : 1
      process.exit(exitCode)
    })
    .catch((error) => {
      console.error("Erro fatal no health check:", error)
      process.exit(1)
    })
}

module.exports = HealthChecker
