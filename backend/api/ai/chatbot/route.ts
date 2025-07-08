import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

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
const chatSessions = new Map<string, ChatSession>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, userId, context = {} } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    // Obter ou criar sessão
    const session = chatSessions.get(sessionId) || createNewSession(sessionId, userId, context)

    // Atualizar contexto da sessão
    session.context = { ...session.context, ...context }
    session.last_activity = new Date().toISOString()

    // Adicionar mensagem do usuário ao histórico
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    })

    // Preparar contexto para o chatbot
    const chatContext = {
      user_id: userId,
      conversation_history: session.messages.slice(-10), // Últimas 10 mensagens
      user_data: {
        current_page: session.context.current_page,
        cart_items: session.context.cart_items || [],
        preferences: session.context.user_preferences || {},
        session_duration: calculateSessionDuration(session.context.session_start),
      },
    }

    // Gerar resposta usando Gemini AI
    const response = await geminiAIService.generateChatResponse(message, chatContext)

    // Adicionar resposta do assistente ao histórico
    session.messages.push({
      role: "assistant",
      content: response,
      timestamp: new Date().toISOString(),
    })

    // Salvar sessão atualizada
    chatSessions.set(sessionId, session)

    // Detectar intenções especiais
    const intent = detectIntent(message)
    const suggestions = generateSuggestions(intent, session.context)

    return NextResponse.json({
      success: true,
      response,
      session_id: sessionId,
      intent,
      suggestions,
      metadata: {
        message_count: session.messages.length,
        session_duration: calculateSessionDuration(session.context.session_start),
        ai_model: "gemini-1.5-flash",
      },
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Desculpe, ocorreu um erro. Tente novamente.",
      },
      { status: 500 },
    )
  }
}

function createNewSession(sessionId: string, userId?: string, context: any = {}): ChatSession {
  const session: ChatSession = {
    id: sessionId,
    user_id: userId,
    messages: [],
    context: {
      ...context,
      session_start: new Date().toISOString(),
    },
    last_activity: new Date().toISOString(),
  }

  // Mensagem de boas-vindas
  session.messages.push({
    role: "assistant",
    content: "Olá! Sou o assistente virtual da Volaron. Como posso ajudá-lo hoje? 😊",
    timestamp: new Date().toISOString(),
  })

  return session
}

function calculateSessionDuration(sessionStart: string): number {
  return Math.floor((Date.now() - new Date(sessionStart).getTime()) / 1000)
}

function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("preço") || lowerMessage.includes("valor") || lowerMessage.includes("custa")) {
    return "price_inquiry"
  }

  if (lowerMessage.includes("entrega") || lowerMessage.includes("frete") || lowerMessage.includes("envio")) {
    return "shipping_inquiry"
  }

  if (lowerMessage.includes("produto") || lowerMessage.includes("item")) {
    return "product_inquiry"
  }

  if (lowerMessage.includes("pedido") || lowerMessage.includes("compra") || lowerMessage.includes("order")) {
    return "order_inquiry"
  }

  if (lowerMessage.includes("problema") || lowerMessage.includes("erro") || lowerMessage.includes("ajuda")) {
    return "support_request"
  }

  return "general_inquiry"
}

function generateSuggestions(intent: string, context: any): string[] {
  const suggestions = []

  switch (intent) {
    case "price_inquiry":
      suggestions.push("Ver produtos em promoção", "Calcular frete", "Formas de pagamento")
      break
    case "shipping_inquiry":
      suggestions.push("Calcular frete para meu CEP", "Prazos de entrega", "Política de devolução")
      break
    case "product_inquiry":
      suggestions.push("Ver categorias", "Produtos mais vendidos", "Lançamentos")
      break
    case "order_inquiry":
      suggestions.push("Rastrear pedido", "Histórico de compras", "Cancelar pedido")
      break
    case "support_request":
      suggestions.push("Falar com atendente", "FAQ", "Política de troca")
      break
    default:
      suggestions.push("Ver produtos", "Ofertas do dia", "Falar com atendente", "Sobre a Volaron")
  }

  return suggestions
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId")

  if (sessionId) {
    const session = chatSessions.get(sessionId)
    if (session) {
      return NextResponse.json({
        session_id: sessionId,
        message_count: session.messages.length,
        last_activity: session.last_activity,
        session_duration: calculateSessionDuration(session.context.session_start),
      })
    } else {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }
  }

  return NextResponse.json({
    endpoint: "Chatbot API",
    description: "Sistema de chat inteligente para a Volaron Store",
    active_sessions: chatSessions.size,
    methods: ["POST", "GET"],
    features: ["Detecção de intenções", "Sugestões contextuais", "Histórico de conversas"],
  })
}

// Limpeza automática de sessões antigas (executar periodicamente)
setInterval(
  () => {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    for (const [sessionId, session] of chatSessions.entries()) {
      const lastActivity = new Date(session.last_activity).getTime()
      if (now - lastActivity > maxAge) {
        chatSessions.delete(sessionId)
      }
    }
  },
  60 * 60 * 1000,
) // Executar a cada hora
