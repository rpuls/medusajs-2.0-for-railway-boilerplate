import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const {
      contentType,
      product,
      campaign,
      targetAudience,
      platform,
      tone = "professional-friendly",
    } = await request.json()

    if (!contentType) {
      return NextResponse.json({ error: "Content type is required" }, { status: 400 })
    }

    const businessContext = {
      storeName: "Volaron",
      website: "volaron.com.br",
      businessType: "utilidades-domesticas-jardinagem",
      location: "Brasil",
      phone: "(18) 3643-1990",
      email: "contato@volaron.com.br",
      workingHours: "Segunda à Sexta das 8h às 18h",
      services: [
        "Envio para todo Brasil",
        "Descontos à vista",
        "Entrega local no mesmo dia",
        "Parcelamento em até 12x sem juros",
      ],
    }

    let content = {}

    switch (contentType) {
      case "email-marketing":
        content = await geminiAIService.generateEmailMarketing({
          product,
          campaign,
          targetAudience,
          businessContext,
          tone,
        })
        break

      case "social-media":
        content = await geminiAIService.generateSocialMediaContent({
          product,
          platform: platform || "instagram",
          targetAudience,
          businessContext,
          tone,
        })
        break

      case "blog-post":
        content = await geminiAIService.generateBlogPost({
          topic: product?.name || campaign?.topic,
          category: product?.category,
          targetAudience,
          businessContext,
          tone,
        })
        break

      case "product-announcement":
        content = await geminiAIService.generateProductAnnouncement({
          product,
          targetAudience,
          businessContext,
          tone,
        })
        break

      case "newsletter":
        content = await geminiAIService.generateNewsletter({
          products: product ? [product] : [],
          campaign,
          targetAudience,
          businessContext,
          tone,
        })
        break

      case "whatsapp-message":
        content = await geminiAIService.generateWhatsAppMessage({
          product,
          targetAudience,
          businessContext,
          tone: "casual-friendly",
        })
        break

      default:
        return NextResponse.json({ error: "Unsupported content type" }, { status: 400 })
    }

    // Gerar variações do conteúdo
    const variations = await geminiAIService.generateContentVariations({
      originalContent: content,
      variationCount: 3,
      contentType,
      tone,
    })

    // Gerar hashtags se for para redes sociais
    let hashtags = []
    if (platform && ["instagram", "twitter", "facebook"].includes(platform)) {
      hashtags = await geminiAIService.generateHashtags({
        content: content.text || content.subject,
        category: product?.category,
        businessContext,
        maxHashtags: 15,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        content: content,
        variations: variations,
        hashtags: hashtags,
        metadata: {
          contentType,
          platform,
          tone,
          targetAudience,
          generatedAt: new Date().toISOString(),
          estimatedReadTime: content.estimatedReadTime || null,
          characterCount: (content.text || content.subject || "").length,
        },
      },
    })
  } catch (error) {
    console.error("Error generating marketing content:", error)
    return NextResponse.json(
      {
        error: "Failed to generate marketing content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get("contentType")

    const availableContentTypes = {
      "email-marketing": {
        description: "E-mails promocionais e informativos",
        platforms: ["email"],
        tones: ["professional", "friendly", "urgent", "casual"],
      },
      "social-media": {
        description: "Conteúdo para redes sociais",
        platforms: ["instagram", "facebook", "twitter", "linkedin"],
        tones: ["casual", "professional", "fun", "inspiring"],
      },
      "blog-post": {
        description: "Artigos para blog",
        platforms: ["website", "blog"],
        tones: ["informative", "professional", "casual", "technical"],
      },
      "product-announcement": {
        description: "Anúncios de produtos",
        platforms: ["all"],
        tones: ["exciting", "professional", "urgent", "informative"],
      },
      newsletter: {
        description: "Boletins informativos",
        platforms: ["email"],
        tones: ["professional", "friendly", "informative"],
      },
      "whatsapp-message": {
        description: "Mensagens para WhatsApp",
        platforms: ["whatsapp"],
        tones: ["casual", "friendly", "professional"],
      },
    }

    if (contentType && !availableContentTypes[contentType]) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        availableContentTypes: contentType
          ? { [contentType]: availableContentTypes[contentType] }
          : availableContentTypes,
        supportedPlatforms: ["instagram", "facebook", "twitter", "linkedin", "email", "whatsapp", "website", "blog"],
        availableTones: [
          "professional",
          "friendly",
          "casual",
          "urgent",
          "exciting",
          "informative",
          "fun",
          "inspiring",
          "technical",
        ],
        businessInfo: {
          storeName: "Volaron",
          categories: [
            "moedores",
            "escadas",
            "jardinagem",
            "raladores",
            "trituradores",
            "serras-de-fita",
            "cilindros-de-massa",
            "lavanderia",
            "utilidades-domesticas",
            "cozinha-buffet",
          ],
        },
      },
    })
  } catch (error) {
    console.error("Error fetching marketing content info:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch marketing content information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
