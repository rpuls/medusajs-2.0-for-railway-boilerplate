import { NextRequest, NextResponse } from "next/server"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id

  try {
    // Get the payment session from Medusa
    const medusaResponse = await fetch(
      `${MEDUSA_BACKEND_URL}/store/payment-sessions/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    if (!medusaResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch payment session" },
        { status: medusaResponse.status }
      )
    }

    const responseData = await medusaResponse.json()
    console.log("Medusa response:", JSON.stringify(responseData, null, 2))
    
    const { payment_session } = responseData

    // If the payment provider is not Solana, return an error
    if (!payment_session.provider_id.includes("solana")) {
      console.log(`Provider ID ${payment_session.provider_id} is not a Solana payment session`)
      return NextResponse.json(
        { error: "Not a Solana payment session" },
        { status: 400 }
      )
    }

    // Return the payment status
    return NextResponse.json({
      id: payment_session.id,
      status: payment_session.status,
      data: payment_session.data,
    })
  } catch (error) {
    console.error("Error checking Solana payment status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
