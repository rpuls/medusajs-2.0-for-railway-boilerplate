import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "../../../services/gemini-ai-studio"

interface ChatSession {
  id: string
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>
  context: any
  createdAt: string
  lastActivity: string
}

// Armazenamento em memória para sessões (em produção, usar Redis ou banco)
const chatSessions = new Map<string, ChatSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    const response = await geminiAIService.generateChatResponse(message, context || {})

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        last_interaction: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        response: "Desculpe, ocorreu um erro. Tente novamente em alguns instantes.",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Chatbot API",
    methods: ["POST"],
    description: "Chatbot conversacional para Volaron Store",
    example: {
      message: "Olá, preciso de ajuda com um produto",
      context: {
        user_id: "user123",
        conversation_history: [],
        user_data: { location: "Birigui" },
      },
    },
  })
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID da sessão é obrigatório",
        },
        { status: 400 },
      )
    }

    const deleted = chatSessions.delete(sessionId)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Sessão não encontrada",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Sessão deletada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao deletar sessão:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
