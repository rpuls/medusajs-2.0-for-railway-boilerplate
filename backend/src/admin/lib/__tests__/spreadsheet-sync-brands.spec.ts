import {
  resolveBrandValues,
  resolveBrandIdForValue,
  type BrandClient,
  type BrandRecord,
} from "../spreadsheet-sync-brands"

function makeFakeClient(initial: BrandRecord[] = []): BrandClient & {
  createdNames: string[]
  records: BrandRecord[]
} {
  const records: BrandRecord[] = [...initial]
  const createdNames: string[] = []
  let nextId = 1
  return {
    createdNames,
    records,
    list: async ({ limit = 200, offset = 0 }) => {
      const slice = records.slice(offset, offset + limit)
      return { brands: slice, count: records.length, limit, offset }
    },
    create: async ({ name, handle, external_code }) => {
      const record: BrandRecord = {
        id: `brand_test_${nextId++}`,
        name,
        handle: handle ?? name.toLowerCase().replace(/\s+/g, "-"),
        external_code: external_code ?? null,
      }
      records.push(record)
      createdNames.push(name)
      return { brand: record }
    },
  }
}

describe("spreadsheet-sync-brands", () => {
  it("resolveBrandValues matches by name case-insensitively", async () => {
    const client = makeFakeClient([
      { id: "brand_biz", name: "Biz Collection", handle: "biz-collection", external_code: "BIZ" },
    ])
    const { idByLowerName, createdLog } = await resolveBrandValues(client, [
      "biz collection",
      "BIZ COLLECTION",
    ])
    expect(idByLowerName.get("biz collection")).toBe("brand_biz")
    expect(client.createdNames).toEqual([])
    expect(createdLog).toEqual([])
  })

  it("resolveBrandValues falls back to external_code lookup", async () => {
    const client = makeFakeClient([
      { id: "brand_asc", name: "AS Colour", handle: "as-colour", external_code: "ASC" },
    ])
    const { idByLowerName } = await resolveBrandValues(client, ["asc", "ASC"])
    expect(idByLowerName.get("asc")).toBe("brand_asc")
    expect(client.createdNames).toEqual([])
  })

  it("resolveBrandValues auto-creates missing brands", async () => {
    const client = makeFakeClient()
    const { idByLowerName, createdLog } = await resolveBrandValues(client, [
      "NewVendorCo",
      "AnotherBrand",
    ])
    expect(idByLowerName.size).toBe(2)
    expect(client.createdNames).toEqual(["NewVendorCo", "AnotherBrand"])
    expect(createdLog.length).toBe(2)
    expect(createdLog[0]).toContain("NewVendorCo")
  })

  it("resolveBrandValues de-dupes input case-insensitively", async () => {
    const client = makeFakeClient()
    const { idByLowerName } = await resolveBrandValues(client, [
      "Ramo",
      "ramo",
      "RAMO",
      "",
      "  ",
    ])
    expect(client.createdNames).toEqual(["Ramo"])
    expect(idByLowerName.size).toBe(1)
  })

  it("resolveBrandIdForValue resolves via name first, then external_code", () => {
    const resolution = {
      idByLowerName: new Map([["biz collection", "brand_biz"]]),
      idByExternalCode: new Map([["biz", "brand_biz"], ["dnc", "brand_dnc"]]),
      createdLog: [],
    }
    expect(resolveBrandIdForValue("Biz Collection", resolution)).toBe("brand_biz")
    expect(resolveBrandIdForValue("BIZ", resolution)).toBe("brand_biz")
    expect(resolveBrandIdForValue("dnc", resolution)).toBe("brand_dnc")
    expect(resolveBrandIdForValue("UnknownBrand", resolution)).toBeNull()
    expect(resolveBrandIdForValue("", resolution)).toBeNull()
    expect(resolveBrandIdForValue(null, resolution)).toBeNull()
  })

  it("resolveBrandValues logs but continues when a single create fails", async () => {
    const client = makeFakeClient()
    let calls = 0
    client.create = async ({ name }) => {
      calls++
      if (name === "fail") throw new Error("simulated")
      return {
        brand: {
          id: `brand_ok_${calls}`,
          name,
          handle: name.toLowerCase(),
          external_code: null,
        },
      }
    }
    const { idByLowerName, createdLog } = await resolveBrandValues(client, ["ok", "fail", "ok2"])
    expect(idByLowerName.get("ok")).toBeDefined()
    expect(idByLowerName.get("ok2")).toBeDefined()
    expect(idByLowerName.get("fail")).toBeUndefined()
    expect(createdLog.some((l) => l.includes('Failed to create brand "fail"'))).toBe(true)
  })
})
