import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData } = body

    if (!customerData) {
      return NextResponse.json({ error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    const vertexAI = getVertexAIService()
    const analysis = await vertexAI.analyzeCustomerBehavior(customerData)

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ error: "ID do cliente é obrigatório" }, { status: 400 })
    }

    // Aqui você buscaria os dados do cliente do banco de dados
    // Por enquanto, retornamos dados mock
    const mockCustomerData = {
      id: customerId,
      name: "Cliente Exemplo",
      email: "cliente@exemplo.com",
      purchases: [
        { product: "Produto A", date: "2024-01-15", value: 99.9 },
        { product: "Produto B", date: "2024-01-20", value: 149.9 },
      ],
      totalSpent: 249.8,
      lastPurchase: "2024-01-20",
      preferredCategories: ["Casa", "Cozinha"],
    }

    const vertexAI = getVertexAIService()
    const analysis = await vertexAI.analyzeCustomerBehavior(mockCustomerData)

    return NextResponse.json({
      success: true,
      customerId,
      customerData: mockCustomerData,
      analysis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao buscar análise do cliente:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
