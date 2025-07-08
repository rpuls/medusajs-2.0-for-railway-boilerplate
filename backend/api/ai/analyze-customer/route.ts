import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData } = body

    if (!customerData) {
      return NextResponse.json({ error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    // Validar estrutura dos dados
    if (!customerData.purchases || !Array.isArray(customerData.purchases)) {
      return NextResponse.json({ error: "Histórico de compras é obrigatório" }, { status: 400 })
    }

    // Análise comportamental do cliente
    const analysis = await geminiAIService.analyzeCustomerBehavior({
      purchases: customerData.purchases,
      browsing_history: customerData.browsing_history || [],
      demographics: customerData.demographics || {},
      preferences: customerData.preferences || {},
      location: customerData.location || "Brasil",
    })

    // Log para monitoramento
    console.log(`[AI] Análise de cliente concluída - ID: ${customerData.customer_id || "anônimo"}`)

    return NextResponse.json({
      success: true,
      analysis: {
        customer_profile: analysis.customer_profile,
        purchase_patterns: analysis.purchase_patterns,
        recommendations: analysis.recommendations,
        risk_assessment: analysis.risk_assessment,
        lifetime_value_prediction: analysis.lifetime_value_prediction,
        next_purchase_probability: analysis.next_purchase_probability,
        preferred_categories: analysis.preferred_categories,
        seasonal_trends: analysis.seasonal_trends,
      },
      metadata: {
        analysis_date: new Date().toISOString(),
        model_used: "gemini-1.5-flash-001",
        confidence_score: analysis.confidence_score || 0.85,
      },
    })
  } catch (error) {
    console.error("Erro na análise do cliente:", error)

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "Limite de requisições excedido. Tente novamente em alguns minutos." },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customer_id")

    if (!customerId) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })
    }

    // Buscar dados do cliente no banco (simulado)
    const customerData = {
      customer_id: customerId,
      purchases: [
        {
          product_id: "moedor-carne-22",
          category: "Moedores",
          price: 89.9,
          date: "2024-01-15",
          rating: 5,
        },
      ],
      demographics: {
        age_range: "35-45",
        location: "Birigui, SP",
        gender: "M",
      },
    }

    const analysis = await geminiAIService.analyzeCustomerBehavior(customerData)

    return NextResponse.json({
      success: true,
      customer_id: customerId,
      analysis,
    })
  } catch (error) {
    console.error("Erro ao buscar análise do cliente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
