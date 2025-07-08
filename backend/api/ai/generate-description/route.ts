import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const { productData } = await request.json()

    if (!productData?.name || !productData?.category) {
      return NextResponse.json({ error: "Nome e categoria do produto são obrigatórios" }, { status: 400 })
    }

    const description = await geminiAIService.generateProductDescription(productData)

    return NextResponse.json({
      success: true,
      description,
      generated_at: new Date().toISOString(),
      api_version: "gemini-ai-studio",
    })
  } catch (error) {
    console.error("Erro na geração de descrição:", error)

    // Tratamento específico de erros do Gemini AI Studio
    if (error.message?.includes("Limite de requisições")) {
      return NextResponse.json(
        {
          error: "Muitas requisições. Tente novamente em alguns minutos.",
        },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Falha na geração de descrição" }, { status: 500 })
  }
}
