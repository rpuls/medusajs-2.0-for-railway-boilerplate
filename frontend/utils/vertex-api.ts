"use client"

interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

interface ChatMessage {
  sessionId: string
  response: string
  suggestions: string[]
  context: string
  timestamp: string
}

interface CustomerAnalysis {
  customerId: string
  analysisType: string
  analysis: {
    summary: string
    insights: string[]
    recommendations: string[]
    confidence: number
  }
  timestamp: string
}

interface HealthStatus {
  status: string
  services: Record<string, any>
  uptime: number
  memory: any
  version: string
}

class VertexAPIClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "/api"
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  }

  async sendChatMessage(message: string, sessionId?: string, context?: string): Promise<APIResponse<ChatMessage>> {
    return this.makeRequest<ChatMessage>("/ai/chatbot", {
      method: "POST",
      body: JSON.stringify({
        message,
        sessionId,
        context,
      }),
    })
  }

  async getChatSession(sessionId: string): Promise<APIResponse<any>> {
    return this.makeRequest(`/ai/chatbot?sessionId=${sessionId}`)
  }

  async deleteChatSession(sessionId: string): Promise<APIResponse<any>> {
    return this.makeRequest(`/ai/chatbot?sessionId=${sessionId}`, {
      method: "DELETE",
    })
  }

  async analyzeCustomer(customerData: any, analysisType = "behavior"): Promise<APIResponse<CustomerAnalysis>> {
    return this.makeRequest<CustomerAnalysis>("/ai/analyze-customer", {
      method: "POST",
      body: JSON.stringify({
        customerData,
        analysisType,
      }),
    })
  }

  async getCustomerAnalysis(customerId: string): Promise<APIResponse<CustomerAnalysis>> {
    return this.makeRequest<CustomerAnalysis>(`/ai/analyze-customer?customerId=${customerId}`)
  }

  async generateProductDescription(productData: any): Promise<APIResponse<{ description: string }>> {
    return this.makeRequest<{ description: string }>("/ai/generate-description", {
      method: "POST",
      body: JSON.stringify({ productData }),
    })
  }

  async generateMarketingContent(
    productData: any,
    type: "email" | "social" | "ad",
  ): Promise<APIResponse<{ content: string }>> {
    return this.makeRequest<{ content: string }>("/ai/marketing-content", {
      method: "POST",
      body: JSON.stringify({
        productData,
        type,
      }),
    })
  }

  async optimizeSEO(content: string, keywords: string[]): Promise<APIResponse<{ optimizedContent: string }>> {
    return this.makeRequest<{ optimizedContent: string }>("/ai/optimize-seo", {
      method: "POST",
      body: JSON.stringify({
        content,
        keywords,
      }),
    })
  }

  async checkAIHealth(): Promise<APIResponse<HealthStatus>> {
    return this.makeRequest<HealthStatus>("/ai/health")
  }

  async getAIStats(): Promise<APIResponse<any>> {
    return this.makeRequest("/ai/stats")
  }
}

// Hook React para usar a API
import { useState, useEffect } from "react"

export function useVertexAPI() {
  const [client] = useState(() => new VertexAPIClient())
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await client.checkAIHealth()
        setIsOnline(response.success)
      } catch (error) {
        setIsOnline(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [client])

  return {
    ...client,
    isOnline,
  }
}

// Instância singleton para uso direto
export const vertexAPI = new VertexAPIClient()
