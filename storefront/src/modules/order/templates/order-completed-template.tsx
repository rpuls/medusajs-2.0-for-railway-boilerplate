import { cookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ReceiptDownloadButton from "@modules/order/components/receipt-download-button"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import TrackingList from "@modules/order/components/tracking-list"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookieStore = await cookies()
  const isOnboarding = cookieStore.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="bg-[var(--brand-background)] py-12 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col gap-y-6 max-w-4xl w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div
          className="bg-white rounded-2xl border border-ui-border-base shadow-sm p-8 sm:p-10"
          data-testid="order-complete-container"
        >
          <div className="border-l-4 border-[var(--brand-secondary)] pl-4 mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Order #{order.display_id} &middot; Confirmed
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold text-[var(--brand-primary)] leading-tight">
              Thank you!
            </h1>
            <p className="text-ui-fg-subtle mt-3 max-w-2xl text-base">
              Your order was placed successfully. We&apos;ll email you a copy
              of the receipt and keep you posted as it moves through
              production.
            </p>
          </div>

          <OrderDetails order={order} />

          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-[var(--brand-primary)] border-l-4 border-[var(--brand-secondary)] pl-4 mb-5">
              Summary
            </h2>
            <Items items={order.items} currencyCode={order.currency_code} />
            <div className="mt-4">
              <CartTotals totals={order} />
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 my-10" />
          <ShippingDetails order={order} />

          <div className="border-t border-dashed border-gray-200 my-10" />
          <TrackingList order={order} />

          <div className="border-t border-dashed border-gray-200 my-10" />
          <PaymentDetails order={order} />

          <div className="border-t border-dashed border-gray-200 my-10" />
          <Help />

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <LocalizedClientLink
              href="/store"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Continue shopping
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account/orders"
              className="inline-flex items-center justify-center rounded-lg border border-ui-border-base bg-white px-6 py-3 text-sm font-semibold text-[var(--brand-primary)] transition hover:bg-ui-bg-subtle"
            >
              View my orders
            </LocalizedClientLink>
            <ReceiptDownloadButton orderId={order.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
