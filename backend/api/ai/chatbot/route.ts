import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { v4 as uuidv4 } from "uuid"

interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  context: string
  createdAt: string
  lastActivity: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  metadata?: any
}

interface ChatResponse {
  sessionId: string
  response: string
  suggestions: string[]
  context: string
  timestamp: string
}

// Armazenamento em memória das sessões (em produção, usar Redis ou banco)
const chatSessions = new Map<string, ChatSession>()

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, context } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ success: false, error: "Mensagem é obrigatória" }, { status: 400 })
    }

    // Verificar configuração da IA
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "IA não configurada" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
    })

    // Obter ou criar sessão
    const session = getOrCreateSession(sessionId, context)

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }
    session.messages.push(userMessage)

    // Construir prompt com contexto da conversa
    const prompt = buildChatPrompt(session, message)

    // Gerar resposta
    const result = await model.generateContent(prompt)
    const response = await result.response
    const aiResponse = response.text()

    // Processar resposta
    const processedResponse = processAIResponse(aiResponse)

    // Adicionar resposta do assistente
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: processedResponse.response,
      timestamp: new Date().toISOString(),
      metadata: {
        suggestions: processedResponse.suggestions,
      },
    }
    session.messages.push(assistantMessage)

    // Atualizar sessão
    session.lastActivity = new Date().toISOString()
    chatSessions.set(session.sessionId, session)

    // Limpar sessões antigas (manter apenas últimas 100 mensagens)
    if (session.messages.length > 100) {
      session.messages = session.messages.slice(-100)
    }

    const chatResponse: ChatResponse = {
      sessionId: session.sessionId,
      response: processedResponse.response,
      suggestions: processedResponse.suggestions,
      context: session.context,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: chatResponse,
    })
  } catch (error) {
    console.error("Erro no chatbot:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do chatbot",
        details: error instanceof Error ? error.message : "Erro desconhecido",
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
      return NextResponse.json({ success: false, error: "ID da sessão é obrigatório" }, { status: 400 })
    }

    const session = chatSessions.get(sessionId)
    if (!session) {
      return NextResponse.json({ success: false, error: "Sessão não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        messages: session.messages,
        context: session.context,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar sessão:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar sessão" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "ID da sessão é obrigatório" }, { status: 400 })
    }

    const deleted = chatSessions.delete(sessionId)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Sessão não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Sessão deletada com sucesso",
    })
  } catch (error) {
    console.error("Erro ao deletar sessão:", error)
    return NextResponse.json({ success: false, error: "Erro ao deletar sessão" }, { status: 500 })
  }
}

function getOrCreateSession(sessionId?: string, context?: string): ChatSession {
  if (sessionId && chatSessions.has(sessionId)) {
    return chatSessions.get(sessionId)!
  }

  const newSessionId = sessionId || uuidv4()
  const newSession: ChatSession = {
    sessionId: newSessionId,
    messages: [],
    context: context || "Volaron Store - Assistente de Atendimento",
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
  }

  // Adicionar mensagem de sistema inicial
  const systemMessage: ChatMessage = {
    id: uuidv4(),
    role: "system",
    content: "Olá! Sou o assistente virtual da Volaron Store. Como posso ajudá-lo hoje?",
    timestamp: new Date().toISOString(),
  }
  newSession.messages.push(systemMessage)

  chatSessions.set(newSessionId, newSession)
  return newSession
}

function buildChatPrompt(session: ChatSession, currentMessage: string): string {
  const recentMessages = session.messages.slice(-10) // Últimas 10 mensagens

  const conversationHistory = recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")

  const prompt = `
Você é um assistente virtual especializado da Volaron Store, uma loja de utilidades domésticas brasileira.

CONTEXTO DA LOJA:
- Especializada em produtos para casa e jardim
- Categorias: Jardinagem, Cozinha, Limpeza, Organização, Ferramentas, etc.
- Atendimento em português brasileiro
- Foco em qualidade e bom atendimento

INSTRUÇÕES:
1. Seja prestativo, educado e profissional
2. Use linguagem natural e amigável
3. Forneça informações precisas sobre produtos
4. Sugira produtos relacionados quando apropriado
5. Ajude com dúvidas sobre pedidos, entrega e políticas
6. Se não souber algo, seja honesto e ofereça alternativas

HISTÓRICO DA CONVERSA:
${conversationHistory}

MENSAGEM ATUAL DO USUÁRIO:
${currentMessage}

FORMATO DE RESPOSTA:
Responda de forma natural e útil. Se apropriado, inclua sugestões de produtos ou ações.

RESPOSTA:
`

  return prompt.trim()
}

function processAIResponse(aiResponse: string) {
  // Extrair sugestões se houver
  const suggestions: string[] = []

  // Procurar por padrões de sugestões na resposta
  const suggestionPatterns = [
    /Posso sugerir:?\s*(.+)/i,
    /Recomendo:?\s*(.+)/i,
    /Você pode:?\s*(.+)/i,
    /Que tal:?\s*(.+)/i,
  ]

  for (const pattern of suggestionPatterns) {
    const match = aiResponse.match(pattern)
    if (match) {
      suggestions.push(match[1].trim())
    }
  }

  // Sugestões padrão se não houver específicas
  if (suggestions.length === 0) {
    suggestions.push("Ver produtos em promoção", "Falar com atendente humano", "Consultar status do pedido")
  }

  return {
    response: aiResponse.trim(),
    suggestions: suggestions.slice(0, 3), // Máximo 3 sugestões
  }
}

// Limpeza automática de sessões antigas (executar periodicamente)
setInterval(
  () => {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 horas

    for (const [sessionId, session] of chatSessions.entries()) {
      const lastActivity = new Date(session.lastActivity).getTime()
      if (now - lastActivity > maxAge) {
        chatSessions.delete(sessionId)
      }
    }
  },
  60 * 60 * 1000,
) // Executar a cada hora
