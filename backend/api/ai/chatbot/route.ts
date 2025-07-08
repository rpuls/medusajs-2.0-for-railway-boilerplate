import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

interface ChatSession {
  sessionId: string
  userId?: string
  messages: Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
  context: {
    customerProfile?: any
    currentProducts?: any[]
    cartItems?: any[]
    orderHistory?: any[]
  }
}

// Armazenamento temporário de sessões (em produção, usar Redis ou banco)
const chatSessions = new Map<string, ChatSession>()

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId, context } = await request.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Message and session ID are required" }, { status: 400 })
    }

    // Recuperar ou criar sessão
    let session = chatSessions.get(sessionId)
    if (!session) {
      session = {
        sessionId,
        userId,
        messages: [],
        context: context || {},
      }
    }

    // Adicionar mensagem do usuário
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    })

    // Preparar contexto para o Gemini AI
    const conversationContext = {
      businessType: "loja-utilidades-domesticas",
      storeName: "Volaron",
      categories: [
        "moedores",
        "escadas",
        "jardinagem",
        "raladores",
        "trituradores",
        "serras-de-fita",
        "cilindros-de-massa",
        "lavanderia",
        "utilidades-domesticas",
        "cozinha-buffet",
      ],
      customerContext: session.context,
      conversationHistory: session.messages.slice(-10), // Últimas 10 mensagens
    }

    // Gerar resposta usando Gemini AI
    const aiResponse = await geminiAIService.generateChatResponse({
      userMessage: message,
      context: conversationContext,
      sessionId: sessionId,
      responseStyle: "helpful-friendly-professional",
    })

    // Adicionar resposta do assistente
    session.messages.push({
      role: "assistant",
      content: aiResponse.content,
      timestamp: new Date().toISOString(),
    })

    // Salvar sessão atualizada
    chatSessions.set(sessionId, session)

    // Gerar sugestões de produtos se relevante
    let productSuggestions = null
    if (aiResponse.shouldSuggestProducts) {
      productSuggestions = await geminiAIService.suggestProducts({
        userQuery: message,
        categories: conversationContext.categories,
        maxSuggestions: 5,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse.content,
        sessionId: sessionId,
        suggestions: aiResponse.suggestions || [],
        productSuggestions: productSuggestions,
        metadata: {
          confidence: aiResponse.confidence || 0.9,
          responseTime: aiResponse.responseTime,
          tokensUsed: aiResponse.tokensUsed,
        },
      },
    })
  } catch (error) {
    console.error("Error in chatbot:", error)
    return NextResponse.json(
      {
        error: "Failed to generate chat response",
        details: error instanceof Error ? error.message : "Unknown error",
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
      return NextResponse.json({ error: "Session ID parameter is required" }, { status: 400 })
    }

    const session = chatSessions.get(sessionId)

    return NextResponse.json({
      success: true,
      data: session || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching chat session:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch chat session",
        details: error instanceof Error ? error.message : "Unknown error",
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
      return NextResponse.json({ error: "Session ID parameter is required" }, { status: 400 })
    }

    chatSessions.delete(sessionId)

    return NextResponse.json({
      success: true,
      message: "Chat session deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting chat session:", error)
    return NextResponse.json(
      {
        error: "Failed to delete chat session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
