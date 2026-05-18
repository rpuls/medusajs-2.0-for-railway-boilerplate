import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

import { STRIPE_PAYMENT_LINK_MODULE } from "../../../modules/stripe-payment-link"

// Replace the workflow with a spy we can assert on. Must be hoisted above
// the import of the unit-under-test so jest substitutes before module init.
const markPaymentCollectionAsPaidMock = jest.fn(() => ({
  run: jest.fn(async () => ({ result: { id: "pay_1" } })),
}))
jest.mock("@medusajs/medusa/core-flows", () => ({
  markPaymentCollectionAsPaid: (...args: unknown[]) =>
    markPaymentCollectionAsPaidMock(...args),
}))

import { handleCheckoutSessionCompleted } from "../handle-webhook"

type Row = {
  id: string
  stripe_link_id: string
  order_id: string | null
  quote_id: string | null
  amount: number
  currency_code: string
  scenario: string
  status: "open" | "paid" | "deactivated" | "expired"
  metadata: Record<string, unknown> | null
}

const buildScope = (initialRow: Row | null, orderMetadata: Record<string, unknown> = {}) => {
  const row = initialRow ? { ...initialRow } : null

  const service = {
    listStripePaymentLinks: jest.fn(async (filter: any) => {
      if (!row) return []
      if (filter?.stripe_link_id && filter.stripe_link_id !== row.stripe_link_id) {
        return []
      }
      return [row]
    }),
    updateStripePaymentLinks: jest.fn(async (patch: any) => {
      if (!row) return null
      Object.assign(row, patch)
      return row
    }),
  }

  const paymentModule = {
    createPaymentCollections: jest.fn(async (input: any) => ({
      id: "paycol_1",
      amount: input.amount,
      currency_code: input.currency_code,
      metadata: input.metadata,
    })),
    updatePayment: jest.fn(async () => ({ id: "pay_1" })),
  }

  const order = { id: "order_1", metadata: { ...orderMetadata } }
  const orderModule = {
    retrieveOrder: jest.fn(async () => order),
    updateOrders: jest.fn(async (_id: string, patch: any) => {
      Object.assign(order, patch)
      return order
    }),
  }

  const remoteLink = {
    create: jest.fn(async () => ({})),
  }

  const query = {
    graph: jest.fn(async ({ entity }: any) => {
      if (entity === "payment_collection") {
        return {
          data: [
            {
              id: "paycol_1",
              payments: [{ id: "pay_1", metadata: {} }],
            },
          ],
        }
      }
      if (entity === "order") {
        return { data: [{ id: "order_1" }] }
      }
      return { data: [] }
    }),
  }

  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }

  const container = {
    resolve: jest.fn((key: string | symbol) => {
      if (key === STRIPE_PAYMENT_LINK_MODULE) return service
      if (key === Modules.PAYMENT) return paymentModule
      if (key === Modules.ORDER) return orderModule
      if (key === ContainerRegistrationKeys.REMOTE_LINK) return remoteLink
      if (key === ContainerRegistrationKeys.QUERY) return query
      if (key === ContainerRegistrationKeys.LOGGER) return logger
      if (key === "logger") return logger
      throw new Error(`unexpected scope.resolve key: ${String(key)}`)
    }),
  }

  return {
    container,
    service,
    paymentModule,
    orderModule,
    remoteLink,
    query,
    logger,
    rowSnapshot: () => (row ? { ...row } : null),
    orderSnapshot: () => ({ ...order, metadata: { ...order.metadata } }),
  }
}

const buildEvent = (overrides: Partial<any> = {}) => ({
  id: overrides.id ?? "evt_test_1",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_test_1",
      payment_status: "paid",
      payment_link: "plink_test_1",
      payment_intent: "pi_test_1",
      amount_total: 1000,
      currency: "aud",
      customer_details: { email: "customer@example.com" },
      ...overrides.session,
    },
  },
})

