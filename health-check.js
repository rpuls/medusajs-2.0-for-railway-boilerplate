const http = require("http")
const https = require("https")
const { performance } = require("perf_hooks")

/**
 * Health Check Script para Volaron Store
 * Verifica a saúde de todos os serviços críticos
 */

class HealthChecker {
  constructor() {
    this.port = process.env.PORT || 3000
    this.host = process.env.HOST || "localhost"
    this.timeout = 10000 // 10 segundos
    this.checks = []
    this.results = {
      overall: "unknown",
      timestamp: new Date().toISOString(),
      checks: {},
      performance: {},
      errors: [],
    }
  }

  // Adicionar verificação
  addCheck(name, checkFunction) {
    this.checks.push({ name, check: checkFunction })
  }

  // Verificar endpoint HTTP
  async checkHttpEndpoint(url, expectedStatus = 200) {
    const startTime = performance.now()

    return new Promise((resolve) => {
      const urlObj = new URL(url)
      const client = urlObj.protocol === "https:" ? https : http

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: "GET",
        timeout: this.timeout,
        headers: {
          "User-Agent": "Volaron-HealthCheck/1.0",
        },
      }

      const req = client.request(options, (res) => {
        const endTime = performance.now()
        const responseTime = Math.round(endTime - startTime)

        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          resolve({
            status: res.statusCode === expectedStatus ? "healthy" : "unhealthy",
            statusCode: res.statusCode,
            responseTime: responseTime,
            contentLength: data.length,
            headers: res.headers,
          })
        })
      })

      req.on("error", (err) => {
        const endTime = performance.now()
        resolve({
          status: "unhealthy",
          error: err.message,
          responseTime: Math.round(endTime - startTime),
        })
      })

      req.on("timeout", () => {
        req.destroy()
        resolve({
          status: "unhealthy",
          error: "Request timeout",
          responseTime: this.timeout,
        })
      })

