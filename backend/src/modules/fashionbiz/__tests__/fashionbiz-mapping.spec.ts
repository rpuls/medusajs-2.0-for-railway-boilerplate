import { FashionBizClient } from "../client"
import {
  collectImageUrls,
  handleForProduct,
  renderDescription,
  slugify,
  titleCase,
} from "../mapping"
import { priceLadderFromFashionBiz } from "../pricing"
import { FashionBizProduct } from "../types"

describe("FashionBiz mapping helpers", () => {
  describe("handleForProduct", () => {
    it("namespaces by brand slug", () => {
      expect(handleForProduct("biz-collection", "p400ms")).toBe("biz-collection-p400ms")
      expect(handleForProduct("syzmik", "ZW123")).toBe("syzmik-zw123")
    })

    it("safely slugifies weird slug input", () => {
      // FashionBiz slugs are well-formed in practice, but defend anyway.
      expect(handleForProduct("biz-care", "csc 249 u/extra")).toBe("biz-care-csc-249-u-extra")
    })
  })

  describe("slugify", () => {
    it("lowercases, hyphenates, trims", () => {
      expect(slugify("  Hello, World!  ")).toBe("hello-world")
      expect(slugify("multi   spaces")).toBe("multi-spaces")
    })
  })

  describe("titleCase", () => {
    it("title-cases space-separated words", () => {
      expect(titleCase("MENS CREW SHORT SLEEVE POLO")).toBe("Mens Crew Short Sleeve Polo")
      expect(titleCase(undefined)).toBe("")
    })
  })

  describe("renderDescription", () => {
    it("renders all sections", () => {
      const rendered = renderDescription({
        sizes: "XS - 2XL",
        fabric: ["Outer Shell: Showerproof, 100% Nylon."],
        features: ["Lightweight", "Plain non-quilted yoke"],
        cares: [],
        extras: [],
      })
      expect(rendered).toContain("Sizes: XS - 2XL")
      expect(rendered).toContain("Fabric:")
      expect(rendered).toContain("- Outer Shell: Showerproof, 100% Nylon.")
      expect(rendered).toContain("Features:")
      expect(rendered).toContain("- Lightweight")
    })

    it("returns empty string for undefined / empty input", () => {
      expect(renderDescription(undefined)).toBe("")
      expect(renderDescription({})).toBe("")
    })

    it("omits empty sections", () => {
      const rendered = renderDescription({
        sizes: "S - XL",
        fabric: [],
        features: [],
        cares: [],
        extras: [],
      })
      expect(rendered).toBe("Sizes: S - XL")
    })
  })

  describe("collectImageUrls", () => {
    it("dedupes and orders by colour index then image index", () => {
      const product: FashionBizProduct = {
        id: 1,
        name: "x",
        slug: "x",
        brand: "biz-collection",
        code: "X",
        colors: [
          {
            id: 1,
            name: "Red",
            index: 1,
            sizes: [],
            images: [
              { https_attachment_url: "https://a/2.jpg", index: 2 },
              { https_attachment_url: "https://a/1.jpg", index: 1 },
            ],
          },
          {
            id: 2,
            name: "Blue",
            index: 0,
            sizes: [],
            images: [
              { https_attachment_url: "https://a/1.jpg", index: 0 }, // duplicate
              { https_attachment_url: "https://a/0.jpg", index: 1 },
            ],
          },
        ],
      }
      expect(collectImageUrls(product)).toEqual([
        "https://a/1.jpg",
        "https://a/0.jpg",
        "https://a/2.jpg",
      ])
    })

    it("includes top-level product images first", () => {
      const product: FashionBizProduct = {
        id: 1,
        name: "x",
        slug: "x",
        brand: "biz-collection",
        code: "X",
        images: [{ https_attachment_url: "https://top.jpg" }],
        colors: [
          {
            id: 1,
            name: "Red",
            sizes: [],
            images: [{ https_attachment_url: "https://colour.jpg" }],
          },
        ],
      }
      expect(collectImageUrls(product)).toEqual([
        "https://top.jpg",
        "https://colour.jpg",
      ])
    })
  })
})

describe("priceLadderFromFashionBiz", () => {
  it("uses the 1-99 tier as cost (no adjustment)", () => {
    const ladder = priceLadderFromFashionBiz([
      { tier: "1-99", price: 10.5 },
      { tier: "100-499", price: 10.4 },
      { tier: "500", price: 10.3 },
    ])
    expect(ladder).not.toBeNull()
    // Mirrors the buildPriceLadder regression test.
    expect(ladder!.tier100Plus).toBe(17.33)
    expect(ladder!.base).toBe(23.1)
  })

  it("falls back to the first tier when 1-99 is absent", () => {
    const ladder = priceLadderFromFashionBiz([{ tier: "Gold", price: 8.0 }])
    expect(ladder).not.toBeNull()
    // 8 * 1.65 = 13.2
    expect(ladder!.tier100Plus).toBe(13.2)
  })

  it("returns null for empty or unparseable prices", () => {
    expect(priceLadderFromFashionBiz([])).toBeNull()
    expect(priceLadderFromFashionBiz(undefined)).toBeNull()
    expect(priceLadderFromFashionBiz([{ tier: "1-99", price: 0 }])).toBeNull()
    expect(priceLadderFromFashionBiz([{ tier: "1-99", price: NaN }])).toBeNull()
  })

  describe("with costAdjustment", () => {
    // P400MS observed: API 1-99 = $10.50, storefront price = $12.08 (~×1.15).
    // After adjustment we feed 10.50 * 1.15 = 12.075 into the ladder.
    it("applies the multiplier before the ladder", () => {
      const ladder = priceLadderFromFashionBiz(
        [{ tier: "1-99", price: 10.5 }],
        1.15
      )
      expect(ladder).not.toBeNull()
      // 12.075 * 1.65 = 19.92375 → round2 = 19.92
      expect(ladder!.tier100Plus).toBe(19.92)
      // standard = 19.92375 / 0.75 = 26.565 → 26.57 (1.65/0.75 = 2.2 exactly,
      // so standard is cost*2.2 = 12.075*2.2 = 26.565)
      expect(ladder!.standard).toBe(26.57)
      expect(ladder!.base).toBe(26.57)
    })

    it("treats explicit 1.0 the same as no adjustment", () => {
      const a = priceLadderFromFashionBiz([{ tier: "1-99", price: 10.5 }])
      const b = priceLadderFromFashionBiz([{ tier: "1-99", price: 10.5 }], 1.0)
      expect(a).toEqual(b)
    })

    it("falls back to 1.0 for invalid adjustment values", () => {
      const baseline = priceLadderFromFashionBiz([{ tier: "1-99", price: 10.5 }])
      // NaN / 0 / negative all coerce to 1.0 — defends against env-var typos
      // that would otherwise zero out every price.
      for (const bad of [NaN, 0, -1.5, Number.POSITIVE_INFINITY]) {
        expect(
          priceLadderFromFashionBiz([{ tier: "1-99", price: 10.5 }], bad)
        ).toEqual(baseline)
      }
    })
  })
})

describe("FashionBizClient.encodeColourForStock", () => {
  it("URL-encodes spaces", () => {
    expect(FashionBizClient.encodeColourForStock("Midnight Navy")).toBe("Midnight%20Navy")
  })

  it("replaces slashes with dashes", () => {
    expect(FashionBizClient.encodeColourForStock("Magenta/Black/Silver")).toBe(
      "Magenta-Black-Silver"
    )
  })

  it("handles plain names unchanged", () => {
    expect(FashionBizClient.encodeColourForStock("Cyan")).toBe("Cyan")
  })
})
