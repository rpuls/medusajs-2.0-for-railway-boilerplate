import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

interface ChatMessage {
  id: string
  message: string
  sender: "user" | "bot"
  timestamp: string
  context?: string
}

interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  context: string
  startTime: string
  lastActivity: string
}

// Armazenamento temporário de sessões (em produção, usar Redis ou banco)
const chatSessions = new Map<string, ChatSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, context } = body

    if (!message) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    const currentSessionId = sessionId || generateSessionId()

    // Recuperar ou criar sessão
    let session = chatSessions.get(currentSessionId)
    if (!session) {
      session = {
        sessionId: currentSessionId,
        messages: [],
        context: context || "Nova conversa iniciada",
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      }
    }

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      message,
      sender: "user",
      timestamp: new Date().toISOString(),
      context: session.context,
    }

    session.messages.push(userMessage)

    // Gerar resposta do bot
    const vertexAI = getVertexAIService()
    const chatResponse = await vertexAI.chatWithCustomer(message, session.context)

    // Adicionar resposta do bot
    const botMessage: ChatMessage = {
      id: generateMessageId(),
      message: chatResponse.message,
      sender: "bot",
      timestamp: new Date().toISOString(),
      context: chatResponse.context,
    }

    session.messages.push(botMessage)
    session.context = chatResponse.context
    session.lastActivity = new Date().toISOString()

    // Salvar sessão
    chatSessions.set(currentSessionId, session)

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      response: chatResponse.message,
      suggestions: chatResponse.suggestions,
      context: chatResponse.context,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
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
      return NextResponse.json({ error: "ID da sessão é obrigatório" }, { status: 400 })
    }

    const session = chatSessions.get(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session,
      messageCount: session.messages.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao buscar sessão do chat:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
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
      return NextResponse.json({ error: "ID da sessão é obrigatório" }, { status: 400 })
    }

    const deleted = chatSessions.delete(sessionId)

    if (!deleted) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Sessão removida com sucesso",
      sessionId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao remover sessão:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
