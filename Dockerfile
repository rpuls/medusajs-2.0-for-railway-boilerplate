# Dockerfile para Railway - Volaron Store
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    bash \
    curl \
    git \
    python3 \
    make \
    g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p .copilot mcp-servers/logs monitoring/logs exports

# Tornar scripts executáveis
RUN chmod +x scripts/*.sh
RUN chmod +x mcp-servers/*.js

# Configurar variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Executar setup automático
RUN ./scripts/railway-auto-setup.sh

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node health-check.js

# Comando de inicialização
CMD ["./start-railway.sh"]
