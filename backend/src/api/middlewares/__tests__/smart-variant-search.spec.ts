import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { smartVariantSearchMiddleware } from "../smart-variant-search"

type Query = Record<string, unknown>

function buildReq(query: Query, fakePg: { raw: jest.Mock }) {
  return {
    query,
    scope: {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.PG_CONNECTION) {
          return fakePg
        }
        throw new Error(`unexpected resolve(${key})`)
      }),
    },
  } as unknown as Parameters<typeof smartVariantSearchMiddleware>[0]
}

describe("smartVariantSearchMiddleware", () => {
  let next: jest.Mock
  let fakePg: { raw: jest.Mock }

  beforeEach(() => {
    next = jest.fn()
    fakePg = { raw: jest.fn() }
  })

  it("passes through single-token queries to Medusa's default search", async () => {
    const query: Query = { q: "staple" }
    const req = buildReq(query, fakePg)

    await smartVariantSearchMiddleware(req, {} as any, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(fakePg.raw).not.toHaveBeenCalled()
    expect(query.q).toBe("staple")
    expect(query.id).toBeUndefined()
  })

  it("passes through queries with no q", async () => {
    const query: Query = { limit: 10 }
    const req = buildReq(query, fakePg)

    await smartVariantSearchMiddleware(req, {} as any, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(fakePg.raw).not.toHaveBeenCalled()
  })

  it("passes through when the caller already supplied id", async () => {
    const query: Query = { q: "staple black", id: ["v_123"] }
    const req = buildReq(query, fakePg)

    await smartVariantSearchMiddleware(req, {} as any, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(fakePg.raw).not.toHaveBeenCalled()
    expect(query.id).toEqual(["v_123"])
    expect(query.q).toBe("staple black")
  })

  it("runs the smart search for multi-token q and rewrites the query into an id filter", async () => {
    fakePg.raw.mockResolvedValue({ rows: [{ variant_id: "v_1" }, { variant_id: "v_2" }] })
    const query: Query = { q: "staple black" }
    const req = buildReq(query, fakePg)

    await smartVariantSearchMiddleware(req, {} as any, next)

    expect(fakePg.raw).toHaveBeenCalledTimes(1)
    const [sql, bindings] = fakePg.raw.mock.calls[0]
    expect(sql).toContain("search_text LIKE :token0")
    expect(sql).toContain("search_text LIKE :token1")
    expect(bindings).toMatchObject({ token0: "%staple%", token1: "%black%" })
    expect(query.id).toEqual(["v_1", "v_2"])
    expect(query.q).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it("emits a sentinel id when the search yields no matches so Medusa returns an empty list", async () => {
    fakePg.raw.mockResolvedValue({ rows: [] })
    const query: Query = { q: "nothing matches this" }
    const req = buildReq(query, fakePg)

    await smartVariantSearchMiddleware(req, {} as any, next)

    expect(Array.isArray(query.id)).toBe(true)
    expect((query.id as string[]).length).toBe(1)
    // Sentinel must not look like a real variant ID someone could collide with.
    expect((query.id as string[])[0]).toMatch(/no_smart_search_match/)
    expect(query.q).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it("accepts q as an array (Express collapses repeated params) and uses the first entry", async () => {
    fakePg.raw.mockResolvedValue({ rows: [{ variant_id: "v_1" }] })
    const query: Query = { q: ["staple black", "ignored"] }
    const req = buildReq(query, fakePg)

    await smartVariantSearchMiddleware(req, {} as any, next)

    expect(fakePg.raw).toHaveBeenCalledTimes(1)
    expect(query.id).toEqual(["v_1"])
  })
})
