const { Server } = require("@modelcontextprotocol/sdk/server/index.js")
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js")
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js")
const { GoogleGenerativeAI } = require("@google/generative-ai")

class GeminiAIServer {
  constructor() {
    this.server = new Server(
      {
        name: "gemini-ai-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({
      model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
    })

    this.setupToolHandlers()
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "generate_text",
            description: "Gerar texto usando Gemini AI",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "Prompt para geração de texto",
                },
                maxTokens: {
                  type: "number",
                  description: "Número máximo de tokens",
                  default: 1000,
                },
              },
              required: ["prompt"],
            },
          },
          {
            name: "generate_product_description",
            description: "Gerar descrição de produto otimizada",
            inputSchema: {
              type: "object",
              properties: {
                productName: { type: "string", description: "Nome do produto" },
                category: { type: "string", description: "Categoria do produto" },
                features: { type: "array", items: { type: "string" }, description: "Características do produto" },
                targetAudience: { type: "string", description: "Público-alvo" },
              },
              required: ["productName"],
            },
          },
          {
            name: "optimize_seo",
            description: "Otimizar conteúdo para SEO",
            inputSchema: {
              type: "object",
              properties: {
                content: { type: "string", description: "Conteúdo a ser otimizado" },
                keywords: { type: "array", items: { type: "string" }, description: "Palavras-chave alvo" },
                type: { type: "string", enum: ["product", "category", "blog"], description: "Tipo de conteúdo" },
              },
              required: ["content"],
            },
          },
          {
            name: "analyze_customer_query",
            description: "Analisar consulta de cliente e sugerir produtos",
            inputSchema: {
              type: "object",
              properties: {
                query: { type: "string", description: "Consulta do cliente" },
                context: { type: "string", description: "Contexto adicional" },
              },
              required: ["query"],
            },
          },
          {
            name: "generate_marketing_content",
            description: "Gerar conteúdo de marketing",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["email", "social", "ad", "newsletter"],
                  description: "Tipo de conteúdo de marketing",
                },
                product: { type: "string", description: "Produto ou serviço" },
                tone: {
                  type: "string",
                  enum: ["professional", "casual", "enthusiastic", "informative"],
                  description: "Tom do conteúdo",
                },
                length: { type: "string", enum: ["short", "medium", "long"], description: "Tamanho do conteúdo" },
              },
              required: ["type", "product"],
            },
          },
        ],
      }
    })

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case "generate_text":
            return await this.generateText(args)
          case "generate_product_description":
            return await this.generateProductDescription(args)
          case "optimize_seo":
            return await this.optimizeSEO(args)
          case "analyze_customer_query":
            return await this.analyzeCustomerQuery(args)
          case "generate_marketing_content":
            return await this.generateMarketingContent(args)
          default:
            throw new Error(`Ferramenta desconhecida: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Erro ao executar ${name}: ${error.message}`,
            },
          ],
          isError: true,
        }
      }
    })
  }

  async generateText(args) {
    const { prompt, maxTokens = 1000 } = args

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                generatedText: text,
                tokensUsed: text.length,
                model: process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash-001",
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao gerar texto",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async generateProductDescription(args) {
    const { productName, category, features = [], targetAudience } = args

    const prompt = `
Gere uma descrição de produto profissional e atrativa para:

Produto: ${productName}
Categoria: ${category || "Não especificada"}
Características: ${features.length > 0 ? features.join(", ") : "Não especificadas"}
Público-alvo: ${targetAudience || "Geral"}

A descrição deve:
- Ser persuasiva e informativa
- Destacar os benefícios principais
- Usar linguagem adequada ao público-alvo
- Ter entre 100-200 palavras
- Incluir call-to-action sutil
- Ser otimizada para SEO

Formato: Apenas a descrição, sem títulos ou formatação extra.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const description = response.text()

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                description: description.trim(),
                productName,
                category,
                features,
                targetAudience,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao gerar descrição do produto",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async optimizeSEO(args) {
    const { content, keywords = [], type = "product" } = args

    const prompt = `
Otimize o seguinte conteúdo para SEO:

Conteúdo original:
${content}

Palavras-chave alvo: ${keywords.join(", ")}
Tipo de conteúdo: ${type}

Tarefas:
1. Reescrever o conteúdo incluindo naturalmente as palavras-chave
2. Melhorar a estrutura e legibilidade
3. Sugerir título SEO (máx 60 caracteres)
4. Sugerir meta descrição (máx 160 caracteres)
5. Sugerir tags H2 e H3 se aplicável

Retorne em formato JSON com as chaves:
- optimizedContent
- seoTitle
- metaDescription
- suggestedHeadings
- keywordDensity
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Tentar extrair JSON da resposta
      let seoData
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : { optimizedContent: text }
      } catch {
        seoData = { optimizedContent: text }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                original: content,
                keywords,
                type,
                seo: seoData,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao otimizar SEO",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async analyzeCustomerQuery(args) {
    const { query, context = "" } = args

    const prompt = `
Analise a seguinte consulta de cliente e forneça insights:

Consulta: "${query}"
Contexto: ${context}

Forneça:
1. Intenção do cliente (compra, informação, suporte, etc.)
2. Produtos ou categorias relevantes
3. Nível de urgência (baixo, médio, alto)
4. Sentimento (positivo, neutro, negativo)
5. Sugestões de resposta
6. Produtos recomendados (se aplicável)

Retorne em formato JSON estruturado.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Tentar extrair JSON da resposta
      let analysis
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        analysis = jsonMatch
          ? JSON.parse(jsonMatch[0])
          : {
              intent: "unknown",
              analysis: text,
            }
      } catch {
        analysis = {
          intent: "unknown",
          analysis: text,
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                query,
                context,
                analysis,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao analisar consulta do cliente",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async generateMarketingContent(args) {
    const { type, product, tone = "professional", length = "medium" } = args

    const lengthGuide = {
      short: "50-100 palavras",
      medium: "100-200 palavras",
      long: "200-400 palavras",
    }

    const prompt = `
Gere conteúdo de marketing para:

Tipo: ${type}
Produto/Serviço: ${product}
Tom: ${tone}
Tamanho: ${length} (${lengthGuide[length]})

Diretrizes específicas por tipo:
- Email: Assunto + corpo do email
- Social: Post para redes sociais com hashtags
- Ad: Anúncio publicitário persuasivo
- Newsletter: Seção para newsletter

O conteúdo deve:
- Ser adequado ao canal
- Ter call-to-action claro
- Ser envolvente e persuasivo
- Seguir o tom especificado
- Incluir elementos visuais sugeridos (se aplicável)

Retorne em formato JSON com estrutura apropriada para o tipo.
`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Tentar extrair JSON da resposta
      let content
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        content = jsonMatch ? JSON.parse(jsonMatch[0]) : { content: text }
      } catch {
        content = { content: text }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: true,
                type,
                product,
                tone,
                length,
                marketingContent: content,
              },
              null,
              2,
            ),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: false,
                error: error.message,
                message: "Erro ao gerar conteúdo de marketing",
              },
              null,
              2,
            ),
          },
        ],
      }
    }
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log("Gemini AI MCP Server rodando...")
  }
}

if (require.main === module) {
  const server = new GeminiAIServer()
  server.run().catch(console.error)
}

module.exports = GeminiAIServer
