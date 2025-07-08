import { type NextRequest, NextResponse } from "next/server"
import { vertexAIService } from "@/services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    const response = await vertexAIService.generateChatResponse(message, context || {})

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)
    return NextResponse.json({ error: "Falha na resposta do chatbot" }, { status: 500 })
  }
}
