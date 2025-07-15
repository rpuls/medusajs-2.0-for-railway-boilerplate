"use client"
import React, { useState, useEffect, useCallback } from "react"
import { Text, Container, clx } from "@medusajs/ui"
import { useRouter } from "next/navigation"
import { ArrowPath } from "@medusajs/icons"
// import { getAuthHeaders, getCartId, removeCartId, setCartId } from "@lib/data/cookies"
import { placeOrder } from "@lib/data/cart"
import { sdk } from "@lib/config"
import dynamic from "next/dynamic"

// Dynamically import QRCode to avoid SSR issues
const QRCode = dynamic(() => import("react-qr-code"), { ssr: false })

// QR code placeholder component - also client-side only
const QRCodeWithPlaceholder = dynamic(() =>
  Promise.resolve(({ value, showQRCode, timeLeft, remainingAmount }: { value: string; showQRCode: boolean; timeLeft: number | null, remainingAmount: number }) => {
    let message: string;
    if (remainingAmount <= 0) {
      message = "Payment complete!";
    } else if (timeLeft !== null && timeLeft <= 0) {
      message = "Price has expired.";
    } else {
      message = "Price expiring soon...";
    }

    return (
      <div>
        <div className="relative flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg max-w-[240px]">
            <div className="relative h-[200px] w-[200px]">
              {showQRCode && value ? (
                <QRCode value={value} size={200} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-400 bg-opacity-100 text-center p-4">
                  <Text className="text-white font-medium">{message}</Text>
                  {timeLeft !== null && timeLeft <= 0 && remainingAmount > 0 && (
                    <Text className="text-white text-sm mt-2">An updated price will be available shortly.</Text>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }),
  { ssr: false }
);

type SolanaPaymentProps = {
  cart: any
}

const SolanaPayment: React.FC<SolanaPaymentProps> = ({ cart }) => {
  const paymentSession = cart?.payment_collection?.payment_sessions?.[0]
  const [isLoading, setIsLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [showQRCode, setShowQRCode] = useState(true)
  const [currentPaymentData, setCurrentPaymentData] = useState(paymentSession?.data)
  
  // Extract payment details from the component's state
  const { 
    sol_amount, 
    solana_one_time_address, 
    expiration_date,
    received_sol_amount 
  } = currentPaymentData || {}

  const remainingAmount = sol_amount && received_sol_amount ? Math.max(0, sol_amount - received_sol_amount) : sol_amount;

  // Create a Solana payment URL for the QR code
  useEffect(() => {
    if (solana_one_time_address && remainingAmount > 0 && paymentSession?.id) {
      // NOTE: Parameterized payment URL, does no longer seem to be supported by the majority of Solana wallets. Using naked wallet address instead.
      // const reference = paymentSession.id
      // const formattedAmount = parseFloat(remainingAmount.toFixed(9)).toString()
      // const message = `Order for ${cart.total} ${cart.currency_code}`
      // let paymentUrl = `solana:${solana_one_time_address}?amount=${formattedAmount}`
      // paymentUrl += `&reference=${reference}`
      // paymentUrl += `&message=${encodeURIComponent(message)}`
      
      setQrCodeUrl(solana_one_time_address)
    }
    setIsLoading(false)
  }, [solana_one_time_address, remainingAmount, paymentSession?.id, cart.total, cart.currency_code])

  // Calculate and update countdown timer
  useEffect(() => {
    if (expiration_date) {
      const expirationDate = new Date(expiration_date)
      const updateTimer = () => {
        const now = new Date()
        const diffMs = expirationDate.getTime() - now.getTime()
        const diffSeconds = Math.ceil(diffMs / 1000)
        setTimeLeft(diffSeconds > 0 ? diffSeconds : 0)
        
        // Hide QR code 15 seconds before expiration
        setShowQRCode(diffSeconds > 15)
      }
      
      updateTimer()
      const timerInterval = setInterval(updateTimer, 1000)
      
      return () => clearInterval(timerInterval)
    }
  }, [expiration_date])

  const checkPaymentStatus = useCallback(async (): Promise<void> => {
    try {
      const cartId = cart?.id;
      if (!cartId) {
        console.error("No cart ID found");
        return;
      }

      // Use the SDK to retrieve the cart
      const { cart: updatedCart } = await sdk.store.cart.retrieve(cartId);
      
      // Find the Solana payment session in the cart
      const solanaSession = updatedCart?.payment_collection?.payment_sessions?.find(
        (session: any) => session.id === paymentSession?.id
      );

      if (solanaSession) {
        // Update the component's state with the latest data
        setCurrentPaymentData(solanaSession.data);

        if (solanaSession.status !== "pending") {
          setPaymentStatus(solanaSession.status);
          if (solanaSession.status === "authorized" || solanaSession.status === "captured") {
            placeOrder(); // Note: the order is technically already placed by the scheduled job - this only serves for fetching the order, and navigating to order confirmation page
          }
        }
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  }, [cart?.id, paymentSession?.id])

  // Poll for payment status
  useEffect(() => {
    if (paymentSession?.id && paymentStatus === "pending") {
      // Check status every 15 seconds
      const interval = setInterval(checkPaymentStatus, 15000)
      return () => clearInterval(interval)
    }
  }, [paymentSession.id, paymentStatus, checkPaymentStatus])

  if (isLoading) {
    return <div>Loading payment details...</div>
  }

  return (
    <div className="mt-5 border border-ui-border-base rounded-lg p-6">
      <Text className="font-semibold mb-4">Solana Payment Details</Text>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Text className="text-ui-fg-subtle mb-1">Total Price:</Text>
            <Text className="font-medium">{sol_amount ? `${sol_amount.toFixed(9)} SOL` : '--'}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle mb-1">Amount Paid:</Text>
            <Text className="font-medium text-ui-fg-success">{received_sol_amount ? `${received_sol_amount.toFixed(9)} SOL` : '0.00 SOL'}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle mb-1">Remaining to Pay:</Text>
            <Text className="font-medium">{remainingAmount ? `${remainingAmount.toFixed(9)} SOL` : '--'}</Text>
          </div>
          {timeLeft !== null && timeLeft > 0 && (
            <div className="flex items-center">
              <Text className="text-ui-fg-subtle text-sm">Price updates in {timeLeft}s</Text>
            </div>
          )}
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
          <Text className="text-ui-fg-subtle mb-3">
            {remainingAmount > 0 ? "Scan with a Solana wallet app:" : "Payment requirement met."}
          </Text>
          <div className="relative">
            <QRCodeWithPlaceholder 
              value={qrCodeUrl} 
              showQRCode={showQRCode && remainingAmount > 0} 
              timeLeft={timeLeft}
              remainingAmount={remainingAmount}
            />
          </div>
          {timeLeft !== null && timeLeft > 1 && (
            <Text className="text-ui-fg-subtle mt-2">Time left until expiration: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
          )}
           {timeLeft !== null && timeLeft <= 0 && (
            <div className="bg-ui-bg-subtle p-4 rounded-lg text-center mt-4">
              <Text className="font-semibold">Payment Session Expired</Text>
              <Text className="text-ui-fg-subtle mt-2 text-sm">
                Don&apos;t worry! If your payment was sent on time, your order will be placed.
                Verification can take up to 5 minutes.
              </Text>
              <Text className="text-ui-fg-subtle mt-2 text-xs">
                If the payment was late and the price has changed, you may be asked to send the remaining amount.
              </Text>
            </div>
          )}
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
                onClick={checkPaymentStatus}
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
            <li>Open your Solana wallet app.</li>
            <li>Scan the QR code or copy the address.</li>
            <li>Send the <span className="font-bold">remaining amount</span> of SOL to the address.</li>
            <li>If the price expires, the remaining amount may be updated.</li>
            <li>The page will automatically update when the full payment is confirmed.</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default SolanaPayment
