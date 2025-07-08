import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "../../../services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData } = body

    if (!customerData) {
      return NextResponse.json({ error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    const analysis = await geminiAIService.analyzeCustomerBehavior(customerData)

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro na análise do cliente:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Customer Analysis API",
    methods: ["POST"],
    description: "Analisa comportamento do cliente usando Gemini AI",
    example: {
      customerData: {
        purchases: [],
        browsing_history: [],
        demographics: {},
      },
    },
  })
}
