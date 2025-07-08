import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productData, type, customPrompt } = body

    if (!productData) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados do produto são obrigatórios",
        },
        { status: 400 },
      )
    }

    if (!type || !["email", "social", "ad"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo de conteúdo deve ser: email, social ou ad",
        },
        { status: 400 },
      )
    }

    const vertexAI = getVertexAIService()
    let content: string

    if (customPrompt) {
      // Usar prompt customizado
      content = await vertexAI.generateText({
        prompt: customPrompt,
        systemPrompt: `Você é um especialista em marketing para a loja Volaron. 
        Crie conteúdo ${type} para o produto: ${JSON.stringify(productData)}`,
        temperature: 0.8,
        maxTokens: 500,
      })
    } else {
      // Usar método específico para marketing
      content = await vertexAI.generateMarketingContent(productData, type)
    }

    // Análise do conteúdo gerado
    const analysis = {
      wordCount: content.split(" ").length,
      characterCount: content.length,
      estimatedReadTime: Math.ceil(content.split(" ").length / 200), // palavras por minuto
      tone: detectTone(content),
      hasCallToAction: detectCallToAction(content),
    }

    return NextResponse.json({
      success: true,
      data: {
        productId: productData.id || null,
        productName: productData.name || productData.title,
        contentType: type,
        content,
        analysis,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Erro ao gerar conteúdo de marketing:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const productId = searchParams.get("productId")

    if (!type || !["email", "social", "ad"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Tipo de conteúdo deve ser: email, social ou ad",
        },
        { status: 400 },
      )
    }

    // Exemplos de conteúdo por tipo
    const examples = {
      email: {
        subject: "🌿 Transforme seu jardim com nossa nova coleção!",
        content: `Olá!

Que tal dar uma nova vida ao seu jardim? Nossa nova coleção de produtos para jardinagem chegou com tudo!

✨ Mangueiras super resistentes
🌱 Ferramentas de qualidade profissional  
💧 Sistemas de irrigação inteligentes

Aproveite 15% OFF na primeira compra com o cupom JARDIM15

Visite nossa loja e descubra como deixar seu espaço verde ainda mais bonito!

Com carinho,
Equipe Volaron`,
      },
      social: {
        platform: "Instagram",
        content: `🌿 JARDIM DOS SONHOS começa aqui! 

Nossa nova coleção chegou para transformar seu espaço verde em um verdadeiro paraíso! 

✨ Produtos de qualidade
🚚 Entrega rápida  
💚 Preços que cabem no bolso

#Volaron #Jardinagem #CasaEJardim #PlantasEFlores #DecoracaoExterna

👆 Deslize para ver mais produtos incríveis!`,
      },
      ad: {
        headline: "Jardim Perfeito em 30 Dias",
        content: `Cansado de um jardim sem vida?

Com os produtos Volaron, você transforma qualquer espaço em um jardim exuberante em apenas 30 dias!

✅ Ferramentas profissionais
✅ Mangueiras ultra-resistentes  
✅ Suporte especializado
✅ Garantia de satisfação

OFERTA ESPECIAL: 20% OFF + Frete Grátis

Clique agora e comece sua transformação hoje mesmo!`,
      },
    }

    const example = examples[type as keyof typeof examples]

    return NextResponse.json({
      success: true,
      data: {
        type,
        example,
        tips: getMarketingTips(type),
        bestPractices: getBestPractices(type),
      },
    })
  } catch (error) {
    console.error("Erro ao buscar exemplos:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}

function detectTone(content: string): string {
  const enthusiasticWords = ["incrível", "fantástico", "maravilhoso", "perfeito", "!"]
  const professionalWords = ["qualidade", "profissional", "garantia", "especializado"]
  const casualWords = ["oi", "olá", "que tal", "vamos", "😊"]

  const enthusiasticCount = enthusiasticWords.filter((word) => content.toLowerCase().includes(word)).length
  const professionalCount = professionalWords.filter((word) => content.toLowerCase().includes(word)).length
  const casualCount = casualWords.filter((word) => content.toLowerCase().includes(word)).length

  if (enthusiasticCount > professionalCount && enthusiasticCount > casualCount) {
    return "enthusiastic"
  } else if (professionalCount > casualCount) {
    return "professional"
  } else {
    return "casual"
  }
}

function detectCallToAction(content: string): boolean {
  const ctaWords = ["clique", "compre", "visite", "acesse", "aproveite", "garanta", "descubra", "experimente"]
  return ctaWords.some((word) => content.toLowerCase().includes(word))
}

function getMarketingTips(type: string): string[] {
  const tips = {
    email: [
      "Use assunto atrativo e personalizado",
      "Inclua call-to-action claro",
      "Segmente sua lista de contatos",
      "Teste diferentes horários de envio",
    ],
    social: [
      "Use hashtags relevantes",
      "Inclua elementos visuais",
      "Poste nos melhores horários",
      "Engaje com comentários",
    ],
    ad: [
      "Foque no benefício principal",
      "Use urgência e escassez",
      "Teste diferentes headlines",
      "Inclua prova social",
    ],
  }

  return tips[type as keyof typeof tips] || []
}

function getBestPractices(type: string): string[] {
  const practices = {
    email: [
      "Mantenha design responsivo",
      "Evite spam words",
      "Personalize o conteúdo",
      "Monitore métricas de abertura",
    ],
    social: [
      "Mantenha consistência visual",
      "Conte histórias",
      "Use user-generated content",
      "Analise insights regularmente",
    ],
    ad: ["Teste A/B constantemente", "Otimize para conversão", "Use targeting preciso", "Monitore ROI"],
  }

  return practices[type as keyof typeof practices] || []
}
