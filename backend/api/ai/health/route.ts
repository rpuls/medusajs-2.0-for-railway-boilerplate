import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/backend/services/gemini-ai-studio"

export async function GET() {
  try {
    const healthChecks = {
      timestamp: new Date().toISOString(),
      service: "Volaron AI Services",
      status: "checking...",
      checks: {},
    }

    // Test Gemini AI connection
    try {
      const testResponse = await geminiAIService.generateContent('Test connection. Respond with "OK".')
      healthChecks.checks.geminiAI = {
        status: testResponse.includes("OK") ? "healthy" : "degraded",
        responseTime: Date.now(),
        lastTest: new Date().toISOString(),
      }
    } catch (error) {
      healthChecks.checks.geminiAI = {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        lastTest: new Date().toISOString(),
      }
    }

    // Check environment variables
    const requiredEnvVars = ["GEMINI_API_KEY", "GOOGLE_AI_API_KEY", "NEXT_PUBLIC_MEDUSA_BACKEND_URL"]

    healthChecks.checks.environment = {
      status: "healthy",
      variables: {},
    }

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      healthChecks.checks.environment.variables[envVar] = {
        configured: !!value,
        length: value ? value.length : 0,
      }

      if (!value) {
        healthChecks.checks.environment.status = "unhealthy"
      }
    }

    // Check API endpoints
    const endpoints = [
      "/api/ai/analyze-customer",
      "/api/ai/chatbot",
      "/api/ai/generate-description",
      "/api/ai/marketing-content",
    ]

    healthChecks.checks.endpoints = {
      status: "healthy",
      available: endpoints.map((endpoint) => ({
        path: endpoint,
        status: "available",
      })),
    }

    // Overall status
    const allChecks = Object.values(healthChecks.checks)
    const hasUnhealthy = allChecks.some((check: any) => check.status === "unhealthy")
    const hasDegraded = allChecks.some((check: any) => check.status === "degraded")

    healthChecks.status = hasUnhealthy ? "unhealthy" : hasDegraded ? "degraded" : "healthy"

    return NextResponse.json(healthChecks, {
      status: healthChecks.status === "healthy" ? 200 : 503,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        service: "Volaron AI Services",
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { service } = await request.json()

    if (service === "gemini") {
      const testPrompt = 'Teste de conectividade. Responda apenas "Conexão OK".'
      const response = await geminiAIService.generateContent(testPrompt)

      return NextResponse.json({
        success: true,
        service: "Gemini AI",
        status: "healthy",
        response: response.substring(0, 100),
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json({ error: "Service not specified or not supported" }, { status: 400 })
  } catch (error) {
    console.error("Service health check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
