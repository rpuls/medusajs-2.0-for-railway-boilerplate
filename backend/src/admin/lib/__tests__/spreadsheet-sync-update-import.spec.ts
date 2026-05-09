import { PRODUCT_IMPORT_CSV_HEADERS } from "../product-import-template-csv"
import { parseCsv } from "../csv-import"
import {
  buildBatchUpdatesFromParsedCsv,
  buildVariantGarmentDataByProductId,
  computeProductUpdateColumnCandidates,
  computeProductUpdatePreview,
  findVariantRowForCsvSku,
  parsedCsvHasVariantGarmentSourceRows,
  PRODUCT_GALLERY_IMAGES_CSV_KEY,
  PRODUCT_UPDATE_BATCH_CHUNK_SIZE,
  PRODUCT_UPDATE_BATCH_CHUNK_SIZE_MEDIA,
  productUpdateBatchChunkSize,
  spreadsheetHeadersIgnoringPatchable,
  validateProductUpdateHeaders,
  VARIANT_GARMENT_METADATA_CSV_KEY,
} from "../spreadsheet-sync-update-import"

const emptyRow = (): Record<string, string> => {
  const r: Record<string, string> = {}
  for (const h of PRODUCT_IMPORT_CSV_HEADERS) {
    r[h.toLowerCase()] = ""
  }
  return r
}

const buildCsv = (rows: Record<string, string>[]): string => {
  const lines = [PRODUCT_IMPORT_CSV_HEADERS.join(",")]
  for (const row of rows) {
    lines.push(PRODUCT_IMPORT_CSV_HEADERS.map((h) => row[h.toLowerCase()] ?? "").join(","))
  }
  return lines.join("\n")
}

