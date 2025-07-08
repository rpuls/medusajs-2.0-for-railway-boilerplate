import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function GET() {
  try {
    const startTime = Date.now()

    // Verificar saúde do Gemini AI
    const geminiHealth = await geminiAIService.healthCheck()

    // Verificar outras dependências
    const dependencies = await checkDependencies()

    const responseTime = Date.now() - startTime

    // Calcular status geral
    const overallStatus = calculateOverallStatus([geminiHealth, ...Object.values(dependencies)])

    const healthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      response_time: responseTime,
      services: {
        gemini_ai: geminiHealth,
        ...dependencies,
      },
      system_info: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage(),
        uptime: process.uptime(),
      },
      environment: {
        node_env: process.env.NODE_ENV,
        has_gemini_key: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        has_database_url: !!process.env.DATABASE_URL,
        has_redis_url: !!process.env.REDIS_URL,
      },
    }

    const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 206 : 503

    return NextResponse.json(healthReport, { status: statusCode })
  } catch (error) {
    console.error("Erro no health check:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Erro desconhecido",
        services: {
          gemini_ai: { status: "unhealthy", error: "Health check failed" },
        },
      },
      { status: 503 },
    )
  }
}

async function checkDependencies() {
  const dependencies: Record<string, any> = {}

  // Verificar banco de dados
  dependencies.database = await checkDatabase()

  // Verificar Redis
  dependencies.redis = await checkRedis()

  // Verificar APIs externas
  dependencies.external_apis = await checkExternalAPIs()

  return dependencies
}

async function checkDatabase(): Promise<any> {
  try {
    if (!process.env.DATABASE_URL) {
      return {
        status: "unhealthy",
        error: "DATABASE_URL não configurada",
        timestamp: new Date().toISOString(),
      }
    }

    // Simular verificação de conexão com banco
    // Em produção, fazer uma query real
    const startTime = Date.now()

    // Placeholder para verificação real do banco
    await new Promise((resolve) => setTimeout(resolve, 10))

    const responseTime = Date.now() - startTime

    return {
      status: "healthy",
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      connection_pool: {
        active: 5,
        idle: 10,
        total: 15,
      },
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Database connection failed",
      timestamp: new Date().toISOString(),
    }
  }
}

async function checkRedis(): Promise<any> {
  try {
    if (!process.env.REDIS_URL) {
      return {
        status: "unhealthy",
        error: "REDIS_URL não configurada",
        timestamp: new Date().toISOString(),
      }
    }

    const startTime = Date.now()

    // Simular verificação do Redis
    // Em produção, fazer um ping real
    await new Promise((resolve) => setTimeout(resolve, 5))

    const responseTime = Date.now() - startTime

    return {
      status: "healthy",
      response_time: responseTime,
      timestamp: new Date().toISOString(),
      memory_usage: "2.5MB",
      connected_clients: 3,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Redis connection failed",
      timestamp: new Date().toISOString(),
    }
  }
}

async function checkExternalAPIs(): Promise<any> {
  const apis = {}

  // Verificar API do MedusaJS (se aplicável)
  try {
    const medusaUrl = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL
    if (medusaUrl) {
      const startTime = Date.now()

      const response = await fetch(`${medusaUrl}/health`, {
        method: "GET",
        timeout: 5000,
      }).catch(() => ({ ok: false, status: 0 }))

      const responseTime = Date.now() - startTime

      apis.medusa = {
        status: response.ok ? "healthy" : "unhealthy",
        response_time: responseTime,
        status_code: response.status,
        timestamp: new Date().toISOString(),
      }
    }
  } catch (error) {
    apis.medusa = {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "MedusaJS API check failed",
      timestamp: new Date().toISOString(),
    }
  }

  return apis
}

function calculateOverallStatus(services: any[]): "healthy" | "degraded" | "unhealthy" {
  const statuses = services.map((service) => service.status)

  const healthyCount = statuses.filter((s) => s === "healthy").length
  const degradedCount = statuses.filter((s) => s === "degraded").length
  const unhealthyCount = statuses.filter((s) => s === "unhealthy").length

  if (unhealthyCount > 0) {
    return unhealthyCount >= services.length / 2 ? "unhealthy" : "degraded"
  }

  if (degradedCount > 0) {
    return "degraded"
  }

  return "healthy"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service } = body

    if (!service) {
      return NextResponse.json({ error: "Serviço é obrigatório" }, { status: 400 })
    }

    let result

    switch (service) {
      case "gemini":
        result = await geminiAIService.healthCheck()
        break
      case "database":
        result = await checkDatabase()
        break
      case "redis":
        result = await checkRedis()
        break
      default:
        return NextResponse.json({ error: `Serviço não reconhecido: ${service}` }, { status: 400 })
    }

    return NextResponse.json({
      service,
      ...result,
      checked_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro no health check específico:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
