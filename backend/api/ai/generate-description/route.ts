import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface ProductData {
  name: string
  category?: string
  features?: string[]
  specifications?: any
  price?: number
  brand?: string
  images?: string[]
  keywords?: string[]
}

interface GeneratedDescription {
  title: string
  shortDescription: string
  fullDescription: string
  features: string[]
  seoTitle: string
  seoDescription: string
  keywords: string[]
  specifications: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { productData, style = "professional", length = "medium" } = await request.json()

    if (!productData || !productData.name) {
      return NextResponse.json({ success: false, error: "Dados do produto são obrigatórios" }, { status: 400 })
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

    // Construir prompt para geração de descrição
    const prompt = buildDescriptionPrompt(productData, style, length)

    // Gerar descrição
    const result = await model.generateContent(prompt)
    const response = await result.response
    const generatedText = response.text()

    // Processar resposta
    const description = parseDescriptionResponse(generatedText, productData)

    return NextResponse.json({
      success: true,
      data: description,
    })
  } catch (error) {
    console.error("Erro na geração de descrição:", error)
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
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ success: false, error: "ID do produto é obrigatório" }, { status: 400 })
    }

    // Em um cenário real, buscaríamos do banco de dados
    // Por enquanto, retornamos uma descrição de exemplo
    const mockDescription: GeneratedDescription = {
      title: "Produto de Exemplo - Volaron Store",
      shortDescription: "Produto de alta qualidade para uso doméstico",
      fullDescription: `
Este produto foi cuidadosamente selecionado pela equipe da Volaron Store para oferecer 
a melhor experiência aos nossos clientes. Fabricado com materiais de primeira qualidade, 
combina funcionalidade e durabilidade em um design moderno e elegante.

Ideal para uso doméstico, este produto atende às mais altas exigências de qualidade e 
performance. Sua construção robusta garante longa vida útil, enquanto seu design 
intuitivo facilita o uso no dia a dia.
      `.trim(),
      features: [
        "Material de alta qualidade",
        "Design moderno e funcional",
        "Fácil de usar e manter",
        "Durabilidade comprovada",
      ],
      seoTitle: "Produto de Exemplo | Volaron Store - Qualidade Garantida",
      seoDescription:
        "Descubra o Produto de Exemplo da Volaron Store. Alta qualidade, design moderno e preço justo. Compre agora com entrega rápida!",
      keywords: ["produto", "qualidade", "casa", "volaron", "utilidades"],
      specifications: [
        "Dimensões: Conforme especificação",
        "Material: Alta qualidade",
        "Garantia: 12 meses",
        "Origem: Nacional",
      ],
    }

    return NextResponse.json({
      success: true,
      data: mockDescription,
    })
  } catch (error) {
    console.error("Erro ao buscar descrição:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar descrição" }, { status: 500 })
  }
}

function buildDescriptionPrompt(productData: ProductData, style: string, length: string): string {
  const prompt = `
Você é um especialista em copywriting para e-commerce, especializado em produtos para casa e jardim.
Crie uma descrição completa e atrativa para o produto da Volaron Store.

DADOS DO PRODUTO:
Nome: ${productData.name}
Categoria: ${productData.category || "Não especificada"}
Características: ${productData.features?.join(", ") || "Não especificadas"}
Preço: ${productData.price ? `R$ ${productData.price.toFixed(2)}` : "Não informado"}
Marca: ${productData.brand || "Não especificada"}
Palavras-chave: ${productData.keywords?.join(", ") || "Não especificadas"}

ESTILO: ${style} (professional, casual, técnico)
TAMANHO: ${length} (short, medium, long)

INSTRUÇÕES:
1. Crie um título atrativo e otimizado para SEO
2. Escreva uma descrição curta (1-2 frases) para listagens
3. Desenvolva uma descrição completa e persuasiva
4. Liste características principais em tópicos
5. Crie título e descrição SEO otimizados
6. Sugira palavras-chave relevantes
7. Inclua especificações técnicas quando aplicável

CONTEXTO DA LOJA:
- Volaron Store: especializada em utilidades domésticas
- Público: famílias brasileiras, classe média
- Foco: qualidade, praticidade e bom preço
- Tom: profissional mas acessível

FORMATO DE RESPOSTA (JSON):
{
  "title": "Título do produto",
  "shortDescription": "Descrição curta para listagens",
  "fullDescription": "Descrição completa e detalhada",
  "features": ["característica 1", "característica 2"],
  "seoTitle": "Título otimizado para SEO (máx 60 chars)",
  "seoDescription": "Meta descrição SEO (máx 160 chars)",
  "keywords": ["palavra-chave 1", "palavra-chave 2"],
  "specifications": ["especificação 1", "especificação 2"]
}

Responda APENAS com o JSON, sem explicações adicionais.
`

  return prompt.trim()
}

function parseDescriptionResponse(generatedText: string, productData: ProductData): GeneratedDescription {
  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        title: parsed.title || productData.name,
        shortDescription: parsed.shortDescription || "Produto de qualidade da Volaron Store",
        fullDescription: parsed.fullDescription || "Descrição não disponível",
        features: parsed.features || [],
        seoTitle: parsed.seoTitle || `${productData.name} | Volaron Store`,
        seoDescription: parsed.seoDescription || `Compre ${productData.name} na Volaron Store com qualidade garantida`,
        keywords: parsed.keywords || [],
        specifications: parsed.specifications || [],
      }
    }
  } catch (error) {
    console.error("Erro ao processar resposta da IA:", error)
  }

  // Fallback para descrição básica
  return {
    title: productData.name,
    shortDescription: `${productData.name} - Produto de qualidade da Volaron Store`,
    fullDescription: `
O ${productData.name} é um produto cuidadosamente selecionado pela Volaron Store 
para oferecer a melhor experiência aos nossos clientes. 

${productData.category ? `Categoria: ${productData.category}` : ""}
${productData.features ? `Características: ${productData.features.join(", ")}` : ""}

Fabricado com materiais de qualidade, este produto combina funcionalidade e 
durabilidade, sendo ideal para uso doméstico.
    `.trim(),
    features: productData.features || ["Qualidade garantida", "Uso doméstico", "Durabilidade"],
    seoTitle: `${productData.name} | Volaron Store`,
    seoDescription: `Compre ${productData.name} na Volaron Store. Qualidade garantida e entrega rápida!`,
    keywords: [productData.name.toLowerCase(), "volaron", "casa", "qualidade"],
    specifications: ["Material: Conforme especificação", "Garantia: 12 meses"],
  }
}
