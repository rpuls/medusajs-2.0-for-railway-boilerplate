import {
  groupRowsByProduct,
  initialSkippedHandles,
} from "../spreadsheet-sync-preview"

describe("spreadsheet-sync-preview", () => {
  it("groupRowsByProduct groups variants by handle and counts them", () => {
    const result = groupRowsByProduct([
      { handle: "biz-collection-shirt", title: "Biz Shirt", brand: "Biz Collection" },
      { handle: "biz-collection-shirt", title: "Biz Shirt", brand: "Biz Collection" },
      { handle: "biz-collection-shirt", title: "Biz Shirt", brand: "Biz Collection" },
      { handle: "ramo-hoodie", title: "Ramo Hoodie", brand: "Ramo" },
    ])
    expect(result.length).toBe(2)
    expect(result[0]).toMatchObject({
      handle: "biz-collection-shirt",
      title: "Biz Shirt",
      brand: "Biz Collection",
      variantCount: 3,
      defaultChecked: true,
    })
    expect(result[1]).toMatchObject({
      handle: "ramo-hoodie",
      variantCount: 1,
    })
  })

  it("groupRowsByProduct auto-unchecks products that have warnings", () => {
    const warningsByHandle = new Map([
      ["biz-collection-shirt", ["duplicate barcode XYZ"]],
    ])
    const [shirt, hoodie] = groupRowsByProduct(
      [
        { handle: "biz-collection-shirt", title: "Biz Shirt", brand: "Biz Collection" },
        { handle: "ramo-hoodie", title: "Ramo Hoodie", brand: "Ramo" },
      ],
      { warningsByHandle }
    )
    expect(shirt!.defaultChecked).toBe(false)
    expect(shirt!.warnings).toEqual(["duplicate barcode XYZ"])
    expect(hoodie!.defaultChecked).toBe(true)
    expect(hoodie!.warnings).toEqual([])
  })

  it("groupRowsByProduct preserves first-seen order", () => {
    const result = groupRowsByProduct([
      { handle: "z-handle" },
      { handle: "a-handle" },
      { handle: "z-handle" },
      { handle: "m-handle" },
    ])
    expect(result.map((r) => r.handle)).toEqual(["z-handle", "a-handle", "m-handle"])
  })

  it("groupRowsByProduct skips rows missing a handle", () => {
    const result = groupRowsByProduct([
      { handle: "" },
      { handle: "   ", title: "blank handle" },
      { handle: "ok" },
    ])
    expect(result.length).toBe(1)
    expect(result[0]!.handle).toBe("ok")
  })

  it("groupRowsByProduct defaults brand to null when missing", () => {
    const result = groupRowsByProduct([{ handle: "no-brand", title: "Hat" }])
    expect(result[0]!.brand).toBeNull()
  })

  it("initialSkippedHandles returns handles whose defaultChecked is false", () => {
    const products = [
      { handle: "a", title: "A", brand: null, variantCount: 1, warnings: [], defaultChecked: true },
      { handle: "b", title: "B", brand: null, variantCount: 1, warnings: ["w"], defaultChecked: false },
      { handle: "c", title: "C", brand: null, variantCount: 1, warnings: ["w"], defaultChecked: false },
    ]
    const skipped = initialSkippedHandles(products)
    expect(skipped.has("a")).toBe(false)
    expect(skipped.has("b")).toBe(true)
    expect(skipped.has("c")).toBe(true)
    expect(skipped.size).toBe(2)
  })
})
