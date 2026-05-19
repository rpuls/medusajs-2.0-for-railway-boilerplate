"use client"

import React from "react"

import Help from "@modules/order/components/help"
import InvoiceDownloadButton from "@modules/order/components/invoice-download-button"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import OrderWatchers from "@modules/order/components/order-watchers"
import ProductionStageTracker from "@modules/order/components/production-stage-tracker"
import ReorderActions from "@modules/order/components/reorder-actions"
import ShippingDetails from "@modules/order/components/shipping-details"
import TrackingList from "@modules/order/components/tracking-list"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M13 8H3M7 4L3 8l4 4" />
  </svg>
)

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-6">
      <LocalizedClientLink
        href="/account/orders"
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
        data-testid="back-to-overview-button"
      >
        <ArrowLeftIcon className="transition-transform group-hover:-translate-x-0.5" />
        Back to orders
      </LocalizedClientLink>

      <div className="flex flex-wrap items-end justify-between gap-3 border-l-4 border-[var(--brand-secondary)] pl-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Order #{order.display_id}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
            Order details
          </h1>
        </div>
        <InvoiceDownloadButton orderId={order.id} />
      </div>

      <div
        className="flex flex-col gap-4 h-full w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <ProductionStageTracker order={order} />
        <ReorderActions order={order} />
        <OrderWatchers orderId={order.id} />
        <Items items={order.items} />
        <ShippingDetails order={order} />
        <TrackingList order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
