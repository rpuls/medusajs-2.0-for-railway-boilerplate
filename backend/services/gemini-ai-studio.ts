import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"

// Configuração do cliente Gemini AI Studio
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc"
const genAI = new GoogleGenerativeAI(API_KEY)

// Configurações de segurança
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

// Configurações de geração
const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
}

// Serviço principal de IA refatorado
export class GeminiAIService {
  private model: string
  private generativeModel: any

  constructor(model = "gemini-1.5-flash") {
    this.model = model
    this.generativeModel = genAI.getGenerativeModel({
      model: this.model,
      generationConfig,
      safetySettings,
    })
  }

  // Geração de texto para descrições de produtos (mantém interface original)
  async generateProductDescription(productData: {
    name: string
    category: string
    features?: string[]
    specifications?: Record<string, any>
  }): Promise<string> {
    const prompt = `
      Crie uma descrição atrativa e otimizada para SEO para o produto:
      Nome: ${productData.name}
      Categoria: ${productData.category}
      Características: ${productData.features?.join(", ") || "N/A"}
      Especificações: ${JSON.stringify(productData.specifications || {})}
      
      A descrição deve ser:
      - Persuasiva e comercial
      - Otimizada para SEO
      - Entre 150-300 palavras
      - Em português brasileiro
      - Destacar benefícios e diferenciais
    `

    return await this.generateText(prompt)
  }

  // Análise semântica de clientes (mantém interface original)
  async analyzeCustomerBehavior(customerData: {
    purchases: any[]
    browsing_history?: any[]
    demographics?: Record<string, any>
  }): Promise<{
    profile: string
    recommendations: string[]
    insights: string[]
  }> {
    const prompt = `
      Analise o comportamento do cliente baseado nos dados:
      Compras: ${JSON.stringify(customerData.purchases)}
      Histórico de navegação: ${JSON.stringify(customerData.browsing_history || [])}
      Demografia: ${JSON.stringify(customerData.demographics || {})}
      
      Forneça uma análise em formato JSON com:
      {
        "profile": "Descrição do perfil do cliente em 1-2 frases",
        "recommendations": ["3-5 recomendações específicas de produtos"],
        "insights": ["2-3 insights comportamentais importantes"]
      }
      
      Responda APENAS com o JSON válido, sem texto adicional.
    `

    const response = await this.generateText(prompt)
    try {
      // Limpa a resposta para garantir JSON válido
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      console.warn("Erro ao parsear resposta JSON:", error)
      return {
        profile: "Cliente com padrão de compra diversificado",
        recommendations: ["Produtos relacionados às compras anteriores"],
        insights: ["Necessita análise mais detalhada"],
      }
    }
  }

