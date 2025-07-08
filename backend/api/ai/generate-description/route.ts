import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData } = body

    if (!productData) {
      return NextResponse.json({ error: "Dados do produto são obrigatórios" }, { status: 400 })
    }

    const vertexAI = getVertexAIService()
    const description = await vertexAI.generateProductDescription(productData)

    return NextResponse.json({
      success: true,
      description,
      productData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar descrição:", error)

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
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 })
    }

    // Mock product data - em produção, buscar do banco
    const mockProductData = {
      id: productId,
      name: "Jogo de Panelas Antiaderente",
      category: "Cozinha",
      features: ["Antiaderente", "5 peças", "Cabo ergonômico", "Compatível com fogão a gás e elétrico"],
      price: "R$ 299,90",
      brand: "Volaron Home",
    }

    const vertexAI = getVertexAIService()
    const description = await vertexAI.generateProductDescription(mockProductData)

    return NextResponse.json({
      success: true,
      productId,
      productData: mockProductData,
      description,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar descrição:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
