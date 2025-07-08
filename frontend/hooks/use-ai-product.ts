"use client"

import { useState } from "react"
import { useVertexAI } from "@/utils/vertex-api"

interface ProductData {
  name: string
  category: string
  features?: string[]
  specifications?: Record<string, any>
}

interface AIProductHook {
  generateDescription: (productData: ProductData) => Promise<void>
  optimizeSEO: (content: any) => Promise<void>
  isLoading: boolean
  error: string | null
  generatedDescription: string | null
  seoOptimization: any | null
}

export function useAIProduct(): AIProductHook {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null)
  const [seoOptimization, setSeoOptimization] = useState<any | null>(null)

  const { generateDescription } = useVertexAI()

  const handleGenerateDescription = async (productData: ProductData) => {
    setIsLoading(true)
    setError(null)

    try {
      const description = await generateDescription(productData)
      setGeneratedDescription(description)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptimizeSEO = async (content: any) => {
    setIsLoading(true)
    setError(null)

    try {
      // Implementar chamada para otimização de SEO
      const response = await fetch("/api/ai/optimize-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error("Falha na otimização de SEO")

      const optimization = await response.json()
      setSeoOptimization(optimization)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    generateDescription: handleGenerateDescription,
    optimizeSEO: handleOptimizeSEO,
    isLoading,
    error,
    generatedDescription,
    seoOptimization,
  }
}
