import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const { contentType, data } = await request.json()

    if (!contentType || !["email", "social", "blog"].includes(contentType)) {
      return NextResponse.json(
        {
          error: "Tipo de conteúdo deve ser: email, social ou blog",
        },
        { status: 400 },
      )
    }

    const content = await geminiAIService.generateMarketingContent(contentType, data || {})

    return NextResponse.json({
      success: true,
      content,
      content_type: contentType,
      generated_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro na geração de conteúdo:", error)
    return NextResponse.json({ error: "Falha na geração de conteúdo" }, { status: 500 })
  }
}
