const { spawn } = require("child_process")
const fs = require("fs")
const path = require("path")

class MCPServerManager {
  constructor() {
    this.servers = new Map()
    this.configPath = path.join(__dirname, "../mcp-servers/config.json")
    this.logDir = path.join(__dirname, "../mcp-servers/logs")

    // Criar diretório de logs se não existir
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, "utf8")
        return JSON.parse(configData)
      }
    } catch (error) {
      console.error("Erro ao carregar configuração MCP:", error.message)
    }

    // Configuração padrão se arquivo não existir
    return {
      mcpServers: {
        "volaron-store": {
          command: "node",
          args: ["./mcp-servers/volaron-store-server.js"],
          env: {
            NODE_ENV: process.env.NODE_ENV || "development",
            MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL || "https://backend-production-c461d.up.railway.app",
            DATABASE_URL: process.env.DATABASE_URL,
          },
        },
        "gemini-ai": {
          command: "node",
          args: ["./mcp-servers/gemini-ai-server.js"],
          env: {
            GEMINI_API_KEY: process.env.GEMINI_API_KEY,
            GOOGLE_AI_MODEL: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
            NODE_ENV: process.env.NODE_ENV || "development",
          },
        },
        analytics: {
          command: "node",
          args: ["./mcp-servers/analytics-server.js"],
          env: {
            NODE_ENV: process.env.NODE_ENV || "development",
            ANALYTICS_DB_URL: process.env.DATABASE_URL,
          },
        },
      },
      settings: {
        autoRestart: true,
        healthCheckInterval: 30000,
        logLevel: "info",
        maxRestarts: 3,
      },
    }
  }

  startServer(name, config) {
    if (this.servers.has(name)) {
      console.log(`Servidor ${name} já está rodando`)
      return
    }

    console.log(`Iniciando servidor MCP: ${name}`)

    const logFile = path.join(this.logDir, `${name}.log`)
    const errorLogFile = path.join(this.logDir, `${name}.error.log`)

    const logStream = fs.createWriteStream(logFile, { flags: "a" })
    const errorLogStream = fs.createWriteStream(errorLogFile, { flags: "a" })

    const serverProcess = spawn(config.command, config.args, {
      env: { ...process.env, ...config.env },
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
    })

    // Log de saída padrão
    serverProcess.stdout.on("data", (data) => {
      const message = data.toString()
      logStream.write(`[${new Date().toISOString()}] ${message}`)
      if (process.env.MCP_VERBOSE === "true") {
        console.log(`[${name}] ${message.trim()}`)
      }
    })

    // Log de erros
    serverProcess.stderr.on("data", (data) => {
      const message = data.toString()
      errorLogStream.write(`[${new Date().toISOString()}] ${message}`)
      console.error(`[${name}] ERROR: ${message.trim()}`)
    })

    // Quando o processo termina
    serverProcess.on("close", (code) => {
      console.log(`Servidor ${name} terminou com código ${code}`)
      this.servers.delete(name)

      logStream.end()
      errorLogStream.end()

      // Auto-restart se configurado
      if (config.autoRestart && code !== 0) {
        console.log(`Reiniciando servidor ${name} em 5 segundos...`)
        setTimeout(() => {
          this.startServer(name, config)
        }, 5000)
      }
    })

    // Tratar erros do processo
    serverProcess.on("error", (error) => {
      console.error(`Erro ao iniciar servidor ${name}:`, error.message)
      this.servers.delete(name)
    })

    this.servers.set(name, {
      process: serverProcess,
      config,
      startTime: new Date(),
      restarts: 0,
    })

    console.log(`✅ Servidor ${name} iniciado (PID: ${serverProcess.pid})`)
  }

  stopServer(name) {
    const server = this.servers.get(name)
    if (!server) {
      console.log(`Servidor ${name} não está rodando`)
      return
    }

    console.log(`Parando servidor ${name}...`)
    server.process.kill("SIGTERM")

    // Forçar kill após 10 segundos se não parar
    setTimeout(() => {
      if (this.servers.has(name)) {
        console.log(`Forçando parada do servidor ${name}`)
        server.process.kill("SIGKILL")
      }
    }, 10000)
  }

  stopAllServers() {
    console.log("Parando todos os servidores MCP...")
    for (const [name] of this.servers) {
      this.stopServer(name)
    }
  }

  startAllServers() {
    const config = this.loadConfig()

    console.log("Iniciando servidores MCP...")
    console.log(`Configuração carregada: ${Object.keys(config.mcpServers).length} servidores`)

    for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
      // Verificar se as dependências estão disponíveis
      if (name === "gemini-ai" && !serverConfig.env.GEMINI_API_KEY) {
        console.warn(`⚠️ Pulando ${name}: GEMINI_API_KEY não configurada`)
        continue
      }

      if (name === "volaron-store" && !serverConfig.env.DATABASE_URL) {
        console.warn(`⚠️ Pulando ${name}: DATABASE_URL não configurada`)
        continue
      }

      this.startServer(name, {
        ...serverConfig,
        autoRestart: config.settings.autoRestart,
      })
    }
  }

  getStatus() {
    const status = {
      running: this.servers.size,
      servers: {},
    }

    for (const [name, server] of this.servers) {
      status.servers[name] = {
        pid: server.process.pid,
        startTime: server.startTime,
        uptime: Date.now() - server.startTime.getTime(),
        restarts: server.restarts,
      }
    }

    return status
  }

  healthCheck() {
    console.log("\n🏥 Health Check dos Servidores MCP")
    console.log("================================")

    const status = this.getStatus()
    console.log(`Servidores rodando: ${status.running}`)

    for (const [name, info] of Object.entries(status.servers)) {
      const uptimeMinutes = Math.floor(info.uptime / 60000)
      console.log(`✅ ${name}: PID ${info.pid}, Uptime: ${uptimeMinutes}min, Restarts: ${info.restarts}`)
    }

    if (status.running === 0) {
      console.log("❌ Nenhum servidor MCP rodando")
    }

    return status
  }
}

