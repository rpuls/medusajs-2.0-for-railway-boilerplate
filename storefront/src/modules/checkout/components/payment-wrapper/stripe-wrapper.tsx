"use client"

import { Stripe, StripeElementsOptions } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { HttpTypes } from "@medusajs/types"

type StripeWrapperProps = {
  paymentSession: HttpTypes.StorePaymentSession
  stripeKey?: string
  stripePromise: Promise<Stripe | null> | null
  children: React.ReactNode
}

const StripeWrapper: React.FC<StripeWrapperProps> = ({
  paymentSession,
  stripeKey,
  stripePromise,
  children,
}) => {
  const options: StripeElementsOptions = {
    clientSecret: paymentSession?.data?.client_secret as string | undefined,
  }

  // These used to throw during render. Since NEXT_PUBLIC_STRIPE_KEY is optional,
  // an unconfigured store took down the whole checkout route rather than showing
  // anything useful. Render the problem in place instead, so the rest of the
  // page survives and the cause is visible.
  const misconfiguration = !stripeKey
    ? "Card payments are not configured for this store. Set NEXT_PUBLIC_STRIPE_KEY in the storefront environment."
    : !stripePromise
    ? "Card payments could not be initialised. Check that NEXT_PUBLIC_STRIPE_KEY holds a valid Stripe publishable key."
    : !paymentSession?.data?.client_secret
    ? "This payment session is missing its Stripe client secret, so card payments cannot start. Check that the Stripe provider is enabled on the backend."
    : null

  if (misconfiguration) {
    console.error("StripeWrapper:", misconfiguration)

    return (
      <div
        className="txt-medium text-ui-fg-error border border-ui-border-error rounded-rounded p-4"
        data-testid="stripe-unavailable-message"
      >
        {misconfiguration}
      </div>
    )
  }

  return (
    <Elements options={options} stripe={stripePromise}>
      {children}
    </Elements>
  )
}

export default StripeWrapper
