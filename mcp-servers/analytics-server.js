#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js")
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js")
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js")

class AnalyticsServer {
  constructor() {
    this.server = new Server(
      {
        name: "analytics-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupToolHandlers()
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_sales_metrics",
            description: "Obter métricas de vendas",
            inputSchema: {
              type: "object",
              properties: {
                period: {
                  type: "string",
                  enum: ["today", "week", "month", "year"],
                  description: "Período para análise",
                },
                metric: {
                  type: "string",
                  enum: ["revenue", "orders", "customers", "products"],
                  description: "Tipo de métrica",
                },
              },
            },
          },
          {
            name: "get_customer_analytics",
            description: "Analisar comportamento de clientes",
            inputSchema: {
              type: "object",
              properties: {
                segment: {
                  type: "string",
                  description: "Segmento de clientes",
                },
                timeframe: {
                  type: "string",
                  description: "Período de análise",
                },
              },
            },
          },
          {
            name: "get_product_performance",
            description: "Analisar performance de produtos",
            inputSchema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Categoria de produtos",
                },
                sort_by: {
                  type: "string",
                  enum: ["sales", "revenue", "views", "conversion"],
                  description: "Ordenar por",
                },
                limit: {
                  type: "number",
                  description: "Número de produtos",
                },
              },
            },
          },
          {
            name: "generate_report",
            description: "Gerar relatório personalizado",
            inputSchema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["daily", "weekly", "monthly", "custom"],
                  description: "Tipo de relatório",
                },
                format: {
                  type: "string",
                  enum: ["json", "csv", "pdf"],
                  description: "Formato do relatório",
                },
                metrics: {
                  type: "array",
                  items: { type: "string" },
                  description: "Métricas a incluir",
                },
              },
              required: ["type"],
            },
          },
        ],
      }
    })

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case "get_sales_metrics":
            return await this.getSalesMetrics(args)
          case "get_customer_analytics":
            return await this.getCustomerAnalytics(args)
          case "get_product_performance":
            return await this.getProductPerformance(args)
          case "generate_report":
            return await this.generateReport(args)
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

  async getSalesMetrics(args) {
    const { period = "today", metric = "revenue" } = args

    const metrics = {
      today: {
        revenue: 1250.75,
        orders: 15,
        customers: 12,
        products: 45,
      },
      week: {
        revenue: 8750.25,
        orders: 105,
        customers: 85,
        products: 320,
      },
      month: {
        revenue: 35420.8,
        orders: 420,
        customers: 340,
        products: 1280,
      },
      year: {
        revenue: 425000.0,
        orders: 5040,
        customers: 4080,
        products: 15360,
      },
    }

    const result = {
      period,
      metric,
      value: metrics[period][metric],
      growth: this.calculateGrowth(period, metric),
      comparison: metrics[period],
      timestamp: new Date().toISOString(),
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  }

  async getCustomerAnalytics(args) {
    const { segment = "all", timeframe = "month" } = args

    const analytics = {
      segment,
      timeframe,
      total_customers: 340,
      new_customers: 45,
      returning_customers: 295,
      customer_lifetime_value: 285.5,
      average_order_value: 104.25,
      purchase_frequency: 2.3,
      churn_rate: 0.08,
      segments: {
        vip: { count: 25, revenue_share: 0.35 },
        regular: { count: 180, revenue_share: 0.45 },
        new: { count: 135, revenue_share: 0.2 },
      },
      top_categories: [
        { name: "Cozinha", customers: 180, revenue: 15420.5 },
        { name: "Limpeza", customers: 120, revenue: 8750.25 },
        { name: "Banheiro", customers: 95, revenue: 6250.75 },
      ],
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analytics, null, 2),
        },
      ],
    }
  }

  async getProductPerformance(args) {
    const { category = "all", sort_by = "sales", limit = 10 } = args

    const products = [
      {
        id: "1",
        name: "Panela Antiaderente 24cm",
        category: "Cozinha",
        sales: 85,
        revenue: 7641.5,
        views: 1250,
        conversion: 0.068,
        rating: 4.8,
      },
      {
        id: "2",
        name: "Jogo de Facas Inox",
        category: "Cozinha",
        sales: 62,
        revenue: 8053.8,
        views: 980,
        conversion: 0.063,
        rating: 4.6,
      },
      {
        id: "3",
        name: "Aspirador Portátil",
        category: "Limpeza",
        sales: 45,
        revenue: 13495.5,
        views: 750,
        conversion: 0.06,
        rating: 4.7,
      },
      {
        id: "4",
        name: "Organizador Multiuso",
        category: "Organização",
        sales: 78,
        revenue: 3120.0,
        views: 1100,
        conversion: 0.071,
        rating: 4.5,
      },
      {
        id: "5",
        name: "Tapete Antiderrapante",
        category: "Banheiro",
        sales: 55,
        revenue: 1375.0,
        views: 650,
        conversion: 0.085,
        rating: 4.4,
      },
    ]

    let filteredProducts = products

    if (category !== "all") {
      filteredProducts = products.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    }

    // Ordenar por métrica escolhida
    filteredProducts.sort((a, b) => {
      switch (sort_by) {
        case "sales":
          return b.sales - a.sales
        case "revenue":
          return b.revenue - a.revenue
        case "views":
          return b.views - a.views
        case "conversion":
          return b.conversion - a.conversion
        default:
          return b.sales - a.sales
      }
    })

    const result = {
      category,
      sort_by,
      total_products: filteredProducts.length,
      products: filteredProducts.slice(0, limit),
      summary: {
        total_sales: filteredProducts.reduce((sum, p) => sum + p.sales, 0),
        total_revenue: filteredProducts.reduce((sum, p) => sum + p.revenue, 0),
        avg_conversion: filteredProducts.reduce((sum, p) => sum + p.conversion, 0) / filteredProducts.length,
        avg_rating: filteredProducts.reduce((sum, p) => sum + p.rating, 0) / filteredProducts.length,
      },
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  }

  async generateReport(args) {
    const { type, format = "json", metrics = ["revenue", "orders", "customers"] } = args

    const reportData = {
      id: `report_${Date.now()}`,
      type,
      format,
      generated_at: new Date().toISOString(),
      period: this.getReportPeriod(type),
      metrics: {},
      summary: {},
    }

    // Gerar dados para cada métrica solicitada
    for (const metric of metrics) {
      switch (metric) {
        case "revenue":
          reportData.metrics.revenue = {
            current: 35420.8,
            previous: 32150.25,
            growth: "+10.2%",
            trend: "up",
          }
          break
        case "orders":
          reportData.metrics.orders = {
            current: 420,
            previous: 385,
            growth: "+9.1%",
            trend: "up",
          }
          break
        case "customers":
          reportData.metrics.customers = {
            current: 340,
            previous: 295,
            growth: "+15.3%",
            trend: "up",
          }
          break
        case "products":
          reportData.metrics.products = {
            total_active: 1280,
            best_seller: "Panela Antiaderente 24cm",
            categories: 8,
            new_this_period: 25,
          }
          break
      }
    }

    // Resumo executivo
    reportData.summary = {
      highlights: [
        "Crescimento de 10.2% na receita",
        "15.3% mais clientes ativos",
        "Categoria Cozinha lidera vendas",
        "Taxa de conversão melhorou 2.1%",
      ],
      recommendations: [
        "Expandir linha de produtos de cozinha",
        "Investir em marketing para categoria Limpeza",
        "Implementar programa de fidelidade",
        "Otimizar páginas de produtos com baixa conversão",
      ],
      next_actions: [
        "Analisar feedback de clientes VIP",
        "Revisar preços de produtos com baixa margem",
        "Planejar campanha para próximo mês",
        "Atualizar estoque de best-sellers",
      ],
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(reportData, null, 2),
        },
      ],
    }
  }

  calculateGrowth(period, metric) {
    // Simular cálculo de crescimento
    const growthRates = {
      today: { revenue: "+5.2%", orders: "+8.1%", customers: "+12.3%", products: "+3.5%" },
      week: { revenue: "+7.8%", orders: "+6.5%", customers: "+9.2%", products: "+4.1%" },
      month: { revenue: "+10.2%", orders: "+9.1%", customers: "+15.3%", products: "+8.7%" },
      year: { revenue: "+18.5%", orders: "+16.2%", customers: "+22.1%", products: "+12.3%" },
    }

    return growthRates[period][metric] || "+0.0%"
  }

  getReportPeriod(type) {
    const now = new Date()
    switch (type) {
      case "daily":
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString(),
          end: now.toISOString(),
        }
      case "weekly":
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          start: weekStart.toISOString(),
          end: now.toISOString(),
        }
      case "monthly":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return {
          start: monthStart.toISOString(),
          end: now.toISOString(),
        }
      default:
        return {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: now.toISOString(),
        }
    }
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error("Analytics MCP Server iniciado")
  }
}

const server = new AnalyticsServer()
server.run().catch(console.error)
