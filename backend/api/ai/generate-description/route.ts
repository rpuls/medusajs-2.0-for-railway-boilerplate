import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData, options = {} } = body

    if (!productData?.name) {
      return NextResponse.json({ error: "Nome do produto é obrigatório" }, { status: 400 })
    }

    // Configurações padrão
    const defaultOptions = {
      length: "medium", // short, medium, long
      tone: "commercial", // commercial, technical, casual
      include_seo: true,
      include_benefits: true,
      target_audience: "geral",
    }

    const finalOptions = { ...defaultOptions, ...options }

    // Enriquecer dados do produto com informações da Volaron
    const enrichedProductData = {
      ...productData,
      store_context: {
        name: "Volaron",
        specialty: "Utilidades domésticas de qualidade",
        benefits: [
          "Entrega para todo o Brasil",
          "Parcelamento em até 12x sem juros",
          "Entrega local no mesmo dia",
          "Descontos à vista",
        ],
      },
    }

    // Gerar descrição usando Gemini AI
    const description = await geminiAIService.generateProductDescription(enrichedProductData)

    // Processar e otimizar a descrição
    const processedDescription = processDescription(description, finalOptions)

    // Gerar metadados SEO se solicitado
    let seoData = null
    if (finalOptions.include_seo) {
      seoData = await generateSEOMetadata(productData, description)
    }

    // Gerar variações da descrição
    const variations = await generateDescriptionVariations(productData, finalOptions)

    return NextResponse.json({
      success: true,
      description: processedDescription,
      seo: seoData,
      variations,
      metadata: {
        word_count: processedDescription.split(" ").length,
        reading_time: Math.ceil(processedDescription.split(" ").length / 200),
        tone: finalOptions.tone,
        length: finalOptions.length,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erro na geração de descrição:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

function processDescription(description: string, options: any): string {
  let processed = description.trim()

  // Ajustar comprimento
  if (options.length === "short" && processed.length > 300) {
    const sentences = processed.split(". ")
    processed = sentences.slice(0, 2).join(". ") + "."
  } else if (options.length === "long" && processed.length < 500) {
    processed +=
      "\n\nEste produto da Volaron combina qualidade e praticidade, sendo ideal para uso doméstico. Aproveite nossas condições especiais de pagamento e entrega."
  }

  // Adicionar call-to-action baseado no tom
  if (options.tone === "commercial") {
    processed += "\n\n🛒 Compre agora e aproveite nossas condições especiais!"
  }

  return processed
}

async function generateSEOMetadata(productData: any, description: string) {
  try {
    const seoContent = {
      title: productData.name,
      description: description.substring(0, 160),
      keywords: extractKeywords(productData, description),
      category: productData.category || "Utilidades Domésticas",
    }

    const optimizedSEO = await geminiAIService.optimizeSEO(seoContent)

    return {
      title: optimizedSEO.optimized_title,
      meta_description: optimizedSEO.meta_description,
      keywords: optimizedSEO.keywords,
      schema_markup: generateSchemaMarkup(productData, optimizedSEO),
    }
  } catch (error) {
    console.error("Erro ao gerar SEO:", error)
    return null
  }
}

function extractKeywords(productData: any, description: string): string[] {
  const keywords = []

  // Adicionar nome do produto
  if (productData.name) {
    keywords.push(productData.name.toLowerCase())
  }

  // Adicionar categoria
  if (productData.category) {
    keywords.push(productData.category.toLowerCase())
  }

  // Adicionar características
  if (productData.features) {
    keywords.push(...productData.features.map((f: string) => f.toLowerCase()))
  }

  // Palavras-chave da Volaron
  keywords.push("volaron", "utilidades domésticas", "qualidade", "entrega rápida")

  return [...new Set(keywords)] // Remover duplicatas
}

function generateSchemaMarkup(productData: any, seoData: any) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productData.name,
    description: seoData.meta_description,
    category: productData.category,
    brand: {
      "@type": "Brand",
      name: "Volaron",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: productData.price || "0",
      priceCurrency: "BRL",
      seller: {
        "@type": "Organization",
        name: "Volaron",
      },
    },
  }
}

async function generateDescriptionVariations(productData: any, options: any): Promise<string[]> {
  const variations = []

  try {
    // Variação técnica
    if (options.tone !== "technical") {
      const technicalData = { ...productData }
      const technicalDesc = await geminiAIService.generateProductDescription(technicalData)
      variations.push({
        type: "technical",
        description: technicalDesc.substring(0, 200) + "...",
      })
    }

    // Variação casual
    if (options.tone !== "casual") {
      const casualData = { ...productData }
      const casualDesc = await geminiAIService.generateProductDescription(casualData)
      variations.push({
        type: "casual",
        description: casualDesc.substring(0, 200) + "...",
      })
    }

    // Variação focada em benefícios
    variations.push({
      type: "benefits_focused",
      description: `${productData.name} - Ideal para sua casa! ✨ Qualidade garantida, entrega rápida e parcelamento sem juros. A Volaron oferece os melhores produtos para seu lar.`,
    })
  } catch (error) {
    console.error("Erro ao gerar variações:", error)
  }

  return variations
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Product Description Generator API",
    description: "Gera descrições otimizadas para produtos usando IA",
    methods: ["POST"],
    required_fields: ["productData.name"],
    optional_fields: ["productData.category", "productData.features", "options"],
    supported_options: {
      length: ["short", "medium", "long"],
      tone: ["commercial", "technical", "casual"],
      include_seo: "boolean",
      include_benefits: "boolean",
      target_audience: "string",
    },
  })
}
