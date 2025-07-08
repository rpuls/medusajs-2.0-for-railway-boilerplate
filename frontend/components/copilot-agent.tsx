"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bot,
  MessageSquare,
  BarChart3,
  Sparkles,
  Send,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  ShoppingCart,
  Zap,
} from "lucide-react"
import { useVertexAPI } from "../utils/vertex-api"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: string
  suggestions?: string[]
}

interface Stats {
  totalCustomers: number
  activeChats: number
  analysisCount: number
  healthStatus: "healthy" | "degraded" | "unhealthy"
}

export default function CopilotAgent() {
  const [activeTab, setActiveTab] = useState("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customerData, setCustomerData] = useState("")
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    activeChats: 0,
    analysisCount: 0,
    healthStatus: "healthy",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const api = useVertexAPI()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadStats = async () => {
    try {
      const healthResponse = await api.checkAIHealth()

      setStats((prev) => ({
        ...prev,
        totalCustomers: Math.floor(Math.random() * 1000) + 500,
        activeChats: Math.floor(Math.random() * 50) + 10,
        analysisCount: prev.analysisCount,
        healthStatus: healthResponse.success ? "healthy" : "degraded",
      }))
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
      setStats((prev) => ({ ...prev, healthStatus: "unhealthy" }))
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await api.sendChatMessage(inputMessage, sessionId || undefined)

      if (response.success && response.data) {
        const botMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          content: response.data.response,
          sender: "bot",
          timestamp: response.data.timestamp,
          suggestions: response.data.suggestions,
        }

        setMessages((prev) => [...prev, botMessage])
        setSessionId(response.data.sessionId)
      } else {
        throw new Error(response.error || "Erro na resposta")
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        content: "Desculpe, ocorreu um erro. Tente novamente.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = async () => {
    if (sessionId) {
      try {
        await api.deleteChatSession(sessionId)
      } catch (error) {
        console.error("Erro ao limpar sessão:", error)
      }
    }

    setMessages([])
    setSessionId(null)
  }

  const analyzeCustomer = async () => {
    if (!customerData.trim() || isLoading) return

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      let parsedData
      try {
        parsedData = JSON.parse(customerData)
      } catch {
        // Se não for JSON válido, criar objeto simples
        parsedData = { description: customerData }
      }

      const response = await api.analyzeCustomer(parsedData)

      if (response.success && response.data) {
        setAnalysisResult(response.data.analysis)
        setStats((prev) => ({ ...prev, analysisCount: prev.analysisCount + 1 }))
      } else {
        throw new Error(response.error || "Erro na análise")
      }
    } catch (error) {
      setAnalysisResult({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "degraded":
        return "text-yellow-600"
      case "unhealthy":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
        return <AlertCircle className="h-4 w-4" />
      case "unhealthy":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Copilot Agent</h1>
            <p className="text-gray-600">Assistente IA para Volaron Store</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`${getHealthStatusColor(stats.healthStatus)} border-current`}>
            {getHealthStatusIcon(stats.healthStatus)}
            <span className="ml-1 capitalize">{stats.healthStatus}</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={loadStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Chats Ativos</p>
                <p className="text-2xl font-bold">{stats.activeChats}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Análises</p>
                <p className="text-2xl font-bold">{stats.analysisCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Conversões</p>
                <p className="text-2xl font-bold">12.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Chat</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Análise</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Ações</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Chat com IA</span>
              </CardTitle>
              <CardDescription>Converse com o assistente IA da Volaron Store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages Area */}
                <ScrollArea className="h-96 w-full border rounded-lg p-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Inicie uma conversa com o assistente IA</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            {message.suggestions && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs opacity-75">Sugestões:</p>
                                {message.suggestions.map((suggestion, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    className="mr-1 mb-1 text-xs bg-transparent"
                                    onClick={() => setInputMessage(suggestion)}
                                  >
                                    {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              <span className="text-sm text-gray-600">Digitando...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={clearChat} disabled={messages.length === 0}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Análise de Cliente</span>
              </CardTitle>
              <CardDescription>Analise dados de clientes com IA para obter insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Dados do Cliente (JSON ou texto)</label>
                  <Textarea
                    placeholder='{"name": "João Silva", "email": "joao@email.com", "purchases": [...], "totalSpent": 500}'
                    value={customerData}
                    onChange={(e) => setCustomerData(e.target.value)}
                    rows={6}
                    disabled={isLoading}
                  />
                </div>

                <Button onClick={analyzeCustomer} disabled={isLoading || !customerData.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analisar Cliente
                    </>
                  )}
                </Button>

                {analysisResult && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resultado da Análise</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.error ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{analysisResult.error}</AlertDescription>
                        </Alert>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Resumo</h4>
                            <p className="text-gray-700">{analysisResult.summary}</p>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Insights</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {analysisResult.insights?.map((insight: string, index: number) => (
                                <li key={index} className="text-gray-700">
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <Separator />

                          <div>
                            <h4 className="font-semibold mb-2">Recomendações</h4>
                            <ul className="list-disc list-inside space-y-1">
                              {analysisResult.recommendations?.map((rec: string, index: number) => (
                                <li key={index} className="text-gray-700">
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {analysisResult.confidence && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-semibold mb-2">Confiança</h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${analysisResult.confidence}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium">{analysisResult.confidence}%</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Ações de Produto</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Descrição de Produto
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Otimizar SEO
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Análise de Preços
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Marketing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Send className="h-4 w-4 mr-2" />
                  Criar Email Marketing
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Post para Redes Sociais
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Campanha Publicitária
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
