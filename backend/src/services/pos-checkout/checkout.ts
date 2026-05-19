import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  OrderStatus,
} from "@medusajs/framework/utils"
import {
  convertDraftOrderWorkflow,
  createOrderWorkflow,
  markPaymentCollectionAsPaid,
} from "@medusajs/medusa/core-flows"

import { createPaymentLink } from "../stripe-payment-link"
import type { Scenario } from "../stripe-payment-link/create-link"

export type POSLineItemInput = {
  kind: "standard" | "customizer"
  variant_id: string | null
  product_id: string
  product_title: string
  variant_title: string | null
  quantity: number
  unit_price_cents?: number | null
  metadata?: Record<string, unknown>
}

export type POSCheckoutInput = {
  items: POSLineItemInput[]
  customer_id?: string | null
  email?: string | null
  region_id: string
  sales_channel_id?: string | null
  currency_code?: string | null
  payment_method: "cash" | "stripe_link"
  created_by_user_id: string
  pos_session_id: string
  metadata?: Record<string, unknown>
}

export type POSCheckoutResult = {
  order: {
    id: string
    display_id: number | string | null
    total: number
    currency_code: string
    email: string | null
  }
  payment: {
    method: "cash" | "stripe_link"
    status: "paid" | "awaiting"
    payment_link_url?: string | null
    payment_link_id?: string | null
  }
}

const isCashAllowed = (input: POSCheckoutInput): boolean =>
  input.payment_method === "cash"

/**
 * Run an end-to-end POS checkout:
 *
 *  1. createOrderWorkflow(is_draft_order=true) — same call as the
 *     built-in admin Create Draft Order route. Items carry an
 *     optional `unit_price` override for negotiated walk-in prices.
 *  2. convertDraftOrderWorkflow — flips the draft into a pending
 *     order so downstream payment/fulfillment can attach.
 *  3a. Cash: create a payment_collection for the total, link to the
 *      order, run markPaymentCollectionAsPaid. Same recipe as the
 *      stripe-payment-link webhook handler.
 *  3b. Stripe link: reuse the existing createPaymentLink service —
 *      stamps `pp_system_default` plus `real_gateway = stripe_payment_link`
 *      metadata so the payment-mix report attributes correctly.
 *
 * Customizer line metadata (CustomizerMetadata shape from the storefront)
 * is passed through unchanged on the order line so existing admin widgets
 * (mockup PDF, customizer downloads, print details) keep working without
 * a special-case for POS.
 */
export const checkoutPOSSession = async (
  container: MedusaContainer,
  input: POSCheckoutInput
): Promise<POSCheckoutResult> => {
  if (!input.items.length) {
    throw new Error("POS checkout requires at least one line item")
  }

  // 1. Build draft order input.
  const draftInput: any = {
    region_id: input.region_id,
    sales_channel_id: input.sales_channel_id ?? undefined,
    currency_code: input.currency_code ?? undefined,
    customer_id: input.customer_id ?? undefined,
    email: input.email ?? undefined,
    status: OrderStatus.DRAFT,
    is_draft_order: true,
    no_notification: true,
    metadata: {
      pos_session_id: input.pos_session_id,
      pos_user_id: input.created_by_user_id,
      payment_method: input.payment_method,
      ...(input.metadata ?? {}),
    },
    items: input.items.map((it) => ({
      title: it.product_title,
      variant_id: it.variant_id ?? undefined,
      quantity: it.quantity,
      ...(typeof it.unit_price_cents === "number"
        ? { unit_price: it.unit_price_cents / 100 }
        : {}),
      metadata: {
        ...(it.metadata ?? {}),
        pos_line_kind: it.kind,
      },
    })),
  }

  // 2. Create draft → convert to order.
  const draftResult = await createOrderWorkflow(container).run({
    input: draftInput,
  })
  const draftId = (draftResult as any)?.result?.id
  if (!draftId) throw new Error("draft order creation returned no id")

  await convertDraftOrderWorkflow(container).run({
    input: { id: draftId },
  })

  // 3. Hydrate the (now pending) order so we know the actual total.
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as any
  const { data: orders } = await query.graph({
    entity: "orders",
    filters: { id: draftId } as any,
    fields: [
      "id",
      "display_id",
      "total",
      "currency_code",
      "email",
      "metadata",
    ],
  })
  const order = orders?.[0]
  if (!order) throw new Error("order not found after draft conversion")

  // 4. Apply payment.
  if (isCashAllowed(input)) {
    const paymentModule = container.resolve(Modules.PAYMENT) as any
    const remoteLink = container.resolve(
      ContainerRegistrationKeys.REMOTE_LINK
    ) as any

    const amountCents = Math.round(Number(order.total) * 100)

    const collection = await paymentModule.createPaymentCollections({
      amount: amountCents / 100,
      currency_code: order.currency_code,
      metadata: {
        real_gateway: "pos_cash",
        pos_session_id: input.pos_session_id,
      },
    })

    await remoteLink.create({
      [Modules.ORDER]: { order_id: order.id },
      [Modules.PAYMENT]: { payment_collection_id: collection.id },
    })

    await markPaymentCollectionAsPaid(container).run({
      input: {
        payment_collection_id: collection.id,
        order_id: order.id,
      },
    })

    // Tag the resulting Payment with the real gateway so the
    // payment-mix report buckets it under "Cash" rather than the
    // hard-coded pp_system_default.
    try {
      const { data: collections } = await query.graph({
        entity: "payment_collection",
        filters: { id: collection.id },
        fields: ["id", "payments.id", "payments.metadata"],
      })
      const payment = (collections?.[0] as any)?.payments?.[0]
      if (payment?.id) {
        await paymentModule.updatePayment({
          id: payment.id,
          metadata: {
            ...((payment.metadata as Record<string, unknown>) ?? {}),
            real_gateway: "pos_cash",
            pos_session_id: input.pos_session_id,
          },
        })
      }
    } catch {
      /* attribution is best-effort */
    }

    return {
      order: {
        id: order.id,
        display_id: order.display_id ?? null,
        total: Number(order.total),
        currency_code: order.currency_code,
        email: order.email ?? null,
      },
      payment: { method: "cash", status: "paid" },
    }
  }

  // 5. Stripe Payment Link path — order stays unpaid until the
  // customer scans + pays; the existing webhook on
  // /hooks/stripe-payment-link does the markPaymentCollectionAsPaid
  // when the Checkout Session completes.
  const link = await createPaymentLink(container, {
    amountCents: Math.round(Number(order.total) * 100),
    currency: order.currency_code,
    label: "Walk-in sale",
    scenario: "full" satisfies Scenario,
    orderId: order.id,
    createdByUserId: input.created_by_user_id,
    metadata: {
      pos_session_id: input.pos_session_id,
    },
  })

  return {
    order: {
      id: order.id,
      display_id: order.display_id ?? null,
      total: Number(order.total),
      currency_code: order.currency_code,
      email: order.email ?? null,
    },
    payment: {
      method: "stripe_link",
      status: "awaiting",
      payment_link_url: link.url,
      payment_link_id: link.id,
    },
  }
}
