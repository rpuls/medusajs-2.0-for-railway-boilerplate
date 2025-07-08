import { type NextRequest, NextResponse } from "next/server"
import { geminiAIService } from "@/backend/services/gemini-ai-studio"

export async function POST(request: NextRequest) {
  try {
    const { customerId, orderHistory, preferences } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const analysisPrompt = `
      Analyze this customer profile and provide insights:
      
      Customer ID: ${customerId}
      Order History: ${JSON.stringify(orderHistory)}
      Preferences: ${JSON.stringify(preferences)}
      
      Please provide:
      1. Customer behavior patterns
      2. Purchase recommendations
      3. Risk assessment (churn probability)
      4. Personalization suggestions
      5. Marketing campaign recommendations
      
      Format the response as JSON with clear categories.
    `

    const analysis = await geminiAIService.generateContent(analysisPrompt)

    // Parse the AI response
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(analysis)
    } catch {
      // If not valid JSON, structure the response
      parsedAnalysis = {
        behaviorPatterns: analysis.split("\n").slice(0, 3),
        recommendations: analysis.split("\n").slice(3, 6),
        riskAssessment: "Low",
        personalization: analysis.split("\n").slice(6, 9),
        marketingCampaigns: analysis.split("\n").slice(9, 12),
      }
    }

    return NextResponse.json({
      success: true,
      customerId,
      analysis: parsedAnalysis,
      timestamp: new Date().toISOString(),
      aiProvider: "gemini-1.5-flash",
    })
  } catch (error) {
    console.error("Customer analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze customer",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID parameter is required" }, { status: 400 })
  }

  try {
    // Here you would typically fetch from your database
    // For now, return a sample analysis
    return NextResponse.json({
      success: true,
      customerId,
      lastAnalysis: {
        behaviorPatterns: ["Frequent buyer", "Price-sensitive", "Mobile-first shopper"],
        recommendations: ["Home & Garden products", "Seasonal items", "Bundle deals"],
        riskAssessment: "Low",
        personalization: ["Email campaigns", "Product recommendations", "Loyalty program"],
        marketingCampaigns: ["Seasonal promotions", "Cross-sell campaigns", "Retention offers"],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching customer analysis:", error)
    return NextResponse.json({ error: "Failed to fetch customer analysis" }, { status: 500 })
  }
}
