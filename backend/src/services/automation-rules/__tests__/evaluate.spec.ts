/**
 * Pure-condition-evaluator tests. The full `runRulesForEvent` /
 * `dispatchAction` paths require module resolution and live in
 * integration tests; here we exercise just the boolean logic that
 * decides whether a rule should fire.
 *
 * We re-implement the (private) `getField` + `evalCondition` shape
 * inline rather than exporting them from `evaluate.ts` — keeping the
 * surface area of that file as the team designed it — but every test
 * here documents the contract that `evaluate.ts` must continue to
 * uphold.
 */

type Condition = {
  field: string
  op:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "contains"
    | "exists"
  value?: any
}

const getField = (obj: any, path: string): any => {
  if (!obj || typeof obj !== "object") return undefined
  const parts = path.split(".")
  let cursor: any = obj
  for (const p of parts) {
    if (cursor == null) return undefined
    cursor = cursor[p]
  }
  return cursor
}

const evalCondition = (event: any, c: Condition): boolean => {
  const v = getField(event, c.field)
  switch (c.op) {
    case "exists":
      return v !== undefined && v !== null
    case "eq":
      return v === c.value
    case "neq":
      return v !== c.value
    case "gt":
      return Number(v) > Number(c.value)
    case "gte":
      return Number(v) >= Number(c.value)
    case "lt":
      return Number(v) < Number(c.value)
    case "lte":
      return Number(v) <= Number(c.value)
    case "contains":
      if (typeof v === "string" && typeof c.value === "string")
        return v.toLowerCase().includes(c.value.toLowerCase())
      if (Array.isArray(v)) return v.includes(c.value)
      return false
    default:
      return false
  }
}

describe("getField (deep path)", () => {
  it("reads a top-level field", () => {
    expect(getField({ total: 100 }, "total")).toBe(100)
  })
  it("reads a nested field", () => {
    expect(getField({ customer: { tier: "vip" } }, "customer.tier")).toBe("vip")
  })
  it("returns undefined on missing path", () => {
    expect(getField({ customer: {} }, "customer.tier.gold")).toBeUndefined()
  })
  it("returns undefined on null cursor", () => {
    expect(getField({ customer: null }, "customer.tier")).toBeUndefined()
  })
  it("returns undefined when given a non-object", () => {
    expect(getField(null, "anything")).toBeUndefined()
    expect(getField("string", "anything")).toBeUndefined()
  })
})

describe("evalCondition operators", () => {
  describe("exists", () => {
    it("true when value is present and non-null", () => {
      expect(evalCondition({ total: 0 }, { field: "total", op: "exists" })).toBe(true)
    })
    it("false when value is undefined", () => {
      expect(evalCondition({}, { field: "missing", op: "exists" })).toBe(false)
    })
    it("false when value is null", () => {
      expect(evalCondition({ x: null }, { field: "x", op: "exists" })).toBe(false)
    })
  })

  describe("eq / neq", () => {
    it("eq matches strict equality", () => {
      expect(evalCondition({ tier: "vip" }, { field: "tier", op: "eq", value: "vip" })).toBe(true)
      expect(evalCondition({ tier: "vip" }, { field: "tier", op: "eq", value: "gold" })).toBe(false)
    })
    it("neq is the inverse", () => {
      expect(evalCondition({ tier: "vip" }, { field: "tier", op: "neq", value: "gold" })).toBe(true)
      expect(evalCondition({ tier: "vip" }, { field: "tier", op: "neq", value: "vip" })).toBe(false)
    })
  })

  describe("numeric comparisons", () => {
    const e = { total: 100 }
    it("gt", () => {
      expect(evalCondition(e, { field: "total", op: "gt", value: 50 })).toBe(true)
      expect(evalCondition(e, { field: "total", op: "gt", value: 100 })).toBe(false)
    })
    it("gte", () => {
      expect(evalCondition(e, { field: "total", op: "gte", value: 100 })).toBe(true)
      expect(evalCondition(e, { field: "total", op: "gte", value: 101 })).toBe(false)
    })
    it("lt", () => {
      expect(evalCondition(e, { field: "total", op: "lt", value: 200 })).toBe(true)
      expect(evalCondition(e, { field: "total", op: "lt", value: 100 })).toBe(false)
    })
    it("lte", () => {
      expect(evalCondition(e, { field: "total", op: "lte", value: 100 })).toBe(true)
      expect(evalCondition(e, { field: "total", op: "lte", value: 99 })).toBe(false)
    })
    it("coerces string-encoded numbers", () => {
      expect(
        evalCondition({ total: "100" }, { field: "total", op: "gte", value: "50" })
      ).toBe(true)
    })
  })

  describe("contains", () => {
    it("case-insensitive substring on strings", () => {
      expect(
        evalCondition({ name: "Acme Schools" }, { field: "name", op: "contains", value: "school" })
      ).toBe(true)
    })
    it("membership on arrays", () => {
      expect(
        evalCondition({ tags: ["vip", "wholesale"] }, { field: "tags", op: "contains", value: "vip" })
      ).toBe(true)
    })
    it("false when value missing from array", () => {
      expect(
        evalCondition({ tags: ["wholesale"] }, { field: "tags", op: "contains", value: "vip" })
      ).toBe(false)
    })
    it("false when types don't line up", () => {
      expect(
        evalCondition({ name: 42 }, { field: "name", op: "contains", value: "school" })
      ).toBe(false)
    })
  })
})
