import {
  buildGarmentImagesForVariant,
  collectImageUrls,
  handleForProduct,
  imageUrl,
  normalizeStockLevel,
  slugify,
  titleCase,
  toArray,
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
    it("prefers `filename` (the field AP uses in live responses)", () => {
      expect(
        imageUrl({
          filename: "https://aussiepacific-images.s3.amazonaws.com/foo.jpg",
          url: "https://other",
        })
      ).toBe("https://aussiepacific-images.s3.amazonaws.com/foo.jpg")
    })
    it("falls back to url/src/path when filename is absent", () => {
      expect(imageUrl({ url: "https://a", src: "https://b" })).toBe("https://a")
      expect(imageUrl({ src: "https://b", path: "https://c" })).toBe("https://b")
      expect(imageUrl({ path: "https://c" })).toBe("https://c")
    })
    it("returns empty string for missing/undefined", () => {
      expect(imageUrl({})).toBe("")
      expect(imageUrl(undefined)).toBe("")
    })
  })

  describe("toArray", () => {
    it("returns a bare array unchanged", () => {
      expect(toArray([1, 2, 3])).toEqual([1, 2, 3])
    })
    it("unwraps the AP `{ data: [...] }` envelope", () => {
      // Verified shape: live AP responses return variants and images as
      // `{ data: [ ... ] }` rather than bare arrays.
      expect(toArray({ data: ["a", "b"] })).toEqual(["a", "b"])
    })
    it("falls back to Object.values for id-keyed objects", () => {
      expect(toArray({ "1": "a", "2": "b" })).toEqual(["a", "b"])
    })
    it("returns empty array for null/undefined/primitive", () => {
      expect(toArray(null)).toEqual([])
      expect(toArray(undefined)).toEqual([])
      expect(toArray(42)).toEqual([])
      expect(toArray("foo")).toEqual([])
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

    it("sets back when a URL contains '_back'", () => {
      const result = buildGarmentImagesForVariant({
        sku: "3312-MRN-10",
        images: [
          { url: "https://cdn/N3312_FLAT_01.jpg" },
          { url: "https://cdn/N3312_FLAT_back_01.jpg" },
        ],
      })
      expect(result.back).toBe("https://cdn/N3312_FLAT_back_01.jpg")
      expect(result.front).toBe("https://cdn/N3312_FLAT_01.jpg")
    })

    it("sets back when image_type contains 'back'", () => {
      const result = buildGarmentImagesForVariant({
        sku: "3312-MRN-10",
        images: [
          { url: "https://cdn/img1.jpg", image_type: "flat_front" },
          { url: "https://cdn/img2.jpg", image_type: "flat_back" },
        ],
      })
      expect(result.back).toBe("https://cdn/img2.jpg")
      expect(result.front).toBe("https://cdn/img1.jpg")
    })

    it("does not set back when no back image is identifiable", () => {
      const result = buildGarmentImagesForVariant({
        sku: "1300-BLK-S",
        images: [{ url: "https://cdn/AP1300_PRODUCT_FLAT_01.jpg" }],
      })
      expect(result.back).toBeUndefined()
    })

    it("front excludes back URLs when a non-back flat is available", () => {
      const result = buildGarmentImagesForVariant({
        sku: "3312-MRN-10",
        images: [
          { url: "https://cdn/N3312_back.jpg" },
          { url: "https://cdn/N3312_front.jpg" },
        ],
      })
      expect(result.front).toBe("https://cdn/N3312_front.jpg")
      expect(result.back).toBe("https://cdn/N3312_back.jpg")
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