  // Otimização de SEO (mantém interface original)
  async optimizeSEO(content: {
    title: string
    description: string
    keywords?: string[]
    category: string
  }): Promise<{
    optimized_title: string
    meta_description: string
    keywords: string[]
    suggestions: string[]
  }> {
    const prompt = `
      Otimize o SEO para o e-commerce brasileiro:
      Título atual: ${content.title}
      Descrição atual: ${content.description}
      Palavras-chave atuais: ${content.keywords?.join(", ") || "N/A"}
      Categoria: ${content.category}
      
      Forneça otimizações em formato JSON:
      {
        "optimized_title": "Título otimizado (máx 60 caracteres)",
        "meta_description": "Meta descrição otimizada (máx 160 caracteres)",
        "keywords": ["lista", "de", "palavras-chave", "relevantes"],
        "suggestions": ["sugestões", "específicas", "de", "melhoria"]
      }
      
      Foque no mercado brasileiro e responda APENAS com JSON válido.
    `

    const response = await this.generateText(prompt)
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      console.warn("Erro ao parsear resposta JSON:", error)
      return {
        optimized_title: content.title.substring(0, 60),
        meta_description: content.description.substring(0, 160),
        keywords: content.keywords || [],
        suggestions: ["Revisar conteúdo para melhor otimização"],
      }
    }
  }

  // Chatbot conversacional (mantém interface original)
  async generateChatResponse(
    message: string,
    context: {
      user_id?: string
      conversation_history?: Array<{ role: string; content: string }>
      user_data?: Record<string, any>
    },
  ): Promise<string> {
    const conversationContext =
      context.conversation_history?.map((msg) => `${msg.role}: ${msg.content}`).join("\n") || ""

    const prompt = `
      Você é um assistente virtual da loja Volaron, especializada em produtos de qualidade.
      
      Contexto da conversa anterior:
      ${conversationContext}
      
      Dados do usuário: ${JSON.stringify(context.user_data || {})}
      
      Mensagem atual do usuário: ${message}
      
      Responda de forma:
      - Amigável e profissional
      - Focada em ajudar com produtos e pedidos
      - Em português brasileiro
      - Máximo 200 palavras
      - Prática e útil
      
      Se não souber algo específico sobre produtos ou pedidos, seja honesto e ofereça alternativas para ajudar.
    `

    return await this.generateText(prompt)
  }

  // Sugestões de melhorias para UX/Performance (mantém interface original)
  async suggestImprovements(analyticsData: {
    page_views: Record<string, number>
    bounce_rate: number
    conversion_rate: number
    user_feedback?: string[]
    performance_metrics?: Record<string, number>
  }): Promise<{
    ux_suggestions: string[]
    performance_suggestions: string[]
    priority_actions: string[]
  }> {
    const prompt = `
      Analise os dados de analytics do e-commerce e sugira melhorias específicas:
      
      Visualizações de página: ${JSON.stringify(analyticsData.page_views)}
      Taxa de rejeição: ${analyticsData.bounce_rate}%
      Taxa de conversão: ${analyticsData.conversion_rate}%
      Feedback dos usuários: ${analyticsData.user_feedback?.join("; ") || "Não disponível"}
      Métricas de performance: ${JSON.stringify(analyticsData.performance_metrics || {})}
      
      Forneça sugestões em formato JSON:
      {
        "ux_suggestions": ["sugestões específicas de UX", "focadas em conversão"],
        "performance_suggestions": ["otimizações técnicas", "melhorias de velocidade"],
        "priority_actions": ["máximo 3 ações prioritárias", "com maior impacto"]
      }
      
      Responda APENAS com JSON válido, sem texto adicional.
    `

    const response = await this.generateText(prompt)
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, "").trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      console.warn("Erro ao parsear resposta JSON:", error)
      return {
        ux_suggestions: ["Melhorar navegação principal", "Otimizar processo de checkout"],
        performance_suggestions: ["Otimizar imagens", "Implementar cache"],
        priority_actions: ["Reduzir taxa de rejeição", "Melhorar velocidade de carregamento"],
      }
    }
  }

  // Novo método: Geração de conteúdo para marketing
  async generateMarketingContent(
    contentType: "email" | "social" | "blog",
    data: {
      product?: any
      campaign?: string
      target_audience?: string
      tone?: "formal" | "casual" | "promotional"
    },
  ): Promise<string> {
    const toneMap = {
      formal: "profissional e respeitoso",
      casual: "descontraído e amigável",
      promotional: "persuasivo e comercial",
    }

    const prompt = `
      Crie conteúdo de marketing para ${contentType} com as seguintes especificações:
      
      Produto: ${JSON.stringify(data.product || {})}
      Campanha: ${data.campaign || "Geral"}
      Público-alvo: ${data.target_audience || "Geral"}
      Tom: ${toneMap[data.tone || "casual"]}
      
      O conteúdo deve ser:
      - Adequado para ${contentType}
      - Em português brasileiro
      - Engajante e relevante
      - Focado em conversão
      ${contentType === "email" ? "- Com subject line atrativo" : ""}
      ${contentType === "social" ? "- Com hashtags relevantes" : ""}
      ${contentType === "blog" ? "- Com estrutura de artigo completo" : ""}
    `

    return await this.generateText(prompt)
  }

  // Método base para geração de texto (refatorado para Gemini AI Studio)
  private async generateText(prompt: string): Promise<string> {
    try {
      // Rate limiting simples
      await this.rateLimitDelay()

      const result = await this.generativeModel.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      if (!text) {
        throw new Error("Resposta vazia da API")
      }

      return text.trim()
    } catch (error) {
      console.error("Erro no Gemini AI Studio:", error)

      // Tratamento específico de erros
      if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
        throw new Error("Limite de requisições excedido. Tente novamente em alguns minutos.")
      }

      if (error.message?.includes("SAFETY")) {
        throw new Error("Conteúdo bloqueado por políticas de segurança.")
      }

      throw new Error("Falha na comunicação com Gemini AI Studio")
    }
  }

  // Rate limiting para evitar exceder limites da API
  private async rateLimitDelay(): Promise<void> {
    // Gemini AI Studio tem limite de 15 RPM no free tier
    // Implementa delay de 4 segundos entre requisições para segurança
    const delay = 4000
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Método para verificar saúde da API
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy"
    model: string
    timestamp: string
  }> {
    try {
      const testPrompt = "Responda apenas 'OK' se você está funcionando corretamente."
      const response = await this.generateText(testPrompt)

      return {
        status: response.toLowerCase().includes("ok") ? "healthy" : "degraded",
        model: this.model,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: "unhealthy",
        model: this.model,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

// Instância singleton (mantém compatibilidade)
export const geminiAIService = new GeminiAIService()

// Alias para manter compatibilidade com código existente
export const vertexAIService = geminiAIService
