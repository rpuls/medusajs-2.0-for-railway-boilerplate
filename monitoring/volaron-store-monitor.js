const express = require("express")
const { GeminiAIService } = require("../backend/services/gemini-ai-studio")

class VolaronStoreMonitor {
  constructor() {
    this.geminiService = new GeminiAIService()
    this.metrics = {
      // Métricas gerais
      totalRequests: 0,
      errors: 0,
      rateLimitHits: 0,
      avgResponseTime: 0,

      // Métricas específicas do e-commerce
      productDescriptionsGenerated: 0,
      chatbotInteractions: 0,
      customerAnalyses: 0,
      seoOptimizations: 0,
      marketingContentGenerated: 0,

      // Métricas de negócio
      conversionImpact: 0, // % de produtos com descrição AI que converteram
      customerSatisfaction: 0, // Score do chatbot
      seoImprovements: 0, // Melhoria no ranking

      // Health status
      lastHealthCheck: null,
      systemStatus: "unknown",
    }

    this.kpis = {
      // KPIs críticos para e-commerce
      targetResponseTime: 5000, // 5s máximo
      targetErrorRate: 2, // 2% máximo
      targetChatbotSatisfaction: 85, // 85% mínimo
      targetConversionLift: 15, // 15% melhoria esperada
    }

    this.startMonitoring()
  }

  startMonitoring() {
    // Health check específico para Volaron Store a cada 3 minutos
    setInterval(
      async () => {
        await this.performVolaronHealthCheck()
      },
      3 * 60 * 1000,
    )

    // Métricas de negócio a cada 10 minutos
    setInterval(
      async () => {
        await this.collectBusinessMetrics()
      },
      10 * 60 * 1000,
    )

    // Log de métricas a cada 5 minutos
    setInterval(
      () => {
        this.logVolaronMetrics()
      },
      5 * 60 * 1000,
    )
  }

