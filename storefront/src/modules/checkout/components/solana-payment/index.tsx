"use client"

import React, { useState, useEffect } from "react"
import { Text, Container, clx } from "@medusajs/ui"
import { sdk } from "@lib/config"
import dynamic from "next/dynamic"

// Dynamically import QRCode to avoid SSR issues
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false })

// QR code placeholder component - also client-side only
const QRCodeWithPlaceholder = dynamic(() => 
  Promise.resolve(({ value }: { value: string }) => (
    <div>
      <div className="relative flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg max-w-[240px]">
          <QRCode value={value} size={200} />
        </div>
      </div>
        <div className="mt-2 text-center">
          <Text className="text-xs break-all text-ui-fg-subtle">
            QR Code for: {value}
          </Text>
        </div>
      </div>
  )),
  { ssr: false }
)

type SolanaPaymentProps = {
  paymentSession: any
  cart?: any
}

const SolanaPayment: React.FC<SolanaPaymentProps> = ({ paymentSession, cart }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [qrCodeUrl, setQrCodeUrl] = useState("")

  // Extract payment details from the payment session
  const paymentData = paymentSession.data
  console.log('paymentData', paymentData);
  const { sol_amount, solana_one_time_address } = paymentData || {}

  // Create a Solana payment URL for the QR code
  useEffect(() => {
    if (solana_one_time_address && sol_amount) {
      const paymentUrl = `solana:${solana_one_time_address}?amount=${sol_amount}`
      setQrCodeUrl(paymentUrl)
      setIsLoading(false)
    }
  }, [solana_one_time_address, sol_amount])

  // Poll for payment status
  useEffect(() => {
    if (paymentSession.id && paymentStatus === "pending") {
      const checkPaymentStatus = async () => {
        try {
          // console.log("Checking payment status for cart with session:", paymentSession.id);
          
          const cartId = cart?.id;
          
          if (!cartId) {
            console.error("No cart ID found");
            return;
          }
          
          // Use the SDK to retrieve the cart
          const { cart: updatedCart } = await sdk.store.cart.retrieve(cartId);
          
          // console.log("Cart response:", updatedCart);
          
          // Find the Solana payment session in the cart
          const solanaSession = updatedCart?.payment_collection?.payment_sessions?.find(
            (session: any) => session.id === paymentSession.id
          );
          
          if (solanaSession && solanaSession.status !== "pending") {
            setPaymentStatus(solanaSession.status);
            
            // If payment is authorized or captured, refresh the cart
            if (solanaSession.status === "authorized" || solanaSession.status === "captured") {
              // Refresh cart or redirect to confirmation page
              window.location.reload();
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }

      // Check status every 15 seconds
      const interval = setInterval(checkPaymentStatus, 15000)
      return () => clearInterval(interval)
    }
  }, [paymentSession.id, paymentStatus])

  if (isLoading) {
    return <div>Loading payment details...</div>
  }

  return (
    <div className="mt-5 border border-ui-border-base rounded-lg p-6">
      <Text className="font-semibold mb-4">Solana Payment Details</Text>
      
      <div className="space-y-4">
        <div>
          <Text className="text-ui-fg-subtle mb-1">Amount:</Text>
          <Text className="font-medium">{JSON.stringify(sol_amount)} SOL</Text>
        </div>
        
        <div>
          <Text className="text-ui-fg-subtle mb-1">Send to wallet address:</Text>
          <Container className="bg-ui-bg-subtle p-3 rounded flex items-center justify-between">
            <Text className="text-xs break-all">{solana_one_time_address}</Text>
            <button 
              onClick={() => navigator.clipboard.writeText(solana_one_time_address)}
              className="ml-2 text-ui-fg-interactive hover:text-ui-fg-interactive-hover text-sm"
            >
              Copy
            </button>
          </Container>
        </div>

        {/* QR Code for payment */}
        <div className="flex flex-col items-center py-4">
          <Text className="text-ui-fg-subtle mb-3">Scan with a Solana wallet app:</Text>
          <div>
            {qrCodeUrl && <QRCodeWithPlaceholder value={qrCodeUrl} />}
          </div>
        </div>

        <div>
          <Text className="text-ui-fg-subtle mb-1">Status:</Text>
          <div className="flex items-center gap-2">
            <Text 
              className={clx("font-medium", {
                "text-ui-fg-interactive": paymentStatus === "pending",
                "text-ui-fg-success": paymentStatus === "authorized" || paymentStatus === "captured",
                "text-ui-fg-error": paymentStatus === "canceled" || paymentStatus === "error"
              })}
            >
              {paymentStatus === "pending" ? "Waiting for payment..." : 
               paymentStatus === "authorized" ? "Payment received!" :
               paymentStatus === "captured" ? "Payment confirmed!" :
               "Payment failed"}
            </Text>
            {paymentStatus === "pending" && (
              <button
                onClick={async () => {
                  try {
                    console.log("Manually checking payment status for cart with session:", paymentSession.id);
                    
                    const cartId = cart?.id;
                    
                    if (!cartId) {
                      console.error("No cart ID found");
                      return;
                    }
                    
                    // Use the SDK to retrieve the cart
                    const { cart: updatedCart } = await sdk.store.cart.retrieve(cartId);
                    
                    console.log("Manual cart check response:", updatedCart);
                    
                    // Find the Solana payment session in the cart
                    const solanaSession = updatedCart?.payment_collection?.payment_sessions?.find(
                      (session: any) => session.id === paymentSession.id
                    );
                    
                    if (solanaSession && solanaSession.status !== "pending") {
                      setPaymentStatus(solanaSession.status);
                      
                      if (solanaSession.status === "authorized" || solanaSession.status === "captured") {
                        window.location.reload();
                      }
                    }
                  } catch (error) {
                    console.error("Error manually checking payment status:", error);
                  }
                }}
                className="text-sm text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              >
                Check now
              </button>
            )}
          </div>
        </div>

        <div className="bg-ui-bg-subtle p-4 rounded mt-4">
          <Text className="font-medium mb-2">Instructions:</Text>
          <ol className="list-decimal pl-5 space-y-1 text-ui-fg-subtle">
            <li>Open your Solana wallet app</li>
            <li>Send exactly {sol_amount} SOL to the address above</li>
            <li>Wait for the transaction to be confirmed</li>
            <li>The page will automatically update when payment is received</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default SolanaPayment
