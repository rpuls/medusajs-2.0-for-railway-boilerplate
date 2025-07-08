import { type NextRequest, NextResponse } from "next/server"
import { vertexAIService } from "@/services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const { customerData } = await request.json()

    if (!customerData?.purchases) {
      return NextResponse.json({ error: "Dados de compras são obrigatórios" }, { status: 400 })
    }

    const analysis = await vertexAIService.analyzeCustomerBehavior(customerData)

    return NextResponse.json({
      success: true,
      analysis,
      analyzed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro na análise do cliente:", error)
    return NextResponse.json({ error: "Falha na análise do cliente" }, { status: 500 })
  }
}
