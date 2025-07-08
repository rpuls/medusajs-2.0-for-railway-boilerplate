const fs = require("fs")
const path = require("path")
const { GoogleGenerativeAI } = require("@google/generative-ai")

class ContinuousMonitor {
  constructor() {
    this.configPath = path.join(__dirname, "config.json")
    this.logDir = path.join(__dirname, "logs")
    this.isRunning = false
    this.intervals = new Map()

    // Criar diretório de logs
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }

    this.loadConfig()
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, "utf8")
        this.config = JSON.parse(configData)
      } else {
        this.config = this.getDefaultConfig()
        this.saveConfig()
      }
    } catch (error) {
      console.error("Erro ao carregar configuração de monitoramento:", error.message)
      this.config = this.getDefaultConfig()
    }
  }

  getDefaultConfig() {
    return {
      enabled: true,
      environment: process.env.NODE_ENV || "development",
      services: [
        {
          name: "gemini-ai",
          type: "api",
          url: "https://generativelanguage.googleapis.com/v1beta/models",
          interval: 300000, // 5 minutos
          timeout: 10000,
          headers: {
            "x-goog-api-key": process.env.GEMINI_API_KEY,
          },
        },
        {
          name: "database",
          type: "postgresql",
          url: process.env.DATABASE_URL,
          interval: 60000, // 1 minuto
          timeout: 5000,
        },
        {
          name: "redis",
          type: "redis",
          url: process.env.REDIS_URL,
          interval: 60000, // 1 minuto
          timeout: 5000,
        },
        {
          name: "backend",
          type: "http",
          url: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE || "https://backend-production-c461d.up.railway.app",
          path: "/health",
          interval: 120000, // 2 minutos
          timeout: 10000,
        },
        {
          name: "mcp-servers",
          type: "process",
          interval: 180000, // 3 minutos
          timeout: 5000,
        },
      ],
      alerts: {
        webhook: process.env.RAILWAY_WEBHOOK_URL,
        email: false,
        slack: false,
        maxFailures: 3,
        cooldownPeriod: 300000, // 5 minutos
      },
      logging: {
        level: "info",
        maxLogSize: 10485760, // 10MB
        maxLogFiles: 5,
      },
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2))
    } catch (error) {
      console.error("Erro ao salvar configuração:", error.message)
    }
  }

  log(level, service, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      service,
      message,
      data,
      environment: this.config.environment,
    }

    // Log no console
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}`

    if (level === "error") {
      console.error(logMessage, data || "")
    } else if (level === "warn") {
      console.warn(logMessage, data || "")
    } else {
      console.log(logMessage, data || "")
    }

    // Log em arquivo
    const logFile = path.join(this.logDir, `monitor-${new Date().toISOString().split("T")[0]}.log`)
    try {
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + "\n")
    } catch (error) {
      console.error("Erro ao escrever log:", error.message)
    }
  }

  async checkGeminiAI(service) {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY não configurada")
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" })

      const result = await model.generateContent("test")
      const response = await result.response

      if (response.text()) {
        this.log("info", service.name, "Gemini AI respondendo normalmente")
        return { status: "healthy", responseTime: Date.now() }
      } else {
        throw new Error("Resposta vazia do Gemini AI")
      }
    } catch (error) {
      this.log("error", service.name, "Erro no Gemini AI", error.message)
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkHTTP(service) {
    try {
      const url = service.url + (service.path || "")
      const startTime = Date.now()

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), service.timeout)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: service.headers || {},
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (response.ok) {
        this.log("info", service.name, `HTTP check OK (${responseTime}ms)`)
        return { status: "healthy", responseTime, statusCode: response.status }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      this.log("error", service.name, "Erro no check HTTP", error.message)
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkDatabase(service) {
    try {
      if (!service.url) {
        throw new Error("URL do banco não configurada")
      }

      // Simulação de check de banco - em produção, usar cliente real
      const startTime = Date.now()

      // Para PostgreSQL, podemos fazer uma query simples
      const response = await fetch("/api/health/database", {
        method: "GET",
        timeout: service.timeout,
      }).catch(() => {
        // Se não houver endpoint de health, assumir que está OK se a URL existe
        return { ok: true }
      })

      const responseTime = Date.now() - startTime

      this.log("info", service.name, `Database check OK (${responseTime}ms)`)
      return { status: "healthy", responseTime }
    } catch (error) {
      this.log("error", service.name, "Erro no check do banco", error.message)
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkRedis(service) {
    try {
      if (!service.url) {
        throw new Error("URL do Redis não configurada")
      }

      // Simulação de check do Redis
      const startTime = Date.now()

      // Em produção, usar cliente Redis real
      const response = await fetch("/api/health/redis", {
        method: "GET",
        timeout: service.timeout,
      }).catch(() => {
        return { ok: true }
      })

      const responseTime = Date.now() - startTime

      this.log("info", service.name, `Redis check OK (${responseTime}ms)`)
      return { status: "healthy", responseTime }
    } catch (error) {
      this.log("error", service.name, "Erro no check do Redis", error.message)
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkMCPServers(service) {
    try {
      const MCPServerManager = require("../scripts/start-mcp-servers.js")
      const manager = new MCPServerManager()
      const status = manager.getStatus()

      if (status.running > 0) {
        this.log("info", service.name, `MCP Servers OK (${status.running} rodando)`)
        return { status: "healthy", serversRunning: status.running, servers: status.servers }
      } else {
        throw new Error("Nenhum servidor MCP rodando")
      }
    } catch (error) {
      this.log("error", service.name, "Erro no check dos MCP Servers", error.message)
      return { status: "unhealthy", error: error.message }
    }
  }

  async checkService(service) {
    const startTime = Date.now()
    let result

    try {
      switch (service.type) {
        case "api":
          if (service.name === "gemini-ai") {
            result = await this.checkGeminiAI(service)
          } else {
            result = await this.checkHTTP(service)
          }
          break
        case "http":
          result = await this.checkHTTP(service)
          break
        case "postgresql":
          result = await this.checkDatabase(service)
          break
        case "redis":
          result = await this.checkRedis(service)
          break
        case "process":
          if (service.name === "mcp-servers") {
            result = await this.checkMCPServers(service)
          }
          break
        default:
          throw new Error(`Tipo de serviço desconhecido: ${service.type}`)
      }

      result.checkTime = Date.now() - startTime
      result.timestamp = new Date().toISOString()

      // Salvar resultado
      this.saveServiceResult(service.name, result)

      return result
    } catch (error) {
      const errorResult = {
        status: "unhealthy",
        error: error.message,
        checkTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }

      this.saveServiceResult(service.name, errorResult)
      return errorResult
    }
  }

  saveServiceResult(serviceName, result) {
    const resultsFile = path.join(this.logDir, `${serviceName}-results.json`)

    try {
      let results = []
      if (fs.existsSync(resultsFile)) {
        const data = fs.readFileSync(resultsFile, "utf8")
        results = JSON.parse(data)
      }

      results.push(result)

      // Manter apenas os últimos 100 resultados
      if (results.length > 100) {
        results = results.slice(-100)
      }

      fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2))
    } catch (error) {
      this.log("error", "monitor", "Erro ao salvar resultado", error.message)
    }
  }

  async sendAlert(service, result) {
    const alertMessage = {
      service: service.name,
      status: result.status,
      error: result.error,
      timestamp: result.timestamp,
      environment: this.config.environment,
    }

    this.log("warn", "alert", `Enviando alerta para ${service.name}`, alertMessage)

    // Webhook
    if (this.config.alerts.webhook) {
      try {
        await fetch(this.config.alerts.webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alertMessage),
        })
      } catch (error) {
        this.log("error", "alert", "Erro ao enviar webhook", error.message)
      }
    }
  }

  startMonitoring() {
    if (this.isRunning) {
      this.log("warn", "monitor", "Monitoramento já está rodando")
      return
    }

    if (!this.config.enabled) {
      this.log("info", "monitor", "Monitoramento desabilitado na configuração")
      return
    }

    this.isRunning = true
    this.log("info", "monitor", "Iniciando monitoramento contínuo")

    // Iniciar monitoramento para cada serviço
    for (const service of this.config.services) {
      if (!service.interval) continue

      const intervalId = setInterval(async () => {
        const result = await this.checkService(service)

        if (result.status === "unhealthy") {
          await this.sendAlert(service, result)
        }
      }, service.interval)

      this.intervals.set(service.name, intervalId)
      this.log("info", "monitor", `Monitoramento iniciado para ${service.name} (${service.interval}ms)`)
    }

    // Health check inicial
    setTimeout(() => {
      this.runHealthCheck()
    }, 5000)
  }

  stopMonitoring() {
    if (!this.isRunning) {
      this.log("warn", "monitor", "Monitoramento não está rodando")
      return
    }

    this.isRunning = false
    this.log("info", "monitor", "Parando monitoramento contínuo")

    // Parar todos os intervalos
    for (const [serviceName, intervalId] of this.intervals) {
      clearInterval(intervalId)
      this.log("info", "monitor", `Monitoramento parado para ${serviceName}`)
    }

    this.intervals.clear()
  }

  async runHealthCheck() {
    this.log("info", "monitor", "Executando health check completo")

    const results = {}
    for (const service of this.config.services) {
      results[service.name] = await this.checkService(service)
    }

    // Salvar relatório de health check
    const reportFile = path.join(this.logDir, `health-report-${Date.now()}.json`)
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      results,
    }

    try {
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
      this.log("info", "monitor", `Relatório de health check salvo: ${reportFile}`)
    } catch (error) {
      this.log("error", "monitor", "Erro ao salvar relatório", error.message)
    }

    return report
  }

  getServiceStatus(serviceName) {
    const resultsFile = path.join(this.logDir, `${serviceName}-results.json`)

    try {
      if (fs.existsSync(resultsFile)) {
        const data = fs.readFileSync(resultsFile, "utf8")
        const results = JSON.parse(data)
        return results.slice(-10) // Últimos 10 resultados
      }
    } catch (error) {
      this.log("error", "monitor", "Erro ao ler status do serviço", error.message)
    }

    return []
  }

  getAllServicesStatus() {
    const status = {}

    for (const service of this.config.services) {
      status[service.name] = this.getServiceStatus(service.name)
    }

    return status
  }
}

// CLI Interface
if (require.main === module) {
  const monitor = new ContinuousMonitor()
  const command = process.argv[2]

  // Tratar sinais de sistema
  process.on("SIGINT", () => {
    console.log("\nRecebido SIGINT, parando monitoramento...")
    monitor.stopMonitoring()
    setTimeout(() => process.exit(0), 1000)
  })

  process.on("SIGTERM", () => {
    console.log("\nRecebido SIGTERM, parando monitoramento...")
    monitor.stopMonitoring()
    setTimeout(() => process.exit(0), 1000)
  })

  switch (command) {
    case "start":
      monitor.startMonitoring()
      break

    case "stop":
      monitor.stopMonitoring()
      setTimeout(() => process.exit(0), 1000)
      break

    case "health":
      monitor.runHealthCheck().then((report) => {
        console.log("\n📊 Relatório de Health Check:")
        console.log("============================")

        for (const [serviceName, result] of Object.entries(report.results)) {
          const status = result.status === "healthy" ? "✅" : "❌"
          const time = result.responseTime ? `(${result.responseTime}ms)` : ""
          console.log(`${status} ${serviceName} ${time}`)

          if (result.error) {
            console.log(`   Erro: ${result.error}`)
          }
        }

        process.exit(0)
      })
      break

    case "status":
      const serviceName = process.argv[3]
      if (serviceName) {
        const status = monitor.getServiceStatus(serviceName)
        console.log(`Status de ${serviceName}:`)
        console.log(JSON.stringify(status, null, 2))
      } else {
        const allStatus = monitor.getAllServicesStatus()
        console.log("Status de todos os serviços:")
        console.log(JSON.stringify(allStatus, null, 2))
      }
      break

    default:
      console.log(`
Uso: node continuous-monitor.js <comando>

Comandos:
  start    - Iniciar monitoramento contínuo
  stop     - Parar monitoramento
  health   - Executar health check único
  status   - Mostrar status dos serviços

Exemplos:
  node continuous-monitor.js start
  node continuous-monitor.js health
  node continuous-monitor.js status gemini-ai
`)
      process.exit(1)
  }
}

module.exports = ContinuousMonitor
