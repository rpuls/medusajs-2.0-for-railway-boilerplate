import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface MarketingContentRequest {
  productData: any
  type: "email" | "social" | "ad" | "blog" | "newsletter"
  target?: string
  tone?: "professional" | "casual" | "urgent" | "friendly"
  length?: "short" | "medium" | "long"
}

interface MarketingContent {
  type: string
  title: string
  content: string
  callToAction: string
  hashtags?: string[]
  subject?: string
  preview?: string
  variations?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const {
      productData,
      type,
      target = "geral",
      tone = "friendly",
      length = "medium",
    }: MarketingContentRequest = await request.json()

    if (!productData || !type) {
      return NextResponse.json({ success: false, error: "Dados do produto e tipo são obrigatórios" }, { status: 400 })
    }

    // Verificar configuração da IA
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "IA não configurada" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
    })

    // Construir prompt específico para o tipo de conteúdo
    const prompt = buildMarketingPrompt(productData, type, target, tone, length)

    // Gerar conteúdo
    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()

    // Processar resposta
    const content = parseMarketingResponse(generatedText, type, productData)

    return NextResponse.json({
      success: true,
      data: content,
    })
  } catch (error) {
    console.error("Erro na geração de conteúdo de marketing:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno na geração",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contentType = searchParams.get("type")
    const productId = searchParams.get("productId")

    if (!contentType) {
      return NextResponse.json({ success: false, error: "Tipo de conteúdo é obrigatório" }, { status: 400 })
    }

    // Retornar exemplo de conteúdo baseado no tipo
    const mockContent = generateMockContent(contentType, productId)

    return NextResponse.json({
      success: true,
      data: mockContent,
    })
  } catch (error) {
    console.error("Erro ao buscar conteúdo:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar conteúdo" }, { status: 500 })
  }
}

function buildMarketingPrompt(productData: any, type: string, target: string, tone: string, length: string): string {
  const baseContext = `
Você é um especialista em marketing digital para e-commerce brasileiro.
Crie conteúdo de marketing para a Volaron Store, especializada em utilidades domésticas.

PRODUTO:
${JSON.stringify(productData, null, 2)}

TIPO DE CONTEÚDO: ${type}
PÚBLICO-ALVO: ${target}
TOM: ${tone}
TAMANHO: ${length}

CONTEXTO DA MARCA:
- Volaron Store: líder em utilidades domésticas
- Valores: qualidade, praticidade, bom preço
- Público: famílias brasileiras, classe média
- Diferencial: atendimento personalizado e produtos selecionados
`

  let specificInstructions = ""

  switch (type) {
    case "email":
      specificInstructions = `
INSTRUÇÕES PARA EMAIL MARKETING:
1. Crie um assunto atrativo (máx 50 chars)
2. Texto de preview envolvente
3. Conteúdo persuasivo mas não invasivo
4. Call-to-action claro e direto
5. Personalização quando possível

FORMATO DE RESPOSTA (JSON):
{
  "type": "email",
  "subject": "Assunto do email",
  "preview": "Texto de preview",
  "title": "Título principal",
  "content": "Conteúdo completo do email",
  "callToAction": "Texto do botão CTA",
  "variations": ["variação 1 do assunto", "variação 2"]
}
`
      break

    case "social":
      specificInstructions = `
INSTRUÇÕES PARA REDES SOCIAIS:
1. Conteúdo engajante e visual
2. Hashtags relevantes (#volaron #casa #utilidades)
3. Call-to-action natural
4. Linguagem adequada à plataforma
5. Máximo 280 caracteres para Twitter, mais livre para Instagram/Facebook

FORMATO DE RESPOSTA (JSON):
{
  "type": "social",
  "title": "Título/Headline",
  "content": "Texto da postagem",
  "callToAction": "CTA da postagem",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "variations": ["variação 1", "variação 2"]
}
`
      break

    case "ad":
      specificInstructions = `
INSTRUÇÕES PARA ANÚNCIO:
1. Headline impactante
2. Descrição persuasiva
3. Benefícios claros
4. Urgência quando apropriado
5. CTA forte e direto

FORMATO DE RESPOSTA (JSON):
{
  "type": "ad",
  "title": "Headline do anúncio",
  "content": "Texto do anúncio",
  "callToAction": "Botão de ação",
  "variations": ["headline alternativo 1", "headline alternativo 2"]
}
`
      break

    default:
      specificInstructions = `
INSTRUÇÕES GERAIS:
1. Conteúdo atrativo e relevante
2. Linguagem clara e objetiva
3. Foco nos benefícios do produto
4. Call-to-action apropriado

FORMATO DE RESPOSTA (JSON):
{
  "type": "${type}",
  "title": "Título do conteúdo",
  "content": "Conteúdo principal",
  "callToAction": "Ação desejada"
}
`
  }

  return `${baseContext}\n${specificInstructions}\n\nResponda APENAS com o JSON, sem explicações adicionais.`
}

function parseMarketingResponse(generatedText: string, type: string, productData: any): MarketingContent {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        type: parsed.type || type,
        title: parsed.title || `${productData.name} - Volaron Store`,
        content: parsed.content || "Conteúdo não disponível",
        callToAction: parsed.callToAction || "Compre Agora",
        hashtags: parsed.hashtags || [],
        subject: parsed.subject,
        preview: parsed.preview,
        variations: parsed.variations || [],
      }
    }
  } catch (error) {
    console.error("Erro ao processar resposta da IA:", error)
  }

  // Fallback para conteúdo básico
  return generateFallbackContent(type, productData)
}

function generateFallbackContent(type: string, productData: any): MarketingContent {
  const productName = productData.name || "Produto"

  switch (type) {
    case "email":
      return {
        type: "email",
        title: `Oferta Especial: ${productName}`,
        content: `
Olá!

Temos uma oferta especial para você na Volaron Store!

O ${productName} está com condições imperdíveis. Não perca esta oportunidade de levar qualidade para sua casa com o melhor preço.

✅ Qualidade garantida
✅ Entrega rápida
✅ Atendimento especializado

Aproveite enquanto durarem os estoques!
        `.trim(),
        callToAction: "Ver Oferta",
        subject: `🏠 Oferta Especial: ${productName}`,
        preview: "Não perca esta oportunidade imperdível!",
      }

    case "social":
      return {
        type: "social",
        title: `${productName} na Volaron! 🏠`,
        content: `
🌟 ${productName} chegou na Volaron Store!

Qualidade que você já conhece, preço que você vai amar. 

#VolaronStore #Casa #Qualidade #Oferta
        `.trim(),
        callToAction: "Compre Agora",
        hashtags: ["#VolaronStore", "#Casa", "#Qualidade", "#Oferta"],
      }

    case "ad":
      return {
        type: "ad",
        title: `${productName} - Qualidade Volaron`,
        content: `
Descubra o ${productName} na Volaron Store. 
Qualidade garantida, preço justo e entrega rápida.
Sua casa merece o melhor!
        `.trim(),
        callToAction: "Comprar Agora",
      }

    default:
      return {
        type,
        title: `${productName} - Volaron Store`,
        content: `Conheça o ${productName} na Volaron Store. Qualidade e praticidade para sua casa.`,
        callToAction: "Saiba Mais",
      }
  }
}

function generateMockContent(contentType: string, productId?: string | null): MarketingContent {
  const productName = productId ? `Produto ${productId}` : "Produto Exemplo"

  return generateFallbackContent(contentType, { name: productName })
}
