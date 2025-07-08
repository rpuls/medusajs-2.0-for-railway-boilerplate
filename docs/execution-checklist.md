# ✅ Checklist de Execução: Migração Gemini AI Studio

## Fase 1: Preparação
- [ ] 💾 Backup completo realizado
- [ ] 📋 Scripts de migração testados
- [ ] 🔍 Análise de dependências concluída
- [ ] 🧪 Ambiente de teste configurado

## Fase 2: Migração de Código
- [ ] 📦 Dependências atualizadas (@google/generative-ai instalada)
- [ ] 🗑️ Dependências antigas removidas
- [ ] 🔧 Serviço Gemini AI implementado
- [ ] 🔗 APIs refatoradas
- [ ] ⏱️ Rate limiting implementado

## Fase 3: Configuração de Ambiente

### 3.1 Arquivos .env Locais
- [ ] 📄 .env.local atualizado
- [ ] 📄 .env.development atualizado
- [ ] 📄 .env.staging atualizado
- [ ] 🔍 Validação de variáveis executada

### 3.2 Railway (Backend)
- [ ] 🚂 Variáveis antigas removidas:
  - [ ] VERTEX_PROJECT_ID
  - [ ] VERTEX_REGION
  - [ ] VERTEX_SERVICE_ACCOUNT_JSON
  - [ ] VERTEX_MODEL
  - [ ] ENABLE_VERTEX_AI
  - [ ] GOOGLE_APPLICATION_CREDENTIALS
  - [ ] GOOGLE_CLOUD_PROJECT

- [ ] ➕ Novas variáveis adicionadas:
  - [ ] GOOGLE_GENERATIVE_AI_API_KEY
  - [ ] GEMINI_MODEL
  - [ ] ENABLE_GEMINI_AI
  - [ ] AI_PROVIDER
  - [ ] RATE_LIMIT_RPM

### 3.3 Vercel (Frontend)
- [ ] ▲ Variáveis públicas adicionadas:
  - [ ] NEXT_PUBLIC_GEMINI_MODEL
  - [ ] NEXT_PUBLIC_AI_PROVIDER
  - [ ] NEXT_PUBLIC_AI_ENABLED

## Fase 4: Testes Locais
- [ ] 🧪 Testes unitários executados
- [ ] ⚡ Testes de performance executados
- [ ] 🔗 Testes de integração executados
- [ ] 🌐 Testes E2E executados
- [ ] ❤️ Health check validado
- [ ] 📝 Geração de conteúdo testada
- [ ] 🤖 Chatbot testado
- [ ] 🔍 Análise de clientes testada
- [ ] 📊 Otimização SEO testada

## Fase 5: Deploy

### 5.1 Pré-Deploy
- [ ] ✅ Todos os testes passando
- [ ] 🔍 Variáveis de ambiente validadas
- [ ] 💾 Backup de produção realizado
- [ ] 📋 Plano de rollback preparado

### 5.2 Deploy Staging
- [ ] 🚂 Deploy Railway staging
- [ ] ▲ Deploy Vercel staging
- [ ] 🧪 Testes em staging
- [ ] 📊 Métricas de staging validadas

### 5.3 Deploy Produção
- [ ] 🚂 Deploy Railway produção
- [ ] ▲ Deploy Vercel produção
- [ ] 🧪 Smoke tests em produção
- [ ] 📊 Monitoramento ativo

## Fase 6: Monitoramento

### 6.1 Configuração de Monitoramento
- [ ] 📊 Dashboard de métricas configurado
- [ ] 🚨 Alertas configurados
- [ ] ❤️ Health checks automáticos
- [ ] 📈 Logging estruturado

### 6.2 Métricas a Monitorar
- [ ] 📊 Taxa de erro < 5%
- [ ] ⚡ Tempo de resposta < 10s
- [ ] 🔄 Rate limit hits < 80%
- [ ] ❤️ Health status = healthy
- [ ] 💰 Custos vs baseline

## Fase 7: Validação Final
- [ ] ✅ Todas as funcionalidades operacionais
- [ ] 📊 Métricas dentro dos parâmetros
- [ ] 💰 Economia de custos confirmada
- [ ] 👥 Feedback da equipe coletado
- [ ] 📚 Documentação atualizada

## Fase 8: Limpeza
- [ ] 🗑️ Backups antigos removidos
- [ ] 📄 Arquivos temporários limpos
- [ ] 📚 Documentação legacy arquivada
- [ ] 🎉 Migração oficialmente concluída

---

## 🚨 Critérios de Rollback

Se qualquer um dos itens abaixo ocorrer, executar rollback imediato:

- [ ] Taxa de erro > 10%
- [ ] Tempo de resposta > 15s
- [ ] Health check falha por > 5 minutos
- [ ] Rate limit atingido constantemente
- [ ] Funcionalidade crítica indisponível

## 📞 Contatos de Emergência

- **DevOps**: [contato]
- **Backend Lead**: [contato]  
- **Frontend Lead**: [contato]
- **Product Owner**: [contato]

## 📊 Métricas de Sucesso

- ✅ **Uptime**: > 99.9%
- ✅ **Response Time**: < 5s média
- ✅ **Error Rate**: < 2%
- ✅ **Cost Reduction**: ~32%
- ✅ **Feature Parity**: 100%
