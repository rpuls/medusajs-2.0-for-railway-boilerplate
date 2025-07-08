import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const { customerId, orderHistory, preferences } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    // Análise comportamental do cliente usando Gemini AI
    const analysis = await geminiAIService.analyzeCustomerBehavior({
      customerId,
      orderHistory: orderHistory || [],
      preferences: preferences || {},
      context: "volaron-store-ecommerce",
    })

    // Gerar insights personalizados
    const insights = await geminiAIService.generateInsights({
      customerData: { customerId, orderHistory, preferences },
      analysisType: "behavioral-pattern",
      businessContext: "utilidades-domesticas-jardinagem",
    })

    // Sugestões de produtos baseadas na análise
    const productSuggestions = await geminiAIService.suggestProducts({
      customerProfile: analysis.profile,
      categories: ["moedores", "escadas", "jardinagem", "raladores", "trituradores"],
      maxSuggestions: 10,
    })

    return NextResponse.json({
      success: true,
      data: {
        customerAnalysis: analysis,
        insights: insights,
        productSuggestions: productSuggestions,
        timestamp: new Date().toISOString(),
        confidence: analysis.confidence || 0.85,
      },
    })
  } catch (error) {
    console.error("Error analyzing customer:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze customer behavior",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID parameter is required" }, { status: 400 })
    }

    // Buscar análise existente do cliente
    const existingAnalysis = await geminiAIService.getCustomerAnalysis(customerId)

    return NextResponse.json({
      success: true,
      data: existingAnalysis || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching customer analysis:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch customer analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