describe("spreadsheet-sync-update-import", () => {
  it("productUpdateBatchChunkSize uses smaller batches for thumbnail or gallery columns", () => {
    expect(productUpdateBatchChunkSize(["product title"])).toBe(PRODUCT_UPDATE_BATCH_CHUNK_SIZE)
    expect(productUpdateBatchChunkSize([PRODUCT_GALLERY_IMAGES_CSV_KEY])).toBe(
      PRODUCT_UPDATE_BATCH_CHUNK_SIZE_MEDIA
    )
    expect(productUpdateBatchChunkSize([VARIANT_GARMENT_METADATA_CSV_KEY])).toBe(
      PRODUCT_UPDATE_BATCH_CHUNK_SIZE_MEDIA
    )
    expect(productUpdateBatchChunkSize(["product thumbnail"])).toBe(PRODUCT_UPDATE_BATCH_CHUNK_SIZE_MEDIA)
  })

  it("validateProductUpdateHeaders requires product id column", () => {
    const parsed = parseCsv("Product Handle,Variant SKU\nfoo,bar")
    expect(validateProductUpdateHeaders(parsed)).toContain("product id")
  })

  it("computeProductUpdatePreview errors when product id missing on a row", () => {
    const r = emptyRow()
    r["product title"] = "T"
    r["variant sku"] = "SKU"
    const parsed = parseCsv(buildCsv([r]))
    const p = computeProductUpdatePreview(parsed)
    expect(p.validationErrors.some((e) => e.includes("Product Id"))).toBe(true)
  })

  it("buildBatchUpdatesFromParsedCsv builds patch from first row per product id", () => {
    const r1 = emptyRow()
    r1["product id"] = "prod_test_1"
    r1["product title"] = "Updated Title"
    r1["product collection id"] = "pcol_x"
    r1["product type id"] = "ptyp_y"
    r1["product tag 1 id"] = "ptag_z"
    r1["variant sku"] = "SKU-A"

    const r2 = emptyRow()
    r2["product id"] = "prod_test_1"
    r2["product title"] = "Ignored second row title"
    r2["variant sku"] = "SKU-B"

    const parsed = parseCsv(buildCsv([r1, r2]))
    const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed)

    expect(errors.length).toBe(0)
    expect(updates.length).toBe(1)
    expect(updates[0]).toMatchObject({
      id: "prod_test_1",
      title: "Updated Title",
      collection_id: "pcol_x",
      type_id: "ptyp_y",
      tags: [{ id: "ptag_z" }],
    })
  })

  it("buildBatchUpdatesFromParsedCsv errors when product has only id", () => {
    const r = emptyRow()
    r["product id"] = "prod_only_id"
    r["variant sku"] = "SKU"
    const parsed = parseCsv(buildCsv([r]))
    const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed)
    expect(updates.length).toBe(0)
    expect(errors.some((e) => e.includes("no non-empty"))).toBe(true)
  })

  it("buildBatchUpdatesFromParsedCsv only applies selected columns", () => {
    const r = emptyRow()
    r["product id"] = "prod_a"
    r["product title"] = "Keep Title"
    r["product subtitle"] = "Sub A"
    r["product collection id"] = "pcol_x"
    r["variant sku"] = "SKU1"
    const parsed = parseCsv(buildCsv([r]))
    const sel = new Set<string>(["product title"])
    const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, { enabledCsvKeys: sel })
    expect(errors.length).toBe(0)
    expect(updates.length).toBe(1)
    expect(updates[0]).toEqual({ id: "prod_a", title: "Keep Title" })
  })

  it("buildBatchUpdatesFromParsedCsv rejects empty column selection", () => {
    const r = emptyRow()
    r["product id"] = "prod_a"
    r["product title"] = "T"
    r["variant sku"] = "S"
    const parsed = parseCsv(buildCsv([r]))
    const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, { enabledCsvKeys: new Set() })
    expect(updates.length).toBe(0)
    expect(errors.some((e) => e.includes("Select at least one"))).toBe(true)
  })

  it("computeProductUpdateColumnCandidates counts first row per Product Id only", () => {
    const r1 = emptyRow()
    r1["product id"] = "prod_1"
    r1["product title"] = "T1"
    r1["variant sku"] = "A"

    const r2 = emptyRow()
    r2["product id"] = "prod_2"
    r2["product title"] = "T2"
    r2["product subtitle"] = "Second row subtitle only"
    r2["variant sku"] = "B"

    const parsed = parseCsv(buildCsv([r1, r2]))
    const cand = computeProductUpdateColumnCandidates(parsed)
    const title = cand.find((c) => c.csvKey === "product title")
    const sub = cand.find((c) => c.csvKey === "product subtitle")
    expect(title?.affectedProductCount).toBe(2)
    expect(sub?.affectedProductCount).toBe(1)
  })

  describe("product gallery images (virtual patch column)", () => {
    it("emits a 2-image array when both Image Urls are filled and the column is enabled", () => {
      const r = emptyRow()
      r["product id"] = "prod_g1"
      r["product image 1 url"] = "https://cdn.example.com/a.jpg"
      r["product image 2 url"] = "https://cdn.example.com/b.jpg"
      r["variant sku"] = "SKU"
      const parsed = parseCsv(buildCsv([r]))
      const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set([PRODUCT_GALLERY_IMAGES_CSV_KEY]),
      })
      expect(errors.length).toBe(0)
      expect(updates).toEqual([
        {
          id: "prod_g1",
          images: [
            { url: "https://cdn.example.com/a.jpg" },
            { url: "https://cdn.example.com/b.jpg" },
          ],
        },
      ])
    })

    it("emits a 1-image array when only one Image Url is filled", () => {
      const r = emptyRow()
      r["product id"] = "prod_g2"
      r["product image 1 url"] = "https://cdn.example.com/only.jpg"
      r["variant sku"] = "SKU"
      const parsed = parseCsv(buildCsv([r]))
      const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set([PRODUCT_GALLERY_IMAGES_CSV_KEY]),
      })
      expect(errors.length).toBe(0)
      expect(updates[0]?.images).toEqual([{ url: "https://cdn.example.com/only.jpg" }])
    })

    it("does not emit an images key when both cells are empty (no accidental gallery wipe)", () => {
      const r = emptyRow()
      r["product id"] = "prod_g3"
      r["product title"] = "Has Title"
      r["variant sku"] = "SKU"
      const parsed = parseCsv(buildCsv([r]))
      const { updates } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set([PRODUCT_GALLERY_IMAGES_CSV_KEY, "product title"]),
      })
      expect(updates[0]).toEqual({ id: "prod_g3", title: "Has Title" })
      expect((updates[0] as Record<string, unknown>).images).toBeUndefined()
    })

    it("does not change images when the column is not enabled", () => {
      const r = emptyRow()
      r["product id"] = "prod_g4"
      r["product image 1 url"] = "https://cdn.example.com/a.jpg"
      r["product title"] = "T"
      r["variant sku"] = "SKU"
      const parsed = parseCsv(buildCsv([r]))
      const { updates } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set(["product title"]),
      })
      expect(updates[0]).toEqual({ id: "prod_g4", title: "T" })
    })

    it("computeProductUpdateColumnCandidates surfaces the gallery virtual column when source headers exist", () => {
      const r = emptyRow()
      r["product id"] = "prod_g5"
      r["product image 1 url"] = "https://cdn.example.com/a.jpg"
      r["variant sku"] = "SKU"
      const parsed = parseCsv(buildCsv([r]))
      const cand = computeProductUpdateColumnCandidates(parsed)
      const gallery = cand.find((c) => c.csvKey === PRODUCT_GALLERY_IMAGES_CSV_KEY)
      expect(gallery).toBeTruthy()
      expect(gallery?.affectedProductCount).toBe(1)
    })

    it("spreadsheetHeadersIgnoringPatchable consumes the two image source headers (not listed as ignored extras)", () => {
      const r = emptyRow()
      r["product id"] = "prod_g6"
      r["product image 1 url"] = "https://cdn.example.com/a.jpg"
      r["product image 2 url"] = "https://cdn.example.com/b.jpg"
      r["variant sku"] = "SKU"
      const parsed = parseCsv(buildCsv([r]))
      const extras = spreadsheetHeadersIgnoringPatchable(parsed)
      expect(extras).not.toContain("product image 1 url")
      expect(extras).not.toContain("product image 2 url")
    })
  })

  describe("variant garment metadata (per-row, PDP)", () => {
    it("buildBatchUpdatesFromParsedCsv yields no product patches when only variant garment column is selected", () => {
      const r1 = emptyRow()
      r1["product id"] = "prod_v1"
      r1["variant sku"] = "SKU-A"
      r1["product image 1 url"] = "https://cdn.example.com/a.jpg"
      r1["variant option 1 name"] = "Size"
      r1["variant option 1 value"] = "M"
      r1["variant title"] = "M / Navy"

      const r2 = emptyRow()
      r2["product id"] = "prod_v1"
      r2["variant sku"] = "SKU-B"
      r2["product image 1 url"] = "https://cdn.example.com/b.jpg"
      r2["variant option 1 value"] = "L"
      r2["variant title"] = "L / Navy"

      const parsed = parseCsv(buildCsv([r1, r2]))
      const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set([VARIANT_GARMENT_METADATA_CSV_KEY]),
      })
      expect(errors.length).toBe(0)
      expect(updates.length).toBe(0)
    })

    it("buildVariantGarmentDataByProductId collects last row per SKU and merges colour", () => {
      const r1 = emptyRow()
      r1["product id"] = "prod_v2"
      r1["variant sku"] = "SKU-X"
      r1["product image 1 url"] = "https://cdn.example.com/first.jpg"
      r1["variant option 2 name"] = "Colour"
      r1["variant option 2 value"] = "Red"

      const r2 = emptyRow()
      r2["product id"] = "prod_v2"
      r2["variant sku"] = "SKU-X"
      r2["product image 1 url"] = "https://cdn.example.com/second.jpg"
      r2["product image 2 url"] = "https://cdn.example.com/back.jpg"
      r2["variant option 2 value"] = "Red"

      const parsed = parseCsv(buildCsv([r1, r2]))
      const { byProduct, errors } = buildVariantGarmentDataByProductId(parsed, new Set([VARIANT_GARMENT_METADATA_CSV_KEY]))
      expect(errors.length).toBe(0)
      const m = byProduct.get("prod_v2")
      expect(m?.size).toBe(1)
      expect(m?.get("SKU-X")).toMatchObject({
        front: "https://cdn.example.com/second.jpg",
        back: "https://cdn.example.com/back.jpg",
        color: "Red",
      })
    })

    it("computeProductUpdateColumnCandidates includes variant garment when gallery + variant sku headers exist", () => {
      const r = emptyRow()
      r["product id"] = "prod_v3"
      r["variant sku"] = "S"
      r["product image 1 url"] = "https://cdn.example.com/a.jpg"
      const parsed = parseCsv(buildCsv([r]))
      const cand = computeProductUpdateColumnCandidates(parsed)
      const vg = cand.find((c) => c.csvKey === VARIANT_GARMENT_METADATA_CSV_KEY)
      expect(vg).toBeTruthy()
      expect(vg?.affectedProductCount).toBe(1)
    })

    it("parsedCsvHasVariantGarmentSourceRows is true when any row has sku + image url", () => {
      const r = emptyRow()
      r["product id"] = "p"
      r["variant sku"] = "ABC"
      r["product image 1 url"] = "https://x.com/a.jpg"
      const parsed = parseCsv(buildCsv([r]))
      expect(parsedCsvHasVariantGarmentSourceRows(parsed)).toBe(true)
    })

    it("findVariantRowForCsvSku matches case-insensitively", () => {
      const variants = [{ id: "v1", sku: "5001-LGREY-F-XS" }]
      expect(findVariantRowForCsvSku(variants, "5001-lgrey-f-xs")?.id).toBe("v1")
      expect(findVariantRowForCsvSku(variants, "5001-LGREY-F-XS")?.id).toBe("v1")
    })
  })

  describe("supplier + dimensions patches", () => {
    it("patches product dimensions when length/width/height columns are enabled", () => {
      const r = emptyRow()
      r["product id"] = "prod_dim"
      r["product length"] = "30"
      r["product width"] = "20.5"
      r["product height"] = "5"
      r["variant sku"] = "SKU"

      const parsed = parseCsv(buildCsv([r]))
      const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set(["product length", "product width", "product height"]),
      })
      expect(errors.length).toBe(0)
      expect(updates[0]).toEqual({
        id: "prod_dim",
        length: 30,
        width: 20.5,
        height: 5,
      })
    })

    it("ignores non-numeric / blank dimension cells", () => {
      const r = emptyRow()
      r["product id"] = "prod_dim_bad"
      r["product length"] = "abc"
      r["product width"] = ""
      r["product height"] = "10"
      r["product title"] = "Keep"
      r["variant sku"] = "SKU"

      const parsed = parseCsv(buildCsv([r]))
      const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set([
          "product title",
          "product length",
          "product width",
          "product height",
        ]),
      })
      expect(errors.length).toBe(0)
      expect(updates[0]).toEqual({ id: "prod_dim_bad", title: "Keep", height: 10 })
    })

    it("patches product.metadata.supplier when product supplier column is enabled", () => {
      const headers = [...PRODUCT_IMPORT_CSV_HEADERS, "Product Supplier"]
      const lines = [
        headers.join(","),
        // First product: only supplier set
        [...headers].map((h) => {
          if (h === "Product Id") return "prod_sup"
          if (h === "Variant SKU") return "SKU"
          if (h === "Product Supplier") return "Biz Collection"
          return ""
        }).join(","),
      ]
      const parsed = parseCsv(lines.join("\n"))
      const { updates, errors } = buildBatchUpdatesFromParsedCsv(parsed, {
        enabledCsvKeys: new Set(["product supplier"]),
      })
      expect(errors.length).toBe(0)
      expect(updates[0]).toEqual({
        id: "prod_sup",
        metadata: { supplier: "Biz Collection" },
      })
    })

    it("computeProductUpdateColumnCandidates surfaces dimension + supplier columns when present", () => {
      const headers = [...PRODUCT_IMPORT_CSV_HEADERS, "Product Supplier"]
      const dataRow = headers
        .map((h) => {
          if (h === "Product Id") return "prod_can"
          if (h === "Variant SKU") return "SKU"
          if (h === "Product Length") return "30"
          if (h === "Product Width") return "20"
          if (h === "Product Height") return "5"
          if (h === "Product Supplier") return "AS Colour"
          return ""
        })
        .join(",")
      const parsed = parseCsv(`${headers.join(",")}\n${dataRow}`)
      const cand = computeProductUpdateColumnCandidates(parsed)
      const keys = new Set(cand.map((c) => c.csvKey))
      expect(keys.has("product length")).toBe(true)
      expect(keys.has("product width")).toBe(true)
      expect(keys.has("product height")).toBe(true)
      expect(keys.has("product supplier")).toBe(true)
    })
  })
})
