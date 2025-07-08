"use client"

interface ProductData {
  name: string
  category: string
  features?: string[]
  specifications?: Record<string, any>
}

interface CustomerData {
  purchases: any[]
  browsing_history?: any[]
  demographics?: Record<string, any>
}

interface SEOContent {
  title: string
  description: string
  keywords?: string[]
  category: string
}

interface ChatContext {
  user_id?: string
  conversation_history?: Array<{ role: string; content: string }>
  user_data?: Record<string, any>
}

class VertexAPIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"
  }

  async generateProductDescription(productData: ProductData): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.description
    } catch (error) {
      console.error("Erro ao gerar descrição:", error)
      throw error
    }
  }

  async analyzeCustomer(customerData: CustomerData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/analyze-customer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerData }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.analysis
    } catch (error) {
      console.error("Erro ao analisar cliente:", error)
      throw error
    }
  }

  async optimizeSEO(content: SEOContent) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/optimize-seo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.optimization
    } catch (error) {
      console.error("Erro ao otimizar SEO:", error)
      throw error
    }
  }

  async sendChatMessage(message: string, context: ChatContext = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, context }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error("Erro no chat:", error)
      throw error
    }
  }

  async generateMarketingContent(
    contentType: "email" | "social" | "blog",
    data: {
      product?: any
      campaign?: string
      target_audience?: string
      tone?: "formal" | "casual" | "promotional"
    },
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/marketing-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentType, data }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.content
    } catch (error) {
      console.error("Erro ao gerar conteúdo de marketing:", error)
      throw error
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/health`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Erro no health check:", error)
      throw error
    }
  }
}

// Hook React para usar a API
import { useState } from "react"

export function useVertexAPI() {
  const [client] = useState(() => new VertexAPIClient())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeWithLoading = async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido"
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    client,
    isLoading,
    error,
    generateProductDescription: (productData: ProductData) =>
      executeWithLoading(() => client.generateProductDescription(productData)),
    analyzeCustomer: (customerData: CustomerData) => executeWithLoading(() => client.analyzeCustomer(customerData)),
    optimizeSEO: (content: SEOContent) => executeWithLoading(() => client.optimizeSEO(content)),
    sendChatMessage: (message: string, context?: ChatContext) =>
      executeWithLoading(() => client.sendChatMessage(message, context)),
    generateMarketingContent: (contentType: "email" | "social" | "blog", data: any) =>
      executeWithLoading(() => client.generateMarketingContent(contentType, data)),
    checkHealth: () => executeWithLoading(() => client.checkHealth()),
  }
}

export default VertexAPIClient
