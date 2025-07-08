import { GoogleGenerativeAI } from "@google/generative-ai"

interface VertexAIConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

interface GenerateTextOptions {
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

interface AnalyzeCustomerOptions {
  customerData: {
    id: string
    email: string
    orders: any[]
    preferences?: any
  }
  analysisType: "behavior" | "preferences" | "recommendations"
}

export class VertexAIService {
  private genAI: GoogleGenerativeAI
  private model: any
  private config: VertexAIConfig

  constructor(config: VertexAIConfig) {
    this.config = config
    this.genAI = new GoogleGenerativeAI(config.apiKey)
    this.model = this.genAI.getGenerativeModel({ model: config.model })
  }

  async generateText(options: GenerateTextOptions): Promise<string> {
    try {
      const { prompt, systemPrompt, temperature = 0.7, maxTokens = 1000 } = options

      let fullPrompt = prompt
      if (systemPrompt) {
        fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`
      }

      const result = await this.model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      })

      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Error generating text:", error)
      throw new Error(`Vertex AI generation failed: ${error.message}`)
    }
  }

  async analyzeCustomer(options: AnalyzeCustomerOptions): Promise<any> {
    try {
      const { customerData, analysisType } = options

      const systemPrompt = `You are an AI assistant specialized in e-commerce customer analysis. 
      Analyze the provided customer data and provide insights based on the analysis type requested.`

      let prompt = ""

      switch (analysisType) {
        case "behavior":
          prompt = `Analyze this customer's behavior patterns:
          Customer ID: ${customerData.id}
          Email: ${customerData.email}
          Orders: ${JSON.stringify(customerData.orders, null, 2)}
          
          Provide insights about:
          1. Purchase frequency
          2. Average order value
          3. Product preferences
          4. Seasonal patterns
          5. Customer lifetime value prediction`
          break

        case "preferences":
          prompt = `Analyze this customer's preferences:
          Customer Data: ${JSON.stringify(customerData, null, 2)}
          
          Identify:
          1. Preferred product categories
          2. Price sensitivity
          3. Brand preferences
          4. Shopping patterns
          5. Communication preferences`
          break

        case "recommendations":
          prompt = `Generate product recommendations for this customer:
          Customer Data: ${JSON.stringify(customerData, null, 2)}
          
          Provide:
          1. Top 5 recommended products
          2. Reasoning for each recommendation
          3. Cross-sell opportunities
          4. Upsell suggestions
          5. Personalized marketing messages`
          break
      }

      const analysis = await this.generateText({
        prompt,
        systemPrompt,
        temperature: 0.3,
        maxTokens: 2000,
      })

      return {
        customerId: customerData.id,
        analysisType,
        timestamp: new Date().toISOString(),
        insights: analysis,
        confidence: 0.85,
      }
    } catch (error) {
      console.error("Error analyzing customer:", error)
      throw new Error(`Customer analysis failed: ${error.message}`)
    }
  }

  async generateProductDescription(productData: any): Promise<string> {
    try {
      const prompt = `Generate a compelling product description for:
      
      Product Name: ${productData.name}
      Category: ${productData.category}
      Price: ${productData.price}
      Features: ${JSON.stringify(productData.features || [])}
      Specifications: ${JSON.stringify(productData.specifications || {})}
      
      Create a description that:
      1. Highlights key benefits
      2. Uses persuasive language
      3. Includes SEO keywords
      4. Appeals to the target audience
      5. Maintains professional tone`

      return await this.generateText({
        prompt,
        systemPrompt: "You are an expert copywriter specializing in e-commerce product descriptions.",
        temperature: 0.6,
        maxTokens: 800,
      })
    } catch (error) {
      console.error("Error generating product description:", error)
      throw new Error(`Product description generation failed: ${error.message}`)
    }
  }

  async chatbotResponse(message: string, context?: any): Promise<string> {
    try {
      const systemPrompt = `You are a helpful customer service chatbot for Volaron Store, 
      an e-commerce platform specializing in home utilities and garden products. 
      Be friendly, helpful, and professional. Provide accurate information about products, 
      orders, shipping, and general inquiries.`

      let prompt = message
      if (context) {
        prompt = `Context: ${JSON.stringify(context)}\n\nCustomer message: ${message}`
      }

      return await this.generateText({
        prompt,
        systemPrompt,
        temperature: 0.4,
        maxTokens: 500,
      })
    } catch (error) {
      console.error("Error generating chatbot response:", error)
      throw new Error(`Chatbot response generation failed: ${error.message}`)
    }
  }

  async healthCheck(): Promise<{ status: string; model: string; timestamp: string }> {
    try {
      const testResponse = await this.generateText({
        prompt: 'Hello, this is a health check. Please respond with "OK".',
        temperature: 0.1,
        maxTokens: 10,
      })

      return {
        status: testResponse.includes("OK") ? "healthy" : "warning",
        model: this.config.model,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Health check failed:", error)
      return {
        status: "unhealthy",
        model: this.config.model,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

// Singleton instance
let vertexAIInstance: VertexAIService | null = null

export function getVertexAIService(): VertexAIService {
  if (!vertexAIInstance) {
    const config: VertexAIConfig = {
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "",
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      temperature: 0.7,
      maxTokens: 1000,
    }

    if (!config.apiKey) {
      throw new Error("Gemini API key not configured")
    }

    vertexAIInstance = new VertexAIService(config)
  }

  return vertexAIInstance
}
