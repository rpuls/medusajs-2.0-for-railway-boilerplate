import { buildSearchSql } from "../build-search-sql"

describe("buildSearchSql", () => {
  it("emits one LIKE clause per token, AND-joined", () => {
    const { text } = buildSearchSql(["staple", "black"], 100)
    const clauses = text.match(/search_text LIKE :token\d+ ESCAPE E'\\\\'/g) ?? []
    expect(clauses).toHaveLength(2)
    expect(text).toContain(
      "search_text LIKE :token0 ESCAPE E'\\\\' AND search_text LIKE :token1 ESCAPE E'\\\\'"
    )
  })

  it("binds each token wrapped in % so LIKE behaves like 'contains'", () => {
    const { bindings } = buildSearchSql(["staple", "black"], 100)
    expect(bindings.token0).toBe("%staple%")
    expect(bindings.token1).toBe("%black%")
  })

  it("binds the limit as a number", () => {
    const { bindings } = buildSearchSql(["x"], 250)
    expect(bindings.limit).toBe(250)
  })

  it("escapes LIKE wildcards in tokens so '100%' is a literal match", () => {
    const { bindings } = buildSearchSql(["100%"], 100)
    expect(bindings.token0).toBe("%100\\%%")
  })

  it("escapes underscores so a SKU containing '_' can't run as a wildcard", () => {
    const { bindings } = buildSearchSql(["3008_x"], 100)
    expect(bindings.token0).toBe("%3008\\_x%")
  })

  it("joins variants to brand via the product↔brand link table", () => {
    const { text } = buildSearchSql(["x"], 100)
    expect(text).toContain("product_product_brand_brand")
    expect(text).toContain("brand b ON b.id = pbb.brand_id")
  })

  it("aggregates option values via product_variant_option", () => {
    const { text } = buildSearchSql(["x"], 100)
    expect(text).toContain("product_variant_option pvo")
    expect(text).toContain("string_agg(pov.value")
  })

  it("aggregates product tags via product_tags", () => {
    const { text } = buildSearchSql(["x"], 100)
    expect(text).toContain("product_tags ptg")
    expect(text).toContain("string_agg(t.value")
  })

  it("filters soft-deleted variants and products", () => {
    const { text } = buildSearchSql(["x"], 100)
    expect(text).toContain("p.deleted_at IS NULL")
    expect(text).toContain("pv.deleted_at IS NULL")
  })

  it("throws on zero tokens — caller is expected to short-circuit", () => {
    expect(() => buildSearchSql([], 100)).toThrow(/at least one token/)
  })

  it("throws on a non-positive limit", () => {
    expect(() => buildSearchSql(["x"], 0)).toThrow(/positive integer limit/)
    expect(() => buildSearchSql(["x"], -1)).toThrow(/positive integer limit/)
  })
})
