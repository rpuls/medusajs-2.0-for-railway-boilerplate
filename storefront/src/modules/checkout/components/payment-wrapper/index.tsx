"use client"

import { loadStripe } from "@stripe/stripe-js"
import React, { useEffect } from "react"
import StripeWrapper from "./stripe-wrapper"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { createContext } from "react"
import { HttpTypes } from "@medusajs/types"
import { isPaypal, isStripe } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"

type WrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

export const StripeContext = createContext(false)

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

// Completes orders that arrive via Afterpay (or other redirect-based Stripe methods).
// Stripe appends payment_intent_client_secret to return_url; we retrieve the intent
// and call placeOrder() if it's authorised — without relying on the Elements context.
const StripeReturnHandler: React.FC = () => {
  useEffect(() => {
    if (typeof window === "undefined" || !stripePromise) return
    const params = new URLSearchParams(window.location.search)
    const clientSecret = params.get("payment_intent_client_secret")
    if (!clientSecret) return

    stripePromise
      .then((stripe) => stripe?.retrievePaymentIntent(clientSecret))
      .then((result) => {
        const status = result?.paymentIntent?.status
        if (status === "requires_capture" || status === "succeeded") {
          placeOrder()
        }
      })
  }, []) // intentionally empty — run once on mount, reads from window.location

  return null
}

const Wrapper: React.FC<WrapperProps> = ({ cart, children }) => {
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  // Always include the return handler so Afterpay redirects are caught regardless
  // of whether the payment session status has changed by the time we land back.
  const returnHandler = stripeKey ? <StripeReturnHandler /> : null

  if (
    isStripe(paymentSession?.provider_id) &&
    paymentSession &&
    stripePromise
  ) {
    return (
      <StripeContext.Provider value={true}>
        {returnHandler}
        <StripeWrapper
          paymentSession={paymentSession}
          stripeKey={stripeKey}
          stripePromise={stripePromise}
        >
          {children}
        </StripeWrapper>
      </StripeContext.Provider>
    )
  }

  if (
    isPaypal(paymentSession?.provider_id) &&
    paypalClientId !== undefined &&
    cart
  ) {
    return (
      <PayPalScriptProvider
        options={{
          "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
          currency: cart?.currency_code?.toUpperCase() ?? "USD",
          intent: "authorize",
          components: "buttons",
        }}
      >
        {returnHandler}
        {children}
      </PayPalScriptProvider>
    )
  }

  return (
    <div>
      {returnHandler}
      {children}
    </div>
  )
}

export default Wrapper
