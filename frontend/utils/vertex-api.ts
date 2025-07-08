// Utilitários para chamadas da API Vertex AI no frontend
export class VertexAPIClient {
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
}

// Instância singleton para uso no frontend
export const vertexAPI = new VertexAPIClient()

// Hook para usar Vertex AI no React
export function useVertexAI() {
  return {
    generateDescription: vertexAPI.generateProductDescription.bind(vertexAPI),
    analyzeCustomer: vertexAPI.analyzeCustomer.bind(vertexAPI),
    sendChatMessage: vertexAPI.sendChatMessage.bind(vertexAPI),
  }
}
