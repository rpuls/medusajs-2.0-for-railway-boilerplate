import {
  applyTagIdsToCreates,
  resolveTagValues,
  type TagClient,
  type TagRecord,
} from "../spreadsheet-sync-tags"

/** In-memory TagClient that mimics Medusa's admin tag list/create surface. */
function makeFakeClient(initial: TagRecord[] = []): TagClient & {
  createdValues: string[]
  records: TagRecord[]
} {
  const records: TagRecord[] = [...initial]
  const createdValues: string[] = []
  let nextId = 1
  return {
    createdValues,
    records,
    list: async ({ limit = 200, offset = 0 }) => {
      const slice = records.slice(offset, offset + limit)
      return { product_tags: slice, count: records.length, limit, offset }
    },
    create: async ({ value }) => {
      const tag = { id: `ptag_test_${nextId++}`, value }
      records.push(tag)
      createdValues.push(value)
      return { product_tag: tag }
    },
  }
}

describe("spreadsheet-sync-tags", () => {
  it("resolveTagValues reuses existing tags case-insensitively without re-creating", async () => {
    const client = makeFakeClient([
      { id: "ptag_existing_socks", value: "Socks" },
      { id: "ptag_existing_aud", value: "audience:unisex" },
    ])
    const { idByLowerValue, createdLog } = await resolveTagValues(client, [
      "socks", // case mismatch — should match existing "Socks"
      "AUDIENCE:UNISEX", // case mismatch — should match existing "audience:unisex"
    ])
    expect(idByLowerValue.get("socks")).toBe("ptag_existing_socks")
    expect(idByLowerValue.get("audience:unisex")).toBe("ptag_existing_aud")
    expect(client.createdValues).toEqual([])
    expect(createdLog).toEqual([])
  })

  it("resolveTagValues creates missing tags preserving first-seen casing", async () => {
    const client = makeFakeClient([{ id: "ptag_aprons", value: "Aprons" }])
    const { idByLowerValue, createdLog } = await resolveTagValues(client, [
      "Aprons",
      "Hospitality",
      "Cotton",
    ])
    expect(idByLowerValue.get("aprons")).toBe("ptag_aprons")
    expect(idByLowerValue.get("hospitality")).toBeDefined()
    expect(idByLowerValue.get("cotton")).toBeDefined()
    expect(client.createdValues).toEqual(["Hospitality", "Cotton"])
    expect(createdLog.length).toBe(2)
    expect(createdLog[0]).toContain('Created tag "Hospitality"')
  })

  it("resolveTagValues de-dupes input case-insensitively (no duplicate creates)", async () => {
    const client = makeFakeClient()
    const { idByLowerValue } = await resolveTagValues(client, [
      "Socks",
      "socks",
      "SOCKS",
      "",
      "  ",
    ])
    expect(client.createdValues).toEqual(["Socks"])
    expect(idByLowerValue.size).toBe(1)
  })

  it("resolveTagValues logs but continues when a single create fails", async () => {
    const client = makeFakeClient()
    let calls = 0
    client.create = async ({ value }) => {
      calls++
      if (value === "fail") {
        throw new Error("simulated server error")
      }
      return { product_tag: { id: `ptag_ok_${calls}`, value } }
    }
    const { idByLowerValue, createdLog } = await resolveTagValues(client, ["ok", "fail", "ok2"])
    expect(idByLowerValue.get("ok")).toBeDefined()
    expect(idByLowerValue.get("ok2")).toBeDefined()
    expect(idByLowerValue.get("fail")).toBeUndefined()
    expect(createdLog.some((l) => l.includes('Failed to create tag "fail"'))).toBe(true)
  })

  it("applyTagIdsToCreates mutates creates with resolved ids, drops unresolved tag values", () => {
    const creates: Array<Record<string, unknown> & { handle?: string }> = [
      { handle: "biz-care-ca044u", title: "Tote" },
      { handle: "biz-care-ccs149u", title: "Socks" },
      { handle: "no-tags", title: "Plain" },
    ]
    const tagValuesByHandle = new Map<string, string[]>([
      ["biz-care-ca044u", ["Accessories", "Bags"]],
      ["biz-care-ccs149u", ["Accessories", "Socks", "missing-from-resolver"]],
    ])
    const idByLowerValue = new Map<string, string>([
      ["accessories", "ptag_acc"],
      ["bags", "ptag_bags"],
      ["socks", "ptag_socks"],
    ])
    applyTagIdsToCreates(creates, tagValuesByHandle, idByLowerValue)

    expect(creates[0]!.tags).toEqual([{ id: "ptag_acc" }, { id: "ptag_bags" }])
    /** "missing-from-resolver" was never resolved — silently dropped, no throw. */
    expect(creates[1]!.tags).toEqual([{ id: "ptag_acc" }, { id: "ptag_socks" }])
    /** No tag values for this handle → tags stays unset. */
    expect(creates[2]!.tags).toBeUndefined()
  })

  it("applyTagIdsToCreates dedupes by id (case-variant tag values map to same id)", () => {
    const creates: Array<Record<string, unknown> & { handle?: string }> = [
      { handle: "h", title: "T" },
    ]
    const tagValuesByHandle = new Map([["h", ["Socks", "socks", "SOCKS"]]])
    const idByLowerValue = new Map([["socks", "ptag_socks"]])
    applyTagIdsToCreates(creates, tagValuesByHandle, idByLowerValue)
    expect(creates[0]!.tags).toEqual([{ id: "ptag_socks" }])
  })

  it("resolveTagValues pages through >200 existing tags", async () => {
    const seed: TagRecord[] = Array.from({ length: 450 }, (_, i) => ({
      id: `ptag_${i}`,
      value: `tag-${i}`,
    }))
    const client = makeFakeClient(seed)
    const { idByLowerValue } = await resolveTagValues(client, ["tag-0", "tag-300", "tag-449"])
    expect(idByLowerValue.get("tag-0")).toBe("ptag_0")
    expect(idByLowerValue.get("tag-300")).toBe("ptag_300")
    expect(idByLowerValue.get("tag-449")).toBe("ptag_449")
    expect(client.createdValues).toEqual([])
  })
})
