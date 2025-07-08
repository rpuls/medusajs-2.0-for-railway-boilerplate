import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/backend/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const {
      productName,
      category,
      features,
      specifications,
      targetAudience,
      tone = "friendly",
      length = "medium",
    } = await request.json()

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }

    const lengthInstructions = {
      short: "máximo 100 palavras",
      medium: "entre 150-250 palavras",
      long: "entre 300-500 palavras",
    }

    const toneInstructions = {
      friendly: "tom amigável e acolhedor",
      professional: "tom profissional e técnico",
      casual: "tom descontraído e informal",
      persuasive: "tom persuasivo e convincente",
    }

    const prompt = `
      Crie uma descrição de produto para a loja Volaron (utilidades domésticas) com as seguintes especificações:
      
      Nome do Produto: ${productName}
      Categoria: ${category || "Não especificada"}
      Características: ${features ? features.join(", ") : "Não especificadas"}
      Especificações: ${specifications || "Não especificadas"}
      Público-alvo: ${targetAudience || "Geral"}
      
      Instruções:
      - Use ${toneInstructions[tone as keyof typeof toneInstructions] || "tom amigável"}
      - Extensão: ${lengthInstructions[length as keyof typeof lengthInstructions]}
      - Destaque os benefícios para o dia a dia
      - Inclua informações sobre qualidade e durabilidade
      - Mencione facilidade de uso quando apropriado
      - Use linguagem brasileira natural
      - Termine com um call-to-action sutil
      
      Formato de resposta JSON:
      {
        "title": "Título otimizado para SEO",
        "description": "Descrição principal do produto",
        "highlights": ["Benefício 1", "Benefício 2", "Benefício 3"],
        "seoKeywords": ["palavra-chave1", "palavra-chave2"],
        "callToAction": "Frase de call-to-action"
      }
    `

    const response = await geminiAIService.generateContent(prompt)

    // Try to parse as JSON, fallback to structured response
    let productDescription
    try {
      productDescription = JSON.parse(response)
    } catch {
      // If not valid JSON, create structured response
      const lines = response.split("\n").filter((line) => line.trim())
      productDescription = {
        title: productName,
        description: lines.slice(0, -3).join(" "),
        highlights: lines.slice(-3, -1),
        seoKeywords: [productName.toLowerCase(), category?.toLowerCase()].filter(Boolean),
        callToAction: lines[lines.length - 1] || "Adquira já o seu!",
      }
    }

    return NextResponse.json({
      success: true,
      product: {
        name: productName,
        category,
        ...productDescription,
      },
      metadata: {
        tone,
        length,
        generatedAt: new Date().toISOString(),
        aiProvider: "gemini-1.5-flash",
      },
    })
  } catch (error) {
    console.error("Product description generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate product description",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Product Description Generator API",
    endpoints: {
      POST: "/api/ai/generate-description",
      parameters: {
        required: ["productName"],
        optional: ["category", "features", "specifications", "targetAudience", "tone", "length"],
      },
      toneOptions: ["friendly", "professional", "casual", "persuasive"],
      lengthOptions: ["short", "medium", "long"],
    },
  })
}
