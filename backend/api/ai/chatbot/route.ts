import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

// Armazenamento em memória para sessões (em produção, usar Redis)
const chatSessions = new Map<string, any[]>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, context, session_id } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    // Gerar ID de sessão se não fornecido
    const sessionId = session_id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Recuperar histórico da sessão
    const sessionHistory = chatSessions.get(sessionId) || []

    // Contexto específico da Volaron
    const volaronContext = {
      store_name: "Volaron",
      location: "Birigui, SP",
      specialties: ["Moedores", "Escadas", "Jardinagem", "Utilidades Domésticas"],
      contact: {
        phone: "(18) 3643-1990",
        email: "contato@volaron.com.br",
        hours: "Segunda à Sexta, 8h às 18h",
      },
      policies: {
        shipping: "Entrega para todo Brasil",
        warranty: "Garantia de 1 ano em todos os produtos",
        return: "Troca em até 30 dias",
      },
      ...context,
    }

    // Gerar resposta do chatbot
    const response = await geminiAIService.generateChatResponse(message, {
      session_history: sessionHistory,
      user_data: volaronContext,
      conversation_type: "customer_support",
      language: "pt-BR",
    })

    // Atualizar histórico da sessão
    sessionHistory.push(
      { role: "user", content: message, timestamp: new Date().toISOString() },
      { role: "assistant", content: response, timestamp: new Date().toISOString() },
    )

    // Manter apenas últimas 20 mensagens
    if (sessionHistory.length > 20) {
      sessionHistory.splice(0, sessionHistory.length - 20)
    }

    chatSessions.set(sessionId, sessionHistory)

    // Log para monitoramento
    console.log(`[Chatbot] Resposta gerada - Sessão: ${sessionId}`)

    return NextResponse.json({
      success: true,
      response,
      session_id: sessionId,
      metadata: {
        response_time: new Date().toISOString(),
        model_used: "gemini-1.5-flash-001",
        session_length: sessionHistory.length / 2,
      },
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "Muitas mensagens. Aguarde alguns minutos e tente novamente." },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Erro interno do servidor. Tente novamente." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "ID da sessão é obrigatório" }, { status: 400 })
    }

    const sessionHistory = chatSessions.get(sessionId) || []

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      history: sessionHistory,
      message_count: sessionHistory.length,
    })
  } catch (error) {
    console.error("Erro ao buscar histórico:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "ID da sessão é obrigatório" }, { status: 400 })
    }

    chatSessions.delete(sessionId)

    return NextResponse.json({
      success: true,
      message: "Sessão removida com sucesso",
    })
  } catch (error) {
    console.error("Erro ao remover sessão:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
