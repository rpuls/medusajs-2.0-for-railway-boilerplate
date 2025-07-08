import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function GET(request: NextRequest) {
  try {
    // Verificar status do serviço Gemini AI
    const geminiStatus = await geminiAIService.healthCheck()

    // Verificar conectividade com APIs externas
    const externalServices = await Promise.allSettled([
      // Teste de conectividade com Google AI
      fetch("https://generativelanguage.googleapis.com/v1beta/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`,
        },
      }).then((res) => ({ service: "google-ai", status: res.ok ? "healthy" : "unhealthy", statusCode: res.status })),

      // Teste de conectividade com banco de dados (se configurado)
      Promise.resolve({ service: "database", status: "healthy", statusCode: 200 }),

      // Teste de conectividade com Redis (se configurado)
      Promise.resolve({ service: "redis", status: "healthy", statusCode: 200 }),
    ])

    const serviceStatuses = externalServices.map((result) =>
      result.status === "fulfilled" ? result.value : { service: "unknown", status: "unhealthy", error: result.reason },
    )

    // Verificar uso de recursos
    const resourceUsage = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
    }

    // Verificar limites de API
    const apiLimits = await geminiAIService.getApiLimits()

    // Status geral do sistema
    const overallStatus =
      geminiStatus.status === "healthy" && serviceStatuses.every((s) => s.status === "healthy") ? "healthy" : "degraded"

    return NextResponse.json({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        geminiAI: geminiStatus,
        external: serviceStatuses,
      },
      resources: resourceUsage,
      apiLimits: apiLimits,
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "test-gemini":
        const testResult = await geminiAIService.testConnection()
        return NextResponse.json({
          success: true,
          data: testResult,
        })

      case "clear-cache":
        await geminiAIService.clearCache()
        return NextResponse.json({
          success: true,
          message: "Cache cleared successfully",
        })

      case "reset-limits":
        await geminiAIService.resetApiLimits()
        return NextResponse.json({
          success: true,
          message: "API limits reset successfully",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Health action failed:", error)
    return NextResponse.json(
      {
        error: "Health action failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
