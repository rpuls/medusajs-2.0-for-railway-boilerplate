import { Modules } from "@medusajs/framework/utils"

// jest.mock is hoisted above imports — define the mock fns inside the
// factory to dodge the TDZ. We grab the references back via getMocks()
// in the tests below.
jest.mock("../../../../../../services/stripe-payment-link", () => {
  const createPaymentLink = jest.fn(async (_scope: unknown, input: any) => ({
    id: "spl_test_1",
    stripe_link_id: "plink_test_1",
    url: "https://buy.stripe.com/test_link_1",
    amount_cents: input.amountCents,
    currency: input.currency,
    scenario: input.scenario,
  }))
  const deactivatePaymentLink = jest.fn(async () => undefined)
  return { createPaymentLink, deactivatePaymentLink }
})

// Stripe API key must look set so the route doesn't 503.
process.env.STRIPE_API_KEY = "sk_test_dummy"
jest.mock("../../../../../../lib/constants", () => ({
  STRIPE_API_KEY: "sk_test_dummy",
}))

import { GET, POST } from "../route"
import { DELETE } from "../[link_id]/route"
import { STRIPE_PAYMENT_LINK_MODULE } from "../../../../../../modules/stripe-payment-link"
import * as stripeService from "../../../../../../services/stripe-payment-link"

const createPaymentLinkMock = stripeService.createPaymentLink as jest.Mock
const deactivatePaymentLinkMock = stripeService.deactivatePaymentLink as jest.Mock

const buildScope = (opts: {
  order?: { id: string; currency_code?: string } | null
  links?: any[]
  retrieveLink?: any
}) => {
  const orderModule = {
    retrieveOrder: jest.fn(async (id: string) => {
      if (!opts.order || opts.order.id !== id) {
        throw new Error("not found")
      }
      return {
        id,
        currency_code: opts.order.currency_code ?? "aud",
        total: 100,
      }
    }),
  }
  const service = {
    listStripePaymentLinks: jest.fn(async () => opts.links ?? []),
    retrieveStripePaymentLink: jest.fn(async (id: string) => {
      if (!opts.retrieveLink) {
        const err: any = new Error("not found")
        throw err
      }
      if (opts.retrieveLink.id !== id) {
        const err: any = new Error("not found")
        throw err
      }
      return opts.retrieveLink
    }),
  }
  return {
    orderModule,
    service,
    scope: {
      resolve: jest.fn((key: string | symbol) => {
        if (key === Modules.ORDER) return orderModule
        if (key === STRIPE_PAYMENT_LINK_MODULE) return service
        throw new Error(`unexpected scope.resolve key: ${String(key)}`)
      }),
    },
  }
}

const buildReq = (
  scope: any,
  params: Record<string, string>,
  body?: Record<string, unknown>
) => ({
  scope,
  params,
  body,
  query: {},
  auth_context: { actor_id: "admin-1" },
})

const buildRes = () => {
  const res: any = { statusCode: 200, body: undefined }
  res.json = jest.fn((p: unknown) => {
    res.body = p
    return res
  })
  res.status = jest.fn((c: number) => {
    res.statusCode = c
    return res
  })
  return res
}

describe("POST /admin/orders/:id/payment-link", () => {
  beforeEach(() => {
    createPaymentLinkMock.mockClear()
    deactivatePaymentLinkMock.mockClear()
  })

  it("creates a payment link with sane defaults", async () => {
    const ctx = buildScope({ order: { id: "order_1", currency_code: "aud" } })
    const req = buildReq(
      ctx.scope,
      { id: "order_1" },
      { amount_cents: 1500, scenario: "deposit", label: "50% upfront" }
    )
    const res = buildRes()

    await POST(req as any, res as any)

    expect(res.statusCode).toBe(200)
    expect(createPaymentLinkMock).toHaveBeenCalledTimes(1)
    expect(createPaymentLinkMock.mock.calls[0][1]).toMatchObject({
      amountCents: 1500,
      currency: "aud",
      scenario: "deposit",
      label: "50% upfront",
      orderId: "order_1",
    })
  })

  it("returns 400 when amount_cents is below Stripe's 50c minimum", async () => {
    const ctx = buildScope({ order: { id: "order_1" } })
    const req = buildReq(ctx.scope, { id: "order_1" }, { amount_cents: 5 })
    const res = buildRes()

    await POST(req as any, res as any)

    expect(res.statusCode).toBe(400)
    expect(createPaymentLinkMock).not.toHaveBeenCalled()
  })

  it("returns 404 when the order doesn't exist", async () => {
    const ctx = buildScope({ order: null })
    const req = buildReq(ctx.scope, { id: "missing" }, { amount_cents: 1000 })
    const res = buildRes()

    await POST(req as any, res as any)

    expect(res.statusCode).toBe(404)
    expect(createPaymentLinkMock).not.toHaveBeenCalled()
  })
})

describe("GET /admin/orders/:id/payment-link", () => {
  it("returns the existing links along with the configured flag", async () => {
    const ctx = buildScope({
      order: { id: "order_1" },
      links: [
        {
          id: "spl_1",
          stripe_link_id: "plink_1",
          url: "https://buy.stripe.com/x",
          amount: 10,
          currency_code: "aud",
          scenario: "deposit",
          label: null,
          status: "open",
          paid_at: null,
          stripe_payment_intent_id: null,
          created_at: new Date("2026-01-01").toISOString(),
        },
      ],
    })
    const req = buildReq(ctx.scope, { id: "order_1" })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.statusCode).toBe(200)
    expect((res.body as any).configured).toBe(true)
    expect((res.body as any).links).toHaveLength(1)
    expect((res.body as any).links[0]).toMatchObject({
      stripe_link_id: "plink_1",
      amount: 10,
    })
  })
})

describe("DELETE /admin/orders/:id/payment-link/:link_id", () => {
  beforeEach(() => {
    createPaymentLinkMock.mockClear()
    deactivatePaymentLinkMock.mockClear()
  })

  it("deactivates an open link", async () => {
    const ctx = buildScope({
      retrieveLink: { id: "spl_1", order_id: "order_1", status: "open" },
    })
    const req = buildReq(ctx.scope, { id: "order_1", link_id: "spl_1" })
    const res = buildRes()

    await DELETE(req as any, res as any)

    expect(res.statusCode).toBe(200)
    expect(deactivatePaymentLinkMock).toHaveBeenCalledWith(ctx.scope, "spl_1")
  })

  it("returns 404 when the link belongs to a different order", async () => {
    const ctx = buildScope({
      retrieveLink: { id: "spl_1", order_id: "other_order", status: "open" },
    })
    const req = buildReq(ctx.scope, { id: "order_1", link_id: "spl_1" })
    const res = buildRes()

    await DELETE(req as any, res as any)

    expect(res.statusCode).toBe(404)
    expect(deactivatePaymentLinkMock).not.toHaveBeenCalled()
  })

  it("propagates a 409 when the helper rejects a paid link", async () => {
    deactivatePaymentLinkMock.mockImplementationOnce(async () => {
      const err: any = new Error("Cannot deactivate a paid payment link")
      err.status = 409
      throw err
    })
    const ctx = buildScope({
      retrieveLink: { id: "spl_1", order_id: "order_1", status: "paid" },
    })
    const req = buildReq(ctx.scope, { id: "order_1", link_id: "spl_1" })
    const res = buildRes()

    await DELETE(req as any, res as any)

    expect(res.statusCode).toBe(409)
  })
})
