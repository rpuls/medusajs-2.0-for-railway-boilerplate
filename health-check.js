#!/usr/bin/env node

/**
 * Volaron Store - Health Check Script
 * Verifica a saúde de todos os serviços da aplicação
 */

const http = require("http")
const https = require("https")
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Configurações
const CONFIG = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",
  timeout: 10000,
  retries: 3,
  services: {
    app: {
      name: "Aplicação Principal",
      url: `http://localhost:${process.env.PORT || 3000}`,
      healthPath: "/health",
    },
    medusa: {
      name: "Medusa Backend",
      url: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL,
      healthPath: "/health",
    },
    database: {
      name: "Banco de Dados",
      url: process.env.DATABASE_URL,
    },
  },
}

// Cores para output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
}

// Função para log colorido
function log(message, color = "reset") {
  const timestamp = new Date().toISOString()
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`)
}

// Função para fazer requisição HTTP
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http
    const req = client.get(url, { timeout }, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
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

    req.on("error", reject)
  })
}

// Verificar se um processo está rodando
function isProcessRunning(processName) {
  try {
    execSync(`pgrep -f "${processName}"`, { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

// Verificar conexão com banco de dados
async function checkDatabase() {
  if (!CONFIG.services.database.url) {
    return { status: "warning", message: "URL do banco não configurada" }
  }

  try {
    // Para PostgreSQL
    if (CONFIG.services.database.url.includes("postgres")) {
      const { Client } = require("pg")
      const client = new Client({ connectionString: CONFIG.services.database.url })
      await client.connect()
      await client.query("SELECT 1")
      await client.end()
      return { status: "healthy", message: "Conexão PostgreSQL OK" }
    }

    return { status: "unknown", message: "Tipo de banco não reconhecido" }
  } catch (error) {
    return { status: "unhealthy", message: error.message }
  }
}

// Verificar serviço HTTP
async function checkHttpService(service) {
  if (!service.url) {
    return { status: "warning", message: "URL não configurada" }
  }

  const fullUrl = service.url + (service.healthPath || "")

  for (let attempt = 1; attempt <= CONFIG.retries; attempt++) {
    try {
      const response = await makeRequest(fullUrl, CONFIG.timeout)

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          status: "healthy",
          message: `HTTP ${response.statusCode}`,
          responseTime: Date.now(),
        }
      } else {
        return {
          status: "degraded",
          message: `HTTP ${response.statusCode}`,
        }
      }
    } catch (error) {
      if (attempt === CONFIG.retries) {
        return {
          status: "unhealthy",
          message: error.message,
        }
      }

      // Aguardar antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

// Verificar recursos do sistema
function checkSystemResources() {
  try {
    const memInfo = fs.readFileSync("/proc/meminfo", "utf8")
    const memTotal = Number.parseInt(memInfo.match(/MemTotal:\s+(\d+)/)[1]) * 1024
    const memFree = Number.parseInt(memInfo.match(/MemAvailable:\s+(\d+)/)[1]) * 1024
    const memUsed = memTotal - memFree
    const memUsagePercent = (memUsed / memTotal) * 100

    const diskUsage = execSync("df -h /", { encoding: "utf8" })
    const diskLine = diskUsage.split("\n")[1]
    const diskUsagePercent = Number.parseInt(diskLine.split(/\s+/)[4])

    return {
      memory: {
        total: Math.round(memTotal / 1024 / 1024),
        used: Math.round(memUsed / 1024 / 1024),
        percentage: Math.round(memUsagePercent),
      },
      disk: {
        usage: diskUsagePercent,
      },
    }
  } catch (error) {
    return { error: error.message }
  }
}

// Verificar variáveis de ambiente
function checkEnvironment() {
  const requiredVars = ["NODE_ENV", "PORT", "DATABASE_URL", "GEMINI_API_KEY", "NEXT_PUBLIC_MEDUSA_BACKEND_URL"]

  const missing = []
  const configured = []

  requiredVars.forEach((varName) => {
    if (process.env[varName]) {
      configured.push(varName)
    } else {
      missing.push(varName)
    }
  })

  return {
    configured: configured.length,
    missing: missing.length,
    missingVars: missing,
    total: requiredVars.length,
  }
}

// Verificar serviços MCP
function checkMCPServers() {
  const mcpServers = ["volaron-store-server.js", "gemini-ai-server.js"]

  const status = {}

  mcpServers.forEach((server) => {
    status[server] = {
      running: isProcessRunning(server),
      logFile: `mcp-servers/logs/${server.replace(".js", ".log")}`,
    }

    // Verificar se arquivo de log existe e tem conteúdo recente
    const logPath = status[server].logFile
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath)
      const ageMinutes = (Date.now() - stats.mtime.getTime()) / 1000 / 60
      status[server].logAge = Math.round(ageMinutes)
      status[server].logSize = stats.size
    }
  })

  return status
}

// Função principal de health check
async function performHealthCheck() {
  log("🏥 Iniciando Health Check da Volaron Store...", "blue")
  log("", "reset")

  const results = {
    timestamp: new Date().toISOString(),
    overall: "healthy",
    checks: {},
  }

  // 1. Verificar ambiente
  log("🔍 Verificando variáveis de ambiente...", "blue")
  const envCheck = checkEnvironment()
  results.checks.environment = envCheck

  if (envCheck.missing > 0) {
    log(`❌ ${envCheck.missing} variáveis faltando: ${envCheck.missingVars.join(", ")}`, "red")
    results.overall = "degraded"
  } else {
    log(`✅ Todas as ${envCheck.configured} variáveis configuradas`, "green")
  }

  // 2. Verificar recursos do sistema
  log("💻 Verificando recursos do sistema...", "blue")
  const systemCheck = checkSystemResources()
  results.checks.system = systemCheck

  if (systemCheck.error) {
    log(`⚠️  Erro ao verificar recursos: ${systemCheck.error}`, "yellow")
  } else {
    log(
      `📊 Memória: ${systemCheck.memory.used}MB/${systemCheck.memory.total}MB (${systemCheck.memory.percentage}%)`,
      "reset",
    )
    log(`💾 Disco: ${systemCheck.disk.usage}% usado`, "reset")

    if (systemCheck.memory.percentage > 90 || systemCheck.disk.usage > 90) {
      log("⚠️  Recursos do sistema em nível crítico", "yellow")
      results.overall = "degraded"
    }
  }

  // 3. Verificar banco de dados
  log("🗄️  Verificando banco de dados...", "blue")
  try {
    const dbCheck = await checkDatabase()
    results.checks.database = dbCheck

    if (dbCheck.status === "healthy") {
      log(`✅ ${dbCheck.message}`, "green")
    } else if (dbCheck.status === "warning") {
      log(`⚠️  ${dbCheck.message}`, "yellow")
    } else {
      log(`❌ ${dbCheck.message}`, "red")
      results.overall = "unhealthy"
    }
  } catch (error) {
    log(`❌ Erro na verificação do banco: ${error.message}`, "red")
    results.checks.database = { status: "error", message: error.message }
    results.overall = "unhealthy"
  }

  // 4. Verificar serviços HTTP
  log("🌐 Verificando serviços HTTP...", "blue")
  for (const [serviceName, serviceConfig] of Object.entries(CONFIG.services)) {
    if (serviceName === "database") continue // Já verificado acima

    try {
      const serviceCheck = await checkHttpService(serviceConfig)
      results.checks[serviceName] = serviceCheck

      if (serviceCheck.status === "healthy") {
        log(`✅ ${serviceConfig.name}: ${serviceCheck.message}`, "green")
      } else if (serviceCheck.status === "degraded") {
        log(`⚠️  ${serviceConfig.name}: ${serviceCheck.message}`, "yellow")
        if (results.overall === "healthy") results.overall = "degraded"
      } else if (serviceCheck.status === "warning") {
        log(`⚠️  ${serviceConfig.name}: ${serviceCheck.message}`, "yellow")
      } else {
        log(`❌ ${serviceConfig.name}: ${serviceCheck.message}`, "red")
        results.overall = "unhealthy"
      }
    } catch (error) {
      log(`❌ Erro verificando ${serviceConfig.name}: ${error.message}`, "red")
      results.checks[serviceName] = { status: "error", message: error.message }
      results.overall = "unhealthy"
    }
  }

  // 5. Verificar servidores MCP
  log("🤖 Verificando servidores MCP...", "blue")
  const mcpCheck = checkMCPServers()
  results.checks.mcp = mcpCheck

  Object.entries(mcpCheck).forEach(([server, status]) => {
    if (status.running) {
      log(`✅ ${server}: Rodando`, "green")
      if (status.logAge !== undefined) {
        log(`   📝 Log atualizado há ${status.logAge} minutos (${status.logSize} bytes)`, "reset")
      }
    } else {
      log(`❌ ${server}: Não está rodando`, "red")
      if (results.overall === "healthy") results.overall = "degraded"
    }
  })

  // Resultado final
  log("", "reset")
  log("📋 Resumo do Health Check:", "bold")

  const statusColor = results.overall === "healthy" ? "green" : results.overall === "degraded" ? "yellow" : "red"
  const statusIcon = results.overall === "healthy" ? "✅" : results.overall === "degraded" ? "⚠️" : "❌"

  log(`${statusIcon} Status Geral: ${results.overall.toUpperCase()}`, statusColor)

  // Salvar resultado em arquivo
  const resultPath = path.join(__dirname, "health-check-result.json")
  fs.writeFileSync(resultPath, JSON.stringify(results, null, 2))
  log(`📄 Resultado salvo em: ${resultPath}`, "blue")

  // Exit code baseado no status
  const exitCode = results.overall === "unhealthy" ? 1 : 0
  process.exit(exitCode)
}

// Executar se chamado diretamente
if (require.main === module) {
  performHealthCheck().catch((error) => {
    log(`💥 Erro fatal no health check: ${error.message}`, "red")
    console.error(error)
    process.exit(1)
  })
}

module.exports = { performHealthCheck, checkDatabase, checkHttpService }
