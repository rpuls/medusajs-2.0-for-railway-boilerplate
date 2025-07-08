import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "../../../services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData } = body

    if (!productData || !productData.name) {
      return NextResponse.json({ error: "Dados do produto são obrigatórios (nome mínimo)" }, { status: 400 })
    }

    const description = await geminiAIService.generateProductDescription(productData)

    return NextResponse.json({
      success: true,
      description,
      product: productData.name,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar descrição:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Product Description Generator",
    methods: ["POST"],
    description: "Gera descrições otimizadas para produtos usando Gemini AI",
    example: {
      productData: {
        name: "Vaso de Cerâmica Decorativo",
        category: "Jardinagem",
        features: ["Resistente", "Decorativo", "Fácil limpeza"],
        specifications: {
          material: "Cerâmica",
          tamanho: "Médio",
          cor: "Branco",
        },
      },
    },
  })
}
