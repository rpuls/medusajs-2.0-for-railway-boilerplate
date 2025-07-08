import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData } = body

    if (!productData) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do produto são obrigatórios",
        },
        { status: 400 },
      )
    }

    // Validar dados mínimos do produto
    if (!productData.name && !productData.title) {
      return NextResponse.json(
        {
          success: false,
          error: "Nome do produto é obrigatório",
        },
        { status: 400 },
      )
    }

    const vertexAI = getVertexAIService()
    const description = await vertexAI.generateProductDescription(productData)

    return NextResponse.json({
      success: true,
      data: {
        productId: productData.id || null,
        productName: productData.name || productData.title,
        description,
        generatedAt: new Date().toISOString(),
        wordCount: description.split(" ").length,
      },
    })
  } catch (error) {
    console.error("Erro ao gerar descrição:", error)

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
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID do produto é obrigatório",
        },
        { status: 400 },
      )
    }

    // Simular busca de produto
    const mockProduct = {
      id: productId,
      name: "Mangueira de Jardim Flexível 15m",
      category: "Jardim",
      price: 89.99,
      features: ["Material resistente", "Flexível e leve", "Conexões universais", "Resistente a UV"],
      specifications: {
        comprimento: "15 metros",
        material: "PVC reforçado",
        diametro: "1/2 polegada",
        pressao: "até 8 bar",
      },
    }

    const vertexAI = getVertexAIService()
    const description = await vertexAI.generateProductDescription(mockProduct)

    return NextResponse.json({
      success: true,
      data: {
        product: mockProduct,
        description,
        generatedAt: new Date().toISOString(),
        wordCount: description.split(" ").length,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar descrição:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
