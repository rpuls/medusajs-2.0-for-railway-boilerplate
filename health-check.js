const http = require("http")
const https = require("https")
const { URL } = require("url")

// Configuração do health check
const CONFIG = {
  timeout: 10000,
  retries: 3,
  interval: 5000,
  endpoints: [
    {
      name: "Main Application",
      url: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE || "http://localhost:3000",
      path: "/health",
      critical: true,
    },
    {
      name: "Admin Panel",
      url: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE || "http://localhost:3000",
      path: "/admin",
      critical: false,
    },
    {
      name: "AI Health",
      url: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE || "http://localhost:3000",
      path: "/api/ai/health",
      critical: true,
    },
    {
      name: "Copilot Health",
      url: process.env.RAILWAY_PUBLIC_DOMAIN_VALUE || "http://localhost:3000",
      path: "/api/copilot/health",
      critical: false,
    },
  ],
}

// Cores para output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message, color = "reset") {
  const timestamp = new Date().toISOString()
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`)
}

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const client = parsedUrl.protocol === "https:" ? https : http

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      timeout: timeout,
      headers: {
        "User-Agent": "Volaron-Health-Check/1.0",
      },
    }

    const req = client.request(options, (res) => {
      let data = ""

      res.on("data", (chunk) => {
        data += chunk
      })

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now() - startTime,
        })
      })
    })

    const startTime = Date.now()

    req.on("error", (error) => {
      reject({
        error: error.message,
        code: error.code,
        responseTime: Date.now() - startTime,
      })
    })

    req.on("timeout", () => {
      req.destroy()
      reject({
        error: "Request timeout",
        code: "TIMEOUT",
        responseTime: timeout,
      })
    })

    req.end()
  })
}

// Função para testar um endpoint
async function testEndpoint(endpoint, retries = CONFIG.retries) {
  const url = `${endpoint.url}${endpoint.path}`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log(`Testing ${endpoint.name} (attempt ${attempt}/${retries}): ${url}`, "blue")

      const result = await makeRequest(url, CONFIG.timeout)

      if (result.statusCode >= 200 && result.statusCode < 400) {
        log(`✅ ${endpoint.name}: OK (${result.statusCode}) - ${result.responseTime}ms`, "green")
        return {
          name: endpoint.name,
          url: url,
          status: "healthy",
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          critical: endpoint.critical,
        }
      } else {
        log(`⚠️ ${endpoint.name}: HTTP ${result.statusCode} - ${result.responseTime}ms`, "yellow")

        if (attempt === retries) {
          return {
            name: endpoint.name,
            url: url,
            status: "unhealthy",
            statusCode: result.statusCode,
            responseTime: result.responseTime,
            critical: endpoint.critical,
            error: `HTTP ${result.statusCode}`,
          }
        }
      }
    } catch (error) {
      log(`❌ ${endpoint.name}: ${error.error} (${error.code}) - ${error.responseTime}ms`, "red")

      if (attempt === retries) {
        return {
          name: endpoint.name,
          url: url,
          status: "unhealthy",
          responseTime: error.responseTime,
          critical: endpoint.critical,
          error: error.error,
          code: error.code,
        }
      }
    }

    if (attempt < retries) {
      log(`Retrying in ${CONFIG.interval}ms...`, "yellow")
      await new Promise((resolve) => setTimeout(resolve, CONFIG.interval))
    }
  }
}

// Função principal de health check
async function runHealthCheck() {
  log("🏥 VOLARON STORE HEALTH CHECK", "cyan")
  log("==============================", "cyan")

  const startTime = Date.now()
  const results = []

  // Informações do ambiente
  log(`Environment: ${process.env.RAILWAY_ENVIRONMENT || "local"}`, "blue")
  log(`Project: ${process.env.RAILWAY_PROJECT_NAME || "unknown"}`, "blue")
  log(`Service: ${process.env.RAILWAY_SERVICE_NAME || "unknown"}`, "blue")
  log("", "reset")

  // Testar todos os endpoints
  for (const endpoint of CONFIG.endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    log("", "reset") // Linha em branco entre testes
  }

  // Análise dos resultados
  const totalTime = Date.now() - startTime
  const healthyCount = results.filter((r) => r.status === "healthy").length
  const unhealthyCount = results.filter((r) => r.status === "unhealthy").length
  const criticalFailures = results.filter((r) => r.status === "unhealthy" && r.critical).length

  log("📊 HEALTH CHECK SUMMARY", "cyan")
  log("=======================", "cyan")
  log(`Total endpoints: ${results.length}`, "blue")
  log(`Healthy: ${healthyCount}`, "green")
  log(`Unhealthy: ${unhealthyCount}`, unhealthyCount > 0 ? "red" : "green")
  log(`Critical failures: ${criticalFailures}`, criticalFailures > 0 ? "red" : "green")
  log(`Total time: ${totalTime}ms`, "blue")

  // Determinar status geral
  let overallStatus = "healthy"
  let exitCode = 0

  if (criticalFailures > 0) {
    overallStatus = "critical"
    exitCode = 2
    log("🚨 CRITICAL: Some critical services are down!", "red")
  } else if (unhealthyCount > 0) {
    overallStatus = "degraded"
    exitCode = 1
    log("⚠️ DEGRADED: Some non-critical services are down", "yellow")
  } else {
    log("✅ HEALTHY: All services are operational", "green")
  }

  // Salvar relatório detalhado
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.RAILWAY_ENVIRONMENT || "local",
    project: process.env.RAILWAY_PROJECT_NAME || "unknown",
    service: process.env.RAILWAY_SERVICE_NAME || "unknown",
    overallStatus: overallStatus,
    totalTime: totalTime,
    summary: {
      total: results.length,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      criticalFailures: criticalFailures,
    },
    endpoints: results,
  }

  try {
    require("fs").writeFileSync("health-check-report.json", JSON.stringify(report, null, 2))
    log("📄 Report saved to health-check-report.json", "blue")
  } catch (error) {
    log(`Failed to save report: ${error.message}`, "red")
  }

  log("", "reset")
  log("🏁 Health check completed", "cyan")

  return exitCode
}

// Executar health check se chamado diretamente
if (require.main === module) {
  runHealthCheck()
    .then((exitCode) => {
      process.exit(exitCode)
    })
    .catch((error) => {
      log(`Health check failed: ${error.message}`, "red")
      process.exit(3)
    })
}

module.exports = { runHealthCheck, testEndpoint, makeRequest }
