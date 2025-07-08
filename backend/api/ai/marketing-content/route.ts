import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "../../../services"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentType, data } = body

    if (!contentType || !["email", "social", "blog"].includes(contentType)) {
      return NextResponse.json({ error: "Tipo de conteúdo inválido. Use: email, social ou blog" }, { status: 400 })
    }

    const content = await geminiAIService.generateMarketingContent(contentType, data || {})

    return NextResponse.json({
      success: true,
      content,
      contentType,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar conteúdo de marketing:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
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
    blog: [
      "Use um título atraente",
      "Inclua imagens relevantes",
      "Estruture seu conteúdo com subtítulos",
      "Inclua call-to-action no final",
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
    blog: [
      "Use meta descrições atraentes",
      "Inclua links internos",
      "Optimize para SEO",
      "Promova seu conteúdo nas redes sociais",
    ],
  }

  return practices[type as keyof typeof practices] || []
}
