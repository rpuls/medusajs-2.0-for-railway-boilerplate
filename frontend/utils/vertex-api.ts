interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
}

interface CustomerAnalysis {
  customerId: string
  analysisType: string
  timestamp: string
  insights: string
  confidence: number
}

interface ChatbotResponse {
  response: string
  sessionId: string
  timestamp: string
}

class VertexAPIClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        error: error.message || "Unknown error occurred",
      }
    }
  }

  async analyzeCustomer(
    customerData: any,
    analysisType: "behavior" | "preferences" | "recommendations" = "behavior",
  ): Promise<ApiResponse<CustomerAnalysis>> {
    return this.makeRequest<CustomerAnalysis>("/api/ai/analyze-customer", {
      method: "POST",
      body: JSON.stringify({ customerData, analysisType }),
    })
  }

  async getCustomerAnalysis(
    customerId: string,
    analysisType: "behavior" | "preferences" | "recommendations" = "behavior",
  ): Promise<ApiResponse<CustomerAnalysis>> {
    return this.makeRequest<CustomerAnalysis>(`/api/ai/analyze-customer?customerId=${customerId}&type=${analysisType}`)
  }

  async sendChatMessage(message: string, context?: any, sessionId?: string): Promise<ApiResponse<ChatbotResponse>> {
    return this.makeRequest<ChatbotResponse>("/api/ai/chatbot", {
      method: "POST",
      body: JSON.stringify({ message, context, sessionId }),
    })
  }

  async getChatResponse(message: string): Promise<ApiResponse<ChatbotResponse>> {
    return this.makeRequest<ChatbotResponse>(`/api/ai/chatbot?message=${encodeURIComponent(message)}`)
  }

  async generateProductDescription(productData: any): Promise<ApiResponse<string>> {
    return this.makeRequest<string>("/api/ai/generate-description", {
      method: "POST",
      body: JSON.stringify({ productData }),
    })
  }

  async healthCheck(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>("/api/ai/health")
  }
}

// Singleton instance
let vertexAPIClient: VertexAPIClient | null = null

export function getVertexAPIClient(): VertexAPIClient {
  if (!vertexAPIClient) {
    vertexAPIClient = new VertexAPIClient()
  }
  return vertexAPIClient
}

// Convenience functions
export const vertexAPI = {
  analyzeCustomer: (customerData: any, analysisType?: "behavior" | "preferences" | "recommendations") =>
    getVertexAPIClient().analyzeCustomer(customerData, analysisType),

  getCustomerAnalysis: (customerId: string, analysisType?: "behavior" | "preferences" | "recommendations") =>
    getVertexAPIClient().getCustomerAnalysis(customerId, analysisType),

  sendChatMessage: (message: string, context?: any, sessionId?: string) =>
    getVertexAPIClient().sendChatMessage(message, context, sessionId),

  getChatResponse: (message: string) => getVertexAPIClient().getChatResponse(message),

  generateProductDescription: (productData: any) => getVertexAPIClient().generateProductDescription(productData),

  healthCheck: () => getVertexAPIClient().healthCheck(),
}
