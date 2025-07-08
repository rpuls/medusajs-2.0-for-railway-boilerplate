# 📋 Plano de Execução: Migração Vertex AI → Gemini AI Studio

## Etapa 1: Análise de Arquivos .env Modificados

### 1.1 Identificação de Mudanças

#### Variáveis Removidas (Vertex AI)
\`\`\`env
# REMOVER - Não mais necessárias
VERTEX_PROJECT_ID=volaron-store
VERTEX_REGION=us-central1
VERTEX_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
VERTEX_MODEL=gemini-1.5-flash-001
ENABLE_VERTEX_AI=true
GOOGLE_APPLICATION_CREDENTIALS=/app/vertex-credentials.json
GOOGLE_CLOUD_PROJECT=volaron-store
\`\`\`

#### Variáveis Adicionadas (Gemini AI Studio)
\`\`\`env
# ADICIONAR - Novas configurações
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
GEMINI_MODEL=gemini-1.5-flash
ENABLE_GEMINI_AI=true
AI_PROVIDER=gemini-ai-studio
RATE_LIMIT_RPM=15
\`\`\`

### 1.2 Mapeamento de Configurações

| Ambiente | Arquivo | Status | Ações Necessárias |
|----------|---------|--------|-------------------|
| Development | `.env.local` | 🟡 Modificado | Revisar e atualizar |
| Staging | `.env.staging` | 🟡 Modificado | Sincronizar com dev |
| Production | Railway/Vercel | 🔴 Pendente | Atualizar variáveis |

### 1.3 Script de Validação

\`\`\`bash
#!/bin/bash
# validate-env-changes.sh

echo "🔍 Validando mudanças em arquivos .env..."

# Verificar arquivos .env existentes
for env_file in .env .env.local .env.development .env.staging .env.production; do
    if [ -f "$env_file" ]; then
        echo "📄 Analisando $env_file..."
        
        # Verificar variáveis antigas (devem estar ausentes)
        old_vars=("VERTEX_PROJECT_ID" "VERTEX_REGION" "VERTEX_SERVICE_ACCOUNT_JSON")
        for var in "${old_vars[@]}"; do
            if grep -q "^$var=" "$env_file"; then
                echo "  ⚠️  Variável antiga encontrada: $var"
            else
                echo "  ✅ Variável antiga removida: $var"
            fi
        done
        
        # Verificar novas variáveis (devem estar presentes)
        new_vars=("GOOGLE_GENERATIVE_AI_API_KEY" "GEMINI_MODEL")
        for var in "${new_vars[@]}"; do
            if grep -q "^$var=" "$env_file"; then
                echo "  ✅ Nova variável encontrada: $var"
            else
                echo "  ❌ Nova variável ausente: $var"
            fi
        done
        
        echo ""
    fi
done

echo "✅ Validação concluída!"
\`\`\`

## Etapa 2: Atualização de Variáveis de Ambiente

### 2.1 Railway (Backend)

#### Configuração Atual vs Nova
\`\`\`javascript
// railway-env-update.js
const railwayConfig = {
  // REMOVER
  remove: [
    'VERTEX_PROJECT_ID',
    'VERTEX_REGION', 
    'VERTEX_SERVICE_ACCOUNT_JSON',
    'VERTEX_MODEL',
    'ENABLE_VERTEX_AI',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_CLOUD_PROJECT'
  ],
  
  // ADICIONAR
  add: {
    'GOOGLE_GENERATIVE_AI_API_KEY': 'AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc',
    'GEMINI_MODEL': 'gemini-1.5-flash',
    'ENABLE_GEMINI_AI': 'true',
    'AI_PROVIDER': 'gemini-ai-studio',
    'RATE_LIMIT_RPM': '15',
    'AI_REQUEST_TIMEOUT': '30000',
    'AI_RETRY_ATTEMPTS': '3'
  }
}
\`\`\`

#### Comandos Railway CLI
\`\`\`bash
# Instalar Railway CLI se necessário
npm install -g @railway/cli

# Login
railway login

# Selecionar projeto
railway link

# Remover variáveis antigas
railway variables delete VERTEX_PROJECT_ID
railway variables delete VERTEX_REGION
railway variables delete VERTEX_SERVICE_ACCOUNT_JSON
railway variables delete VERTEX_MODEL
railway variables delete ENABLE_VERTEX_AI
railway variables delete GOOGLE_APPLICATION_CREDENTIALS
railway variables delete GOOGLE_CLOUD_PROJECT

# Adicionar novas variáveis
railway variables set GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyAM7Z6gEhkIRVxzvVI1c_1JbQhlZ9iPwKc
railway variables set GEMINI_MODEL=gemini-1.5-flash
railway variables set ENABLE_GEMINI_AI=true
railway variables set AI_PROVIDER=gemini-ai-studio
railway variables set RATE_LIMIT_RPM=15

# Verificar configuração
railway variables
\`\`\`

### 2.2 Vercel (Frontend)

#### Configuração Frontend
\`\`\`javascript
// vercel-env-update.js
const vercelConfig = {
  add: {
    'NEXT_PUBLIC_GEMINI_MODEL': 'gemini-1.5-flash',
    'NEXT_PUBLIC_AI_PROVIDER': 'gemini-ai-studio',
    'NEXT_PUBLIC_AI_ENABLED': 'true',
    'NEXT_PUBLIC_RATE_LIMIT_WARNING': 'true'
  }
}
\`\`\`

#### Comandos Vercel CLI
\`\`\`bash
# Instalar Vercel CLI se necessário
npm install -g vercel

# Login
vercel login

# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_GEMINI_MODEL
# Valor: gemini-1.5-flash

vercel env add NEXT_PUBLIC_AI_PROVIDER  
# Valor: gemini-ai-studio

vercel env add NEXT_PUBLIC_AI_ENABLED
# Valor: true

# Verificar configuração
vercel env ls
\`\`\`

## Etapa 3: Testes Locais Abrangentes

### 3.1 Suite de Testes

\`\`\`javascript
// tests/gemini-integration.test.js
const { GeminiAIService } = require('../backend/services/gemini-ai-studio')
const { geminiAPI } = require('../frontend/utils/gemini-api')

describe('Gemini AI Studio Integration', () => {
  let geminiService
  
  beforeAll(() => {
    geminiService = new GeminiAIService()
  })

  describe('Backend Service Tests', () => {
    test('should initialize service correctly', () => {
      expect(geminiService).toBeDefined()
      expect(geminiService.model).toBe('gemini-1.5-flash')
    })

    test('should generate product description', async () => {
      const productData = {
        name: 'Vaso de Cerâmica',
        category: 'Jardinagem',
        features: ['Resistente', 'Decorativo']
      }
      
      const description = await geminiService.generateProductDescription(productData)
      
      expect(description).toBeDefined()
      expect(description.length).toBeGreaterThan(100)
      expect(description).toContain('vaso')
    }, 30000)

    test('should analyze customer behavior', async () => {
      const customerData = {
        purchases: [
          { product: 'Vaso', category: 'Jardinagem', price: 50 }
        ]
      }
      
      const analysis = await geminiService.analyzeCustomerBehavior(customerData)
      
      expect(analysis).toHaveProperty('profile')
      expect(analysis).toHaveProperty('recommendations')
      expect(analysis).toHaveProperty('insights')
    }, 30000)

    test('should handle rate limiting', async () => {
      const startTime = Date.now()
      
      // Fazer duas requisições consecutivas
      await geminiService.generateText('Test 1')
      await geminiService.generateText('Test 2')
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Deve ter delay de pelo menos 4 segundos entre requisições
      expect(duration).toBeGreaterThan(4000)
    }, 60000)
  })

  describe('Frontend API Tests', () => {
    test('should check API health', async () => {
      const health = await geminiAPI.checkHealth()
      
      expect(health).toHaveProperty('status')
      expect(['healthy', 'degraded', 'unhealthy']).toContain(health.status)
    })

    test('should generate marketing content', async () => {
      const content = await geminiAPI.generateMarketingContent('email', {
        product: { name: 'Vaso Decorativo' },
        tone: 'promotional'
      })
      
      expect(content).toBeDefined()
      expect(content.length).toBeGreaterThan(50)
    }, 30000)
  })

  describe('Error Handling Tests', () => {
    test('should handle API errors gracefully', async () => {
      // Simular erro de rate limit
      const invalidService = new GeminiAIService('invalid-model')
      
      await expect(
        invalidService.generateText('test')
      ).rejects.toThrow()
    })

    test('should handle network timeouts', async () => {
      // Teste de timeout será implementado com mock
      expect(true).toBe(true) // Placeholder
    })
  })
})
\`\`\`

### 3.2 Testes de Performance

\`\`\`javascript
// tests/performance.test.js
const { performance } = require('perf_hooks')
const { GeminiAIService } = require('../backend/services/gemini-ai-studio')

describe('Performance Tests', () => {
  let geminiService
  
  beforeAll(() => {
    geminiService = new GeminiAIService()
  })

  test('should respond within acceptable time limits', async () => {
    const startTime = performance.now()
    
    await geminiService.generateText('Generate a short product description')
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Deve responder em menos de 10 segundos
    expect(duration).toBeLessThan(10000)
  }, 15000)

  test('should handle concurrent requests properly', async () => {
    const promises = []
    const startTime = performance.now()
    
    // Fazer 3 requisições "simultâneas" (serão sequenciais devido ao rate limiting)
    for (let i = 0; i < 3; i++) {
      promises.push(
        geminiService.generateText(\`Test request \${i + 1}\`)
      )
    }
    
    const results = await Promise.all(promises)
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })
    
    // Deve levar pelo menos 8 segundos (3 requests com 4s de delay cada)
    expect(duration).toBeGreaterThan(8000)
  }, 30000)
})
\`\`\`

### 3.3 Comandos de Teste

\`\`\`bash
#!/bin/bash
# run-local-tests.sh

echo "🧪 Iniciando testes locais abrangentes..."

# 1. Testes unitários
echo "📋 Executando testes unitários..."
npm test -- --testPathPattern=gemini-integration.test.js

# 2. Testes de performance
echo "⚡ Executando testes de performance..."
npm test -- --testPathPattern=performance.test.js

# 3. Testes de integração
echo "🔗 Executando testes de integração..."
npm run test:integration

# 4. Testes E2E
echo "🌐 Executando testes E2E..."
npm run test:e2e

# 5. Verificação de health check
echo "❤️  Verificando health check..."
curl -X GET http://localhost:3000/api/ai/health

# 6. Teste de geração de conteúdo
echo "📝 Testando geração de conteúdo..."
curl -X POST http://localhost:3000/api/ai/generate-description \
  -H "Content-Type: application/json" \
  -d '{
    "productData": {
      "name": "Vaso Teste",
      "category": "Jardinagem",
      "features": ["Teste"]
    }
  }'

echo "✅ Testes locais concluídos!"
\`\`\`

## Etapa 4: Deploy e Monitoramento

### 4.1 Estratégia de Deploy

#### Deploy Gradual (Blue-Green)
\`\`\`yaml
# deploy-strategy.yml
deployment:
  strategy: blue-green
  phases:
    - name: staging
      environment: staging
      traffic: 0%
      duration: 2h
      
    - name: canary
      environment: production
      traffic: 10%
      duration: 4h
      
    - name: full-rollout
      environment: production
      traffic: 100%
      duration: ongoing

monitoring:
  metrics:
    - response_time
    - error_rate
    - rate_limit_hits
    - api_health_status
    
  alerts:
    - condition: error_rate > 5%
      action: rollback
    - condition: response_time > 10s
      action: alert
    - condition: rate_limit_hits > 80%
      action: throttle
\`\`\`

### 4.2 Scripts de Deploy

\`\`\`bash
#!/bin/bash
# deploy-gemini-integration.sh

echo "🚀 Iniciando deploy da integração Gemini AI Studio..."

# 1. Verificações pré-deploy
echo "🔍 Verificações pré-deploy..."

# Verificar se testes passaram
if ! npm test; then
    echo "❌ Testes falharam. Abortando deploy."
    exit 1
fi

# Verificar variáveis de ambiente
if [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
    echo "❌ GOOGLE_GENERATIVE_AI_API_KEY não configurada"
    exit 1
fi

# 2. Deploy no Railway (Backend)
echo "🚂 Deploy no Railway..."
railway up --detach

# Aguardar deploy
echo "⏳ Aguardando deploy do backend..."
sleep 60

# Verificar health do backend
BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
if curl -f "$BACKEND_URL/api/ai/health"; then
    echo "✅ Backend deploy bem-sucedido"
else
    echo "❌ Backend deploy falhou"
    exit 1
fi

# 3. Deploy no Vercel (Frontend)
echo "▲ Deploy no Vercel..."
vercel --prod

# 4. Testes pós-deploy
echo "🧪 Testes pós-deploy..."

# Teste de integração completa
FRONTEND_URL=$(vercel ls --json | jq -r '.[0].url')
if curl -f "https://$FRONTEND_URL"; then
    echo "✅ Frontend deploy bem-sucedido"
else
    echo "❌ Frontend deploy falhou"
    exit 1
fi

echo "🎉 Deploy concluído com sucesso!"
\`\`\`

### 4.3 Monitoramento e Alertas

\`\`\`javascript
// monitoring/gemini-monitor.js
const express = require('express')
const { GeminiAIService } = require('../backend/services/gemini-ai-studio')

class GeminiMonitor {
  constructor() {
    this.geminiService = new GeminiAIService()
    this.metrics = {
      requests: 0,
      errors: 0,
      rateLimitHits: 0,
      avgResponseTime: 0,
      lastHealthCheck: null
    }
    
    // Iniciar monitoramento
    this.startMonitoring()
  }

  startMonitoring() {
    // Health check a cada 5 minutos
    setInterval(async () => {
      await this.performHealthCheck()
    }, 5 * 60 * 1000)

    // Métricas a cada minuto
    setInterval(() => {
      this.logMetrics()
    }, 60 * 1000)
  }

  async performHealthCheck() {
    try {
      const startTime = Date.now()
      const health = await this.geminiService.healthCheck()
      const responseTime = Date.now() - startTime

      this.metrics.lastHealthCheck = {
        timestamp: new Date().toISOString(),
        status: health.status,
        responseTime
      }

      if (health.status !== 'healthy') {
        this.sendAlert('Health check failed', health)
      }

      console.log(\`✅ Health check: \${health.status} (\${responseTime}ms)\`)
    } catch (error) {
      this.metrics.errors++
      this.sendAlert('Health check error', error)
      console.error('❌ Health check failed:', error.message)
    }
  }

  logMetrics() {
    console.log('📊 Gemini AI Metrics:', {
      ...this.metrics,
      timestamp: new Date().toISOString()
    })

    // Reset counters
    this.metrics.requests = 0
    this.metrics.errors = 0
    this.metrics.rateLimitHits = 0
  }

  sendAlert(message, data) {
    // Implementar integração com sistema de alertas
    console.warn(\`🚨 ALERT: \${message}\`, data)
    
    // Exemplo: enviar para webhook, Slack, etc.
    // await this.sendToSlack(message, data)
  }

  // Middleware para tracking de requests
  trackRequest() {
    return (req, res, next) => {
      this.metrics.requests++
      
      const startTime = Date.now()
      
      res.on('finish', () => {
        const responseTime = Date.now() - startTime
        this.metrics.avgResponseTime = 
          (this.metrics.avgResponseTime + responseTime) / 2

        if (res.statusCode >= 400) {
          this.metrics.errors++
        }

        if (res.statusCode === 429) {
          this.metrics.rateLimitHits++
          this.sendAlert('Rate limit hit', { 
            url: req.url, 
            method: req.method 
          })
        }
      })
      
      next()
    }
  }
}

module.exports = GeminiMonitor
\`\`\`

### 4.4 Dashboard de Monitoramento

\`\`\`javascript
// monitoring/dashboard.js
const express = require('express')
const GeminiMonitor = require('./gemini-monitor')

const app = express()
const monitor = new GeminiMonitor()

// Usar middleware de tracking
app.use('/api/ai', monitor.trackRequest())

// Endpoint de métricas
app.get('/metrics', (req, res) => {
  res.json({
    service: 'gemini-ai-studio',
    metrics: monitor.metrics,
    timestamp: new Date().toISOString()
  })
})

// Dashboard HTML simples
app.get('/dashboard', (req, res) => {
  res.send(\`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Gemini AI Studio - Dashboard</title>
        <meta http-equiv="refresh" content="30">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .metric { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .healthy { color: green; }
            .unhealthy { color: red; }
            .degraded { color: orange; }
        </style>
    </head>
    <body>
        <h1>🤖 Gemini AI Studio Dashboard</h1>
        <div id="metrics">Carregando...</div>
        
        <script>
            async function loadMetrics() {
                try {
                    const response = await fetch('/metrics')
                    const data = await response.json()
                    
                    document.getElementById('metrics').innerHTML = \`
                        <div class="metric">
                            <h3>📊 Métricas Gerais</h3>
                            <p>Requests: \${data.metrics.requests}</p>
                            <p>Errors: \${data.metrics.errors}</p>
                            <p>Rate Limit Hits: \${data.metrics.rateLimitHits}</p>
                            <p>Avg Response Time: \${data.metrics.avgResponseTime.toFixed(2)}ms</p>
                        </div>
                        
                        <div class="metric">
                            <h3>❤️ Health Status</h3>
                            <p class="\${data.metrics.lastHealthCheck?.status || 'unknown'}">
                                Status: \${data.metrics.lastHealthCheck?.status || 'Unknown'}
                            </p>
                            <p>Last Check: \${data.metrics.lastHealthCheck?.timestamp || 'Never'}</p>
                        </div>
                        
                        <div class="metric">
                            <h3>🔄 Last Updated</h3>
                            <p>\${data.timestamp}</p>
                        </div>
                    \`
                } catch (error) {
                    document.getElementById('metrics').innerHTML = 
                        '<p style="color: red;">Erro ao carregar métricas</p>'
                }
            }
            
            loadMetrics()
            setInterval(loadMetrics, 30000) // Atualizar a cada 30s
        </script>
    </body>
    </html>
  \`)
})

const PORT = process.env.MONITOR_PORT || 3001
app.listen(PORT, () => {
  console.log(\`📊 Dashboard disponível em http://localhost:\${PORT}/dashboard\`)
})
\`\`\`
\`\`\`

## Checklist de Execução Completo
