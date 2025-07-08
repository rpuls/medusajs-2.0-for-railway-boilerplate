import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, analysisType = "behavior" } = body

    if (!customerData) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do cliente são obrigatórios",
        },
        { status: 400 },
      )
    }

    const vertexAI = getVertexAIService()
    const analysis = await vertexAI.analyzeCustomerBehavior(customerData)

    return NextResponse.json({
      success: true,
      data: {
        customerId: customerData.id || "unknown",
        analysisType,
        analysis,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erro na análise do cliente:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
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
      return NextResponse.json(
        {
          success: false,
          error: "ID do cliente é obrigatório",
        },
        { status: 400 },
      )
    }

    // Simular busca de dados do cliente
    const mockCustomerData = {
      id: customerId,
      name: "Cliente Exemplo",
      email: "cliente@exemplo.com",
      totalOrders: 15,
      totalSpent: 2500.0,
      lastOrderDate: "2024-01-05",
      preferredCategories: ["Casa", "Jardim"],
      averageOrderValue: 166.67,
    }

    const vertexAI = getVertexAIService()
    const analysis = await vertexAI.analyzeCustomerBehavior(mockCustomerData)

    return NextResponse.json({
      success: true,
      data: {
        customer: mockCustomerData,
        analysis,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar análise do cliente:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
