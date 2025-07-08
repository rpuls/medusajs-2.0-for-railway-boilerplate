import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentType, data = {}, options = {} } = body

    if (!contentType) {
      return NextResponse.json({ error: "Tipo de conteúdo é obrigatório" }, { status: 400 })
    }

    const supportedTypes = ["email", "social", "blog", "ad", "newsletter", "sms"]
    if (!supportedTypes.includes(contentType)) {
      return NextResponse.json({ error: `Tipo não suportado. Use: ${supportedTypes.join(", ")}` }, { status: 400 })
    }

    // Configurações padrão
    const defaultOptions = {
      tone: "casual",
      target_audience: "clientes da volaron",
      include_cta: true,
      brand_voice: "amigável e confiável",
    }

    const finalOptions = { ...defaultOptions, ...options }

    // Enriquecer dados com contexto da Volaron
    const enrichedData = {
      ...data,
      brand_context: {
        name: "Volaron",
        tagline: "Qualidade para seu lar",
        values: ["Qualidade", "Confiança", "Praticidade", "Atendimento"],
        benefits: [
          "Entrega para todo o Brasil",
          "Parcelamento em até 12x sem juros",
          "Entrega local no mesmo dia",
          "Descontos à vista",
          "Atendimento especializado",
        ],
        contact: {
          phone: "(18) 3643-1990",
          email: "contato@volaron.com.br",
          hours: "Segunda à Sexta das 8h às 18h",
        },
      },
    }

    // Gerar conteúdo usando Gemini AI
    const content = await geminiAIService.generateMarketingContent(
      contentType as "email" | "social" | "blog",
      enrichedData,
    )

    // Processar conteúdo baseado no tipo
    const processedContent = await processMarketingContent(content, contentType, finalOptions)

    // Gerar variações
    const variations = await generateContentVariations(contentType, enrichedData, finalOptions)

    // Calcular métricas estimadas
    const metrics = calculateContentMetrics(processedContent, contentType)

    return NextResponse.json({
      success: true,
      content: processedContent,
      variations,
      metrics,
      metadata: {
        content_type: contentType,
        word_count: processedContent.split(" ").length,
        character_count: processedContent.length,
        estimated_reading_time: Math.ceil(processedContent.split(" ").length / 200),
        tone: finalOptions.tone,
        generated_at: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erro na geração de conteúdo de marketing:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

async function processMarketingContent(content: string, contentType: string, options: any): Promise<string> {
  let processed = content.trim()

  switch (contentType) {
    case "email":
      processed = processEmailContent(processed, options)
      break
    case "social":
      processed = processSocialContent(processed, options)
      break
    case "blog":
      processed = processBlogContent(processed, options)
      break
    case "ad":
      processed = processAdContent(processed, options)
      break
    case "newsletter":
      processed = processNewsletterContent(processed, options)
      break
    case "sms":
      processed = processSMSContent(processed, options)
      break
  }

  return processed
}

function processEmailContent(content: string, options: any): string {
  let processed = content

  // Adicionar estrutura de email se não existir
  if (!processed.includes("Assunto:")) {
    const lines = processed.split("\n")
    const subject = generateEmailSubject(processed)
    processed = `Assunto: ${subject}\n\n${processed}`
  }

  // Adicionar assinatura
  if (!processed.includes("Atenciosamente")) {
    processed += `\n\nAtenciosamente,\nEquipe Volaron\n\n📞 (18) 3643-1990\n📧 contato@volaron.com.br\n🌐 volaron.com.br`
  }

  return processed
}

function processSocialContent(content: string, options: any): string {
  let processed = content

  // Limitar caracteres para redes sociais
  if (processed.length > 280) {
    processed = processed.substring(0, 270) + "..."
  }

  // Adicionar hashtags se não existirem
  if (!processed.includes("#")) {
    const hashtags = generateHashtags(processed)
    processed += `\n\n${hashtags.join(" ")}`
  }

  // Adicionar emoji se apropriado
  if (options.tone === "casual" && !hasEmoji(processed)) {
    processed = addRelevantEmoji(processed)
  }

  return processed
}

function processBlogContent(content: string, options: any): string {
  let processed = content

  // Adicionar estrutura de blog se necessário
  if (!processed.includes("##") && !processed.includes("#")) {
    const lines = processed.split("\n")
    const title = lines[0] || "Artigo Volaron"
    processed = `# ${title}\n\n${processed}`
  }

  // Adicionar call-to-action no final
  if (options.include_cta && !processed.toLowerCase().includes("visite")) {
    processed += `\n\n---\n\n**Visite nossa loja online em volaron.com.br e descubra nossa linha completa de produtos para seu lar!**`
  }

  return processed
}

function processAdContent(content: string, options: any): string {
  let processed = content

  // Manter anúncios concisos
  if (processed.length > 150) {
    processed = processed.substring(0, 140) + "..."
  }

  // Adicionar CTA forte
  if (options.include_cta) {
    processed += "\n\n🛒 COMPRE AGORA!"
  }

  return processed
}

function processNewsletterContent(content: string, options: any): string {
  let processed = content

  // Adicionar cabeçalho de newsletter
  if (!processed.includes("Newsletter")) {
    processed = `📧 Newsletter Volaron\n${new Date().toLocaleDateString("pt-BR")}\n\n${processed}`
  }

  // Adicionar rodapé
  processed += `\n\n---\n\nVocê está recebendo este email porque se inscreveu em nossa newsletter.\nPara cancelar, responda este email com "CANCELAR".`

  return processed
}

function processSMSContent(content: string, options: any): string {
  let processed = content

  // Limitar a 160 caracteres
  if (processed.length > 160) {
    processed = processed.substring(0, 150) + "..."
  }

  // Adicionar identificação da Volaron
  if (!processed.toLowerCase().includes("volaron")) {
    processed = `Volaron: ${processed}`
  }

  return processed
}

function generateEmailSubject(content: string): string {
  const subjects = [
    "Oferta especial Volaron para você!",
    "Novidades em utilidades domésticas",
    "Desconto exclusivo - Volaron",
    "Produtos selecionados para seu lar",
    "Promoção imperdível - Volaron Store",
  ]

  return subjects[Math.floor(Math.random() * subjects.length)]
}

function generateHashtags(content: string): string[] {
  const baseHashtags = ["#Volaron", "#UtilidadesDomesticas", "#QualidadeParaSeuLar"]

  // Adicionar hashtags baseadas no conteúdo
  if (content.toLowerCase().includes("cozinha")) baseHashtags.push("#Cozinha")
  if (content.toLowerCase().includes("limpeza")) baseHashtags.push("#Limpeza")
  if (content.toLowerCase().includes("jardim")) baseHashtags.push("#Jardinagem")
  if (content.toLowerCase().includes("promoção")) baseHashtags.push("#Promocao")

  return baseHashtags.slice(0, 5) // Máximo 5 hashtags
}

function hasEmoji(text: string): boolean {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u
  return emojiRegex.test(text)
}

function addRelevantEmoji(content: string): string {
  const lowerContent = content.toLowerCase()

  if (lowerContent.includes("casa") || lowerContent.includes("lar")) {
    return "🏠 " + content
  }
  if (lowerContent.includes("cozinha")) {
    return "👨‍🍳 " + content
  }
  if (lowerContent.includes("limpeza")) {
    return "🧽 " + content
  }
  if (lowerContent.includes("jardim")) {
    return "🌱 " + content
  }
  if (lowerContent.includes("oferta") || lowerContent.includes("promoção")) {
    return "🔥 " + content
  }

  return "✨ " + content
}

async function generateContentVariations(contentType: string, data: any, options: any): Promise<any[]> {
  const variations = []

  try {
    // Variação com tom diferente
    const alternativeTones = ["formal", "casual", "promotional"]
    const currentTone = options.tone

    for (const tone of alternativeTones) {
      if (tone !== currentTone) {
        const variantOptions = { ...options, tone }
        const variant = await geminiAIService.generateMarketingContent(contentType as "email" | "social" | "blog", {
          ...data,
          tone,
        })

        variations.push({
          type: `${tone}_tone`,
          content: variant.substring(0, 200) + "...",
          full_content: variant,
        })

        break // Apenas uma variação para não sobrecarregar
      }
    }

    // Variação curta
    if (contentType !== "sms") {
      variations.push({
        type: "short_version",
        content: await generateShortVersion(data, contentType),
        full_content: await generateShortVersion(data, contentType),
      })
    }
  } catch (error) {
    console.error("Erro ao gerar variações:", error)
  }

  return variations
}

async function generateShortVersion(data: any, contentType: string): Promise<string> {
  const shortPrompts = {
    email: "Crie um email curto e direto para a Volaron",
    social: "Crie um post conciso para redes sociais da Volaron",
    blog: "Crie um resumo executivo para blog da Volaron",
    ad: "Crie um anúncio de 50 palavras para a Volaron",
    newsletter: "Crie uma newsletter resumida da Volaron",
    sms: "Crie um SMS promocional da Volaron",
  }

  return `Versão resumida: ${data.product?.name || "Produtos Volaron"} - Qualidade garantida, entrega rápida, parcelamento sem juros. Visite volaron.com.br`
}

function calculateContentMetrics(content: string, contentType: string) {
  const wordCount = content.split(" ").length
  const charCount = content.length

  const metrics = {
    word_count: wordCount,
    character_count: charCount,
    estimated_reading_time: Math.ceil(wordCount / 200),
    engagement_score: calculateEngagementScore(content, contentType),
    seo_score: calculateSEOScore(content),
    readability_score: calculateReadabilityScore(content),
  }

  return metrics
}

function calculateEngagementScore(content: string, contentType: string): number {
  let score = 50 // Base score

  // Pontos por elementos de engajamento
  if (content.includes("!")) score += 10
  if (content.includes("?")) score += 5
  if (hasEmoji(content)) score += 15
  if (content.toLowerCase().includes("você")) score += 10
  if (content.toLowerCase().includes("grátis") || content.toLowerCase().includes("desconto")) score += 20

  // Ajustes por tipo de conteúdo
  if (contentType === "social" && content.includes("#")) score += 10
  if (contentType === "email" && content.includes("Assunto:")) score += 5

  return Math.min(score, 100)
}

function calculateSEOScore(content: string): number {
  let score = 30 // Base score

  if (content.toLowerCase().includes("volaron")) score += 20
  if (content.toLowerCase().includes("utilidades domésticas")) score += 15
  if (content.toLowerCase().includes("qualidade")) score += 10
  if (content.length > 300) score += 15
  if (content.length < 2000) score += 10

  return Math.min(score, 100)
}

function calculateReadabilityScore(content: string): number {
  const sentences = content.split(/[.!?]+/).length
  const words = content.split(" ").length
  const avgWordsPerSentence = words / sentences

  let score = 100

  // Penalizar frases muito longas
  if (avgWordsPerSentence > 20) score -= 20
  if (avgWordsPerSentence > 30) score -= 30

  // Bonificar frases bem estruturadas
  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) score += 10

  return Math.max(score, 0)
}

export async function GET() {
  return NextResponse.json({
    endpoint: "Marketing Content Generator API",
    description: "Gera conteúdo de marketing otimizado usando IA",
    methods: ["POST"],
    supported_types: ["email", "social", "blog", "ad", "newsletter", "sms"],
    required_fields: ["contentType"],
    optional_fields: ["data", "options"],
    supported_options: {
      tone: ["casual", "formal", "promotional"],
      target_audience: "string",
      include_cta: "boolean",
      brand_voice: "string",
    },
    features: [
      "Geração de múltiplos tipos de conteúdo",
      "Otimização automática por tipo",
      "Variações de tom e estilo",
      "Métricas de engajamento estimadas",
      "Integração com marca Volaron",
    ],
  })
}
