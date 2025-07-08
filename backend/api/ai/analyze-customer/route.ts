import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface CustomerData {
  id?: string
  email?: string
  name?: string
  orders?: any[]
  behavior?: any
  preferences?: any
  demographics?: any
}

interface AnalysisResult {
  customerId: string
  analysisType: string
  analysis: {
    summary: string
    insights: string[]
    recommendations: string[]
    confidence: number
    segments: string[]
    riskLevel: "low" | "medium" | "high"
    lifetimeValue: number
    churnProbability: number
  }
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const { customerData, analysisType = "behavior" } = await request.json()

    if (!customerData) {
      return NextResponse.json({ success: false, error: "Dados do cliente são obrigatórios" }, { status: 400 })
    }

    // Verificar se Gemini AI está configurado
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Gemini AI não configurado" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
    })

    // Construir prompt para análise
    const prompt = buildAnalysisPrompt(customerData, analysisType)

    // Gerar análise
    const result = await model.generateContent(prompt)
    const response = await result.response
    const analysisText = response.text()

    // Processar resposta da IA
    const analysis = parseAnalysisResponse(analysisText, customerData)

    const analysisResult: AnalysisResult = {
      customerId: customerData.id || customerData.email || "unknown",
      analysisType,
      analysis,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: analysisResult,
    })
  } catch (error) {
    console.error("Erro na análise do cliente:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno na análise",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get("customerId")

    if (!customerId) {
      return NextResponse.json({ success: false, error: "ID do cliente é obrigatório" }, { status: 400 })
    }

    // Em um cenário real, buscaríamos do banco de dados
    // Por enquanto, retornamos uma análise simulada
    const mockAnalysis: AnalysisResult = {
      customerId,
      analysisType: "behavior",
      analysis: {
        summary: "Cliente com comportamento de compra regular e alta fidelidade",
        insights: [
          "Compra principalmente produtos de jardinagem",
          "Prefere compras aos fins de semana",
          "Sensível a promoções de desconto",
          "Alta taxa de abertura de emails",
        ],
        recommendations: [
          "Oferecer produtos complementares de jardinagem",
          "Enviar ofertas especiais nas sextas-feiras",
          "Criar programa de fidelidade personalizado",
          "Segmentar campanhas de email marketing",
        ],
        confidence: 85,
        segments: ["Jardinagem", "Fidelidade Alta", "Sensível a Preço"],
        riskLevel: "low",
        lifetimeValue: 1250.0,
        churnProbability: 15,
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      data: mockAnalysis,
    })
  } catch (error) {
    console.error("Erro ao buscar análise:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar análise" }, { status: 500 })
  }
}

function buildAnalysisPrompt(customerData: CustomerData, analysisType: string): string {
  const basePrompt = `
Você é um especialista em análise de comportamento de clientes para e-commerce.
Analise os dados do cliente fornecidos e gere insights acionáveis.

DADOS DO CLIENTE:
${JSON.stringify(customerData, null, 2)}

TIPO DE ANÁLISE: ${analysisType}

INSTRUÇÕES:
1. Analise o comportamento de compra
2. Identifique padrões e tendências
3. Calcule métricas importantes (LTV, probabilidade de churn)
4. Sugira ações específicas
5. Determine segmentos de cliente
6. Avalie nível de risco

FORMATO DE RESPOSTA (JSON):
{
  "summary": "Resumo executivo da análise",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "confidence": 85,
  "segments": ["segmento 1", "segmento 2"],
  "riskLevel": "low|medium|high",
  "lifetimeValue": 1000.00,
  "churnProbability": 20
}

Responda APENAS com o JSON, sem explicações adicionais.
`

  return basePrompt.trim()
}

function parseAnalysisResponse(analysisText: string, customerData: CustomerData) {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        summary: parsed.summary || "Análise não disponível",
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        confidence: parsed.confidence || 50,
        segments: parsed.segments || [],
        riskLevel: parsed.riskLevel || "medium",
        lifetimeValue: parsed.lifetimeValue || 0,
        churnProbability: parsed.churnProbability || 50,
      }
    }
  } catch (error) {
    console.error("Erro ao processar resposta da IA:", error)
  }

  // Fallback para análise básica
  return {
    summary: "Cliente analisado com base nos dados disponíveis",
    insights: ["Dados limitados disponíveis para análise", "Recomenda-se coleta de mais informações comportamentais"],
    recommendations: ["Implementar tracking de comportamento", "Coletar feedback direto do cliente"],
    confidence: 30,
    segments: ["Dados Limitados"],
    riskLevel: "medium" as const,
    lifetimeValue: 0,
    churnProbability: 50,
  }
}
