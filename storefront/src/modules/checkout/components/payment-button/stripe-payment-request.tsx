"use client"

import { useEffect, useState, useRef } from "react"
import { useStripe, useElements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import ErrorMessage from "../error-message"

type StripePaymentRequestProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  onPaymentComplete?: () => void
}

/**
 * Stripe Payment Request Button component for Google Pay and Apple Pay
 * Uses Stripe's Payment Request API
 */
const StripePaymentRequest = ({
  cart,
  notReady,
  onPaymentComplete,
}: StripePaymentRequestProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [canMakePayment, setCanMakePayment] = useState(false)
  const paymentRequestRef = useRef<any>(null)
  const paymentRequestButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!stripe || !elements || notReady || !cart) {
      return
    }

    const session = cart.payment_collection?.payment_sessions?.find(
      (s) => s.status === "pending"
    )

    if (!session?.data?.client_secret) {
      return
    }

    // Create payment request
    const paymentRequest = stripe.paymentRequest({
      country: cart.billing_address?.country_code?.toUpperCase() || "US",
      currency: cart.currency_code?.toLowerCase() || "usd",
      total: {
        label: "Total",
        amount: Math.round(cart.total ?? 0), // Amount in smallest currency unit (cents)
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: cart.billing_address?.phone ? true : false,
    })

    // Check if payment request is available
    paymentRequest.canMakePayment().then((result) => {
      if (result) {
        setCanMakePayment(true)
        paymentRequestRef.current = paymentRequest

        // Mount payment request button using Elements
        const elementsInstance = elements
        if (elementsInstance && paymentRequestButtonRef.current) {
          const prButton = elementsInstance.create("paymentRequestButton", {
            paymentRequest,
            style: {
              paymentRequestButton: {
                type: "default",
                theme: "dark",
                height: "48px",
              },
            },
          })

          prButton.mount(paymentRequestButtonRef.current)
        }

        // Handle payment method event
        paymentRequest.on("paymentmethod", async (ev) => {
          try {
            // Confirm payment with Stripe
            const { error: confirmError, paymentIntent } =
              await stripe.confirmCardPayment(
                session.data.client_secret as string,
                {
                  payment_method: ev.paymentMethod.id,
                },
                { handleActions: false }
              )

            if (confirmError) {
              ev.complete("fail")
              setError(confirmError.message || "Payment failed")
              return
            }

            if (
              paymentIntent &&
              (paymentIntent.status === "requires_capture" ||
                paymentIntent.status === "succeeded")
            ) {
              ev.complete("success")

              // Place order
              try {
                await placeOrder()
                if (onPaymentComplete) {
                  onPaymentComplete()
                }
              } catch (err: any) {
                setError(err.message || "Failed to place order")
              }
            } else {
              ev.complete("fail")
              setError("Payment was not successful")
            }
          } catch (err: any) {
            ev.complete("fail")
            setError(err.message || "Payment failed")
          }
        })
      }
    })

    return () => {
      if (paymentRequestRef.current) {
        paymentRequestRef.current = null
      }
    }
  }, [stripe, elements, cart, notReady, onPaymentComplete])

  if (!canMakePayment) {
    return null
  }

  return (
    <div className="w-full">
      <div ref={paymentRequestButtonRef} className="w-full" />
      <ErrorMessage error={error} data-testid="payment-request-error-message" />
    </div>
  )
}

export default StripePaymentRequest

