import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, customerData } = body

    if (!customerData) {
      return NextResponse.json({ error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    // Validar estrutura dos dados
    const requiredFields = ["purchases"]
    for (const field of requiredFields) {
      if (!customerData[field]) {
        return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 400 })
      }
    }

    // Analisar comportamento do cliente usando Gemini AI
    const analysis = await geminiAIService.analyzeCustomerBehavior({
      purchases: customerData.purchases,
      browsing_history: customerData.browsing_history || [],
      demographics: customerData.demographics || {},
    })

    // Enriquecer análise com dados do MedusaJS
    const enrichedAnalysis = {
      ...analysis,
      customer_id: customerId,
      analysis_date: new Date().toISOString(),
      recommendations_count: analysis.recommendations?.length || 0,
      insights_count: analysis.insights?.length || 0,
      confidence_score: calculateConfidenceScore(customerData),
      next_actions: generateNextActions(analysis, customerData),
    }

    return NextResponse.json({
      success: true,
      analysis: enrichedAnalysis,
      metadata: {
        processing_time: Date.now(),
        ai_model: "gemini-1.5-flash",
        version: "1.0.0",
      },
    })
  } catch (error) {
    console.error("Erro na análise do cliente:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

function calculateConfidenceScore(customerData: any): number {
  let score = 0

  // Pontuação baseada na quantidade de dados disponíveis
  if (customerData.purchases?.length > 0) score += 40
  if (customerData.browsing_history?.length > 0) score += 30
  if (customerData.demographics && Object.keys(customerData.demographics).length > 0) score += 20
  if (customerData.purchases?.length > 5) score += 10 // Histórico robusto

  return Math.min(score, 100)
}

function generateNextActions(analysis: any, customerData: any): string[] {
  const actions = []

  if (analysis.recommendations?.length > 0) {
    actions.push("Enviar recomendações personalizadas por email")
  }

  if (customerData.purchases?.length === 0) {
    actions.push("Oferecer desconto para primeira compra")
  }

  if (customerData.purchases?.length > 3) {
    actions.push("Convidar para programa de fidelidade")
  }

  actions.push("Agendar follow-up em 7 dias")

  return actions
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Customer Analysis API",
    description: "Analisa comportamento de clientes usando IA",
    methods: ["POST"],
    required_fields: ["customerData.purchases"],
    optional_fields: ["customerData.browsing_history", "customerData.demographics"],
  })
}
