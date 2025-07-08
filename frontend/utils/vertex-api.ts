interface AnalysisResult {
  summary: string
  insights: string[]
  recommendations: string[]
  confidence: number
}

interface ChatResponse {
  success: boolean
  sessionId: string
  response: string
  suggestions: string[]
  context: string
  timestamp: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class VertexAPIClient {
  private baseUrl: string
  private headers: HeadersInit

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    this.headers = {
      "Content-Type": "application/json",
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error("API Request Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro de rede",
      }
    }
  }

  async analyzeCustomer(customerData: any): Promise<ApiResponse<AnalysisResult>> {
    return this.makeRequest<AnalysisResult>("/api/ai/analyze-customer", {
      method: "POST",
      body: JSON.stringify({ customerData }),
    })
  }

  async getCustomerAnalysis(customerId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/ai/analyze-customer?customerId=${customerId}`)
  }

  async sendChatMessage(message: string, sessionId?: string, context?: string): Promise<ApiResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>("/api/ai/chatbot", {
      method: "POST",
      body: JSON.stringify({ message, sessionId, context }),
    })
  }

  async getChatSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/ai/chatbot?sessionId=${sessionId}`)
  }

  async deleteChatSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/api/ai/chatbot?sessionId=${sessionId}`, {
      method: "DELETE",
    })
  }

  async generateProductDescription(productData: any): Promise<ApiResponse<string>> {
    return this.makeRequest<string>("/api/ai/generate-description", {
      method: "POST",
      body: JSON.stringify({ productData }),
    })
  }

  async generateMarketingContent(productData: any, type: "email" | "social" | "ad"): Promise<ApiResponse<string>> {
    return this.makeRequest<string>("/api/ai/marketing-content", {
      method: "POST",
      body: JSON.stringify({ productData, type }),
    })
  }

  async checkAIHealth(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>("/api/ai/health")
  }
}

// Instância singleton
let apiClient: VertexAPIClient | null = null

export function getVertexAPIClient(): VertexAPIClient {
  if (!apiClient) {
    apiClient = new VertexAPIClient()
  }
  return apiClient
}

// Hooks para React
export function useVertexAPI() {
  const client = getVertexAPIClient()

  return {
    analyzeCustomer: client.analyzeCustomer.bind(client),
    getCustomerAnalysis: client.getCustomerAnalysis.bind(client),
    sendChatMessage: client.sendChatMessage.bind(client),
    getChatSession: client.getChatSession.bind(client),
    deleteChatSession: client.deleteChatSession.bind(client),
    generateProductDescription: client.generateProductDescription.bind(client),
    generateMarketingContent: client.generateMarketingContent.bind(client),
    checkAIHealth: client.checkAIHealth.bind(client),
  }
}

// Utilitários
export function formatAnalysisResult(analysis: AnalysisResult): string {
  return `
**Resumo:** ${analysis.summary}

**Insights:**
${analysis.insights.map((insight) => `• ${insight}`).join("\n")}

**Recomendações:**
${analysis.recommendations.map((rec) => `• ${rec}`).join("\n")}

**Confiança:** ${analysis.confidence}%
  `.trim()
}

export function validateCustomerData(data: any): boolean {
  return !!(data && (data.id || data.email || data.name))
}

export default VertexAPIClient
