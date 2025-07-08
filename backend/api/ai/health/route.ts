import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function GET(request: NextRequest) {
  try {
    // Verificar saúde do serviço Gemini AI
    const healthCheck = await geminiAIService.healthCheck()

    // Verificar conectividade com banco de dados (simulado)
    const dbHealth = await checkDatabaseHealth()

    // Verificar uso de recursos
    const resourceUsage = await checkResourceUsage()

    // Verificar serviços externos
    const externalServices = await checkExternalServices()

    const overallHealth = determineOverallHealth([
      healthCheck.status,
      dbHealth.status,
      resourceUsage.status,
      externalServices.status,
    ])

    return NextResponse.json({
      status: overallHealth,
      timestamp: new Date().toISOString(),
      services: {
        gemini_ai: {
          status: healthCheck.status,
          model: healthCheck.model,
          response_time: healthCheck.response_time,
          last_request: healthCheck.last_request,
        },
        database: {
          status: dbHealth.status,
          connection_pool: dbHealth.connection_pool,
          query_time: dbHealth.query_time,
        },
        resources: {
          status: resourceUsage.status,
          memory_usage: resourceUsage.memory_usage,
          cpu_usage: resourceUsage.cpu_usage,
          disk_usage: resourceUsage.disk_usage,
        },
        external_services: {
          status: externalServices.status,
          medusa_api: externalServices.medusa_api,
          railway_status: externalServices.railway_status,
        },
      },
      metrics: {
        uptime: process.uptime(),
        requests_today: await getRequestCount(),
        error_rate: await getErrorRate(),
        avg_response_time: await getAverageResponseTime(),
      },
      version: {
        app_version: "1.0.0",
        node_version: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    })
  } catch (error) {
    console.error("Erro no health check:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        details: error.message,
      },
      { status: 503 },
    )
  }
}

// Funções auxiliares para health check
async function checkDatabaseHealth() {
  try {
    // Simular verificação do banco
    const startTime = Date.now()

    // Aqui você faria uma query real no banco
    await new Promise((resolve) => setTimeout(resolve, 10))

    const queryTime = Date.now() - startTime

    return {
      status: "healthy",
      connection_pool: "active",
      query_time: `${queryTime}ms`,
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    }
  }
}

async function checkResourceUsage() {
  try {
    const memUsage = process.memoryUsage()
    const memUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)

    return {
      status: memUsagePercent < 90 ? "healthy" : "warning",
      memory_usage: `${memUsagePercent}%`,
      cpu_usage: "N/A", // Seria calculado com libs específicas
      disk_usage: "N/A",
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    }
  }
}

async function checkExternalServices() {
  try {
    // Verificar status do MedusaJS (simulado)
    const medusaStatus = await checkMedusaAPI()

    // Verificar status do Railway (simulado)
    const railwayStatus = await checkRailwayStatus()

    return {
      status: medusaStatus && railwayStatus ? "healthy" : "degraded",
      medusa_api: medusaStatus ? "online" : "offline",
      railway_status: railwayStatus ? "operational" : "issues",
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    }
  }
}

async function checkMedusaAPI() {
  try {
    // Simular chamada para API do Medusa
    const response = await fetch(`${process.env.MEDUSA_BACKEND_URL}/health`, {
      method: "GET",
      timeout: 5000,
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function checkRailwayStatus() {
  try {
    // Verificar se estamos rodando no Railway
    return !!process.env.RAILWAY_ENVIRONMENT
  } catch (error) {
    return false
  }
}

function determineOverallHealth(statuses: string[]): string {
  if (statuses.every((status) => status === "healthy")) {
    return "healthy"
  } else if (statuses.some((status) => status === "unhealthy")) {
    return "unhealthy"
  } else {
    return "degraded"
  }
}

async function getRequestCount(): Promise<number> {
  // Em produção, isso viria de um sistema de métricas
  return Math.floor(Math.random() * 1000) + 100
}

async function getErrorRate(): Promise<string> {
  // Em produção, isso viria de um sistema de métricas
  return `${(Math.random() * 5).toFixed(2)}%`
}

async function getAverageResponseTime(): Promise<string> {
  // Em produção, isso viria de um sistema de métricas
  return `${Math.floor(Math.random() * 200) + 50}ms`
}
