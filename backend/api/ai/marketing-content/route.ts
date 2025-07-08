import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/backend/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const {
      contentType,
      product,
      campaign,
      audience,
      platform,
      tone = "engaging",
      objective = "sales",
    } = await request.json()

    if (!contentType) {
      return NextResponse.json({ error: "Content type is required" }, { status: 400 })
    }

    const contentTypes = {
      email: "E-mail marketing",
      social: "Post para redes sociais",
      ad: "Anúncio publicitário",
      blog: "Artigo de blog",
      newsletter: "Newsletter",
      sms: "SMS marketing",
    }

    const objectives = {
      sales: "aumentar vendas",
      awareness: "aumentar conhecimento da marca",
      engagement: "aumentar engajamento",
      retention: "reter clientes",
      acquisition: "adquirir novos clientes",
    }

    const platforms = {
      instagram: "Instagram (visual, hashtags, stories)",
      facebook: "Facebook (engajamento, compartilhamento)",
      whatsapp: "WhatsApp (pessoal, direto)",
      email: "E-mail (formal, detalhado)",
      sms: "SMS (conciso, urgente)",
    }

    const prompt = `
      Crie conteúdo de marketing para a Volaron (loja de utilidades domésticas) com estas especificações:
      
      Tipo de Conteúdo: ${contentTypes[contentType as keyof typeof contentTypes] || contentType}
      Produto/Serviço: ${product || "Produtos gerais da loja"}
      Campanha: ${campaign || "Campanha geral"}
      Público-alvo: ${audience || "Donas de casa e pessoas que cuidam do lar"}
      Plataforma: ${platforms[platform as keyof typeof platforms] || "Geral"}
      Objetivo: ${objectives[objective as keyof typeof objectives] || "aumentar vendas"}
      
      Diretrizes da Volaron:
      - Loja brasileira de utilidades domésticas
      - Foco em praticidade e qualidade de vida
      - Produtos para casa, jardim, cozinha, organização
      - Entrega nacional, parcelamento facilitado
      - Tom acolhedor e próximo ao cliente
      
      Instruções específicas:
      - Use linguagem brasileira natural
      - Inclua benefícios práticos dos produtos
      - Destaque diferenciais da Volaron
      - Inclua call-to-action apropriado
      - Adapte o formato para a plataforma escolhida
      - Tom: ${tone}
      
      Retorne em formato JSON:
      {
        "headline": "Título principal",
        "content": "Conteúdo principal",
        "callToAction": "Call-to-action",
        "hashtags": ["#tag1", "#tag2"] (se aplicável),
        "subject": "Assunto do e-mail" (se aplicável),
        "variations": ["Variação 1", "Variação 2"]
      }
    `

    const response = await geminiAIService.generateContent(prompt)

    // Try to parse as JSON, fallback to structured response
    let marketingContent
    try {
      marketingContent = JSON.parse(response)
    } catch {
      // If not valid JSON, create structured response
      const lines = response.split("\n").filter((line) => line.trim())
      marketingContent = {
        headline: lines[0] || "Descubra a praticidade na Volaron!",
        content: lines.slice(1, -2).join("\n"),
        callToAction: lines[lines.length - 1] || "Visite nossa loja online!",
        hashtags: contentType === "social" ? ["#volaron", "#utilidadesdomesticas", "#casa"] : [],
        subject: contentType === "email" ? lines[0] : undefined,
        variations: [lines[0], "Transforme sua casa com a Volaron"],
      }
    }

    return NextResponse.json({
      success: true,
      content: marketingContent,
      metadata: {
        contentType,
        platform,
        objective,
        tone,
        generatedAt: new Date().toISOString(),
        aiProvider: "gemini-1.5-flash",
      },
    })
  } catch (error) {
    console.error("Marketing content generation error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate marketing content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Marketing Content Generator API",
    endpoints: {
      POST: "/api/ai/marketing-content",
      parameters: {
        required: ["contentType"],
        optional: ["product", "campaign", "audience", "platform", "tone", "objective"],
      },
      contentTypes: ["email", "social", "ad", "blog", "newsletter", "sms"],
      platforms: ["instagram", "facebook", "whatsapp", "email", "sms"],
      objectives: ["sales", "awareness", "engagement", "retention", "acquisition"],
      tones: ["engaging", "professional", "casual", "urgent", "friendly"],
    },
  })
}
