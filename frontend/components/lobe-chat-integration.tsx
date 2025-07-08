"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Store, Settings, ShoppingCart, Bot, Sparkles, Menu, X } from "lucide-react"

interface LobeMenuItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  external?: boolean
  badge?: string
}

export default function LobeChatIntegration() {
  const [activeTab, setActiveTab] = useState("chat")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isStoreLoaded, setIsStoreLoaded] = useState(false)

  // Menu items inspirado no Lobe Chat
  const menuItems: LobeMenuItem[] = [
    {
      id: "chat",
      label: "Chat IA",
      icon: <MessageCircle className="h-4 w-4" />,
      badge: "AI",
    },
    {
      id: "store",
      label: "Loja Volaron",
      icon: <Store className="h-4 w-4" />,
      href: "/store",
      external: true,
      badge: "NEW",
    },
    {
      id: "products",
      label: "Produtos",
      icon: <ShoppingCart className="h-4 w-4" />,
      href: "/products",
    },
    {
      id: "copilot",
      label: "Copilot",
      icon: <Bot className="h-4 w-4" />,
      badge: "PRO",
    },
    {
      id: "settings",
      label: "Configurações",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  const handleMenuClick = (item: LobeMenuItem) => {
    if (item.external && item.href) {
      // Abrir loja em nova aba
      window.open(item.href, "_blank", "noopener,noreferrer")
    } else if (item.href) {
      // Navegação interna
      window.location.href = item.href
    } else {
      // Mudar tab ativa
      setActiveTab(item.id)
    }

    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Volaron AI</h1>
                <p className="text-xs text-gray-500">Powered by Lobe Chat</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMenuClick(item)}
                  className="flex items-center space-x-2"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleMenuClick(item)}
                  className="w-full justify-start space-x-2"
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Chat com IA - Volaron</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Bot className="h-16 w-16 text-slate-400 mx-auto" />
                    <h3 className="text-lg font-semibold text-slate-700">Chat IA da Volaron</h3>
                    <p className="text-slate-500 max-w-md">
                      Converse com nossa IA especializada em utilidades domésticas. Tire dúvidas sobre produtos,
                      instalação e muito mais!
                    </p>
                    <Button className="mt-4">Iniciar Conversa</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copilot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Copilot FullStack</span>
                  <Badge variant="outline">PRO</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Sparkles className="h-16 w-16 text-blue-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-slate-700">Copilot FullStack Agent</h3>
                    <p className="text-slate-600 max-w-md">
                      Assistente IA avançado para desenvolvimento, análise de código, geração de componentes e automação
                      de tarefas.
                    </p>
                    <Button className="mt-4">Acessar Copilot</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configurações</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Integração com Loja</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">Link da Loja no Menu</span>
                        <Badge variant="outline" className="text-green-600">
                          Ativo
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm">SSO com MedusaJS</span>
                        <Badge variant="outline">Configurar</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-700 mb-3">Tema Visual</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white border-2 border-blue-500 rounded-lg cursor-pointer">
                        <div className="w-full h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded mb-2"></div>
                        <span className="text-xs">Lobe Theme</span>
                      </div>
                      <div className="p-3 bg-slate-50 border rounded-lg cursor-pointer">
                        <div className="w-full h-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded mb-2"></div>
                        <span className="text-xs">Dark</span>
                      </div>
                      <div className="p-3 bg-slate-50 border rounded-lg cursor-pointer">
                        <div className="w-full h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded mb-2"></div>
                        <span className="text-xs">Volaron</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Store Integration Modal/Iframe */}
      {isStoreLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Loja Volaron</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsStoreLoaded(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <iframe src="/store" className="w-full h-full border-0" title="Loja Volaron" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
