import { classifyAussiePacificProduct } from "../product-taxonomy"

describe("classifyAussiePacificProduct", () => {
  it("resolves product_type from sub_category first", () => {
    const result = classifyAussiePacificProduct({
      main_category: "Ladies",
      sub_category: "Shirts",
      style: "Bayview",
      style_code: "2906T",
    })
    expect(result.productType).toBe("Shirts")
  })

  it("falls back to main_category when sub_category doesn't resolve", () => {
    const result = classifyAussiePacificProduct({
      main_category: "Polos",
      sub_category: "Bayview Lifestyle Collection",
      style: "Bayview",
      style_code: "1300",
    })
    expect(result.productType).toBe("Polos")
  })

  it("never lets demographic main_category leak through as a Type (strict alias matching)", () => {
    // Previously "Ladies" title-cased to "Ladies" type via the fallback.
    // The strict lookup means demographics with no alias return null.
    const result = classifyAussiePacificProduct({
      main_category: "Ladies",
      sub_category: "Unknown Garment Category",
      style: "Bayview",
      style_code: "9999X",
    })
    expect(result.productType).toBeNull()
  })

  it("maps Ladies/Mens/Kids main_category to canonical gender tags", () => {
    // TAG_ALIASES has ladies→Women, mens→Men, kids→Kids
    const ladies = classifyAussiePacificProduct({
      main_category: "Ladies",
      sub_category: "Shirts",
      style: "Bayview",
      style_code: "2906T",
    })
    expect(ladies.tags).toContain("Women")
    const mens = classifyAussiePacificProduct({
      main_category: "Mens",
      sub_category: "Polos",
      style: "Botany",
      style_code: "3307",
    })
    expect(mens.tags).toContain("Men")
    const kids = classifyAussiePacificProduct({
      main_category: "Kids",
      sub_category: "Polos",
      style: "Botany",
      style_code: "3307K",
    })
    expect(kids.tags).toContain("Kids")
  })

  it("drops the AP `style` field from tags entirely (it's already in the title)", () => {
    const result = classifyAussiePacificProduct({
      main_category: "Ladies",
      sub_category: "Shirts",
      style: "Bayview",
      style_code: "2906T",
    })
    expect(result.tags).not.toContain("Bayview")
    expect(result.tags).not.toContain("bayview")
  })

  it("doesn't double-tag the garment-type used as the productType", () => {
    // sub_category "Shirts" becomes the productType, so it shouldn't
    // re-appear in tags. (normalizeTags filters out PRODUCT_TYPE_ALIASES
    // values automatically.)
    const result = classifyAussiePacificProduct({
      main_category: "Ladies",
      sub_category: "Shirts",
      style: "Bayview",
      style_code: "2906T",
    })
    expect(result.tags).not.toContain("Shirts")
  })

  it("resolves productType from compound sub_category strings, skipping demographic tokens", () => {
    // Real example from the live API: "Botany Kids Polos - N3307" with
    // main_category="Kids", sub_category="Kids Polos". Should resolve to
    // Polos (not Kids).
    const kidsPolos = classifyAussiePacificProduct({
      main_category: "Kids",
      sub_category: "Kids Polos",
      style: "Botany",
      style_code: "3307",
    })
    expect(kidsPolos.productType).toBe("Polos")
    expect(kidsPolos.tags).toContain("Kids")
    expect(kidsPolos.tags).not.toContain("Polos")

    const mensTees = classifyAussiePacificProduct({
      main_category: "Mens",
      sub_category: "Mens Tees",
      style: "Whatever",
      style_code: "5050",
    })
    expect(mensTees.productType).toBe("T-Shirts")
    expect(mensTees.tags).toContain("Men")

    const womensPolos = classifyAussiePacificProduct({
      main_category: "Ladies",
      sub_category: "Womens Polos",
      style: "Whatever",
      style_code: "5060",
    })
    expect(womensPolos.productType).toBe("Polos")
    expect(womensPolos.tags).toContain("Women")
  })

  it("picks demographic tag from sub_category when main_category isn't demographic", () => {
    // Hypothetical AP shape where sub_category carries the demographic.
    const result = classifyAussiePacificProduct({
      main_category: "Polos",
      sub_category: "Kids Polos",
      style: "Botany",
      style_code: "3307K",
    })
    expect(result.productType).toBe("Polos")
    expect(result.tags).toContain("Kids")
  })

  it("leaves productType null and logs when neither category resolves", () => {
    const log: string[] = []
    const result = classifyAussiePacificProduct(
      {
        main_category: "FooBar",
        sub_category: "QuuxBaz",
        style: "Bayview",
        style_code: "WEIRD",
      },
      log
    )
    expect(result.productType).toBeNull()
    expect(log.some((m) => m.includes("aussie-pacific product_type"))).toBe(true)
  })
})
