import type { HttpTypes } from "@medusajs/types"

import { isBeanieGarmentProduct, isHatGarmentProduct } from "./variant-options"

const product = (overrides: Partial<HttpTypes.StoreProduct> = {}) =>
  ({
    title: "",
    handle: "",
    subtitle: null,
    description: null,
    metadata: {},
    ...overrides,
  } as unknown as HttpTypes.StoreProduct)

describe("isBeanieGarmentProduct", () => {
  it("matches DNC HiVis micro fleece beanie titles", () => {
    expect(
      isBeanieGarmentProduct(
        product({ title: "HiVis micro fleece beanie", handle: "h025" })
      )
    ).toBe(true)
  })

  it("matches metadata override", () => {
    expect(
      isBeanieGarmentProduct(
        product({
          title: "Acrylic Headwear",
          metadata: { headwear_type: "beanie" },
        })
      )
    ).toBe(true)
  })

  it("does not classify a fleece pullover as a beanie", () => {
    expect(
      isBeanieGarmentProduct(
        product({ title: "Polar fleece pullover", handle: "fleece-pullover" })
      )
    ).toBe(false)
  })
})

describe("isHatGarmentProduct", () => {
  it("matches DNC cap titles", () => {
    expect(isHatGarmentProduct(product({ title: "Cap with Net Back" }))).toBe(true)
    expect(
      isHatGarmentProduct(
        product({ title: "HiVis 2 tone cap with reflective trim & velcro strap" })
      )
    ).toBe(true)
    expect(
      isHatGarmentProduct(product({ title: "Brushed Cotton Cap Black/White/Orange" }))
    ).toBe(true)
  })

  it("matches snapbacks, truckers, buckets, and visors", () => {
    expect(isHatGarmentProduct(product({ title: "Classic 6-panel snapback" }))).toBe(true)
    expect(isHatGarmentProduct(product({ title: "Cotton trucker cap" }))).toBe(true)
    expect(isHatGarmentProduct(product({ title: "Bucket Hat" }))).toBe(true)
    expect(isHatGarmentProduct(product({ title: "Sun visor" }))).toBe(true)
  })

  it("does not double-classify beanies as hats", () => {
    expect(
      isHatGarmentProduct(product({ title: "HiVis micro fleece beanie" }))
    ).toBe(false)
  })

  it("does not match unrelated words like 'capacity' or 'thatched'", () => {
    expect(
      isHatGarmentProduct(product({ title: "High-capacity zip pouch" }))
    ).toBe(false)
    expect(isHatGarmentProduct(product({ title: "Thatched roof tee" }))).toBe(false)
  })

  it("respects metadata override", () => {
    expect(
      isHatGarmentProduct(
        product({ title: "Mystery item", metadata: { garment_type: "hat" } })
      )
    ).toBe(true)
  })
})
