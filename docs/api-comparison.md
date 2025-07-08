# Comparação: Vertex AI vs Gemini AI Studio API

## Diferenças Principais

### Autenticação
- **Vertex AI**: Service Account JSON + OAuth2
- **Gemini AI Studio**: API Key simples

### Endpoints
- **Vertex AI**: `https://us-central1-aiplatform.googleapis.com/v1/projects/{project}/locations/{location}/publishers/google/models/{model}:predict`
- **Gemini AI Studio**: `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`

### Modelos Disponíveis
- **Vertex AI**: gemini-1.5-flash-001, gemini-1.5-pro-001
- **Gemini AI Studio**: gemini-1.5-flash, gemini-1.5-pro, gemini-pro

### Estrutura de Request/Response
- **Vertex AI**: Formato específico com instances/predictions
- **Gemini AI Studio**: Formato mais simples com contents/candidates

## Análise de Custos

### Vertex AI (Atual)
- **Gemini 1.5 Flash**: $0.075 / 1M input tokens, $0.30 / 1M output tokens
- **Gemini 1.5 Pro**: $1.25 / 1M input tokens, $5.00 / 1M output tokens
- **Overhead**: Custos de infraestrutura Google Cloud

### Gemini AI Studio (Novo)
- **Gemini 1.5 Flash**: $0.075 / 1M input tokens, $0.30 / 1M output tokens
- **Gemini 1.5 Pro**: $1.25 / 1M input tokens, $5.00 / 1M output tokens
- **Vantagem**: Sem custos de infraestrutura adicional
- **Rate Limits**: 15 RPM (requests per minute) para free tier

### Economia Estimada
- **Redução de 20-30%** nos custos operacionais
- **Eliminação** de custos de Service Account e projeto Google Cloud
- **Simplificação** da infraestrutura
\`\`\`

## Novo Serviço Gemini AI Studio
