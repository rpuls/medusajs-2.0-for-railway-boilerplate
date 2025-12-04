import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

/**
 * POST /api/econt/cart/[id]
 * Proxy request to save Econt data to cart metadata (server-side)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!PUBLISHABLE_API_KEY) {
      return NextResponse.json(
        { message: "Publishable API key not configured" },
        { status: 500 }
      )
    }

    const { id } = params
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/store/carts/${id}/econt-data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
        },
        body: JSON.stringify(body),
        // Server-side fetch - credentials are never exposed to client
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { message: errorText || "Failed to save Econt data" },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Don't revalidate tags here - it causes unnecessary re-fetches and loops
    // MedusaJS will automatically recalculate prices when cart metadata changes
    // The Shipping component will fetch updated methods when needed
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error proxying Econt cart data request:", error)
    return NextResponse.json(
      { message: error.message || "Failed to save Econt data" },
      { status: 500 }
    )
  }
}

