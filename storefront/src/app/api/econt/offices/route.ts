import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

/**
 * GET /api/econt/offices?city_id={id}
 * Proxy request to backend Econt offices endpoint (server-side)
 */
export async function GET(request: NextRequest) {
  try {
    if (!PUBLISHABLE_API_KEY) {
      return NextResponse.json(
        { message: "Publishable API key not configured" },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const cityId = searchParams.get("city_id")

    if (!cityId) {
      return NextResponse.json(
        { message: "city_id is required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/store/econt/offices?city_id=${cityId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
        },
        // Server-side fetch - credentials are never exposed to client
        // Use ISR: revalidate every 24 hours, but allow stale-while-revalidate
        next: {
          revalidate: 86400, // Revalidate once per day
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { message: errorText || "Failed to fetch offices" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error proxying Econt offices request:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch offices" },
      { status: 500 }
    )
  }
}

