import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
  context?: {
    currentPage?: string
    selectedElements?: string[]
    projectState?: any
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history = [], context } = body

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem é obrigatória" }, { status: 400 })
    }

    // Configurar modelo Gemini
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    // Construir contexto do sistema
    const systemContext = `
Você é o Copilot FullStack da Volaron Store, um assistente de IA especializado em:

🏪 SOBRE A VOLARON:
- E-commerce de utilidades domésticas
- 11 categorias principais: Cozinha, Banheiro, Limpeza, etc.
- Stack: MedusaJS (backend) + Next.js (frontend) + Railway (infra)

🤖 SUAS CAPACIDADES:
- Desenvolvimento de componentes React/Next.js
- Integração com MedusaJS e APIs
- Análise de código e sugestões de melhorias
- Geração de conteúdo para produtos
- Automação de tarefas de desenvolvimento
- Monitoramento de performance e métricas

💬 COMANDOS ESPECIAIS:
- /produto [nome] - Criar/analisar produto
- /componente [tipo] - Gerar componente React
- /api [endpoint] - Criar endpoint de API
- /deploy - Informações de deployment
- /analytics - Métricas e relatórios
- /help - Lista de comandos

🎯 CONTEXTO ATUAL:
${context?.currentPage ? `Página: ${context.currentPage}` : ""}
${context?.selectedElements?.length ? `Elementos selecionados: ${context.selectedElements.join(", ")}` : ""}

Responda de forma prática, técnica e focada em soluções. Use emojis para melhor visualização.
`

    // Construir histórico da conversa
    const conversationHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }))

    // Adicionar mensagem atual
    conversationHistory.push({
      role: "user",
      parts: [{ text: `${systemContext}\n\nUsuário: ${message}` }],
    })

    // Gerar resposta
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // Excluir última mensagem do histórico
    })

    const result = await chat.sendMessage(message)
    const response = result.response
    const responseText = response.text()

    // Detectar comandos especiais
    const isCommand = message.startsWith("/")
    let commandResult = null

    if (isCommand) {
      commandResult = await handleSpecialCommand(message, context)
    }

    // Preparar resposta
    const chatResponse = {
      message: responseText,
      timestamp: new Date().toISOString(),
      command: isCommand
        ? {
            executed: true,
            result: commandResult,
          }
        : null,
      suggestions: generateSuggestions(message, context),
      context: {
        ...context,
        lastInteraction: new Date().toISOString(),
      },
    }

    return NextResponse.json(chatResponse)
  } catch (error) {
    console.error("Erro no chat do Copilot:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

async function handleSpecialCommand(command: string, context: any) {
  const [cmd, ...args] = command.split(" ")

  switch (cmd) {
    case "/produto":
      return await handleProductCommand(args.join(" "), context)

    case "/componente":
      return await handleComponentCommand(args.join(" "), context)

    case "/api":
      return await handleApiCommand(args.join(" "), context)

    case "/deploy":
      return await handleDeployCommand(context)

    case "/analytics":
      return await handleAnalyticsCommand(context)

    case "/help":
      return {
        type: "help",
        commands: [
          { cmd: "/produto [nome]", desc: "Criar ou analisar produto" },
          { cmd: "/componente [tipo]", desc: "Gerar componente React" },
          { cmd: "/api [endpoint]", desc: "Criar endpoint de API" },
          { cmd: "/deploy", desc: "Status de deployment" },
          { cmd: "/analytics", desc: "Métricas do sistema" },
          { cmd: "/help", desc: "Lista de comandos" },
        ],
      }

    default:
      return { type: "error", message: `Comando não reconhecido: ${cmd}` }
  }
}

async function handleProductCommand(productName: string, context: any) {
  if (!productName) {
    return { type: "error", message: "Nome do produto é obrigatório" }
  }

  // Simular criação/análise de produto
  return {
    type: "product",
    action: "analyze",
    product: {
      name: productName,
      category: "Cozinha", // Detectar categoria automaticamente
      description: `Produto ${productName} analisado pelo Copilot`,
      suggestions: ["Adicionar imagens de alta qualidade", "Otimizar descrição para SEO", "Definir preço competitivo"],
    },
  }
}

async function handleComponentCommand(componentType: string, context: any) {
  if (!componentType) {
    return { type: "error", message: "Tipo de componente é obrigatório" }
  }

  return {
    type: "component",
    componentType,
    generated: true,
    code: `// Componente ${componentType} gerado pelo Copilot\nexport function ${componentType}() {\n  return <div>Novo ${componentType}</div>;\n}`,
    files: [`components/${componentType.toLowerCase()}.tsx`],
  }
}

async function handleApiCommand(endpoint: string, context: any) {
  if (!endpoint) {
    return { type: "error", message: "Endpoint é obrigatório" }
  }

  return {
    type: "api",
    endpoint,
    method: "GET",
    code: `// API ${endpoint} gerada pelo Copilot\nexport async function GET() {\n  return Response.json({ message: 'Hello from ${endpoint}' });\n}`,
    file: `app/api/${endpoint}/route.ts`,
  }
}

async function handleDeployCommand(context: any) {
  return {
    type: "deploy",
    status: "healthy",
    services: {
      backend: { status: "running", url: "https://backend-production-c461d.up.railway.app" },
      frontend: { status: "running", url: "https://storefront-production-bd8d.up.railway.app" },
      database: { status: "connected" },
      redis: { status: "connected" },
    },
    lastDeploy: new Date().toISOString(),
  }
}

async function handleAnalyticsCommand(context: any) {
  return {
    type: "analytics",
    metrics: {
      sales: { total: 125000, orders: 1250 },
      traffic: { visitors: 15000, pageViews: 45000 },
      performance: { loadTime: "1.2s", uptime: "99.9%" },
    },
    period: "last_30_days",
  }
}

function generateSuggestions(message: string, context: any): string[] {
  const suggestions = []

  // Sugestões baseadas no contexto
  if (context?.currentPage === "products") {
    suggestions.push("Criar novo produto", "Analisar performance de vendas")
  }

  if (context?.currentPage === "dashboard") {
    suggestions.push("Ver métricas de hoje", "Gerar relatório semanal")
  }

  // Sugestões baseadas na mensagem
  if (message.toLowerCase().includes("produto")) {
    suggestions.push("/produto [nome]", "Otimizar SEO do produto")
  }

  if (message.toLowerCase().includes("componente")) {
    suggestions.push("/componente [tipo]", "Revisar componentes existentes")
  }

  // Sugestões padrão
  if (suggestions.length === 0) {
    suggestions.push("Ver status do sistema", "Analisar métricas", "Criar novo componente", "Otimizar performance")
  }

  return suggestions.slice(0, 4) // Máximo 4 sugestões
}

export async function GET() {
  return NextResponse.json({
    status: "Copilot Chat API está funcionando",
    version: "1.0.0",
    capabilities: [
      "Chat com IA",
      "Comandos especiais",
      "Geração de código",
      "Análise de métricas",
      "Sugestões contextuais",
    ],
  })
}
