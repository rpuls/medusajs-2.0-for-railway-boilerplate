"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bot, User, Lightbulb, TrendingUp, Settings, Code } from "lucide-react"
import { useVertexAI } from "@/utils/vertex-api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "suggestion" | "analysis" | "code" | "general"
}

interface CopilotStats {
  suggestions_implemented: number
  performance_improvements: number
  code_optimizations: number
  user_satisfaction: number
}

export default function CopilotAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o Copilot FullStack da Volaron. Posso ajudar com análises, sugestões de melhorias, geração de código e otimizações. Como posso ajudar hoje?",
      timestamp: new Date(),
      type: "general",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<CopilotStats>({
    suggestions_implemented: 23,
    performance_improvements: 8,
    code_optimizations: 15,
    user_satisfaction: 94,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendChatMessage } = useVertexAI()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const context = {
        conversation_history: messages.slice(-5).map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        user_data: {
          role: "admin",
          project: "volaron-store",
        },
      }

      const response = await sendChatMessage(input, context)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        type: detectMessageType(response),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const detectMessageType = (content: string): Message["type"] => {
    if (content.includes("sugestão") || content.includes("recomendo")) return "suggestion"
    if (content.includes("análise") || content.includes("dados")) return "analysis"
    if (content.includes("código") || content.includes("```")) return "code"
    return "general"
  }

  const getMessageIcon = (type?: Message["type"]) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="w-4 h-4 text-yellow-500" />
      case "analysis":
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      case "code":
        return <Code className="w-4 h-4 text-green-500" />
      default:
        return <Bot className="w-4 h-4 text-purple-500" />
    }
  }

  const quickActions = [
    { label: "Analisar Performance", action: "Analise a performance atual do site e sugira melhorias" },
    { label: "Otimizar SEO", action: "Revise o SEO das páginas principais e sugira otimizações" },
    { label: "Gerar Componente", action: "Crie um novo componente React para o carrinho de compras" },
    { label: "Análise de Dados", action: "Analise os dados de vendas da última semana" },
  ]

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-6 gap-6">
      {/* Header com Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Sugestões</p>
                <p className="text-2xl font-bold">{stats.suggestions_implemented}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Melhorias</p>
                <p className="text-2xl font-bold">{stats.performance_improvements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Otimizações</p>
                <p className="text-2xl font-bold">{stats.code_optimizations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold">{stats.user_satisfaction}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Principal */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-500" />
              Copilot FullStack AI
              <Badge variant="secondary">Online</Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4 mb-4" style={{ height: "400px" }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0">{getMessageIcon(message.type)}</div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm">Processando...</p>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta ou comando..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 bg-transparent"
                  onClick={() => setInput(action.action)}
                >
                  <div>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.action.substring(0, 50)}...</p>
                  </div>
                </Button>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Status do Sistema</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Vertex AI</span>
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>N8N Workflows</span>
                  <Badge variant="secondary" className="text-xs">
                    Ativo
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Database</span>
                  <Badge variant="secondary" className="text-xs">
                    Saudável
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
