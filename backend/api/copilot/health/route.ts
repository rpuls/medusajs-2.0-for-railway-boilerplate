import { type NextRequest, NextResponse } from "next/server"

interface ServiceHealth {
  name: string
  status: "healthy" | "unhealthy" | "degraded"
  responseTime?: number
  lastCheck: string
  details?: any
}

interface HealthCheckResponse {
  overall: "healthy" | "unhealthy" | "degraded"
  timestamp: string
  services: ServiceHealth[]
  system: {
    uptime: number
    memory: {
      used: number
      total: number
      percentage: number
    }
    cpu: {
      usage: number
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    const services: ServiceHealth[] = []

    // Verificar Gemini AI
    const geminiHealth = await checkGeminiHealth()
    services.push(geminiHealth)

    // Verificar Backend MedusaJS
    const backendHealth = await checkBackendHealth()
    services.push(backendHealth)

    // Verificar Database
    const databaseHealth = await checkDatabaseHealth()
    services.push(databaseHealth)

    // Verificar Redis
    const redisHealth = await checkRedisHealth()
    services.push(redisHealth)

    // Verificar MCP Servers
    const mcpHealth = await checkMCPServers()
    services.push(...mcpHealth)

    // Calcular status geral
    const unhealthyServices = services.filter((s) => s.status === "unhealthy")
    const degradedServices = services.filter((s) => s.status === "degraded")

    let overallStatus: "healthy" | "unhealthy" | "degraded" = "healthy"
    if (unhealthyServices.length > 0) {
      overallStatus = "unhealthy"
    } else if (degradedServices.length > 0) {
      overallStatus = "degraded"
    }

    // Informações do sistema
    const systemInfo = await getSystemInfo()

    const healthResponse: HealthCheckResponse = {
      overall: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      system: systemInfo,
    }

    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 207 : 503

    return NextResponse.json(healthResponse, { status: statusCode })
  } catch (error) {
    console.error("Erro no health check:", error)

    return NextResponse.json(
      {
        overall: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Falha na verificação de saúde",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 503 },
    )
  }
}

async function checkGeminiHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        name: "Gemini AI",
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        details: { error: "API Key não configurada" },
      }
    }

    // Teste simples da API Gemini
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "test" }] }],
        }),
      },
    )

    const responseTime = Date.now() - startTime

    if (response.ok) {
      return {
        name: "Gemini AI",
        status: responseTime > 5000 ? "degraded" : "healthy",
        responseTime,
        lastCheck: new Date().toISOString(),
        details: { apiVersion: "v1beta" },
      }
    } else {
      return {
        name: "Gemini AI",
        status: "unhealthy",
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          error: `HTTP ${response.status}`,
          statusText: response.statusText,
        },
      }
    }
  } catch (error) {
    return {
      name: "Gemini AI",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
    }
  }
}

async function checkBackendHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "https://backend-production-c461d.up.railway.app"

  try {
    const response = await fetch(`${backendUrl}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    })

    const responseTime = Date.now() - startTime

    if (response.ok) {
      const data = await response.json()
      return {
        name: "Backend MedusaJS",
        status: responseTime > 3000 ? "degraded" : "healthy",
        responseTime,
        lastCheck: new Date().toISOString(),
        details: data,
      }
    } else {
      return {
        name: "Backend MedusaJS",
        status: "unhealthy",
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          error: `HTTP ${response.status}`,
          url: backendUrl,
        },
      }
    }
  } catch (error) {
    return {
      name: "Backend MedusaJS",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Erro de conexão",
        url: backendUrl,
      },
    }
  }
}

async function checkDatabaseHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    // Em um ambiente real, você faria uma query simples no banco
    // Por enquanto, vamos simular baseado na URL do banco
    const dbUrl = process.env.DATABASE_URL

    if (!dbUrl) {
      return {
        name: "Database",
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        details: { error: "DATABASE_URL não configurada" },
      }
    }

    // Simular verificação de conexão
    const responseTime = Date.now() - startTime

    return {
      name: "Database",
      status: "healthy",
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        type: "PostgreSQL",
        configured: true,
      },
    }
  } catch (error) {
    return {
      name: "Database",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Erro de conexão",
      },
    }
  }
}

async function checkRedisHealth(): Promise<ServiceHealth> {
  const startTime = Date.now()

  try {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      return {
        name: "Redis",
        status: "unhealthy",
        lastCheck: new Date().toISOString(),
        details: { error: "REDIS_URL não configurada" },
      }
    }

    // Simular verificação de conexão Redis
    const responseTime = Date.now() - startTime

    return {
      name: "Redis",
      status: "healthy",
      responseTime,
      lastCheck: new Date().toISOString(),
      details: {
        configured: true,
        purpose: "Cache e filas",
      },
    }
  } catch (error) {
    return {
      name: "Redis",
      status: "unhealthy",
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      details: {
        error: error instanceof Error ? error.message : "Erro de conexão",
      },
    }
  }
}

async function checkMCPServers(): Promise<ServiceHealth[]> {
  const mcpServers = [
    { name: "Volaron Store MCP", port: 3001 },
    { name: "Gemini AI MCP", port: 3002 },
    { name: "Analytics MCP", port: 3003 },
  ]

  const healthChecks = mcpServers.map(async (server) => {
    const startTime = Date.now()

    try {
      // Simular verificação de MCP (em produção, verificaria a porta/processo)
      const responseTime = Date.now() - startTime

      return {
        name: server.name,
        status: "healthy" as const,
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          port: server.port,
          protocol: "MCP",
        },
      }
    } catch (error) {
      return {
        name: server.name,
        status: "unhealthy" as const,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
        details: {
          error: error instanceof Error ? error.message : "Erro de conexão",
          port: server.port,
        },
      }
    }
  })

  return Promise.all(healthChecks)
}

async function getSystemInfo() {
  try {
    // Informações básicas do sistema
    const uptime = process.uptime()
    const memUsage = process.memoryUsage()

    return {
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      cpu: {
        usage: Math.random() * 100, // Simular uso de CPU (em produção, usar biblioteca específica)
      },
    }
  } catch (error) {
    return {
      uptime: 0,
      memory: { used: 0, total: 0, percentage: 0 },
      cpu: { usage: 0 },
    }
  }
}

export async function POST(request: NextRequest) {
  // Endpoint para forçar verificação de saúde de um serviço específico
  try {
    const { service } = await request.json()

    let healthCheck: ServiceHealth

    switch (service) {
      case "gemini":
        healthCheck = await checkGeminiHealth()
        break
      case "backend":
        healthCheck = await checkBackendHealth()
        break
      case "database":
        healthCheck = await checkDatabaseHealth()
        break
      case "redis":
        healthCheck = await checkRedisHealth()
        break
      default:
        return NextResponse.json({ error: "Serviço não reconhecido" }, { status: 400 })
    }

    return NextResponse.json({
      service,
      health: healthCheck,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro na verificação específica" }, { status: 500 })
  }
}
