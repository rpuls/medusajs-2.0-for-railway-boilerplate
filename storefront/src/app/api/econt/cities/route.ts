import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:9000"

const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

/**
 * GET /api/econt/cities
 * Proxy request to backend Econt cities endpoint (server-side)
 */
export async function GET(request: NextRequest) {
  // Log immediately to ensure function is called
  console.log("=".repeat(50))
  console.log("[ECONT CITIES API] Request received at:", new Date().toISOString())
  console.log("[ECONT CITIES API] Request URL:", request.url)
  
  try {
    if (!PUBLISHABLE_API_KEY) {
      console.error("[ECONT CITIES API] ERROR: PUBLISHABLE_API_KEY is not set in environment variables")
      return NextResponse.json(
        { message: "Publishable API key not configured" },
        { status: 500 }
      )
    }

    if (!BACKEND_URL) {
      console.error("[ECONT CITIES API] ERROR: BACKEND_URL is not set in environment variables")
      return NextResponse.json(
        { message: "Backend URL not configured" },
        { status: 500 }
      )
    }

    // Extract search query from URL
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get("q")
    const queryParam = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""
    
    const backendUrl = `${BACKEND_URL}/store/econt/cities${queryParam}`
    console.log("[ECONT CITIES API] Proxying request to:", backendUrl)
    console.log("[ECONT CITIES API] Search query:", searchQuery || "none")
    console.log("[ECONT CITIES API] Using publishable key:", PUBLISHABLE_API_KEY ? "***" + PUBLISHABLE_API_KEY.slice(-4) : "NOT SET")

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_API_KEY,
      },
      // Server-side fetch - credentials are never exposed to client
      cache: "no-store", // Don't cache errors
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[ECONT CITIES API] Backend error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      
      // Try to parse as JSON, otherwise return as text
      try {
        const errorJson = JSON.parse(errorText)
        return NextResponse.json(
          { message: errorJson.message || errorText },
          { status: response.status }
        )
      } catch(error: any) {
        return NextResponse.json(
          { message: errorText || "Failed to fetch cities" },
          { status: response.status }
        )
      }
    }

    const data = await response.json()
    console.log("[ECONT CITIES API] Success! Received", data.cities?.length || 0, "cities")
    console.log("=".repeat(50))
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[ECONT CITIES API] ERROR proxying Econt cities request:", error)
    console.error("[ECONT CITIES API] Error stack:", error.stack)
    console.log("=".repeat(50))
    return NextResponse.json(
      { message: error.message || "Failed to fetch cities" },
      { status: 500 }
    )
  }
}