// CLI Interface
if (require.main === module) {
  const manager = new MCPServerManager()
  const command = process.argv[2]

  // Tratar sinais de sistema
  process.on("SIGINT", () => {
    console.log("\nRecebido SIGINT, parando servidores...")
    manager.stopAllServers()
    setTimeout(() => process.exit(0), 2000)
  })

  process.on("SIGTERM", () => {
    console.log("\nRecebido SIGTERM, parando servidores...")
    manager.stopAllServers()
    setTimeout(() => process.exit(0), 2000)
  })

  switch (command) {
    case "start":
      manager.startAllServers()

      // Health check periódico
      setInterval(() => {
        if (process.env.MCP_VERBOSE === "true") {
          manager.healthCheck()
        }
      }, 60000) // A cada minuto

      break

    case "stop":
      manager.stopAllServers()
      setTimeout(() => process.exit(0), 2000)
      break

    case "restart":
      manager.stopAllServers()
      setTimeout(() => {
        manager.startAllServers()
      }, 3000)
      break

    case "status":
      const status = manager.healthCheck()
      process.exit(status.running > 0 ? 0 : 1)
      break

    case "logs":
      const serverName = process.argv[3]
      if (serverName) {
        const logFile = path.join(__dirname, "../mcp-servers/logs", `${serverName}.log`)
        if (fs.existsSync(logFile)) {
          console.log(fs.readFileSync(logFile, "utf8"))
        } else {
          console.log(`Log não encontrado para ${serverName}`)
        }
      } else {
        console.log("Uso: node start-mcp-servers.js logs <nome-do-servidor>")
      }
      break

    default:
      console.log(`
Uso: node start-mcp-servers.js <comando>

Comandos:
  start    - Iniciar todos os servidores MCP
  stop     - Parar todos os servidores MCP
  restart  - Reiniciar todos os servidores MCP
  status   - Mostrar status dos servidores
  logs     - Mostrar logs de um servidor específico

Exemplos:
  node start-mcp-servers.js start
  node start-mcp-servers.js status
  node start-mcp-servers.js logs gemini-ai
`)
      process.exit(1)
  }
}

module.exports = MCPServerManager
