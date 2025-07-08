import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentType, data } = body

    if (!contentType || !["email", "social", "blog", "ad", "newsletter"].includes(contentType)) {
      return NextResponse.json(
        { error: "Tipo de conteúdo inválido. Use: email, social, blog, ad, newsletter" },
        { status: 400 },
      )
    }

    if (!data) {
      return NextResponse.json({ error: "Dados para geração são obrigatórios" }, { status: 400 })
    }

    // Contexto da marca Volaron
    const brandContext = {
      brand_name: "Volaron",
      brand_voice: "Confiável, familiar, especialista",
      location: "Birigui, SP",
      established: "1995",
      specialties: ["Moedores", "Escadas", "Jardinagem", "Utilidades Domésticas"],
      values: ["Qualidade", "Tradição", "Confiança", "Atendimento personalizado"],
      target_audience: "Donas de casa, profissionais da cozinha, jardineiros",
      ...data,
    }

    // Gerar conteúdo baseado no tipo
    const content = await geminiAIService.generateMarketingContent(contentType, brandContext)

    // Gerar variações se solicitado
    const variations = []
    if (data.generate_variations) {
      for (let i = 0; i < 3; i++) {
        const variation = await geminiAIService.generateMarketingContent(contentType, {
          ...brandContext,
          variation_seed: i + 1,
        })
        variations.push(variation)
      }
    }

    // Análise de sentimento e tom
    const contentAnalysis = {
      tone: detectTone(content),
      sentiment: "positive", // Simplificado
      readability_score: calculateReadability(content),
      word_count: content.split(" ").length,
      estimated_engagement: calculateEngagement(contentType, content),
    }

    // Log para monitoramento
    console.log(`[AI] Conteúdo de marketing gerado - Tipo: ${contentType}`)

    return NextResponse.json({
      success: true,
      content,
      variations,
      analysis: contentAnalysis,
      metadata: {
        content_type: contentType,
        generated_at: new Date().toISOString(),
        model_used: "gemini-1.5-flash-001",
        brand: "Volaron",
      },
    })
  } catch (error) {
    console.error("Erro na geração de conteúdo:", error)

    if (error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "Limite de requisições excedido. Tente novamente em alguns minutos." },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get("type")
    const campaignId = searchParams.get("campaign_id")

    if (!contentType) {
      return NextResponse.json({ error: "Tipo de conteúdo é obrigatório" }, { status: 400 })
    }

    // Buscar templates pré-definidos
    const templates = getMarketingTemplates(contentType)

    return NextResponse.json({
      success: true,
      content_type: contentType,
      templates,
      campaign_id: campaignId,
    })
  } catch (error) {
    console.error("Erro ao buscar templates:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// Funções auxiliares
function detectTone(content: string): string {
  const toneKeywords = {
    professional: ["qualidade", "especialista", "confiança", "experiência"],
    friendly: ["família", "casa", "cozinha", "fácil"],
    promotional: ["oferta", "desconto", "promoção", "aproveite"],
  }

  let maxScore = 0
  let detectedTone = "neutral"

  Object.entries(toneKeywords).forEach(([tone, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (content.toLowerCase().includes(keyword) ? 1 : 0)
    }, 0)

    if (score > maxScore) {
      maxScore = score
      detectedTone = tone
    }
  })

  return detectedTone
}

function calculateReadability(content: string): number {
  // Fórmula simplificada de legibilidade
  const words = content.split(" ").length
  const sentences = content.split(/[.!?]+/).length
  const avgWordsPerSentence = words / sentences

  // Pontuação de 0-100 (100 = mais fácil de ler)
  return Math.max(0, Math.min(100, 100 - avgWordsPerSentence * 2))
}

function calculateEngagement(contentType: string, content: string): string {
  const engagementFactors = {
    email: content.includes("?") ? "high" : "medium",
    social: content.length < 280 ? "high" : "medium",
    blog: content.split(" ").length > 300 ? "high" : "medium",
    ad: content.includes("!") ? "high" : "medium",
    newsletter: content.includes("clique") ? "high" : "medium",
  }

  return engagementFactors[contentType] || "medium"
}

function getMarketingTemplates(contentType: string) {
  const templates = {
    email: [
      {
        name: "Promoção Semanal",
        subject: "🔥 Ofertas imperdíveis da Volaron!",
        preview: "Produtos com até 30% de desconto...",
      },
      {
        name: "Novo Produto",
        subject: "✨ Novidade chegou na Volaron!",
        preview: "Conheça nosso mais novo produto...",
      },
    ],
    social: [
      {
        name: "Dica de Uso",
        format: "Instagram Post",
        preview: "💡 Dica da Volaron: Como usar seu moedor...",
      },
      {
        name: "Produto em Destaque",
        format: "Facebook Post",
        preview: "🌟 Produto em destaque: Escada Multifuncional...",
      },
    ],
    blog: [
      {
        name: "Guia Completo",
        title: "Como escolher o moedor ideal para sua cozinha",
        preview: "Descubra tudo sobre moedores...",
      },
    ],
  }

  return templates[contentType] || []
}
