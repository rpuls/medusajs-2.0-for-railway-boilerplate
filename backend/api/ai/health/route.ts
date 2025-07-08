import { NextResponse } from "next/server"
import { geminiAIService } from "../../../services/gemini-ai-studio"

export async function GET() {
  try {
    // Verificar saúde do Gemini AI
    const geminiHealth = await geminiAIService.healthCheck()

    // Verificar conectividade com outros serviços
    const services = {
      gemini_ai: geminiHealth,
      database: await checkDatabase(),
      redis: await checkRedis(),
      meilisearch: await checkMeilisearch(),
    }

    // Calcular status geral
    const allHealthy = Object.values(services).every((service) => service.status === "healthy")

    const overallStatus = allHealthy ? "healthy" : "degraded"

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Erro no health check:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
        version: "1.0.0",
      },
      { status: 503 },
    )
  }
}

async function checkDatabase() {
  try {
    // Simular verificação do banco
    // Em produção, fazer uma query simples
    return {
      status: "healthy",
      response_time: Math.random() * 100,
      last_check: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      last_check: new Date().toISOString(),
    }
  }
}

async function checkRedis() {
  try {
    // Simular verificação do Redis
    return {
      status: "healthy",
      response_time: Math.random() * 50,
      last_check: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      last_check: new Date().toISOString(),
    }
  }
}

async function checkMeilisearch() {
  try {
    // Simular verificação do MeiliSearch
    return {
      status: "healthy",
      response_time: Math.random() * 200,
      last_check: new Date().toISOString(),
    }
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      last_check: new Date().toISOString(),
    }
  }
}
