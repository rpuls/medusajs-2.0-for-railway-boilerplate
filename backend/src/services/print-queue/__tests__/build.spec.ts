import { buildPrintQueue, type PrintJobInput } from "../build"

const baseJob = (overrides: Partial<PrintJobInput> = {}): PrintJobInput => ({
  order_id: "ord_1",
  display_id: 1,
  email: "test@example.com",
  created_at: "2026-05-01T09:00:00Z",
  deadline_at: null,
  stage: "approved",
  is_stale: false,
  units: 10,
  decoration_method: "screen_print",
  colours: [],
  recipe_id: null,
  ...overrides,
})

describe("buildPrintQueue", () => {
  test("returns empty when there are no jobs", () => {
    expect(buildPrintQueue([])).toEqual([])
    expect(buildPrintQueue(null)).toEqual([])
    expect(buildPrintQueue(undefined)).toEqual([])
  })

  test("drops malformed jobs (no order_id or no method)", () => {
    const result = buildPrintQueue([
      baseJob(),
      // @ts-expect-error testing defensive filter
      baseJob({ order_id: null }),
      // @ts-expect-error testing defensive filter
      baseJob({ decoration_method: "" }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].jobs).toHaveLength(1)
  })

  test("groups jobs with the same method + colours into one bucket", () => {
    const result = buildPrintQueue([
      baseJob({ order_id: "ord_a", colours: ["white", "black"] }),
      baseJob({ order_id: "ord_b", colours: ["black", "white"] }), // different order, same set
      baseJob({ order_id: "ord_c", colours: ["White", "Black"] }), // different case
    ])
    expect(result).toHaveLength(1)
    expect(result[0].jobs).toHaveLength(3)
    expect(result[0].decoration_method).toBe("screen_print")
    // Colours are normalised to sorted lowercase
    expect(result[0].colours).toEqual(["black", "white"])
  })

  test("splits buckets by decoration method", () => {
    const result = buildPrintQueue([
      baseJob({ order_id: "ord_a", decoration_method: "screen_print" }),
      baseJob({ order_id: "ord_b", decoration_method: "embroidery" }),
    ])
    expect(result).toHaveLength(2)
  })

  test("splits buckets by colour set within method", () => {
    const result = buildPrintQueue([
      baseJob({ order_id: "ord_a", colours: ["white"] }),
      baseJob({ order_id: "ord_b", colours: ["white", "black"] }),
    ])
    expect(result).toHaveLength(2)
  })

  test("'unspecified' colour set forms its own bucket", () => {
    const result = buildPrintQueue([
      baseJob({ order_id: "ord_a", colours: [] }),
      baseJob({ order_id: "ord_b", colours: [] }),
      baseJob({ order_id: "ord_c", colours: ["white"] }),
    ])
    expect(result).toHaveLength(2)
    const unspec = result.find((b) => b.colours.length === 0)
    expect(unspec?.jobs).toHaveLength(2)
  })

  test("stale jobs sort first within their bucket", () => {
    const result = buildPrintQueue([
      baseJob({
        order_id: "ord_fresh",
        is_stale: false,
        deadline_at: "2026-05-10T00:00:00Z",
      }),
      baseJob({
        order_id: "ord_stale",
        is_stale: true,
        deadline_at: "2026-05-20T00:00:00Z",
      }),
    ])
    expect(result[0].jobs[0].order_id).toBe("ord_stale")
    expect(result[0].has_stale).toBe(true)
  })

  test("non-stale jobs sort by deadline ascending then created_at FIFO", () => {
    const result = buildPrintQueue([
      baseJob({
        order_id: "ord_b",
        deadline_at: "2026-05-15T00:00:00Z",
        created_at: "2026-05-01T00:00:00Z",
      }),
      baseJob({
        order_id: "ord_a",
        deadline_at: "2026-05-10T00:00:00Z",
        created_at: "2026-05-02T00:00:00Z",
      }),
      baseJob({
        order_id: "ord_c",
        deadline_at: "2026-05-15T00:00:00Z",
        created_at: "2026-04-28T00:00:00Z", // earliest
      }),
    ])
    // Deadline 10th first, then 15th twice — earliest created first
    expect(result[0].jobs.map((j) => j.order_id)).toEqual([
      "ord_a",
      "ord_c",
      "ord_b",
    ])
  })

  test("null deadlines sort to the end of their bucket", () => {
    const result = buildPrintQueue([
      baseJob({ order_id: "ord_no_dl", deadline_at: null }),
      baseJob({
        order_id: "ord_dl",
        deadline_at: "2026-06-01T00:00:00Z",
      }),
    ])
    expect(result[0].jobs[0].order_id).toBe("ord_dl")
    expect(result[0].jobs[1].order_id).toBe("ord_no_dl")
  })

  test("invalid deadline strings degrade to 'no deadline'", () => {
    const result = buildPrintQueue([
      baseJob({ order_id: "ord_bad", deadline_at: "not-a-date" }),
      baseJob({
        order_id: "ord_good",
        deadline_at: "2026-06-01T00:00:00Z",
      }),
    ])
    expect(result[0].jobs[0].order_id).toBe("ord_good")
  })

  test("buckets containing stale jobs float to the top", () => {
    const result = buildPrintQueue([
      baseJob({
        order_id: "ord_embroidery_fresh",
        decoration_method: "embroidery",
        is_stale: false,
      }),
      baseJob({
        order_id: "ord_screen_stale",
        decoration_method: "screen_print",
        is_stale: true,
      }),
    ])
    expect(result[0].decoration_method).toBe("screen_print")
    expect(result[1].decoration_method).toBe("embroidery")
  })

  test("between non-stale buckets, most-units-first wins", () => {
    const result = buildPrintQueue([
      baseJob({
        order_id: "ord_a",
        decoration_method: "embroidery",
        units: 5,
      }),
      baseJob({
        order_id: "ord_b",
        decoration_method: "screen_print",
        units: 50,
      }),
      baseJob({
        order_id: "ord_c",
        decoration_method: "screen_print",
        units: 50,
      }),
    ])
    expect(result[0].decoration_method).toBe("screen_print")
    expect(result[0].total_units).toBe(100)
  })

  test("ties between same-method same-units buckets break alphabetically", () => {
    const result = buildPrintQueue([
      baseJob({
        order_id: "ord_a",
        decoration_method: "screen_print",
        colours: ["white"],
        units: 10,
      }),
      baseJob({
        order_id: "ord_b",
        decoration_method: "screen_print",
        colours: ["yellow"],
        units: 10,
      }),
    ])
    // Both have same units; "screen_print:white" < "screen_print:yellow"
    expect(result[0].colours).toEqual(["white"])
    expect(result[1].colours).toEqual(["yellow"])
  })

  test("an order with multiple decoration methods appears in multiple buckets", () => {
    // Same order id, two jobs (screen print + embroidery)
    const result = buildPrintQueue([
      baseJob({
        order_id: "ord_mixed",
        decoration_method: "screen_print",
        colours: ["white"],
      }),
      baseJob({
        order_id: "ord_mixed",
        decoration_method: "embroidery",
        colours: ["red"],
      }),
    ])
    expect(result).toHaveLength(2)
    expect(result.find((b) => b.decoration_method === "screen_print")?.jobs[0].order_id).toBe("ord_mixed")
    expect(result.find((b) => b.decoration_method === "embroidery")?.jobs[0].order_id).toBe("ord_mixed")
  })

  test("malformed units coerce to 0 in total but the job is still kept", () => {
    const result = buildPrintQueue([
      // @ts-expect-error testing defensive coercion
      baseJob({ order_id: "ord_bad_units", units: "not-a-number" }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].total_units).toBe(0)
  })

  test("identical bucket signatures across different invocations produce deterministic output", () => {
    const inputA: PrintJobInput[] = [
      baseJob({ order_id: "ord_a", colours: ["white", "black"] }),
      baseJob({ order_id: "ord_b", colours: ["white", "black"] }),
    ]
    const inputB: PrintJobInput[] = [
      baseJob({ order_id: "ord_b", colours: ["black", "white"] }),
      baseJob({ order_id: "ord_a", colours: ["black", "white"] }),
    ]
    const resA = buildPrintQueue(inputA)
    const resB = buildPrintQueue(inputB)
    expect(resA.length).toBe(resB.length)
    expect(resA[0].jobs.map((j) => j.order_id)).toEqual(
      resB[0].jobs.map((j) => j.order_id)
    )
  })
})
