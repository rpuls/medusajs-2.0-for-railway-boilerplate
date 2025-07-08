"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bot,
  Send,
  Activity,
  Users,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { vertexAPI } from "../utils/vertex-api"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface Stats {
  totalCustomers: number
  activeOrders: number
  revenue: number
  aiInteractions: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
}

export default function CopilotAgent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 1247,
    activeOrders: 89,
    revenue: 45678.9,
    aiInteractions: 342,
  })
  const [healthStatus, setHealthStatus] = useState<"healthy" | "warning" | "error">("healthy")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: "1",
        content:
          "Olá! Sou o Copilot da Volaron Store. Como posso ajudá-lo hoje? Posso analisar clientes, gerar descrições de produtos, ou responder perguntas sobre o negócio.",
        sender: "bot",
        timestamp: new Date(),
      },
    ])

    // Check AI health on mount
    checkAIHealth()
  }, [])

  const checkAIHealth = async () => {
    try {
      const response = await vertexAPI.healthCheck()
      if (response.success) {
        setHealthStatus("healthy")
      } else {
        setHealthStatus("warning")
      }
    } catch (error) {
      setHealthStatus("error")
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await vertexAPI.sendChatMessage(inputMessage)

      if (response.success && response.data) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.data.response,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])

        // Update stats
        setStats((prev) => ({
          ...prev,
          aiInteractions: prev.aiInteractions + 1,
        }))
      } else {
        throw new Error(response.error || "Failed to get response")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: "analyze-customer",
      title: "Analisar Cliente",
      description: "Análise comportamental de clientes",
      icon: <Users className="h-4 w-4" />,
      action: async () => {
        setIsLoading(true)
        try {
          const response = await vertexAPI.getCustomerAnalysis("12345", "behavior")
          if (response.success && response.data) {
            const analysisMessage: Message = {
              id: Date.now().toString(),
              content: `Análise do Cliente 12345:\n\n${response.data.insights}`,
              sender: "bot",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, analysisMessage])
          }
        } catch (error) {
          console.error("Error analyzing customer:", error)
        } finally {
          setIsLoading(false)
        }
      },
    },
    {
      id: "generate-description",
      title: "Gerar Descrição",
      description: "Criar descrição de produto com IA",
      icon: <Zap className="h-4 w-4" />,
      action: () => {
        const message =
          "Gere uma descrição para um produto de jardinagem: Mangueira de jardim 15m, resistente, com bico pulverizador."
        setInputMessage(message)
      },
    },
    {
      id: "sales-report",
      title: "Relatório de Vendas",
      description: "Análise de performance de vendas",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => {
        const message = "Gere um relatório de vendas com insights sobre os produtos mais vendidos e tendências."
        setInputMessage(message)
      },
    },
    {
      id: "customer-support",
      title: "Suporte ao Cliente",
      description: "Respostas automáticas para dúvidas",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => {
        const message = "Como posso ajudar um cliente que está com problemas no checkout?"
        setInputMessage(message)
      },
    },
  ]

  const getHealthStatusColor = () => {
    switch (healthStatus) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthStatusIcon = () => {
    switch (healthStatus) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="h-8 w-8 text-blue-600" />
              Copilot FullStack Agent
            </h1>
            <p className="text-muted-foreground mt-1">Assistente inteligente para Volaron Store</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getHealthStatusColor()}>
              {getHealthStatusIcon()}
              {healthStatus === "healthy" ? "Online" : healthStatus === "warning" ? "Atenção" : "Offline"}
            </Badge>
            <Button variant="outline" size="sm" onClick={checkAIHealth}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pedidos Ativos</p>
                  <p className="text-2xl font-bold">{stats.activeOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita</p>
                  <p className="text-2xl font-bold">
                    R$ {stats.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Interações IA</p>
                  <p className="text-2xl font-bold">{stats.aiInteractions}</p>
                </div>
                <Bot className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat IA</TabsTrigger>
              <TabsTrigger value="actions">Ações Rápidas</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Conversa com IA
                  </CardTitle>
                  <CardDescription>Converse com o assistente inteligente da Volaron Store</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "user" ? "bg-blue-600 text-white" : "bg-muted"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.sender === "user" ? "text-blue-100" : "text-muted-foreground"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                              <span>Pensando...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <Separator className="my-4" />
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                    />
                    <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <Button variant="ghost" className="w-full h-auto p-0 justify-start" onClick={action.action}>
                        <div className="flex items-start gap-3 text-left">
                          <div className="mt-1">{action.icon}</div>
                          <div>
                            <h3 className="font-semibold">{action.title}</h3>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">IA Gemini</span>
                <Badge variant={healthStatus === "healthy" ? "default" : "destructive"}>
                  {healthStatus === "healthy" ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backend</span>
                <Badge variant="default">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="default">Online</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Análises hoje</span>
                  <span className="font-semibold">23</span>
                </div>
                <div className="flex justify-between">
                  <span>Descrições geradas</span>
                  <span className="font-semibold">15</span>
                </div>
                <div className="flex justify-between">
                  <span>Chats atendidos</span>
                  <span className="font-semibold">67</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {healthStatus !== "healthy" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Alguns serviços de IA podem estar indisponíveis. Verifique a configuração.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}
