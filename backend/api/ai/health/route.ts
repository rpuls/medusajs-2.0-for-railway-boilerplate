import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function GET(request: NextRequest) {
  try {
    const health = await geminiAIService.healthCheck()

    return NextResponse.json({
      ...health,
      api_provider: "gemini-ai-studio",
      rate_limit_info: {
        requests_per_minute: 15,
        current_model: health.model,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
