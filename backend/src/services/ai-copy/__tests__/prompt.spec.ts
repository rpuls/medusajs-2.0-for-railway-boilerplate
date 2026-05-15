import {
  buildProductDescriptionPrompt,
  parseDescriptionResponse,
} from "../prompt"

describe("buildProductDescriptionPrompt", () => {
  test("throws on missing title", () => {
    expect(() =>
      buildProductDescriptionPrompt({ title: "" })
    ).toThrow(/title/i)
  })

  test("includes provided context fields in the user prompt", () => {
    const { user, system } = buildProductDescriptionPrompt({
      title: "Heavyweight 5050 Hoodie",
      brand_name: "AS Colour",
      type_value: "Hoodie",
      weight_grams: 380,
      tags: ["hoodie", "fleece", "club"],
      variant_titles: ["Black / S", "Black / M", "Black / L"],
    })
    expect(user).toContain("Heavyweight 5050 Hoodie")
    expect(user).toContain("AS Colour")
    expect(user).toContain("380g")
    expect(user).toContain("Hoodie")
    expect(user).toContain("hoodie, fleece, club")
    expect(user).toContain("Black / S")
    expect(system).toContain("strict JSON")
  })

  test("trims very long variant lists", () => {
    const variants = Array.from({ length: 30 }, (_, i) => `Variant ${i}`)
    const { user } = buildProductDescriptionPrompt({
      title: "Test",
      variant_titles: variants,
    })
    // Only first MAX_VARIANT_LIST (8) variants should be in the prompt
    expect(user).toContain("Variant 0")
    expect(user).toContain("Variant 7")
    expect(user).not.toContain("Variant 8")
  })

  test("dedupes tags + variants", () => {
    const { user } = buildProductDescriptionPrompt({
      title: "Test",
      tags: ["club", "club", "hoodie"],
      variant_titles: ["Black", "Black", "White"],
    })
    expect(user.match(/club/g)?.length).toBe(1)
    expect(user.match(/Black/g)?.length).toBe(1)
  })

  test("truncates a very long existing description", () => {
    const longDesc = "x".repeat(2000)
    const { user } = buildProductDescriptionPrompt({
      title: "Test",
      description_current: longDesc,
    })
    expect(user).toContain("…")
    expect(user.length).toBeLessThan(longDesc.length)
  })

  test("ignores empty / whitespace-only optional fields", () => {
    const { user } = buildProductDescriptionPrompt({
      title: "Test",
      brand_name: "   ",
      type_value: "",
      description_current: "   \n\t  ",
      weight_grams: 0,
    })
    expect(user).not.toContain("Brand:")
    expect(user).not.toContain("Garment type:")
    expect(user).not.toContain("Garment weight:")
    expect(user).not.toContain("Current description")
  })

  test("safe_metadata only includes non-empty values", () => {
    const { user } = buildProductDescriptionPrompt({
      title: "Test",
      safe_metadata: {
        fabric_blend: "80/20 cotton/polyester",
        gsm: 380,
        empty_field: "",
        null_field: null,
        whitespace: "  ",
      },
    })
    expect(user).toContain("fabric_blend=80/20 cotton/polyester")
    expect(user).toContain("gsm=380")
    expect(user).not.toContain("empty_field")
    expect(user).not.toContain("null_field")
    expect(user).not.toContain("whitespace")
  })
})

describe("parseDescriptionResponse", () => {
  test("returns empty when input is empty / non-string", () => {
    expect(parseDescriptionResponse("")).toEqual([])
    // @ts-expect-error testing defensive null handling
    expect(parseDescriptionResponse(null)).toEqual([])
  })

  test("returns empty when input is unparseable JSON", () => {
    expect(parseDescriptionResponse("not json at all")).toEqual([])
  })

  test("returns empty when JSON shape lacks drafts array", () => {
    expect(parseDescriptionResponse('{"foo": "bar"}')).toEqual([])
  })

  test("parses a clean JSON payload", () => {
    const raw = JSON.stringify({
      drafts: [
        { label: "Short", body: "A simple one-liner." },
        { label: "Long", body: "A longer paragraph." },
      ],
    })
    const out = parseDescriptionResponse(raw)
    expect(out).toEqual([
      { label: "Short", body: "A simple one-liner." },
      { label: "Long", body: "A longer paragraph." },
    ])
  })

  test("strips markdown code fences", () => {
    const raw = '```json\n{"drafts": [{"label": "X", "body": "y"}]}\n```'
    const out = parseDescriptionResponse(raw)
    expect(out).toEqual([{ label: "X", body: "y" }])
  })

  test("falls back to 'Draft' when label is missing or empty", () => {
    const raw = JSON.stringify({
      drafts: [
        { body: "no label" },
        { label: "", body: "blank label" },
        { label: "   ", body: "whitespace label" },
      ],
    })
    const out = parseDescriptionResponse(raw)
    expect(out.map((d) => d.label)).toEqual(["Draft", "Draft", "Draft"])
  })

  test("drops drafts with empty bodies", () => {
    const raw = JSON.stringify({
      drafts: [
        { label: "Empty", body: "" },
        { label: "Whitespace", body: "   " },
        { label: "OK", body: "valid text" },
      ],
    })
    const out = parseDescriptionResponse(raw)
    expect(out).toHaveLength(1)
    expect(out[0].body).toBe("valid text")
  })

  test("caps output at 5 drafts", () => {
    const raw = JSON.stringify({
      drafts: Array.from({ length: 10 }, (_, i) => ({
        label: `D${i}`,
        body: `body ${i}`,
      })),
    })
    expect(parseDescriptionResponse(raw)).toHaveLength(5)
  })

  test("tolerates leading / trailing whitespace and noise around JSON", () => {
    const raw = '   \n  {"drafts":[{"label":"A","body":"b"}]}\n   '
    const out = parseDescriptionResponse(raw)
    expect(out).toEqual([{ label: "A", body: "b" }])
  })
})
