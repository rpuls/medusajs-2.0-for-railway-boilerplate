import { Modules } from "@medusajs/framework/utils"

import { GET, POST } from "../route"
import { PRODUCTION_STAGE_EVENT } from "../../../../../../lib/production-stage"

type AnyOrder = {
  id: string
  metadata?: Record<string, unknown>
}

const buildScope = (order: AnyOrder, opts?: { eventBusBroken?: boolean }) => {
  const orderModule = {
    retrieveOrder: jest.fn(async (id: string) => {
      if (id !== order.id) {
        throw new Error(`order ${id} not found`)
      }
      return { ...order }
    }),
    updateOrders: jest.fn(async (id: string, patch: { metadata: Record<string, unknown> }) => {
      // Simulate Medusa's updateOrders by mutating the test fixture in-place so
      // subsequent calls within a single test see the new metadata.
      order.metadata = patch.metadata
      return [order]
    }),
  }
  const eventBus = {
    emit: jest.fn(async () => {
      if (opts?.eventBusBroken) throw new Error("redis is having a moment")
    }),
  }
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() }

  return {
    orderModule,
    eventBus,
    logger,
    scope: {
      resolve: jest.fn((key: string | symbol) => {
        if (key === Modules.ORDER) return orderModule
        if (key === Modules.EVENT_BUS) return eventBus
        if (key === "logger") return logger
        throw new Error(`unexpected scope.resolve key: ${String(key)}`)
      }),
    },
  }
}

const buildReq = (
  scope: any,
  params: Record<string, string>,
  body?: Record<string, unknown>,
  query?: Record<string, unknown>
) => ({
  scope,
  params,
  body,
  query: query ?? {},
  auth_context: { actor_id: "admin-user-1" },
})

const buildRes = () => {
  const res: any = {
    statusCode: 200,
    body: undefined as unknown,
  }
  res.json = jest.fn((payload: unknown) => {
    res.body = payload
    return res
  })
  res.status = jest.fn((code: number) => {
    res.statusCode = code
    return res
  })
  return res
}

describe("POST /admin/orders/:id/production-stage", () => {
  it("sets the stage, appends a history entry, and emits the change event", async () => {
    const order: AnyOrder = { id: "order-1", metadata: {} }
    const { scope, orderModule, eventBus } = buildScope(order)
    const req = buildReq(scope, { id: "order-1" }, { stage: "in_production" })
    const res = buildRes()

    await POST(req as any, res as any)

    expect(orderModule.updateOrders).toHaveBeenCalledTimes(1)
    const updateArgs = orderModule.updateOrders.mock.calls[0]
    expect(updateArgs[0]).toBe("order-1")
    expect(updateArgs[1].metadata.production_stage).toBe("in_production")
    expect(updateArgs[1].metadata.production_stage_history).toHaveLength(1)
    expect(updateArgs[1].metadata.production_stage_history[0]).toMatchObject({
      stage: "in_production",
      changed_by: "admin-user-1",
    })

    expect(eventBus.emit).toHaveBeenCalledWith({
      name: PRODUCTION_STAGE_EVENT,
      data: expect.objectContaining({
        order_id: "order-1",
        from_stage: null,
        to_stage: "in_production",
      }),
    })

    expect(res.body).toMatchObject({
      ok: true,
      changed: true,
      production_stage: "in_production",
    })
  })

  it("is a no-op when re-applying the same stage (no event, no history append)", async () => {
    const order: AnyOrder = {
      id: "order-1",
      metadata: {
        production_stage: "in_production",
        production_stage_changed_at: "2026-01-01T00:00:00.000Z",
        production_stage_history: [
          {
            stage: "in_production",
            changed_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    }
    const { scope, orderModule, eventBus } = buildScope(order)
    const req = buildReq(scope, { id: "order-1" }, { stage: "in_production" })
    const res = buildRes()

    await POST(req as any, res as any)

    expect(orderModule.updateOrders).not.toHaveBeenCalled()
    expect(eventBus.emit).not.toHaveBeenCalled()
    expect(res.body).toMatchObject({
      ok: true,
      changed: false,
      production_stage: "in_production",
    })
  })

  it("appends to existing history when transitioning to a new stage", async () => {
    const order: AnyOrder = {
      id: "order-1",
      metadata: {
        production_stage: "received",
        production_stage_history: [
          {
            stage: "received",
            changed_at: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    }
    const { scope, orderModule } = buildScope(order)
    const req = buildReq(
      scope,
      { id: "order-1" },
      { stage: "art_review", note: "Heading to design" }
    )
    const res = buildRes()

    await POST(req as any, res as any)

    const patch = orderModule.updateOrders.mock.calls[0][1]
    expect(patch.metadata.production_stage_history).toHaveLength(2)
    expect(patch.metadata.production_stage_history[0].stage).toBe("received")
    expect(patch.metadata.production_stage_history[1]).toMatchObject({
      stage: "art_review",
      note: "Heading to design",
    })
  })

  it("rejects invalid stage values via zod", async () => {
    const order: AnyOrder = { id: "order-1" }
    const { scope } = buildScope(order)
    const req = buildReq(scope, { id: "order-1" }, { stage: "totally_made_up" })
    const res = buildRes()

    await expect(POST(req as any, res as any)).rejects.toThrow()
  })

  it("does not roll back the metadata change if event emission fails", async () => {
    const order: AnyOrder = { id: "order-1", metadata: {} }
    const { scope, orderModule, eventBus, logger } = buildScope(order, { eventBusBroken: true })
    const req = buildReq(scope, { id: "order-1" }, { stage: "in_production" })
    const res = buildRes()

    await POST(req as any, res as any)

    expect(orderModule.updateOrders).toHaveBeenCalledTimes(1)
    expect(eventBus.emit).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalled()
    expect(res.body).toMatchObject({ ok: true, changed: true })
  })
})

describe("GET /admin/orders/:id/production-stage", () => {
  it("returns the current stage + history from order metadata", async () => {
    const order: AnyOrder = {
      id: "order-1",
      metadata: {
        production_stage: "in_production",
        production_stage_changed_at: "2026-02-01T00:00:00.000Z",
        production_stage_history: [
          { stage: "received", changed_at: "2026-01-01T00:00:00.000Z" },
          { stage: "in_production", changed_at: "2026-02-01T00:00:00.000Z" },
        ],
      },
    }
    const { scope } = buildScope(order)
    const req = buildReq(scope, { id: "order-1" })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.body).toMatchObject({
      production_stage: "in_production",
      production_stage_changed_at: "2026-02-01T00:00:00.000Z",
    })
    expect((res.body as any).production_stage_history).toHaveLength(2)
  })

  it("returns null stage when none has been set yet", async () => {
    const order: AnyOrder = { id: "order-1" }
    const { scope } = buildScope(order)
    const req = buildReq(scope, { id: "order-1" })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.body).toMatchObject({
      production_stage: null,
      production_stage_changed_at: null,
      production_stage_history: [],
    })
  })

  it("filters out malformed history entries instead of throwing", async () => {
    const order: AnyOrder = {
      id: "order-1",
      metadata: {
        production_stage_history: [
          { stage: "received", changed_at: "2026-01-01T00:00:00.000Z" },
          { stage: "not_real", changed_at: "x" }, // bad stage
          "garbage", // not even an object
          { stage: "in_production" }, // missing changed_at
        ],
      },
    }
    const { scope } = buildScope(order)
    const req = buildReq(scope, { id: "order-1" })
    const res = buildRes()

    await GET(req as any, res as any)

    const body = res.body as { production_stage_history: unknown[] }
    expect(body.production_stage_history).toHaveLength(1)
  })
})
