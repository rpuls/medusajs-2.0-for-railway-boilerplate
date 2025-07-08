import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/backend/services/gemini-ai-studio"

interface ChatSession {
  id: string
  user_id?: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  context: {
    current_page?: string
    cart_items?: any[]
    user_preferences?: Record<string, any>
    session_start: string
  }
  last_activity: string
}

// Armazenamento em memória das sessões (em produção, usar Redis)
const chatSessions = new Map<string, Array<{ role: string; content: string }>>()

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, context } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Message and session ID are required" }, { status: 400 })
    }

    // Get or create chat session
    let conversation = chatSessions.get(sessionId) || []

    // Add user message to conversation
    conversation.push({ role: "user", content: message })

    // Build context-aware prompt
    const systemPrompt = `
      Você é um assistente virtual da Volaron, uma loja de utilidades domésticas brasileira.
      
      Informações da loja:
      - Especializada em produtos para casa, jardim, cozinha e organização
      - Entrega para todo o Brasil
      - Parcelamento em até 12x sem juros
      - Atendimento humanizado e personalizado
      
      Contexto adicional: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}
      
      Histórico da conversa:
      ${conversation
        .slice(-10)
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n")}
      
      Responda de forma amigável, útil e sempre relacionando com os produtos da Volaron quando apropriado.
      Mantenha as respostas concisas mas informativas.
    `

    const response = await geminiAIService.generateContent(systemPrompt)

    // Add assistant response to conversation
    conversation.push({ role: "assistant", content: response })

    // Keep only last 20 messages to manage memory
    if (conversation.length > 20) {
      conversation = conversation.slice(-20)
    }

    // Update session
    chatSessions.set(sessionId, conversation)

    return NextResponse.json({
      success: true,
      response,
      sessionId,
      messageCount: conversation.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Chatbot error:", error)
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID parameter is required" }, { status: 400 })
  }

  const conversation = chatSessions.get(sessionId) || []

  return NextResponse.json({
    success: true,
    sessionId,
    conversation,
    messageCount: conversation.length,
    timestamp: new Date().toISOString(),
  })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID parameter is required" }, { status: 400 })
  }

  chatSessions.delete(sessionId)

  return NextResponse.json({
    success: true,
    message: "Chat session cleared",
    sessionId,
    timestamp: new Date().toISOString(),
  })
}

// Limpeza automática de sessões antigas (executar periodicamente)
setInterval(
  () => {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    for (const [sessionId, conversation] of chatSessions.entries()) {
      const lastMessage = conversation[conversation.length - 1]
      const lastActivity = new Date(lastMessage.timestamp).getTime()
      if (now - lastActivity > maxAge) {
        chatSessions.delete(sessionId)
      }
    }
  },
  60 * 60 * 1000,
) // Executar a cada hora