      req.end()
    })
  }

  // Verificar banco de dados
  async checkDatabase() {
    if (!process.env.DATABASE_URL) {
      return { status: "skipped", reason: "DATABASE_URL not configured" }
    }

    try {
      const { Client } = require("pg")
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
      })

      const startTime = performance.now()
      await client.connect()

      // Executar query simples
      const result = await client.query("SELECT NOW() as current_time")
      await client.end()

      const endTime = performance.now()

      return {
        status: "healthy",
        responseTime: Math.round(endTime - startTime),
        currentTime: result.rows[0].current_time,
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  // Verificar Redis
  async checkRedis() {
    if (!process.env.REDIS_URL) {
      return { status: "skipped", reason: "REDIS_URL not configured" }
    }

    try {
      const redis = require("redis")
      const client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: { connectTimeout: 5000 },
      })

      const startTime = performance.now()
      await client.connect()

      // Executar comando PING
      const pong = await client.ping()
      await client.quit()

      const endTime = performance.now()

      return {
        status: pong === "PONG" ? "healthy" : "unhealthy",
        responseTime: Math.round(endTime - startTime),
        response: pong,
      }
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  // Verificar Google AI API
  async checkGoogleAI() {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return { status: "skipped", reason: "GOOGLE_GENERATIVE_AI_API_KEY not configured" }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`
    return await this.checkHttpEndpoint(url, 200)
  }

  // Verificar uso de memória
  checkMemoryUsage() {
    const usage = process.memoryUsage()
    const totalMB = Math.round(usage.rss / 1024 / 1024)
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)

    // Considerar unhealthy se usar mais de 1GB
    const status = totalMB > 1024 ? "warning" : "healthy"

    return {
      status,
      rss: `${totalMB}MB`,
      heapUsed: `${heapUsedMB}MB`,
      heapTotal: `${heapTotalMB}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`,
    }
  }

  // Verificar uptime
  checkUptime() {
    const uptimeSeconds = process.uptime()
    const uptimeMinutes = Math.floor(uptimeSeconds / 60)
    const uptimeHours = Math.floor(uptimeMinutes / 60)

    return {
      status: "healthy",
      uptime: `${uptimeHours}h ${uptimeMinutes % 60}m ${Math.floor(uptimeSeconds % 60)}s`,
      uptimeSeconds: Math.floor(uptimeSeconds),
    }
  }

  // Executar todas as verificações
  async runAllChecks() {
    console.log("🏥 Iniciando health check...")

    // Verificações básicas
    this.addCheck("main-app", () => this.checkHttpEndpoint(`http://${this.host}:${this.port}/api/health`))
    this.addCheck("database", () => this.checkDatabase())
    this.addCheck("redis", () => this.checkRedis())
    this.addCheck("google-ai", () => this.checkGoogleAI())
    this.addCheck("memory", () => this.checkMemoryUsage())
    this.addCheck("uptime", () => this.checkUptime())

    // Executar verificações em paralelo
    const checkPromises = this.checks.map(async ({ name, check }) => {
      try {
        const startTime = performance.now()
        const result = await check()
        const endTime = performance.now()

        this.results.checks[name] = {
          ...result,
          checkDuration: Math.round(endTime - startTime),
        }

        console.log(`✅ ${name}: ${result.status}`)
      } catch (error) {
        this.results.checks[name] = {
          status: "error",
          error: error.message,
        }
        this.results.errors.push(`${name}: ${error.message}`)
        console.error(`❌ ${name}: ${error.message}`)
      }
    })

    await Promise.all(checkPromises)

    // Calcular status geral
    const statuses = Object.values(this.results.checks).map((check) => check.status)
    const hasUnhealthy = statuses.includes("unhealthy") || statuses.includes("error")
    const hasWarning = statuses.includes("warning")

    if (hasUnhealthy) {
      this.results.overall = "unhealthy"
    } else if (hasWarning) {
      this.results.overall = "warning"
    } else {
      this.results.overall = "healthy"
    }

    // Adicionar informações de performance
    this.results.performance = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: process.env.NODE_ENV || "development",
    }

    return this.results
  }

  // Imprimir relatório
  printReport() {
    console.log("\n📊 Health Check Report")
    console.log("=".repeat(50))
    console.log(`Overall Status: ${this.getStatusEmoji(this.results.overall)} ${this.results.overall.toUpperCase()}`)
    console.log(`Timestamp: ${this.results.timestamp}`)
    console.log(`Environment: ${this.results.performance.environment}`)
    console.log(`Node Version: ${this.results.performance.nodeVersion}`)

    console.log("\n🔍 Service Checks:")
    Object.entries(this.results.checks).forEach(([name, check]) => {
      const emoji = this.getStatusEmoji(check.status)
      const responseTime = check.responseTime ? ` (${check.responseTime}ms)` : ""
      console.log(`  ${emoji} ${name}: ${check.status}${responseTime}`)

      if (check.error) {
        console.log(`    Error: ${check.error}`)
      }
    })

    if (this.results.errors.length > 0) {
      console.log("\n❌ Errors:")
      this.results.errors.forEach((error) => console.log(`  - ${error}`))
    }

    console.log("=".repeat(50))
  }

  // Obter emoji para status
  getStatusEmoji(status) {
    const emojis = {
      healthy: "✅",
      unhealthy: "❌",
      warning: "⚠️",
      error: "💥",
      skipped: "⏭️",
      unknown: "❓",
    }
    return emojis[status] || "❓"
  }
}

// Executar health check se chamado diretamente
if (require.main === module) {
  const checker = new HealthChecker()

  checker
    .runAllChecks()
    .then((results) => {
      checker.printReport()

      // Exit code baseado no status
      const exitCode = results.overall === "healthy" ? 0 : 1
      process.exit(exitCode)
    })
    .catch((error) => {
      console.error("💥 Health check failed:", error)
      process.exit(1)
    })
}

module.exports = HealthChecker
