import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function GET(request: NextRequest) {
  try {
    const vertexAI = getVertexAIService()
    const healthStatus = await vertexAI.healthCheck()

    // Verificar outras dependências
    const systemHealth = {
      ai_service: healthStatus,
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      environment: checkEnvironmentVariables(),
      timestamp: new Date().toISOString(),
    }

    const overallHealthy = Object.values(systemHealth).every((service) =>
      typeof service === "object" ? service.status === "healthy" : service,
    )

    return NextResponse.json({
      success: true,
      status: overallHealthy ? "healthy" : "degraded",
      services: systemHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || "1.0.0",
    })
  } catch (error) {
    console.error("Erro no health check:", error)

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function checkDatabaseHealth(): Promise<{ status: string; responseTime?: number }> {
  try {
    const startTime = Date.now()

    // Simular verificação do banco - em produção, fazer query real
    if (process.env.DATABASE_URL) {
      const responseTime = Date.now() - startTime
      return { status: "healthy", responseTime }
    } else {
      return { status: "unhealthy" }
    }
  } catch (error) {
    return { status: "unhealthy" }
  }
}

async function checkRedisHealth(): Promise<{ status: string; responseTime?: number }> {
  try {
    const startTime = Date.now()

    // Simular verificação do Redis - em produção, fazer ping real
    if (process.env.REDIS_URL) {
      const responseTime = Date.now() - startTime
      return { status: "healthy", responseTime }
    } else {
      return { status: "unhealthy" }
    }
  } catch (error) {
    return { status: "unhealthy" }
  }
}

function checkEnvironmentVariables(): boolean {
  const requiredVars = ["GEMINI_API_KEY", "DATABASE_URL", "REDIS_URL", "JWT_SECRET", "COOKIE_SECRET"]

  return requiredVars.every((varName) => !!process.env[varName])
}
