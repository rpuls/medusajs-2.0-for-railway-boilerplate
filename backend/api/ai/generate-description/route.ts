import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const {
      productName,
      category,
      specifications,
      features,
      targetAudience,
      descriptionType = "complete",
    } = await request.json()

    if (!productName || !category) {
      return NextResponse.json({ error: "Product name and category are required" }, { status: 400 })
    }

    // Contexto específico da Volaron
    const businessContext = {
      storeName: "Volaron",
      businessType: "utilidades-domesticas-jardinagem",
      targetMarket: "brasil",
      categories: {
        moedores: "Equipamentos para moer grãos, café, temperos",
        escadas: "Escadas domésticas e profissionais",
        jardinagem: "Ferramentas e equipamentos para jardim",
        raladores: "Utensílios para ralar alimentos",
        trituradores: "Equipamentos para triturar materiais",
        "serras-de-fita": "Serras para cortes precisos",
        "cilindros-de-massa": "Equipamentos para massa",
        lavanderia: "Produtos para lavanderia",
        "utilidades-domesticas": "Utensílios domésticos diversos",
        "cozinha-buffet": "Equipamentos para cozinha profissional",
      },
    }

    // Gerar diferentes tipos de descrição
    const descriptions = await Promise.all([
      // Descrição principal
      geminiAIService.generateProductDescription({
        productName,
        category,
        specifications: specifications || {},
        features: features || [],
        businessContext,
        style: "persuasive-informative",
        length: "medium",
      }),

      // Descrição curta para listagens
      geminiAIService.generateProductDescription({
        productName,
        category,
        specifications: specifications || {},
        features: features || [],
        businessContext,
        style: "concise-appealing",
        length: "short",
      }),

      // Descrição técnica
      geminiAIService.generateProductDescription({
        productName,
        category,
        specifications: specifications || {},
        features: features || [],
        businessContext,
        style: "technical-detailed",
        length: "long",
      }),
    ])

    // Gerar tags SEO
    const seoTags = await geminiAIService.generateSEOTags({
      productName,
      category,
      description: descriptions[0].content,
      businessContext,
    })

    // Gerar títulos alternativos
    const alternativeTitles = await geminiAIService.generateAlternativeTitles({
      productName,
      category,
      features: features || [],
      maxTitles: 5,
    })

    return NextResponse.json({
      success: true,
      data: {
        descriptions: {
          main: descriptions[0],
          short: descriptions[1],
          technical: descriptions[2],
        },
        seo: {
          tags: seoTags.tags,
          metaDescription: seoTags.metaDescription,
          keywords: seoTags.keywords,
        },
        alternativeTitles: alternativeTitles,
        metadata: {
          generatedAt: new Date().toISOString(),
          category: category,
          targetAudience: targetAudience || "geral",
        },
      },
    })
  } catch (error) {
    console.error("Error generating product description:", error)
    return NextResponse.json(
      {
        error: "Failed to generate product description",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const category = searchParams.get("category")

    if (!productId && !category) {
      return NextResponse.json({ error: "Product ID or category parameter is required" }, { status: 400 })
    }

    // Buscar descrições existentes ou templates por categoria
    let templates = {}

    if (category) {
      templates = await geminiAIService.getDescriptionTemplates(category)
    }

    return NextResponse.json({
      success: true,
      data: {
        templates: templates,
        availableStyles: ["persuasive-informative", "concise-appealing", "technical-detailed"],
        availableLengths: ["short", "medium", "long"],
        supportedCategories: Object.keys({
          moedores: true,
          escadas: true,
          jardinagem: true,
          raladores: true,
          trituradores: true,
          "serras-de-fita": true,
          "cilindros-de-massa": true,
          lavanderia: true,
          "utilidades-domesticas": true,
          "cozinha-buffet": true,
        }),
      },
    })
  } catch (error) {
    console.error("Error fetching description templates:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch description templates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
