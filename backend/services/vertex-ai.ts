import { VertexAI } from "@google-cloud/aiplatform"
import { GoogleAuth } from "google-auth-library"

// Configuração do cliente Vertex AI
const projectId = process.env.VERTEX_PROJECT_ID || "volaron-store"
const location = process.env.VERTEX_REGION || "us-central1"

// Inicialização do cliente com autenticação
const auth = new GoogleAuth({
  keyFilename: process.env.VERTEX_SERVICE_ACCOUNT_JSON ? undefined : "./vertex-credentials.json",
  credentials: process.env.VERTEX_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.VERTEX_SERVICE_ACCOUNT_JSON)
    : undefined,
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
})

const vertexAI = new VertexAI({
  project: projectId,
  location: location,
  googleAuthOptions: {
    authClient: auth,
  },
})

// Serviço principal de IA
export class VertexAIService {
  private model: string

  constructor(model = "gemini-1.5-flash-001") {
    this.model = model
  }

  // Geração de texto para descrições de produtos
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

  // Análise semântica de clientes
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
      
      Forneça:
      1. Perfil do cliente (1-2 frases)
      2. 3-5 recomendações de produtos
      3. 2-3 insights comportamentais
      
      Responda em formato JSON válido.
    `

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response)
    } catch {
      return {
        profile: "Cliente com padrão de compra diversificado",
        recommendations: ["Produtos relacionados às compras anteriores"],
        insights: ["Necessita análise mais detalhada"],
      }
    }
  }

  // Otimização de SEO
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
      Otimize o SEO para:
      Título: ${content.title}
      Descrição: ${content.description}
      Palavras-chave: ${content.keywords?.join(", ") || "N/A"}
      Categoria: ${content.category}
      
      Forneça:
      1. Título otimizado (máx 60 caracteres)
      2. Meta descrição (máx 160 caracteres)
      3. Lista de palavras-chave relevantes
      4. Sugestões de melhoria
      
      Responda em JSON válido, focado no mercado brasileiro.
    `

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response)
    } catch {
      return {
        optimized_title: content.title,
        meta_description: content.description.substring(0, 160),
        keywords: content.keywords || [],
        suggestions: ["Revisar conteúdo para melhor otimização"],
      }
    }
  }

  // Chatbot conversacional
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
      
      Contexto da conversa:
      ${conversationContext}
      
      Dados do usuário: ${JSON.stringify(context.user_data || {})}
      
      Mensagem atual: ${message}
      
      Responda de forma:
      - Amigável e profissional
      - Focada em ajudar com produtos e pedidos
      - Em português brasileiro
      - Máximo 200 palavras
      
      Se não souber algo específico, seja honesto e ofereça alternativas.
    `

    return await this.generateText(prompt)
  }

  // Sugestões de melhorias para UX/Performance
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
      Analise os dados de analytics e sugira melhorias:
      
      Visualizações de página: ${JSON.stringify(analyticsData.page_views)}
      Taxa de rejeição: ${analyticsData.bounce_rate}%
      Taxa de conversão: ${analyticsData.conversion_rate}%
      Feedback dos usuários: ${analyticsData.user_feedback?.join("; ") || "N/A"}
      Métricas de performance: ${JSON.stringify(analyticsData.performance_metrics || {})}
      
      Forneça sugestões específicas e acionáveis em JSON:
      - ux_suggestions: melhorias de experiência do usuário
      - performance_suggestions: otimizações técnicas
      - priority_actions: ações prioritárias (máx 3)
    `

    const response = await this.generateText(prompt)
    try {
      return JSON.parse(response)
    } catch {
      return {
        ux_suggestions: ["Melhorar navegação principal", "Otimizar processo de checkout"],
        performance_suggestions: ["Otimizar imagens", "Implementar cache"],
        priority_actions: ["Reduzir taxa de rejeição", "Melhorar velocidade de carregamento"],
      }
    }
  }

  // Método base para geração de texto
  private async generateText(prompt: string): Promise<string> {
    try {
      const request = {
        endpoint: `projects/${projectId}/locations/${location}/publishers/google/models/${this.model}`,
        instances: [
          {
            content: prompt,
          },
        ],
        parameters: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          topP: 0.8,
          topK: 40,
        },
      }

      const [response] = await vertexAI.predict(request)
      return response?.predictions?.[0]?.content || "Erro na geração de resposta"
    } catch (error) {
      console.error("Erro no Vertex AI:", error)
      throw new Error("Falha na comunicação com Vertex AI")
    }
  }
}

// Instância singleton
export const vertexAIService = new VertexAIService()
