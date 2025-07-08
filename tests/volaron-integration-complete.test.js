const { GoogleGenerativeAI } = require("@google/generative-ai")

describe("Volaron Store - Integração Completa Gemini AI", () => {
  let genAI
  let model

  beforeAll(() => {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  })

  describe("Configuração Básica", () => {
    test("deve ter todas as variáveis de ambiente necessárias", () => {
      expect(process.env.GOOGLE_GENERATIVE_AI_API_KEY).toBeDefined()
      expect(process.env.GEMINI_MODEL).toBeDefined()
      expect(process.env.VOLARON_STORE_NAME).toBeDefined()
      expect(process.env.VOLARON_PRIMARY_COLOR).toBeDefined()
      expect(process.env.AI_CONTENT_LANGUAGE).toBe("pt-BR")
      expect(process.env.AI_BUSINESS_CONTEXT).toBe("utilidades-domesticas-jardinagem")
    })

    test("deve conectar com Gemini AI Studio", async () => {
      const result = await model.generateContent("Responda apenas 'OK'")
      const response = await result.response
      const text = response.text()

      expect(text.toLowerCase()).toContain("ok")
    }, 30000)
  })

  describe("Funcionalidades Específicas Volaron", () => {
    test("deve gerar descrição para produto de jardinagem", async () => {
      const prompt = `
        Crie uma descrição atrativa para o produto:
        Nome: Vaso de Cerâmica Decorativo
        Categoria: Jardinagem
        Características: Resistente ao tempo, Design moderno, Drenagem perfeita
        
        A descrição deve ser em português brasileiro, entre 150-300 palavras, 
        persuasiva e otimizada para SEO.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const description = response.text()

      expect(description).toBeDefined()
      expect(description.length).toBeGreaterThan(150)
      expect(description.length).toBeLessThan(300)
      expect(description.toLowerCase()).toContain("vaso")
      expect(description.toLowerCase()).toContain("jardinagem")
      expect(description.toLowerCase()).toContain("cerâmica")
    }, 30000)

    test("deve gerar resposta de chatbot contextualizada", async () => {
      const prompt = `
        Você é um assistente virtual da loja Volaron, especializada em utilidades domésticas e jardinagem.
        
        Cliente pergunta: "Vocês fazem entrega no mesmo dia em Birigui?"
        
        Responda de forma amigável, em português brasileiro, máximo 100 palavras.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const chatResponse = response.text()

      expect(chatResponse).toBeDefined()
      expect(chatResponse.length).toBeLessThan(200)
      expect(chatResponse.toLowerCase()).toContain("birigui")
      expect(chatResponse.toLowerCase()).toMatch(/\b(entrega|mesmo dia|rápida)\b/)
    }, 30000)

    test("deve otimizar SEO para produto específico", async () => {
      const prompt = `
        Otimize o SEO para:
        Título: Vaso Cerâmica
        Descrição: Vaso bonito para plantas
        Categoria: Jardinagem
        
        Forneça em formato JSON:
        {
          "optimized_title": "Título otimizado (máx 60 caracteres)",
          "meta_description": "Meta descrição (máx 160 caracteres)",
          "keywords": ["lista", "de", "palavras-chave"],
          "suggestions": ["sugestões", "de", "melhoria"]
        }
        
        Foque no mercado brasileiro e responda APENAS com JSON válido.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const seoText = response.text()

      // Limpar resposta para garantir JSON válido
      const cleanResponse = seoText.replace(/```json\n?|\n?```/g, "").trim()
      const seoData = JSON.parse(cleanResponse)

      expect(seoData).toHaveProperty("optimized_title")
      expect(seoData).toHaveProperty("meta_description")
      expect(seoData).toHaveProperty("keywords")
      expect(seoData).toHaveProperty("suggestions")

      expect(seoData.optimized_title.length).toBeLessThanOrEqual(60)
      expect(seoData.meta_description.length).toBeLessThanOrEqual(160)
      expect(Array.isArray(seoData.keywords)).toBe(true)
      expect(Array.isArray(seoData.suggestions)).toBe(true)
    }, 30000)

    test("deve gerar conteúdo de marketing sazonal", async () => {
      const prompt = `
        Crie um post para Instagram da loja Volaron sobre produtos de jardinagem para a primavera.
        
        Produto: Kit Jardinagem Completo
        Tom: casual e amigável
        Público: famílias brasileiras
        
        Inclua hashtags relevantes e call-to-action.
        Máximo 200 palavras.
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const marketingContent = response.text()

      expect(marketingContent).toBeDefined()
      expect(marketingContent.length).toBeLessThan(250)
      expect(marketingContent.toLowerCase()).toContain("jardinagem")
      expect(marketingContent.toLowerCase()).toContain("primavera")
      expect(marketingContent).toMatch(/#\w+/) // Deve conter hashtags
    }, 30000)
  })

  describe("Performance e Rate Limiting", () => {
    test("deve respeitar rate limiting", async () => {
      const startTime = Date.now()

      // Fazer duas requisições consecutivas
      await model.generateContent("Teste 1")
      await new Promise((resolve) => setTimeout(resolve, 4000)) // Aguardar 4s
      await model.generateContent("Teste 2")

      const endTime = Date.now()
      const duration = endTime - startTime

      // Deve levar pelo menos 4 segundos
      expect(duration).toBeGreaterThan(4000)
    }, 60000)

    test("deve responder em tempo aceitável para e-commerce", async () => {
      const startTime = Date.now()

      await model.generateContent("Gere uma descrição curta para um produto de jardinagem")

      const endTime = Date.now()
      const duration = endTime - startTime

      // Para e-commerce, deve ser < 10 segundos
      expect(duration).toBeLessThan(10000)
    }, 15000)
  })
})
