import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, sessionId } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
    }

    const vertexAI = getVertexAIService()
    const response = await vertexAI.chatbotResponse(message, context)

    return NextResponse.json({
      success: true,
      data: {
        response,
        sessionId: sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate chatbot response",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const message = searchParams.get("message")

  if (!message) {
    return NextResponse.json({ error: "Message parameter is required" }, { status: 400 })
  }

  try {
    const vertexAI = getVertexAIService()
    const response = await vertexAI.chatbotResponse(message)

    return NextResponse.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate chatbot response",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
