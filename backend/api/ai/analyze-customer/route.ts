import { type NextRequest, NextResponse } from "next/server"
import { getVertexAIService } from "../../../services/vertex-ai"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerData, analysisType = "behavior" } = body

    if (!customerData || !customerData.id) {
      return NextResponse.json({ error: "Customer data is required" }, { status: 400 })
    }

    const vertexAI = getVertexAIService()
    const analysis = await vertexAI.analyzeCustomer({
      customerData,
      analysisType,
    })

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Customer analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze customer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get("customerId")
  const analysisType = searchParams.get("type") || "behavior"

  if (!customerId) {
    return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
  }

  try {
    // Mock customer data - in real implementation, fetch from database
    const customerData = {
      id: customerId,
      email: `customer${customerId}@example.com`,
      orders: [
        {
          id: "order_1",
          total: 150.0,
          items: ["Garden Hose", "Plant Pot"],
          date: "2024-01-15",
        },
        {
          id: "order_2",
          total: 89.99,
          items: ["Kitchen Utensils"],
          date: "2024-02-20",
        },
      ],
      preferences: {
        categories: ["garden", "kitchen"],
        priceRange: "mid",
      },
    }

    const vertexAI = getVertexAIService()
    const analysis = await vertexAI.analyzeCustomer({
      customerData,
      analysisType: analysisType as "behavior" | "preferences" | "recommendations",
    })

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Customer analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze customer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
