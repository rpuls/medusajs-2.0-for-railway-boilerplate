import {
  buildGarmentImagesForVariant,
  collectImageUrls,
  handleForProduct,
  imageUrl,
  normalizeStockLevel,
  slugify,
  titleCase,
} from "../mapping"
import type { AussiePacificProduct } from "../types"

describe("Aussie Pacific mapping helpers", () => {
  describe("slugify", () => {
    it("lowercases, hyphenates, trims", () => {
      expect(slugify("  Hello World  ")).toBe("hello-world")
      expect(slugify("Multi   Spaces")).toBe("multi-spaces")
      expect(slugify("punc!tu@tion#")).toBe("punc-tu-tion")
    })
    it("handles empty/null input", () => {
      expect(slugify("")).toBe("")
      expect(slugify(undefined as any)).toBe("")
    })
  })

  describe("handleForProduct", () => {
    it("namespaces with aussie-pacific prefix", () => {
      expect(handleForProduct("1300")).toBe("aussie-pacific-1300")
      expect(handleForProduct("N1300")).toBe("aussie-pacific-n1300")
    })
    it("slugifies messy style codes", () => {
      expect(handleForProduct("AP 1300/X")).toBe("aussie-pacific-ap-1300-x")
    })
  })

  describe("titleCase", () => {
    it("title cases multi-word strings", () => {
      expect(titleCase("MENS SHORT SLEEVE POLO")).toBe("Mens Short Sleeve Polo")
      expect(titleCase("hello")).toBe("Hello")
    })
    it("handles empty input", () => {
      expect(titleCase(undefined)).toBe("")
      expect(titleCase("")).toBe("")
    })
  })

  describe("imageUrl", () => {
    it("returns the first present field in order: url, src, path", () => {
      expect(imageUrl({ url: "https://a", src: "https://b", path: "https://c" })).toBe("https://a")
      expect(imageUrl({ src: "https://b", path: "https://c" })).toBe("https://b")
      expect(imageUrl({ path: "https://c" })).toBe("https://c")
    })
    it("returns empty string for missing/undefined", () => {
      expect(imageUrl({})).toBe("")
      expect(imageUrl(undefined)).toBe("")
    })
  })

  describe("normalizeStockLevel", () => {
    it("floors positive decimals", () => {
      expect(normalizeStockLevel(12.7)).toBe(12)
      expect(normalizeStockLevel("9.4")).toBe(9)
    })
    it("returns 0 for negative/non-numeric/null", () => {
      expect(normalizeStockLevel(-5)).toBe(0)
      expect(normalizeStockLevel("abc")).toBe(0)
      expect(normalizeStockLevel(null)).toBe(0)
      expect(normalizeStockLevel(undefined)).toBe(0)
    })
  })

  describe("buildGarmentImagesForVariant", () => {
    it("picks the first flat (non-model) image as front and a model image if present", () => {
      const result = buildGarmentImagesForVariant({
        sku: "1300-BLK-S",
        images: [
          { url: "https://cdn/AP1300_TALENT_01.jpg" },
          { url: "https://cdn/AP1300_PRODUCT_FLAT_01.jpg" },
        ],
      })
      expect(result.front).toBe("https://cdn/AP1300_PRODUCT_FLAT_01.jpg")
      expect(result.model_image).toBe("https://cdn/AP1300_TALENT_01.jpg")
      expect(result.all).toHaveLength(2)
    })

    it("falls back to whatever image exists when no flat is identifiable", () => {
      const result = buildGarmentImagesForVariant({
        sku: "1300",
        images: [{ url: "https://cdn/random.jpg" }],
      })
      expect(result.front).toBe("https://cdn/random.jpg")
    })

    it("returns empty front when variant has no images", () => {
      const result = buildGarmentImagesForVariant({ sku: "1300" })
      expect(result.front).toBe("")
      expect(result.all).toEqual([])
    })
  })

  describe("collectImageUrls", () => {
    it("dedupes URLs across top-level images and every variant", () => {
      const product: AussiePacificProduct = {
        name: "Polo",
        style_code: "1300",
        images: [{ url: "https://cdn/top.jpg" }],
        variants: [
          {
            sku: "1300-BLK-S",
            images: [
              { url: "https://cdn/top.jpg" }, // duplicate
              { url: "https://cdn/black.jpg" },
            ],
          },
          {
            sku: "1300-NVY-S",
            images: [{ url: "https://cdn/navy.jpg" }],
          },
        ],
      }
      const urls = collectImageUrls(product)
      expect(urls).toContain("https://cdn/top.jpg")
      expect(urls).toContain("https://cdn/black.jpg")
      expect(urls).toContain("https://cdn/navy.jpg")
      // No duplicates
      expect(new Set(urls).size).toBe(urls.length)
    })
  })
})
