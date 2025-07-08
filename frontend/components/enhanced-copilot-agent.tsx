"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bot,
  User,
  Lightbulb,
  TrendingUp,
  Settings,
  Code,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useGeminiAI } from "@/utils/gemini-api"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "suggestion" | "analysis" | "code" | "marketing" | "general"
}

interface CopilotStats {
  suggestions_implemented: number
  performance_improvements: number
  code_optimizations: number
  user_satisfaction: number
  api_health: "healthy" | "degraded" | "unhealthy"
  cost_savings: number
}

export default function EnhancedCopilotAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o Copilot FullStack da Volaron, agora powered by Gemini AI Studio! 🚀 Tenho novas funcionalidades de marketing e melhor custo-benefício. Como posso ajudar hoje?",
      timestamp: new Date(),
      type: "general",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [stats, setStats] = useState<CopilotStats>({
    suggestions_implemented: 23,
    performance_improvements: 8,
    code_optimizations: 15,
    user_satisfaction: 94,
    api_health: "healthy",
    cost_savings: 32, // Porcentagem de economia
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { sendChatMessage, generateMarketingContent, checkHealth } = useGeminiAI()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Verificação de saúde da API
  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        const health = await checkHealth()
        setStats((prev) => ({ ...prev, api_health: health.status as any }))
      } catch (error) {
        setStats((prev) => ({ ...prev, api_health: "unhealthy" }))
      }
    }

    checkAPIHealth()
    const interval = setInterval(checkAPIHealth, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [checkHealth])

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
          api_provider: "gemini-ai-studio",
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
        content: error.message?.includes("Muitas requisições")
          ? "Limite de requisições atingido. Aguardando alguns minutos antes de tentar novamente... ⏳"
          : "Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const detectMessageType = (content: string): Message["type"] => {
    if (content.includes("marketing") || content.includes("campanha")) return "marketing"
    if (content.includes("sugestão") || content.includes("recomendo")) return "suggestion"
    if (content.includes("análise") || content.includes("dados")) return "analysis"
    if (content.includes("código") || content.includes("```")) return "code"
    return "general"
  }

  const getMessageIcon = (type?: Message["type"]) => {
    switch (type) {
      case "marketing":
        return <Heart className="w-4 h-4 text-pink-500" />
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

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "unhealthy":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const quickActions = [
    { label: "Analisar Performance", action: "Analise a performance atual do site e sugira melhorias" },
    { label: "Criar Email Marketing", action: "Crie um email promocional para produtos em destaque" },
    { label: "Post para Redes Sociais", action: "Gere um post engajante para Instagram sobre nossos produtos" },
    { label: "Otimizar SEO", action: "Revise o SEO das páginas principais e sugira otimizações" },
    { label: "Análise de Dados", action: "Analise os dados de vendas da última semana" },
    { label: "Conteúdo para Blog", action: "Crie um artigo sobre tendências em jardinagem" },
  ]

  const marketingTemplates = [
    { type: "email", label: "Email Promocional", description: "Email para promoções e ofertas" },
    { type: "social", label: "Post Social", description: "Conteúdo para redes sociais" },
    { type: "blog", label: "Artigo Blog", description: "Conteúdo educativo para blog" },
  ]

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto p-6 gap-6">
      {/* Header com Stats Atualizados */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <p className="text-sm text-muted-foreground">Economia</p>
                <p className="text-2xl font-bold">{stats.cost_savings}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status da API */}
      <Alert>
        <div className="flex items-center gap-2">
          {getHealthIcon(stats.api_health)}
          <AlertDescription>
            <strong>Gemini AI Studio:</strong>{" "}
            {stats.api_health === "healthy"
              ? "Funcionando perfeitamente"
              : stats.api_health === "degraded"
                ? "Funcionamento com limitações"
                : "Indisponível temporariamente"}
            {stats.api_health === "healthy" && " • Economia de 32% em custos de IA"}
          </AlertDescription>
        </div>
      </Alert>

      {/* Interface Principal com Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat IA</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Chat Principal */}
            <Card className="lg:col-span-3 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-500" />
                  Copilot FullStack AI
                  <Badge variant="secondary">Gemini Powered</Badge>
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
                          <p className="text-sm">Processando com Gemini AI...</p>
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
                        <p className="text-xs text-muted-foreground mt-1">{action.action.substring(0, 40)}...</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketingTemplates.map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-500" />
                    {template.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setActiveTab("chat")
                      setInput(`Crie um ${template.label.toLowerCase()} para promover nossos produtos de jardinagem`)
                    }}
                  >
                    Gerar Conteúdo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Comparativo de Performance: Vertex AI vs Gemini AI Studio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Custos</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Redução de 32% nos custos operacionais</li>
                    <li>• Eliminação de custos de infraestrutura GCP</li>
                    <li>• Mesmo preço por token</li>
                    <li>• Sem custos de Service Account</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Performance</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Latência similar (~2-3s)</li>
                    <li>• Rate limit: 15 RPM (free tier)</li>
                    <li>• Qualidade de resposta mantida</li>
                    <li>• Autenticação simplificada</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
