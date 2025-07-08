const { GeminiAIService } = require("../backend/services/gemini-ai-studio")
const { geminiAPI } = require("../frontend/utils/gemini-api")

describe("Volaron Store - Gemini AI Integration", () => {
  let geminiService

  beforeAll(() => {
    geminiService = new GeminiAIService()
  })

  describe("Funcionalidades Core do E-commerce", () => {
    test("deve gerar descrição para produto de jardinagem", async () => {
      const productData = {
        name: "Vaso de Cerâmica Decorativo",
        category: "Jardinagem",
        features: ["Resistente ao tempo", "Design moderno", "Drenagem perfeita"],
        specifications: {
          material: "Cerâmica esmaltada",
          tamanho: "30cm x 25cm",
          peso: "2.5kg",
          cor: "Terracota",
        },
      }

      const description = await geminiService.generateProductDescription(productData)

      expect(description).toBeDefined()
      expect(description.length).toBeGreaterThan(150)
      expect(description.length).toBeLessThan(300)
      expect(description.toLowerCase()).toContain("vaso")
      expect(description.toLowerCase()).toContain("jardinagem")
      expect(description.toLowerCase()).toContain("cerâmica")
      expect(description).toMatch(/\b(resistente|durável|qualidade)\b/i)
    }, 30000)

    test("deve gerar descrição para utensílio doméstico", async () => {
      const productData = {
        name: "Ralador Multiuso Inox",
        category: "Cozinha",
        features: ["4 faces diferentes", "Cabo ergonômico", "Fácil limpeza"],
        specifications: {
          material: "Aço inoxidável",
          dimensoes: "25cm x 10cm",
          peso: "300g",
        },
      }

      const description = await geminiService.generateProductDescription(productData)

      expect(description).toBeDefined()
      expect(description.toLowerCase()).toContain("ralador")
      expect(description.toLowerCase()).toContain("cozinha")
      expect(description.toLowerCase()).toContain("inox")
      expect(description).toMatch(/\b(prático|útil|facilita)\b/i)
    }, 30000)

    test("deve otimizar SEO para produto específico", async () => {
      const content = {
        title: "Vaso Cerâmica",
        description: "Vaso bonito para plantas",
        keywords: ["vaso", "plantas"],
        category: "Jardinagem",
      }

      const seoOptimization = await geminiService.optimizeSEO(content)

      expect(seoOptimization).toHaveProperty("optimized_title")
      expect(seoOptimization).toHaveProperty("meta_description")
      expect(seoOptimization).toHaveProperty("keywords")
      expect(seoOptimization).toHaveProperty("suggestions")

      expect(seoOptimization.optimized_title.length).toBeLessThanOrEqual(60)
      expect(seoOptimization.meta_description.length).toBeLessThanOrEqual(160)
      expect(seoOptimization.keywords).toContain("vaso")
      expect(seoOptimization.keywords).toContain("jardinagem")
    }, 30000)
  })

  describe("Chatbot de Suporte ao Cliente", () => {
    test("deve responder sobre produtos de jardinagem", async () => {
      const message = "Qual o melhor vaso para plantas suculentas?"
      const context = {
        user_data: {
          location: "Birigui",
          interests: ["jardinagem"],
        },
      }

      const response = await geminiService.generateChatResponse(message, context)

      expect(response).toBeDefined()
      expect(response.toLowerCase()).toContain("suculenta")
      expect(response.toLowerCase()).toMatch(/\b(vaso|drenagem|cerâmica)\b/)
      expect(response.length).toBeLessThan(200)
    }, 30000)

    test("deve responder sobre entrega em Birigui", async () => {
      const message = "Vocês fazem entrega no mesmo dia em Birigui?"
      const context = {
        user_data: {
          location: "Birigui",
          cep: "16100-000",
        },
      }

      const response = await geminiService.generateChatResponse(message, context)

      expect(response).toBeDefined()
      expect(response.toLowerCase()).toContain("birigui")
      expect(response.toLowerCase()).toMatch(/\b(mesmo dia|entrega|rápida)\b/)
    }, 30000)

    test("deve responder sobre produtos de cozinha", async () => {
      const message = "Preciso de um ralador bom para queijo"
      const context = {
        user_data: {
          interests: ["cozinha", "culinária"],
        },
      }

      const response = await geminiService.generateChatResponse(message, context)

      expect(response).toBeDefined()
      expect(response.toLowerCase()).toContain("ralador")
      expect(response.toLowerCase()).toMatch(/\b(queijo|cozinha|inox)\b/)
    }, 30000)
  })

  describe("Análise de Comportamento do Cliente", () => {
    test("deve analisar cliente interessado em jardinagem", async () => {
      const customerData = {
        purchases: [
          { product: "Vaso de Cerâmica", category: "Jardinagem", price: 45 },
          { product: "Terra Adubada", category: "Jardinagem", price: 25 },
          { product: "Regador", category: "Jardinagem", price: 35 },
        ],
        browsing_history: [
          { category: "Jardinagem", time_spent: 300 },
          { category: "Ferramentas", time_spent: 120 },
        ],
        demographics: {
          location: "Birigui",
          age_range: "35-45",
        },
      }

      const analysis = await geminiService.analyzeCustomerBehavior(customerData)

      expect(analysis).toHaveProperty("profile")
      expect(analysis).toHaveProperty("recommendations")
      expect(analysis).toHaveProperty("insights")

      expect(analysis.profile.toLowerCase()).toContain("jardinagem")
      expect(analysis.recommendations).toBeInstanceOf(Array)
      expect(analysis.recommendations.length).toBeGreaterThan(0)
      expect(analysis.insights).toBeInstanceOf(Array)
    }, 30000)

    test("deve analisar cliente interessado em cozinha", async () => {
      const customerData = {
        purchases: [
          { product: "Ralador Inox", category: "Cozinha", price: 35 },
          { product: "Tábua de Corte", category: "Cozinha", price: 28 },
        ],
        demographics: {
          location: "São Paulo",
        },
      }

      const analysis = await geminiService.analyzeCustomerBehavior(customerData)

      expect(analysis.profile.toLowerCase()).toMatch(/\b(cozinha|culinária|utensílios)\b/)
      expect(analysis.recommendations.some((rec) => rec.toLowerCase().includes("cozinha"))).toBe(true)
    }, 30000)
  })

  describe("Geração de Conteúdo de Marketing", () => {
    test("deve gerar email promocional para jardinagem", async () => {
      const contentData = {
        product: {
          name: "Kit Jardinagem Completo",
          category: "Jardinagem",
          price: 89.9,
        },
        campaign: "Primavera 2024",
        target_audience: "Entusiastas de jardinagem",
        tone: "promotional",
      }

      const emailContent = await geminiService.generateMarketingContent("email", contentData)

      expect(emailContent).toBeDefined()
      expect(emailContent.toLowerCase()).toContain("jardinagem")
      expect(emailContent.toLowerCase()).toContain("primavera")
      expect(emailContent.toLowerCase()).toMatch(/\b(oferta|promoção|desconto)\b/)
      expect(emailContent.length).toBeGreaterThan(200)
    }, 30000)

    test("deve gerar post para redes sociais", async () => {
      const contentData = {
        product: {
          name: "Vaso Decorativo Moderno",
          category: "Jardinagem",
        },
        campaign: "Decoração de Casa",
        tone: "casual",
      }

      const socialContent = await geminiService.generateMarketingContent("social", contentData)

      expect(socialContent).toBeDefined()
      expect(socialContent.toLowerCase()).toContain("vaso")
      expect(socialContent.toLowerCase()).toMatch(/\b(decoração|casa|plantas)\b/)
      expect(socialContent).toMatch(/#\w+/) // Deve conter hashtags
    }, 30000)
  })

  describe("Performance e Rate Limiting", () => {
    test("deve respeitar rate limiting do Gemini AI Studio", async () => {
      const startTime = Date.now()

      // Fazer duas requisições consecutivas
      await geminiService.generateText("Teste 1")
      await geminiService.generateText("Teste 2")

      const endTime = Date.now()
      const duration = endTime - startTime

      // Deve ter delay de pelo menos 4 segundos
      expect(duration).toBeGreaterThan(4000)
    }, 60000)

    test("deve responder dentro do tempo aceitável para e-commerce", async () => {
      const startTime = Date.now()

      await geminiService.generateProductDescription({
        name: "Produto Teste",
        category: "Teste",
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Para e-commerce, resposta deve ser < 10 segundos
      expect(duration).toBeLessThan(10000)
    }, 15000)
  })
})

// Testes específicos de integração com MedusaJS
describe("Integração com MedusaJS", () => {
  let geminiService

  beforeAll(() => {
    geminiService = new GeminiAIService()
  })

  test("deve integrar com API de produtos do Medusa", async () => {
    // Mock da integração com MedusaJS
    const mockProduct = {
      id: "prod_123",
      title: "Vaso de Cerâmica",
      description: "",
      categories: [{ name: "Jardinagem" }],
      variants: [{ prices: [{ amount: 4500 }] }],
    }

    // Simular geração de descrição para produto do Medusa
    const description = await geminiService.generateProductDescription({
      name: mockProduct.title,
      category: mockProduct.categories[0].name,
      features: ["Produto de qualidade"],
    })

    expect(description).toBeDefined()
    expect(description.length).toBeGreaterThan(100)
  }, 30000)
})
