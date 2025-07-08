import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData, type } = body

    if (!productData) {
      return NextResponse.json({ error: "Dados do produto são obrigatórios" }, { status: 400 })
    }

    if (!type || !["email", "social", "ad"].includes(type)) {
      return NextResponse.json({ error: "Tipo deve ser: email, social ou ad" }, { status: 400 })
    }

    const vertexAI = getVertexAIService()
    const content = await vertexAI.generateMarketingContent(productData, type)

    return NextResponse.json({
      success: true,
      content,
      type,
      productData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar conteúdo de marketing:", error)

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
    const type = searchParams.get("type") as "email" | "social" | "ad"

    if (!productId) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 })
    }

    if (!type || !["email", "social", "ad"].includes(type)) {
      return NextResponse.json({ error: "Tipo deve ser: email, social ou ad" }, { status: 400 })
    }

    // Mock product data
    const mockProductData = {
      id: productId,
      name: "Aspirador de Pó Portátil",
      category: "Limpeza",
      features: ["Sem fio", "Bateria de longa duração", "Filtro HEPA", "Múltiplos acessórios"],
      price: "R$ 199,90",
      discount: "20%",
      brand: "Volaron Clean",
    }

    const vertexAI = getVertexAIService()
    const content = await vertexAI.generateMarketingContent(mockProductData, type)

    return NextResponse.json({
      success: true,
      productId,
      productData: mockProductData,
      type,
      content,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar conteúdo de marketing:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