  async performVolaronHealthCheck() {
    console.log("🏪 Executando health check específico do Volaron Store...")

    try {
      const checks = await Promise.all([
        this.checkProductDescriptionGeneration(),
        this.checkChatbotFunctionality(),
        this.checkSEOOptimization(),
        this.checkMarketingContentGeneration(),
      ])

      const allHealthy = checks.every((check) => check.status === "healthy")
      this.metrics.systemStatus = allHealthy ? "healthy" : "degraded"

      this.metrics.lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: this.metrics.systemStatus,
        details: checks,
      }

      if (!allHealthy) {
        this.sendVolaronAlert("Health check degraded", { checks })
      }

      console.log(`✅ Volaron Store Health: ${this.metrics.systemStatus}`)
    } catch (error) {
      this.metrics.systemStatus = "unhealthy"
      this.sendVolaronAlert("Health check failed", error)
      console.error("❌ Volaron Store Health Check failed:", error.message)
    }
  }

  async checkProductDescriptionGeneration() {
    try {
      const startTime = Date.now()
      const testProduct = {
        name: "Produto Teste Health Check",
        category: "Jardinagem",
        features: ["Teste"],
      }

      const description = await this.geminiService.generateProductDescription(testProduct)
      const responseTime = Date.now() - startTime

      return {
        service: "product-description",
        status: description && responseTime < this.kpis.targetResponseTime ? "healthy" : "degraded",
        responseTime,
        details: { hasDescription: !!description, length: description?.length || 0 },
      }
    } catch (error) {
      return {
        service: "product-description",
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  async checkChatbotFunctionality() {
    try {
      const startTime = Date.now()
      const testMessage = "Teste de funcionamento do chatbot"
      const context = { user_data: { location: "Birigui" } }

      const response = await this.geminiService.generateChatResponse(testMessage, context)
      const responseTime = Date.now() - startTime

      return {
        service: "chatbot",
        status: response && responseTime < this.kpis.targetResponseTime ? "healthy" : "degraded",
        responseTime,
        details: { hasResponse: !!response, length: response?.length || 0 },
      }
    } catch (error) {
      return {
        service: "chatbot",
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  async checkSEOOptimization() {
    try {
      const startTime = Date.now()
      const testContent = {
        title: "Produto Teste",
        description: "Descrição teste",
        category: "Teste",
      }

      const seoResult = await this.geminiService.optimizeSEO(testContent)
      const responseTime = Date.now() - startTime

      return {
        service: "seo-optimization",
        status: seoResult && responseTime < this.kpis.targetResponseTime ? "healthy" : "degraded",
        responseTime,
        details: { hasOptimization: !!seoResult },
      }
    } catch (error) {
      return {
        service: "seo-optimization",
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  async checkMarketingContentGeneration() {
    try {
      const startTime = Date.now()
      const testData = {
        product: { name: "Produto Teste" },
        tone: "casual",
      }

      const content = await this.geminiService.generateMarketingContent("social", testData)
      const responseTime = Date.now() - startTime

      return {
        service: "marketing-content",
        status: content && responseTime < this.kpis.targetResponseTime ? "healthy" : "degraded",
        responseTime,
        details: { hasContent: !!content, length: content?.length || 0 },
      }
    } catch (error) {
      return {
        service: "marketing-content",
        status: "unhealthy",
        error: error.message,
      }
    }
  }

  async collectBusinessMetrics() {
    console.log("📊 Coletando métricas de negócio do Volaron Store...")

    // Simular coleta de métricas de negócio
    // Em produção, isso viria do MedusaJS, Google Analytics, etc.
    try {
      // Métricas simuladas - substituir por dados reais
      this.metrics.conversionImpact = Math.random() * 20 + 10 // 10-30%
      this.metrics.customerSatisfaction = Math.random() * 20 + 80 // 80-100%
      this.metrics.seoImprovements = Math.random() * 15 + 5 // 5-20%

      console.log("📈 Métricas de negócio atualizadas")
    } catch (error) {
      console.error("❌ Erro ao coletar métricas de negócio:", error.message)
    }
  }

  logVolaronMetrics() {
    const timestamp = new Date().toISOString()

    console.log("📊 VOLARON STORE - MÉTRICAS AI", {
      timestamp,
      system: {
        status: this.metrics.systemStatus,
        totalRequests: this.metrics.totalRequests,
        errors: this.metrics.errors,
        errorRate: ((this.metrics.errors / this.metrics.totalRequests) * 100).toFixed(2) + "%",
        avgResponseTime: this.metrics.avgResponseTime.toFixed(2) + "ms",
      },
      ecommerce: {
        productDescriptions: this.metrics.productDescriptionsGenerated,
        chatbotInteractions: this.metrics.chatbotInteractions,
        customerAnalyses: this.metrics.customerAnalyses,
        seoOptimizations: this.metrics.seoOptimizations,
        marketingContent: this.metrics.marketingContentGenerated,
      },
      business: {
        conversionImpact: this.metrics.conversionImpact.toFixed(1) + "%",
        customerSatisfaction: this.metrics.customerSatisfaction.toFixed(1) + "%",
        seoImprovements: this.metrics.seoImprovements.toFixed(1) + "%",
      },
      kpis: {
        responseTimeTarget: this.kpis.targetResponseTime + "ms",
        errorRateTarget: this.kpis.targetErrorRate + "%",
        chatbotSatisfactionTarget: this.kpis.targetChatbotSatisfaction + "%",
        conversionLiftTarget: this.kpis.targetConversionLift + "%",
      },
    })

    // Verificar se KPIs estão sendo atingidos
    this.checkKPIs()
  }

  checkKPIs() {
    const issues = []

    if (this.metrics.avgResponseTime > this.kpis.targetResponseTime) {
      issues.push(`Response time (${this.metrics.avgResponseTime}ms) above target (${this.kpis.targetResponseTime}ms)`)
    }

    const errorRate = (this.metrics.errors / this.metrics.totalRequests) * 100
    if (errorRate > this.kpis.targetErrorRate) {
      issues.push(`Error rate (${errorRate.toFixed(2)}%) above target (${this.kpis.targetErrorRate}%)`)
    }

    if (this.metrics.customerSatisfaction < this.kpis.targetChatbotSatisfaction) {
      issues.push(
        `Chatbot satisfaction (${this.metrics.customerSatisfaction.toFixed(1)}%) below target (${
          this.kpis.targetChatbotSatisfaction
        }%)`,
      )
    }

    if (issues.length > 0) {
      this.sendVolaronAlert("KPI targets not met", { issues })
    }
  }

  sendVolaronAlert(message, data) {
    const alert = {
      timestamp: new Date().toISOString(),
      store: "Volaron Store",
      service: "Gemini AI Studio",
      message,
      data,
      severity: this.metrics.systemStatus === "unhealthy" ? "critical" : "warning",
    }

    console.warn("🚨 VOLARON STORE ALERT:", alert)

    // Em produção, enviar para Slack, email, webhook, etc.
    // this.sendToSlack(alert)
    // this.sendToEmail(alert)
  }

  // Middleware para tracking de requests específicos do Volaron
  trackVolaronRequest(requestType) {
    return (req, res, next) => {
      this.metrics.totalRequests++

      const startTime = Date.now()

      res.on("finish", () => {
        const responseTime = Date.now() - startTime
        this.metrics.avgResponseTime = (this.metrics.avgResponseTime + responseTime) / 2

        if (res.statusCode >= 400) {
          this.metrics.errors++
        }

        if (res.statusCode === 429) {
          this.metrics.rateLimitHits++
        }

        // Tracking específico por tipo de request
        switch (requestType) {
          case "product-description":
            if (res.statusCode === 200) this.metrics.productDescriptionsGenerated++
            break
          case "chatbot":
            if (res.statusCode === 200) this.metrics.chatbotInteractions++
            break
          case "customer-analysis":
            if (res.statusCode === 200) this.metrics.customerAnalyses++
            break
          case "seo-optimization":
            if (res.statusCode === 200) this.metrics.seoOptimizations++
            break
          case "marketing-content":
            if (res.statusCode === 200) this.metrics.marketingContentGenerated++
            break
        }
      })

      next()
    }
  }

  // Dashboard específico do Volaron Store
  getVolaronDashboard() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Volaron Store - AI Monitoring Dashboard</title>
        <meta http-equiv="refresh" content="30">
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: linear-gradient(135deg, #1a4d2e, #2d5a3d);
                color: white;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .metric-card {
                background: rgba(255,255,255,0.1);
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #ff6b35;
            }
            .metric-value {
                font-size: 2em;
                font-weight: bold;
                color: #ff6b35;
            }
            .metric-label {
                font-size: 0.9em;
                opacity: 0.8;
                margin-top: 5px;
            }
            .status-healthy { color: #4CAF50; }
            .status-degraded { color: #FF9800; }
            .status-unhealthy { color: #F44336; }
            .kpi-section {
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 10px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏪 Volaron Store - AI Monitoring Dashboard</h1>
            <p>Monitoramento em tempo real da integração Gemini AI Studio</p>
            <div class="status-${this.metrics.systemStatus}">
                Status: ${this.metrics.systemStatus.toUpperCase()}
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${this.metrics.totalRequests}</div>
                <div class="metric-label">Total de Requisições AI</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${this.metrics.avgResponseTime.toFixed(0)}ms</div>
                <div class="metric-label">Tempo Médio de Resposta</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${((this.metrics.errors / this.metrics.totalRequests) * 100 || 0).toFixed(1)}%</div>
                <div class="metric-label">Taxa de Erro</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${this.metrics.productDescriptionsGenerated}</div>
                <div class="metric-label">Descrições de Produtos Geradas</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${this.metrics.chatbotInteractions}</div>
                <div class="metric-label">Interações do Chatbot</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${this.metrics.conversionImpact.toFixed(1)}%</div>
                <div class="metric-label">Impacto na Conversão</div>
            </div>
        </div>

        <div class="kpi-section">
            <h3>📊 KPIs do E-commerce</h3>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${this.metrics.customerSatisfaction.toFixed(1)}%</div>
                    <div class="metric-label">Satisfação do Cliente (Chatbot)</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${this.metrics.seoImprovements.toFixed(1)}%</div>
                    <div class="metric-label">Melhoria SEO</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-value">${this.metrics.marketingContentGenerated}</div>
                    <div class="metric-label">Conteúdo de Marketing Gerado</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px; opacity: 0.7;">
            <p>Última atualização: ${new Date().toLocaleString("pt-BR")}</p>
            <p>Volaron Store © 2024 - Powered by Gemini AI Studio</p>
        </div>

        <script>
            // Auto-refresh a cada 30 segundos
            setTimeout(() => location.reload(), 30000);
        </script>
    </body>
    </html>
    `
  }
}

module.exports = VolaronStoreMonitor
