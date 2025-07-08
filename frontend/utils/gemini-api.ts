// Utilitários atualizados para Gemini AI Studio (mantém interface original)
export class GeminiAPIClient {
  private baseUrl: string

  constructor(baseUrl = "/api/ai") {
    this.baseUrl = baseUrl
  }

  async generateProductDescription(productData: {
    name: string
    category: string
    features?: string[]
    specifications?: Record<string, any>
  }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productData }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Muitas requisições. Aguarde alguns minutos e tente novamente.")
      }
      throw new Error("Falha na geração de descrição")
    }

    const data = await response.json()
    return data.description
  }

  async analyzeCustomer(customerData: {
    purchases: any[]
    browsing_history?: any[]
    demographics?: Record<string, any>
  }) {
    const response = await fetch(`${this.baseUrl}/analyze-customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ customerData }),
    })

    if (!response.ok) {
      throw new Error("Falha na análise do cliente")
    }

    const data = await response.json()
    return data.analysis
  }

  async sendChatMessage(message: string, context?: any): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chatbot`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, context }),
    })

    if (!response.ok) {
      throw new Error("Falha na resposta do chatbot")
    }

    const data = await response.json()
    return data.response
  }

  // Nova funcionalidade: Geração de conteúdo de marketing
  async generateMarketingContent(
    contentType: "email" | "social" | "blog",
    data: {
      product?: any
      campaign?: string
      target_audience?: string
      tone?: "formal" | "casual" | "promotional"
    },
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/marketing-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contentType, data }),
    })

    if (!response.ok) {
      throw new Error("Falha na geração de conteúdo")
    }

    const result = await response.json()
    return result.content
  }

  // Verificação de saúde da API
  async checkHealth(): Promise<{
    status: string
    model: string
    timestamp: string
  }> {
    const response = await fetch(`${this.baseUrl}/health`)

    if (!response.ok) {
      throw new Error("API indisponível")
    }

    return await response.json()
  }
}

// Instância singleton (mantém compatibilidade)
export const geminiAPI = new GeminiAPIClient()

// Alias para manter compatibilidade
export const vertexAPI = geminiAPI

// Hook atualizado (mantém interface original)
export function useGeminiAI() {
  return {
    generateDescription: geminiAPI.generateProductDescription.bind(geminiAPI),
    analyzeCustomer: geminiAPI.analyzeCustomer.bind(geminiAPI),
    sendChatMessage: geminiAPI.sendChatMessage.bind(geminiAPI),
    generateMarketingContent: geminiAPI.generateMarketingContent.bind(geminiAPI),
    checkHealth: geminiAPI.checkHealth.bind(geminiAPI),
  }
}

// Alias para manter compatibilidade
export const useVertexAI = useGeminiAI
