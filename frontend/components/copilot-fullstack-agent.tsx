"use client"

/**
 * Copilot FullStack Agent - Interface Principal
 * Volaron Store - Advanced AI Assistant
 */

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Code,
  FileText,
  Sparkles,
  Shield,
  BarChart3,
  Send,
  Mic,
  MicOff,
  Book,
} from "lucide-react"

interface ChatMessage {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: string
  metadata?: {
    command?: string
    execution_time?: number
    files_generated?: number
    task_id?: string
  }
}

interface ProjectHealth {
  score: number
  metrics: {
    code_quality: number
    test_coverage: number
    performance: number
    security: number
    documentation: number
  }
  issues: Array<{
    type: "error" | "warning" | "info"
    category: string
    message: string
    file?: string
  }>
  suggestions: string[]
}

interface CopilotTask {
  id: string
  type: string
  status: "pending" | "running" | "completed" | "failed"
  title: string
  description: string
  progress: number
  created_at: string
  completed_at?: string
}

interface MCPServer {
  name: string
  status: "connected" | "disconnected" | "error"
  capabilities: string[]
  last_ping: string
}

export default function CopilotFullStackAgent() {
  // Estados principais
  const [activeTab, setActiveTab] = useState("overview")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [projectHealth, setProjectHealth] = useState<ProjectHealth | null>(null)
  const [tasks, setTasks] = useState<CopilotTask[]>([])
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([])
  const [autoMode, setAutoMode] = useState(false)

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  // Efeitos
  useEffect(() => {
    initializeCopilot()
    const interval = setInterval(updateStatus, 30000) // Atualizar a cada 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Funções principais
  const initializeCopilot = async () => {
    try {
      // Carregar estado inicial
      await Promise.all([loadProjectHealth(), loadTasks(), loadMCPStatus(), loadChatHistory()])

      // Mensagem de boas-vindas
      addSystemMessage("🤖 Copilot FullStack Agent iniciado! Como posso ajudar com o projeto Volaron Store hoje?")
    } catch (error) {
      console.error("Erro ao inicializar Copilot:", error)
      addSystemMessage("❌ Erro ao inicializar. Verifique a configuração.")
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      type: "user",
      content: currentMessage,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentMessage,
          context: {
            activeTab,
            projectHealth,
            recentTasks: tasks.slice(-5),
          },
        }),
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        type: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
      }

      setChatMessages((prev) => [...prev, assistantMessage])

      // Atualizar dados se necessário
      if (data.metadata?.task_id) {
        await loadTasks()
      }
      if (data.metadata?.health_updated) {
        await loadProjectHealth()
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      addSystemMessage("❌ Erro ao processar mensagem. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const executeQuickAction = async (action: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/copilot/quick-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      addSystemMessage(`✅ ${action} executado: ${data.message}`)

      // Atualizar dados relevantes
      await updateStatus()
    } catch (error) {
      console.error("Erro na ação rápida:", error)
      addSystemMessage(`❌ Erro ao executar ${action}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoiceInput = () => {
    if (!isListening) {
      startVoiceRecognition()
    } else {
      stopVoiceRecognition()
    }
  }

  const startVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      addSystemMessage("❌ Reconhecimento de voz não suportado neste navegador")
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = "pt-BR"

    recognition.onstart = () => {
      setIsListening(true)
      addSystemMessage("🎤 Escutando...")
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setCurrentMessage(transcript)
      addSystemMessage(`🎤 Reconhecido: "${transcript}"`)
    }

    recognition.onerror = (event: any) => {
      console.error("Erro no reconhecimento de voz:", event.error)
      addSystemMessage(`❌ Erro no reconhecimento: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const stopVoiceRecognition = () => {
    setIsListening(false)
  }

  // Funções auxiliares
  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: `sys_${Date.now()}`,
      type: "system",
      content,
      timestamp: new Date().toISOString(),
    }
    setChatMessages((prev) => [...prev, systemMessage])
  }

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const updateStatus = async () => {
    await Promise.all([loadProjectHealth(), loadTasks(), loadMCPStatus()])
  }

  const loadProjectHealth = async () => {
    try {
      const response = await fetch("/api/copilot/health")
      const health = await response.json()
      setProjectHealth(health)
    } catch (error) {
      console.error("Erro ao carregar saúde do projeto:", error)
    }
  }

  const loadTasks = async () => {
    try {
      const response = await fetch("/api/copilot/tasks")
      const tasksData = await response.json()
      setTasks(tasksData)
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error)
    }
  }

  const loadMCPStatus = async () => {
    try {
      const response = await fetch("/api/copilot/mcp-status")
      const servers = await response.json()
      setMcpServers(servers)
    } catch (error) {
      console.error("Erro ao carregar status MCP:", error)
    }
  }

  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/copilot/chat-history")
      const history = await response.json()
      setChatMessages(history.slice(-50)) // Últimas 50 mensagens
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "running":
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "error":
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Copilot FullStack Agent</h1>
              <p className="text-sm text-gray-600">Assistente IA para Volaron Store</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={autoMode ? "default" : "secondary"}>{autoMode ? "Auto" : "Manual"}</Badge>
            <Button onClick={toggleVoiceInput}>{isListening ? <MicOff /> : <Mic />}</Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="health">Saúde do Projeto</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">{/* Overview Content */}</TabsContent>
          <TabsContent value="chat">
            {/* Chat Content */}
            <div className="flex flex-col space-y-4">
              <ScrollArea className="flex-1">
                <div className="p-4">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex items-start space-x-4">
                      <div
                        className={`p-2 rounded-lg ${msg.type === "user" ? "bg-blue-100 text-blue-800" : msg.type === "assistant" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {msg.content}
                      </div>
                      <div className="text-sm text-gray-500">{formatTimestamp(msg.timestamp)}</div>
                    </div>
                  ))}
                  <div ref={chatEndRef}></div>
                </div>
              </ScrollArea>
              <div className="flex items-center space-x-2">
                <Textarea
                  ref={messageInputRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={isLoading}>
                  {isLoading ? <Activity className="h-4 w-4 animate-spin" /> : <Send />}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tasks">
            {/* Tasks Content */}
            <div className="flex flex-col space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                    <span>{task.title}</span>
                  </div>
                  <div className="text-sm text-gray-500">{formatTimestamp(task.created_at)}</div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="health">
            {/* Health Content */}
            {projectHealth && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getHealthColor(projectHealth.score)}`}>
                    Saúde: {projectHealth.score}%
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Code /> Qualidade de Código: {projectHealth.metrics.code_quality}%
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText /> Cobertura de Testes: {projectHealth.metrics.test_coverage}%
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 /> Desempenho: {projectHealth.metrics.performance}%
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield /> Segurança: {projectHealth.metrics.security}%
                  </div>
                  <div className="flex items-center space-x-2">
                    <Book /> Documentação: {projectHealth.metrics.documentation}%
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {projectHealth.issues.map((issue) => (
                    <div key={issue.message} className="flex items-center space-x-2">
                      {issue.type === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : issue.type === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col space-y-2">
                  {projectHealth.suggestions.map((suggestion) => (
                    <div key={suggestion} className="flex items-center space-x-2">
                      <Sparkles /> {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="settings">{/* Settings Content */}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
