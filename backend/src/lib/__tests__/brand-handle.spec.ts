import { brandValueKey, slugifyBrandHandle } from "../brand-handle"

describe("brand-handle", () => {
  describe("slugifyBrandHandle", () => {
    it("lowercases and replaces whitespace with dashes", () => {
      expect(slugifyBrandHandle("Biz Collection")).toBe("biz-collection")
      expect(slugifyBrandHandle("  DNC Workwear  ")).toBe("dnc-workwear")
    })

    it("expands ampersand to 'and'", () => {
      expect(slugifyBrandHandle("Black & Red")).toBe("black-and-red")
    })

    it("strips punctuation", () => {
      expect(slugifyBrandHandle("Stanley/Stella")).toBe("stanley-stella")
      expect(slugifyBrandHandle("AS Colour!")).toBe("as-colour")
    })

    it("collapses repeated separators", () => {
      expect(slugifyBrandHandle("Aussie   Pacific")).toBe("aussie-pacific")
      expect(slugifyBrandHandle("foo---bar")).toBe("foo-bar")
    })

    it("trims leading/trailing dashes", () => {
      expect(slugifyBrandHandle("- Biz -")).toBe("biz")
    })
  })

  describe("brandValueKey", () => {
    it("returns a stable lowercase key trimmed of whitespace", () => {
      expect(brandValueKey("  Biz Collection  ")).toBe("biz collection")
      expect(brandValueKey("DNC")).toBe("dnc")
      expect(brandValueKey("AS Colour")).toBe("as colour")
    })
  })
})
