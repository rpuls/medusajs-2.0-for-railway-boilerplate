import { GoogleGenerativeAI } from "@google/generative-ai"

interface VertexAIConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

interface AnalysisResult {
  summary: string
  insights: string[]
  recommendations: string[]
  confidence: number
}

interface ChatResponse {
  message: string
  context: string
  suggestions: string[]
}

export class VertexAIService {
  private genAI: GoogleGenerativeAI
  private model: any
  private config: VertexAIConfig

  constructor(config: VertexAIConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    }

    this.genAI = new GoogleGenerativeAI(this.config.apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model,
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens,
      },
    })
  }

  async analyzeCustomerBehavior(customerData: any): Promise<AnalysisResult> {
    try {
      const prompt = `
        Analise os dados do cliente e forneça insights sobre comportamento de compra:
        
        Dados do Cliente:
        ${JSON.stringify(customerData, null, 2)}
        
        Por favor, forneça:
        1. Resumo do perfil do cliente
        2. Insights sobre padrões de compra
        3. Recomendações para melhorar engajamento
        4. Nível de confiança da análise (0-100)
        
        Responda em formato JSON com as chaves: summary, insights, recommendations, confidence
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Tentar parsear JSON, se falhar, criar estrutura padrão
      try {
        return JSON.parse(text)
      } catch {
        return {
          summary: text.substring(0, 200),
          insights: [text],
          recommendations: ["Análise detalhada disponível no resumo"],
          confidence: 75,
        }
      }
    } catch (error) {
      console.error("Erro na análise do cliente:", error)
      throw new Error("Falha ao analisar dados do cliente")
    }
  }

  async generateProductDescription(productData: any): Promise<string> {
    try {
      const prompt = `
        Crie uma descrição atrativa para este produto da loja Volaron:
        
        Produto: ${productData.name || "Produto"}
        Categoria: ${productData.category || "Geral"}
        Características: ${JSON.stringify(productData.features || [])}
        Preço: ${productData.price || "Consulte"}
        
        A descrição deve ser:
        - Atrativa e persuasiva
        - Focada nos benefícios
        - Otimizada para SEO
        - Entre 100-200 palavras
        - Adequada para e-commerce
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Erro ao gerar descrição:", error)
      throw new Error("Falha ao gerar descrição do produto")
    }
  }

  async chatWithCustomer(message: string, context?: string): Promise<ChatResponse> {
    try {
      const prompt = `
        Você é um assistente da loja Volaron, especializada em utilidades domésticas.
        
        Contexto anterior: ${context || "Primeira interação"}
        Mensagem do cliente: ${message}
        
        Responda de forma:
        - Amigável e profissional
        - Focada em ajudar o cliente
        - Com sugestões de produtos quando apropriado
        - Máximo 150 palavras
        
        Forneça também 2-3 sugestões de perguntas que o cliente pode fazer.
        
        Responda em formato JSON com: message, context, suggestions
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      try {
        return JSON.parse(text)
      } catch {
        return {
          message: text,
          context: `Cliente perguntou: ${message}`,
          suggestions: ["Como posso ver mais produtos?", "Qual o prazo de entrega?", "Vocês têm desconto?"],
        }
      }
    } catch (error) {
      console.error("Erro no chat:", error)
      throw new Error("Falha na comunicação com o cliente")
    }
  }

  async optimizeSEO(content: string, keywords: string[]): Promise<string> {
    try {
      const prompt = `
        Otimize este conteúdo para SEO:
        
        Conteúdo original: ${content}
        Palavras-chave: ${keywords.join(", ")}
        
        Melhore o conteúdo para:
        - Incluir palavras-chave naturalmente
        - Melhorar legibilidade
        - Aumentar relevância para buscadores
        - Manter tom natural e atrativo
        
        Retorne apenas o conteúdo otimizado.
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Erro na otimização SEO:", error)
      throw new Error("Falha ao otimizar conteúdo para SEO")
    }
  }

  async generateMarketingContent(productData: any, type: "email" | "social" | "ad"): Promise<string> {
    try {
      const prompts = {
        email: "Crie um email marketing atrativo",
        social: "Crie um post para redes sociais",
        ad: "Crie um anúncio publicitário",
      }

      const prompt = `
        ${prompts[type]} para este produto da Volaron:
        
        Produto: ${JSON.stringify(productData, null, 2)}
        
        O conteúdo deve ser:
        - Persuasivo e envolvente
        - Adequado para o canal ${type}
        - Com call-to-action claro
        - Focado nos benefícios
        - Máximo 200 palavras
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Erro ao gerar conteúdo de marketing:", error)
      throw new Error("Falha ao gerar conteúdo de marketing")
    }
  }

  async healthCheck(): Promise<{ status: string; model: string; timestamp: string }> {
    try {
      const testPrompt = "Responda apenas 'OK' se você está funcionando corretamente."
      const result = await this.model.generateContent(testPrompt)
      const response = await result.response
      const text = response.text()

      return {
        status: text.includes("OK") ? "healthy" : "degraded",
        model: this.config.model,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: "unhealthy",
        model: this.config.model,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

// Instância singleton
let vertexAIInstance: VertexAIService | null = null

export function getVertexAIService(): VertexAIService {
  if (!vertexAIInstance) {
    const config: VertexAIConfig = {
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "",
      model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
      temperature: 0.7,
      maxTokens: 1000,
    }

    if (!config.apiKey) {
      throw new Error("GEMINI_API_KEY ou GOOGLE_AI_API_KEY não configurada")
    }

    vertexAIInstance = new VertexAIService(config)
  }

  return vertexAIInstance
}
