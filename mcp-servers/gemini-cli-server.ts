#!/usr/bin/env node

/**
 * Gemini CLI MCP Server
 * Integração com google-gemini/gemini-cli
 * Volaron Store - Advanced AI Integration
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"

const execAsync = promisify(exec)

interface GeminiSession {
  id: string
  name: string
  created_at: string
  last_used: string
  context: string[]
  model: string
}

interface GeminiCommand {
  command: string
  args: string[]
  output: string
  timestamp: string
  success: boolean
}

class GeminiCLIMCPServer {
  private server: Server
  private sessions: Map<string, GeminiSession> = new Map()
  private commandHistory: GeminiCommand[] = []
  private geminiCliPath: string

  constructor() {
    this.geminiCliPath = process.env.GEMINI_CLI_PATH || "gemini"

    this.server = new Server(
      {
        name: "gemini-cli-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    )

    this.setupHandlers()
    this.initializeDefaultSession()
  }

  private setupHandlers() {
    // Lista de recursos disponíveis
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "gemini-cli://sessions",
            mimeType: "application/json",
            name: "Sessões Gemini CLI",
            description: "Lista de sessões ativas do Gemini CLI",
          },
          {
            uri: "gemini-cli://history",
            mimeType: "application/json",
            name: "Histórico de Comandos",
            description: "Histórico completo de comandos executados",
          },
          {
            uri: "gemini-cli://models",
            mimeType: "application/json",
            name: "Modelos Disponíveis",
            description: "Lista de modelos Gemini disponíveis via CLI",
          },
          {
            uri: "gemini-cli://config",
            mimeType: "application/json",
            name: "Configuração CLI",
            description: "Configuração atual do Gemini CLI",
          },
        ],
      }
    })

    // Leitura de recursos específicos
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params

      switch (uri) {
        case "gemini-cli://sessions":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(Array.from(this.sessions.values()), null, 2),
              },
            ],
          }

        case "gemini-cli://history":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(this.commandHistory, null, 2),
              },
            ],
          }

        case "gemini-cli://models":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(await this.getAvailableModels(), null, 2),
              },
            ],
          }

        case "gemini-cli://config":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(await this.getCliConfig(), null, 2),
              },
            ],
          }

        default:
          throw new McpError(ErrorCode.InvalidRequest, `Recurso não encontrado: ${uri}`)
      }
    })

    // Lista de ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "gemini_chat",
            description: "Conversar com Gemini via CLI",
            inputSchema: {
              type: "object",
              properties: {
                message: { type: "string", description: "Mensagem para o Gemini" },
                session_id: { type: "string", description: "ID da sessão (opcional)" },
                model: { type: "string", description: "Modelo a usar (opcional)" },
                temperature: { type: "number", description: "Temperatura (0.0-1.0)" },
                max_tokens: { type: "number", description: "Máximo de tokens" },
              },
              required: ["message"],
            },
          },
          {
            name: "gemini_generate_code",
            description: "Gerar código usando Gemini CLI",
            inputSchema: {
              type: "object",
              properties: {
                prompt: { type: "string", description: "Prompt para geração de código" },
                language: { type: "string", description: "Linguagem de programação" },
                framework: { type: "string", description: "Framework específico" },
                context: { type: "string", description: "Contexto adicional" },
              },
              required: ["prompt"],
            },
          },
          {
            name: "gemini_analyze_file",
            description: "Analisar arquivo usando Gemini CLI",
            inputSchema: {
              type: "object",
              properties: {
                file_path: { type: "string", description: "Caminho do arquivo" },
                analysis_type: {
                  type: "string",
                  enum: ["code_review", "security", "performance", "documentation"],
                  description: "Tipo de análise",
                },
                instructions: { type: "string", description: "Instruções específicas" },
              },
              required: ["file_path", "analysis_type"],
            },
          },
          {
            name: "gemini_batch_process",
            description: "Processar múltiplos arquivos em lote",
            inputSchema: {
              type: "object",
              properties: {
                file_pattern: { type: "string", description: "Padrão de arquivos (glob)" },
                task: {
                  type: "string",
                  enum: ["document", "refactor", "test", "optimize"],
                  description: "Tarefa a executar",
                },
                output_dir: { type: "string", description: "Diretório de saída" },
              },
              required: ["file_pattern", "task"],
            },
          },
          {
            name: "gemini_create_session",
            description: "Criar nova sessão de conversa",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nome da sessão" },
                context: { type: "string", description: "Contexto inicial" },
                model: { type: "string", description: "Modelo a usar" },
              },
              required: ["name"],
            },
          },
          {
            name: "gemini_list_sessions",
            description: "Listar todas as sessões ativas",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
          {
            name: "gemini_delete_session",
            description: "Deletar sessão específica",
            inputSchema: {
              type: "object",
              properties: {
                session_id: { type: "string", description: "ID da sessão" },
              },
              required: ["session_id"],
            },
          },
          {
            name: "gemini_export_conversation",
            description: "Exportar conversa para arquivo",
            inputSchema: {
              type: "object",
              properties: {
                session_id: { type: "string", description: "ID da sessão" },
                format: {
                  type: "string",
                  enum: ["json", "markdown", "txt"],
                  description: "Formato de exportação",
                },
                output_path: { type: "string", description: "Caminho do arquivo de saída" },
              },
              required: ["session_id", "format"],
            },
          },
        ],
      }
    })

    // Execução de ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case "gemini_chat":
            return await this.geminiChat(args as any)

          case "gemini_generate_code":
            return await this.geminiGenerateCode(args as any)

          case "gemini_analyze_file":
            return await this.geminiAnalyzeFile(args as any)

          case "gemini_batch_process":
            return await this.geminiBatchProcess(args as any)

          case "gemini_create_session":
            return await this.geminiCreateSession(args as any)

          case "gemini_list_sessions":
            return await this.geminiListSessions()

          case "gemini_delete_session":
            return await this.geminiDeleteSession(args as any)

          case "gemini_export_conversation":
            return await this.geminiExportConversation(args as any)

          default:
            throw new McpError(ErrorCode.MethodNotFound, `Ferramenta não encontrada: ${name}`)
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Erro ao executar ${name}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    })
  }

  private async initializeDefaultSession() {
    const defaultSession: GeminiSession = {
      id: "default",
      name: "Sessão Padrão Volaron",
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      context: [
        "Você é um assistente especializado em e-commerce e desenvolvimento web.",
        "Está trabalhando no projeto Volaron Store - uma loja online brasileira.",
        "Stack: MedusaJS (backend), Next.js (frontend), Railway (deploy).",
        "Foque em soluções práticas e código de qualidade.",
      ],
      model: "gemini-1.5-flash-001",
    }

    this.sessions.set("default", defaultSession)
  }

  private async executeGeminiCommand(args: string[]): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(`${this.geminiCliPath} ${args.join(" ")}`)

      // Salvar no histórico
      this.commandHistory.push({
        command: this.geminiCliPath,
        args,
        output: stdout,
        timestamp: new Date().toISOString(),
        success: true,
      })

      return stdout
    } catch (error: any) {
      // Salvar erro no histórico
      this.commandHistory.push({
        command: this.geminiCliPath,
        args,
        output: error.message,
        timestamp: new Date().toISOString(),
        success: false,
      })

      throw new Error(`Erro no Gemini CLI: ${error.message}`)
    }
  }

  private async geminiChat(args: {
    message: string
    session_id?: string
    model?: string
    temperature?: number
    max_tokens?: number
  }) {
    const sessionId = args.session_id || "default"
    const session = this.sessions.get(sessionId)

    if (!session) {
      throw new Error(`Sessão não encontrada: ${sessionId}`)
    }

    // Construir comando CLI
    const cliArgs = ["chat"]

    if (args.model) {
      cliArgs.push("--model", args.model)
    }

    if (args.temperature !== undefined) {
      cliArgs.push("--temperature", args.temperature.toString())
    }

    if (args.max_tokens) {
      cliArgs.push("--max-tokens", args.max_tokens.toString())
    }

    // Adicionar contexto da sessão
    const contextMessage = session.context.join("\n") + "\n\n" + args.message
    cliArgs.push(JSON.stringify(contextMessage))

    const response = await this.executeGeminiCommand(cliArgs)

    // Atualizar sessão
    session.last_used = new Date().toISOString()
    this.sessions.set(sessionId, session)

    return {
      content: [
        {
          type: "text",
          text: `**Sessão:** ${session.name}\n**Resposta:**\n\n${response}`,
        },
      ],
    }
  }

  private async geminiGenerateCode(args: {
    prompt: string
    language?: string
    framework?: string
    context?: string
  }) {
    const codePrompt = `
Gere código ${args.language ? `em ${args.language}` : ""} ${args.framework ? `usando ${args.framework}` : ""}.

${args.context ? `Contexto: ${args.context}\n` : ""}

Requisitos:
${args.prompt}

Instruções:
- Código limpo e bem documentado
- Seguir melhores práticas
- Incluir comentários explicativos
- Considerar tratamento de erros
- Otimizar para performance

Retorne apenas o código, sem explicações adicionais.
`

    const cliArgs = ["generate", "--format", "code", JSON.stringify(codePrompt)]
    const response = await this.executeGeminiCommand(cliArgs)

    return {
      content: [
        {
          type: "text",
          text: `**Código Gerado:**\n\n\`\`\`${args.language || ""}\n${response}\n\`\`\``,
        },
      ],
    }
  }

  private async geminiAnalyzeFile(args: {
    file_path: string
    analysis_type: "code_review" | "security" | "performance" | "documentation"
    instructions?: string
  }) {
    // Verificar se arquivo existe
    try {
      await fs.access(args.file_path)
    } catch {
      throw new Error(`Arquivo não encontrado: ${args.file_path}`)
    }

    const analysisPrompts = {
      code_review: "Faça uma revisão completa do código, identificando problemas, melhorias e boas práticas.",
      security: "Analise o código em busca de vulnerabilidades de segurança e problemas de segurança.",
      performance: "Analise o código em busca de gargalos de performance e oportunidades de otimização.",
      documentation: "Analise a documentação do código e sugira melhorias na documentação.",
    }

    const prompt = `
Analise o arquivo: ${args.file_path}

Tipo de análise: ${args.analysis_type}
${analysisPrompts[args.analysis_type]}

${args.instructions ? `Instruções adicionais: ${args.instructions}` : ""}

Forneça:
1. Resumo da análise
2. Problemas identificados
3. Sugestões de melhoria
4. Código corrigido (se aplicável)
`

    const cliArgs = ["analyze", "--file", args.file_path, JSON.stringify(prompt)]
    const response = await this.executeGeminiCommand(cliArgs)

    return {
      content: [
        {
          type: "text",
          text: `**Análise de ${args.file_path}**\n**Tipo:** ${args.analysis_type}\n\n${response}`,
        },
      ],
    }
  }

  private async geminiBatchProcess(args: {
    file_pattern: string
    task: "document" | "refactor" | "test" | "optimize"
    output_dir?: string
  }) {
    const taskPrompts = {
      document: "Gere documentação completa para o código",
      refactor: "Refatore o código seguindo melhores práticas",
      test: "Gere testes unitários completos",
      optimize: "Otimize o código para melhor performance",
    }

    const prompt = `
Processamento em lote de arquivos: ${args.file_pattern}
Tarefa: ${args.task} - ${taskPrompts[args.task]}

${args.output_dir ? `Diretório de saída: ${args.output_dir}` : ""}

Para cada arquivo:
1. Analise o conteúdo
2. Execute a tarefa solicitada
3. Gere o resultado apropriado
4. Mantenha a estrutura original quando possível
`

    const cliArgs = ["batch", "--pattern", args.file_pattern, "--task", args.task]

    if (args.output_dir) {
      cliArgs.push("--output", args.output_dir)
    }

    cliArgs.push(JSON.stringify(prompt))

    const response = await this.executeGeminiCommand(cliArgs)

    return {
      content: [
        {
          type: "text",
          text: `**Processamento em Lote Concluído**\n**Padrão:** ${args.file_pattern}\n**Tarefa:** ${args.task}\n\n${response}`,
        },
      ],
    }
  }

  private async geminiCreateSession(args: {
    name: string
    context?: string
    model?: string
  }) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: GeminiSession = {
      id: sessionId,
      name: args.name,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
      context: args.context ? [args.context] : [],
      model: args.model || "gemini-1.5-flash-001",
    }

    this.sessions.set(sessionId, session)

    return {
      content: [
        {
          type: "text",
          text: `**Sessão Criada**\n**ID:** ${sessionId}\n**Nome:** ${args.name}\n**Modelo:** ${session.model}`,
        },
      ],
    }
  }

  private async geminiListSessions() {
    const sessions = Array.from(this.sessions.values())

    const sessionList = sessions
      .map(
        (session) =>
          `• **${session.name}** (${session.id})\n  Criada: ${new Date(session.created_at).toLocaleString()}\n  Última uso: ${new Date(session.last_used).toLocaleString()}\n  Modelo: ${session.model}`,
      )
      .join("\n\n")

    return {
      content: [
        {
          type: "text",
          text: `**Sessões Ativas (${sessions.length})**\n\n${sessionList || "Nenhuma sessão ativa"}`,
        },
      ],
    }
  }

  private async geminiDeleteSession(args: { session_id: string }) {
    if (args.session_id === "default") {
      throw new Error("Não é possível deletar a sessão padrão")
    }

    const session = this.sessions.get(args.session_id)
    if (!session) {
      throw new Error(`Sessão não encontrada: ${args.session_id}`)
    }

    this.sessions.delete(args.session_id)

    return {
      content: [
        {
          type: "text",
          text: `**Sessão Deletada**\n**ID:** ${args.session_id}\n**Nome:** ${session.name}`,
        },
      ],
    }
  }

  private async geminiExportConversation(args: {
    session_id: string
    format: "json" | "markdown" | "txt"
    output_path?: string
  }) {
    const session = this.sessions.get(args.session_id)
    if (!session) {
      throw new Error(`Sessão não encontrada: ${args.session_id}`)
    }

    // Filtrar histórico da sessão
    const sessionHistory = this.commandHistory.filter((cmd) => cmd.args.some((arg) => arg.includes(args.session_id)))

    let exportContent = ""
    const outputPath = args.output_path || `./exports/session_${args.session_id}.${args.format}`

    switch (args.format) {
      case "json":
        exportContent = JSON.stringify(
          {
            session,
            history: sessionHistory,
            exported_at: new Date().toISOString(),
          },
          null,
          2,
        )
        break

      case "markdown":
        exportContent = `# Sessão: ${session.name}

**ID:** ${session.id}
**Criada:** ${new Date(session.created_at).toLocaleString()}
**Modelo:** ${session.model}

## Contexto
${session.context.join("\n")}

## Histórico de Comandos
${sessionHistory
  .map(
    (cmd) => `
### ${new Date(cmd.timestamp).toLocaleString()}
**Comando:** \`${cmd.command} ${cmd.args.join(" ")}\`
**Sucesso:** ${cmd.success ? "✅" : "❌"}

\`\`\`
${cmd.output}
\`\`\`
`,
  )
  .join("\n")}

---
*Exportado em: ${new Date().toLocaleString()}*
`
        break

      case "txt":
        exportContent = `Sessão: ${session.name} (${session.id})
Criada: ${new Date(session.created_at).toLocaleString()}
Modelo: ${session.model}

Contexto:
${session.context.join("\n")}

Histórico:
${sessionHistory
  .map(
    (cmd) => `
[${new Date(cmd.timestamp).toLocaleString()}] ${cmd.success ? "OK" : "ERRO"}
Comando: ${cmd.command} ${cmd.args.join(" ")}
Saída:
${cmd.output}
`,
  )
  .join("\n")}

Exportado em: ${new Date().toLocaleString()}
`
        break
    }

    // Criar diretório se não existir
    const dir = path.dirname(outputPath)
    await fs.mkdir(dir, { recursive: true })

    // Salvar arquivo
    await fs.writeFile(outputPath, exportContent, "utf8")

    return {
      content: [
        {
          type: "text",
          text: `**Conversa Exportada**\n**Sessão:** ${session.name}\n**Formato:** ${args.format}\n**Arquivo:** ${outputPath}`,
        },
      ],
    }
  }

  private async getAvailableModels() {
    try {
      const response = await this.executeGeminiCommand(["models", "list"])
      return {
        current_model: "gemini-1.5-flash-001",
        available_models: response.split("\n").filter((line) => line.trim()),
        cli_version: await this.getCliVersion(),
      }
    } catch (error) {
      return {
        current_model: "gemini-1.5-flash-001",
        available_models: ["gemini-1.5-flash-001", "gemini-1.5-pro"],
        error: "Não foi possível listar modelos via CLI",
      }
    }
  }

  private async getCliConfig() {
    try {
      const response = await this.executeGeminiCommand(["config", "show"])
      return {
        cli_path: this.geminiCliPath,
        config: response,
        version: await this.getCliVersion(),
      }
    } catch (error) {
      return {
        cli_path: this.geminiCliPath,
        error: "Não foi possível obter configuração do CLI",
      }
    }
  }

  private async getCliVersion(): Promise<string> {
    try {
      const { stdout } = await execAsync(`${this.geminiCliPath} --version`)
      return stdout.trim()
    } catch {
      return "Versão não disponível"
    }
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error("Gemini CLI MCP Server iniciado")
  }
}

// Iniciar servidor se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new GeminiCLIMCPServer()
  server.start().catch(console.error)
}

export default GeminiCLIMCPServer