describe("handleCheckoutSessionCompleted", () => {
  beforeEach(() => {
    markPaymentCollectionAsPaidMock.mockClear()
  })

  it("applies a payment to the order and flips the row to paid", async () => {
    const { container, service, paymentModule, remoteLink, orderModule, rowSnapshot, orderSnapshot } =
      buildScope({
        id: "spl_1",
        stripe_link_id: "plink_test_1",
        order_id: "order_1",
        quote_id: null,
        amount: 10,
        currency_code: "aud",
        scenario: "deposit",
        status: "open",
        metadata: null,
      })

    await handleCheckoutSessionCompleted(container as any, buildEvent() as any)

    expect(paymentModule.createPaymentCollections).toHaveBeenCalledTimes(1)
    expect(paymentModule.createPaymentCollections.mock.calls[0][0]).toMatchObject({
      amount: 10,
      currency_code: "aud",
      metadata: expect.objectContaining({
        real_gateway: "stripe_payment_link",
        stripe_payment_link_id: "plink_test_1",
      }),
    })
    expect(remoteLink.create).toHaveBeenCalledTimes(1)
    expect(markPaymentCollectionAsPaidMock).toHaveBeenCalledTimes(1)
    expect(service.updateStripePaymentLinks).toHaveBeenCalled()
    expect(rowSnapshot()?.status).toBe("paid")
    // order metadata should now carry a summary entry.
    const finalOrder = orderSnapshot()
    expect((finalOrder.metadata as any).stripe_payment_links).toHaveLength(1)
    expect((finalOrder.metadata as any).stripe_payment_links[0]).toMatchObject({
      link_id: "plink_test_1",
      payment_intent_id: "pi_test_1",
    })
    expect(orderModule.updateOrders).toHaveBeenCalled()
  })

  it("is idempotent when the row is already paid", async () => {
    const { container, paymentModule, service } = buildScope({
      id: "spl_1",
      stripe_link_id: "plink_test_1",
      order_id: "order_1",
      quote_id: null,
      amount: 10,
      currency_code: "aud",
      scenario: "deposit",
      status: "paid",
      metadata: null,
    })

    await handleCheckoutSessionCompleted(container as any, buildEvent() as any)

    expect(paymentModule.createPaymentCollections).not.toHaveBeenCalled()
    expect(markPaymentCollectionAsPaidMock).not.toHaveBeenCalled()
    expect(service.updateStripePaymentLinks).not.toHaveBeenCalled()
  })

  it("ignores sessions whose payment_status isn't 'paid'", async () => {
    const { container, paymentModule } = buildScope({
      id: "spl_1",
      stripe_link_id: "plink_test_1",
      order_id: "order_1",
      quote_id: null,
      amount: 10,
      currency_code: "aud",
      scenario: "deposit",
      status: "open",
      metadata: null,
    })

    await handleCheckoutSessionCompleted(
      container as any,
      buildEvent({ session: { payment_status: "unpaid" } }) as any
    )

    expect(paymentModule.createPaymentCollections).not.toHaveBeenCalled()
  })

  it("ignores sessions with no payment_link (cart checkout)", async () => {
    const { container, paymentModule } = buildScope({
      id: "spl_1",
      stripe_link_id: "plink_test_1",
      order_id: "order_1",
      quote_id: null,
      amount: 10,
      currency_code: "aud",
      scenario: "deposit",
      status: "open",
      metadata: null,
    })

    await handleCheckoutSessionCompleted(
      container as any,
      buildEvent({ session: { payment_link: null } }) as any
    )

    expect(paymentModule.createPaymentCollections).not.toHaveBeenCalled()
  })

  it("logs and ignores when no local row matches the stripe_link_id", async () => {
    const { container, paymentModule, logger } = buildScope(null)

    await handleCheckoutSessionCompleted(container as any, buildEvent() as any)

    expect(paymentModule.createPaymentCollections).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalled()
  })

  it("merges multiple paid links into order metadata without duplicating", async () => {
    const ctx = buildScope(
      {
        id: "spl_1",
        stripe_link_id: "plink_test_1",
        order_id: "order_1",
        quote_id: null,
        amount: 10,
        currency_code: "aud",
        scenario: "deposit",
        status: "open",
        metadata: null,
      },
      {
        stripe_payment_links: [
          {
            link_id: "plink_test_1",
            payment_intent_id: "pi_old",
            amount: 5,
            currency: "aud",
            scenario: "deposit",
            paid_at: new Date().toISOString(),
            payment_collection_id: "paycol_old",
          },
        ],
      }
    )

    await handleCheckoutSessionCompleted(ctx.container as any, buildEvent() as any)

    const finalOrder = ctx.orderSnapshot()
    const summary = (finalOrder.metadata as any).stripe_payment_links
    expect(summary).toHaveLength(1)
    // The new entry overwrites the stale one with the same link_id.
    expect(summary[0]).toMatchObject({
      link_id: "plink_test_1",
      payment_intent_id: "pi_test_1",
    })
  })
})
