import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

interface ChatSession {
  id: string
  messages: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>
  context: string
  createdAt: string
  lastActivity: string
}

// Armazenamento em memória para sessões (em produção, usar Redis ou banco)
const chatSessions = new Map<string, ChatSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, context } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Mensagem é obrigatória",
        },
        { status: 400 },
      )
    }

    // Obter ou criar sessão
    let session: ChatSession
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId)!
      session.lastActivity = new Date().toISOString()
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      session = {
        id: newSessionId,
        messages: [],
        context: context || "",
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      }
      chatSessions.set(newSessionId, session)
    }

    // Adicionar mensagem do usuário
    const userMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date().toISOString(),
    }
    session.messages.push(userMessage)

    // Gerar resposta com IA
    const vertexAI = getVertexAIService()
    const chatResponse = await vertexAI.chatWithCustomer(message, session.context)

    // Adicionar resposta do bot
    const botMessage = {
      role: "assistant" as const,
      content: chatResponse.message,
      timestamp: new Date().toISOString(),
    }
    session.messages.push(botMessage)

    // Atualizar contexto
    session.context = chatResponse.context

    // Salvar sessão atualizada
    chatSessions.set(session.id, session)

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        response: chatResponse.message,
        suggestions: chatResponse.suggestions,
        context: chatResponse.context,
        timestamp: botMessage.timestamp,
      },
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
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

    const session = chatSessions.get(sessionId)
    if (!session) {
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
      data: {
        sessionId: session.id,
        messages: session.messages,
        context: session.context,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar sessão:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
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
