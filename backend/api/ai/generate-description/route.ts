import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData } = body

    if (!productData || !productData.name) {
      return NextResponse.json({ error: "Dados do produto são obrigatórios (nome mínimo)" }, { status: 400 })
    }

    // Enriquecer dados do produto com contexto da Volaron
    const enrichedProductData = {
      ...productData,
      store_context: {
        brand: "Volaron",
        location: "Birigui, SP",
        expertise: "Especialista em utilidades domésticas desde 1995",
        target_audience: "Donas de casa, profissionais da cozinha, jardineiros",
      },
    }

    // Gerar descrição otimizada
    const description = await geminiAIService.generateProductDescription(enrichedProductData)

    // Gerar também SEO metadata
    const seoData = await geminiAIService.optimizeSEO({
      title: productData.name,
      description: description,
      category: productData.category || "Utilidades Domésticas",
      keywords: productData.keywords || [],
    })

    // Log para monitoramento
    console.log(`[AI] Descrição gerada para produto: ${productData.name}`)

    return NextResponse.json({
      success: true,
      description,
      seo: {
        title: seoData.optimized_title,
        meta_description: seoData.meta_description,
        keywords: seoData.keywords,
        structured_data: seoData.structured_data,
      },
      metadata: {
        generated_at: new Date().toISOString(),
        model_used: "gemini-1.5-flash-001",
        word_count: description.split(" ").length,
        reading_time: Math.ceil(description.split(" ").length / 200), // minutos
      },
    })
  } catch (error) {
    console.error("Erro na geração de descrição:", error)

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
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 })
    }

    // Buscar produto no banco (simulado)
    const productData = {
      id: productId,
      name: "Moedor de Carne Elétrico 22",
      category: "Moedores",
      features: ["Motor potente", "Fácil limpeza", "Compacto"],
      specifications: {
        power: "500W",
        material: "Aço inoxidável",
        capacity: "2kg/min",
      },
    }

    const description = await geminiAIService.generateProductDescription(productData)

    return NextResponse.json({
      success: true,
      product_id: productId,
      description,
      product_data: productData,
    })
  } catch (error) {
    console.error("Erro ao buscar descrição do produto:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
