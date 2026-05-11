import { PRODUCT_IMPORT_CSV_HEADERS } from "../product-import-template-csv"
import { parseCsv } from "../csv-import"
import {
  applyDefaultCollectionIdToParsedCsv,
  buildBatchCreatesFromParsedCsv,
  collectProductCategoryPathsFromRow,
  collectProductImageUrlsFromRow,
  collectProductTagsFromRow,
  computeSpreadsheetPreview,
  detectDncWorkwearCatalog,
  detectFashionBizVariantCatalog,
  detectGoldCatalogFormat,
  detectHoneybeeCatalog,
  detectRamoCatalog,
  expandDncWorkwearCatalogToTemplate,
  expandFashionBizCatalogToTemplate,
  expandGoldCatalogToTemplate,
  expandHoneybeeCatalogToTemplate,
  expandRamoCatalogToTemplate,
  inferHoneybeeBrandFromRows,
  normalizeSpreadsheetForImport,
  parseProductMetadataJsonFromRow,
  slugifyCollectionHandle,
} from "../spreadsheet-sync-import"

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
    lines.push(
      PRODUCT_IMPORT_CSV_HEADERS.map((h) => row[h.toLowerCase()] ?? "").join(",")
    )
  }
  return lines.join("\n")
}

describe("spreadsheet-sync-import", () => {
  it("slugifyCollectionHandle produces stable handles", () => {
    expect(slugifyCollectionHandle("Summer 2026 — Basics")).toBe("summer-2026-basics")
    expect(slugifyCollectionHandle("   ")).toBe("collection")
  })

  it("applyDefaultCollectionIdToParsedCsv fills empty Product Collection Id cells", () => {
    const r = emptyRow()
    r["product handle"] = "a"
    r["product title"] = "A"
    r["shipping profile id"] = "sp_x"
    r["variant sku"] = "SKU1"
    r["variant price aud"] = "10"
    const r2 = emptyRow()
    r2["product handle"] = "b"
    r2["product title"] = "B"
    r2["shipping profile id"] = "sp_x"
    r2["variant sku"] = "SKU2"
    r2["variant price aud"] = "20"
    r2["product collection id"] = "pcol_keep"

    const parsed = parseCsv(buildCsv([r, r2]))
    const stamped = applyDefaultCollectionIdToParsedCsv(parsed, "pcol_new")

    expect(stamped.rows[0]!["product collection id"]).toBe("pcol_new")
    expect(stamped.rows[1]!["product collection id"]).toBe("pcol_keep")
  })

  it("computeSpreadsheetPreview flags rows missing variant pricing (matches sync validation)", () => {
    const r = emptyRow()
    r["product handle"] = "acme-shirt"
    r["product title"] = "Acme Shirt"
    r["product status"] = "published"
    r["shipping profile id"] = "sp_test"
    r["variant sku"] = "ACM-NO-PRICE"
    r["variant title"] = "M"
    r["variant option 1 name"] = "Size"
    r["variant option 1 value"] = "M"

    const parsed = parseCsv(buildCsv([r]))
    const preview = computeSpreadsheetPreview(parsed)

    expect(preview.validationErrors.some((e) => e.includes("Variant Price AUD"))).toBe(true)
    const { errors } = buildBatchCreatesFromParsedCsv(parsed)
    expect(errors.some((e) => e.includes("Variant Price AUD"))).toBe(true)
  })

  it("computeSpreadsheetPreview counts products and tier rules", () => {
    const r = emptyRow()
    r["product handle"] = "acme-shirt"
    r["product title"] = "Acme Shirt"
    r["product status"] = "published"
    r["shipping profile id"] = "sp_test"
    r["variant sku"] = "ACM-SHIRT-BLU-M"
    r["variant title"] = "Blue / M"
    r["variant option 1 name"] = "Color"
    r["variant option 1 value"] = "Blue"
    r["base_sale_price"] = "90"
    r["tier_10_to_49_price"] = "85"
    r["tier_50_to_99_price"] = "80"
    r["tier_100_plus_price"] = "75"

    const parsed = parseCsv(buildCsv([r]))
    const preview = computeSpreadsheetPreview(parsed)

    expect(preview.productCount).toBe(1)
    expect(preview.variantCount).toBe(1)
    expect(preview.tierRuleCount).toBe(1)
    expect(preview.validationErrors.length).toBe(0)
  })

  it("buildBatchCreatesFromParsedCsv derives AUD tiers from Variant Price AUD alone (100+ anchor)", () => {
    const r = emptyRow()
    r["product handle"] = "anchor-shirt"
    r["product title"] = "Anchor Shirt"
    r["product status"] = "published"
    r["shipping profile id"] = "sp_test"
    r["variant sku"] = "ANCH-001"
    r["variant title"] = "M"
    r["variant option 1 name"] = "Size"
    r["variant option 1 value"] = "M"
    r["variant price aud"] = "8"

    const parsed = parseCsv(buildCsv([r]))
    const { tierBySku, errors } = buildBatchCreatesFromParsedCsv(parsed)

    expect(errors.length).toBe(0)
    expect(tierBySku.has("ANCH-001")).toBe(true)
    const t = tierBySku.get("ANCH-001")!
    expect(t.t100_plus).toBe(800)
    expect(t.t1_9).toBeGreaterThan(t.t100_plus)
  })

  it("buildBatchCreatesFromParsedCsv builds one product with supplemental tier columns", () => {
    const r = emptyRow()
    r["product handle"] = "acme-shirt"
    r["product title"] = "Acme Shirt"
    r["product status"] = "published"
    r["shipping profile id"] = "sp_test"
    r["variant sku"] = "ACM-SHIRT-BLU-M"
    r["variant title"] = "Blue / M"
    r["variant option 1 name"] = "Color"
    r["variant option 1 value"] = "Blue"
    r["base_sale_price"] = "100"
    r["tier_10_to_49_price"] = "95"
    r["tier_50_to_99_price"] = "90"
    r["tier_100_plus_price"] = "85"

    const parsed = parseCsv(buildCsv([r]))
    const { creates, tierBySku, errors } = buildBatchCreatesFromParsedCsv(parsed)

    expect(errors.length).toBe(0)
    expect(creates.length).toBe(1)
    expect(creates[0]?.handle).toBe("acme-shirt")
    expect(creates[0]?.shipping_profile_id).toBe("sp_test")
    expect(creates[0]?.variants?.length).toBe(1)

    expect(tierBySku.has("ACM-SHIRT-BLU-M")).toBe(true)
    expect(tierBySku.get("ACM-SHIRT-BLU-M")).toEqual({
      t1_9: 10000,
      t10_19: 9500,
      t20_49: 9500,
      t50_99: 9000,
      t100_plus: 8500,
    })
  })

  it("buildBatchCreatesFromParsedCsv omits barcode on duplicates (first occurrence wins)", () => {
    const dup = "1.98057E+11"
    const a = emptyRow()
    a["product handle"] = "dedupe-bc"
    a["product title"] = "Dedupe Barcode Demo"
    a["product status"] = "published"
    a["shipping profile id"] = "sp_test"
    a["variant sku"] = "SKU-FIRST"
    a["variant barcode"] = dup
    a["variant title"] = "M"
    a["variant option 1 name"] = "Size"
    a["variant option 1 value"] = "M"
    a["variant price aud"] = "12"

    const b = emptyRow()
    Object.assign(b, a)
    b["variant sku"] = "SKU-SECOND"
    b["variant option 1 value"] = "L"

    const parsed = parseCsv(buildCsv([a, b]))
    const { creates, errors, warnings } = buildBatchCreatesFromParsedCsv(parsed)

    expect(errors.length).toBe(0)
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings.some((w) => w.includes("duplicate barcode"))).toBe(true)
    const vars = creates[0]?.variants as Array<{ sku: string; barcode?: string }>
    expect(vars?.length).toBe(2)
    expect(vars?.[0]?.barcode).toBe(dup)
    expect(vars?.[1]?.barcode).toBeUndefined()
  })

  it("reports missing required columns", () => {
    const parsed = parseCsv("foo,bar\n1,2")
    const preview = computeSpreadsheetPreview(parsed)
    expect(preview.validationErrors.some((e) => e.includes("product handle"))).toBe(true)
  })

  const GOLD_HEADER =
    "customerGroupId,STYLECODE,PRODUCT_NAME,COMPOSITION,FABRIC,SIZE_RANGE,COLOURS_COUNT,SHORT_DESCRIPTION,BOX_QTY,PRICE,CATEGORY,CATEGORY_SORT,Product URL"

  it("detects AS Colour wholesale CSV shape", () => {
    const raw =
      `${GOLD_HEADER}\n3,1000,Parcel Tote,,,,,,50,6.95,BAGS,41000,https://example.com/p`
    const parsed = parseCsv(raw)
    expect(detectGoldCatalogFormat(parsed)).toBe(true)
  })

  it("expandGoldCatalogToTemplate maps STYLECODE rows", () => {
    const raw = `${GOLD_HEADER}\n3,1000,Parcel Tote,,,,,,50,6.95,BAGS,41000,`
    const parsed = parseCsv(raw)
    const exp = expandGoldCatalogToTemplate(parsed, "sp_test")
    expect(exp.rows.length).toBe(1)
    expect(exp.rows[0]?.["product handle"]).toBe("ascolour-1000")
    expect(exp.rows[0]?.["shipping profile id"]).toBe("sp_test")
    expect(computeSpreadsheetPreview(exp).validationErrors.length).toBe(0)
  })

  it("expandGoldCatalogToTemplate maps AS Colour angle URLs to template + create metadata", () => {
    const header = `${GOLD_HEADER},ImageUrl_Standard,ImageFrontUrl,ImageBackUrl,ImageSideUrl`
    const row =
      "3,1000,Parcel Tote,,,,,,50,6.95,BAGS,41000,https://example.com/hero.jpg,https://example.com/std.jpg,https://example.com/front.jpg,https://example.com/back.jpg,https://example.com/side.jpg"
    const parsed = parseCsv(`${header}\n${row}`)
    const exp = expandGoldCatalogToTemplate(parsed, "sp_test")
    expect(exp.rows.length).toBe(1)
    const r = exp.rows[0]!
    expect(r["product thumbnail"]).toBe("https://example.com/hero.jpg")
    expect(r["image standard url"]).toBe("https://example.com/std.jpg")
    expect(r["image front url"]).toBe("https://example.com/front.jpg")
    expect(r["image back url"]).toBe("https://example.com/back.jpg")
    expect(r["image side url"]).toBe("https://example.com/side.jpg")

    const { creates, errors } = buildBatchCreatesFromParsedCsv(exp)
    expect(errors.length).toBe(0)
    const meta = creates[0]?.metadata as Record<string, string> | undefined
    expect(meta?.image_standard_url).toBe("https://example.com/std.jpg")
    expect(meta?.image_front_url).toBe("https://example.com/front.jpg")
    expect(meta?.image_back_url).toBe("https://example.com/back.jpg")
    expect(meta?.image_side_url).toBe("https://example.com/side.jpg")
  })

  it("normalizeSpreadsheetForImport requires shipping profile for gold CSV", () => {
    const parsed = parseCsv(`${GOLD_HEADER}\n3,1000,T,,,,,,1,1,,,`)
    expect(normalizeSpreadsheetForImport(parsed, {}).readyParsed).toBeNull()
    expect(
      normalizeSpreadsheetForImport(parsed, { defaultShippingProfileId: "sp_z" }).readyParsed?.rows.length
    ).toBe(1)
  })

  const FASHIONBIZ_HEADER = "sku,style_code,size,colour,price,product_name"

  it("detects FashionBiz / biz-collection variant CSV shape", () => {
    const raw = `${FASHIONBIZ_HEADER}\nSKU1,P3225,M,Navy,19.99,Women Elite Polo`
    const parsed = parseCsv(raw)
    expect(detectFashionBizVariantCatalog(parsed)).toBe(true)
  })

  it("detects FashionBiz when product handle column exists but every cell is empty", () => {
    const raw =
      "product handle,sku,style_code,size,colour,price1\n,A,ZP145,M,Navy,29.95\n,B,ZP145,L,Navy,29.95"
    const parsed = parseCsv(raw)
    expect(detectFashionBizVariantCatalog(parsed)).toBe(true)
  })

  it("detects FashionBiz when sku column is named variant sku", () => {
    const raw = "variant sku,style_code,size,colour,price\nSKU1,P3225,M,Navy,10"
    const parsed = parseCsv(raw)
    expect(detectFashionBizVariantCatalog(parsed)).toBe(true)
  })

  it("detects variant grid for ERP-style Stock Item + Style Code headers", () => {
    const raw =
      "Stock Item,Style Code,Size,Colour,Unit Price\n9401042561558,ZP145R,M,Navy,29.95"
    expect(detectFashionBizVariantCatalog(parseCsv(raw))).toBe(true)
  })

  it("expandFashionBizCatalogToTemplate maps rows with Size + Colour options", () => {
    const raw = `${FASHIONBIZ_HEADER}\nA,P3225,M,Navy,19.99,W Polo\nB,P3225,L,Navy,19.99,W Polo`
    const parsed = parseCsv(raw)
    const exp = expandFashionBizCatalogToTemplate(parsed, "sp_fb")
    expect(exp.rows.length).toBe(2)
    expect(exp.rows[0]?.["product handle"]).toBe("biz-collection-p3225")
    expect(exp.rows[0]?.["variant option 1 name"]).toBe("Size")
    expect(exp.rows[0]?.["variant option 2 name"]).toBe("Colour")
    const prev = computeSpreadsheetPreview(exp)
    expect(prev.validationErrors.length).toBe(0)
    expect(prev.tierRuleCount).toBe(2)

    const { creates, errors } = buildBatchCreatesFromParsedCsv(exp)
    expect(errors.length).toBe(0)
    expect(creates.length).toBe(1)
    const opts = creates[0]?.options as Array<{ title: string; values: string[] }>
    expect(opts?.length).toBe(2)
    expect(opts?.[0]?.title).toBe("Size")
    expect(opts?.[1]?.title).toBe("Colour")
    const vars = creates[0]?.variants as Array<{ options: Record<string, string> }>
    expect(vars?.length).toBe(2)
    expect(vars?.[0]?.options["Size"]).toBe("M")
    expect(vars?.[0]?.options["Colour"]).toBe("Navy")
  })

  it("expandFashionBizCatalogToTemplate reads AUD from loosely named price columns", () => {
    const raw =
      "sku,style_code,size,colour,Supplier Line Sell AUD inc GST\nA,P1,M,Navy,18.50\nB,P1,L,Navy,18.50"
    const parsed = parseCsv(raw)
    const exp = expandFashionBizCatalogToTemplate(parsed, "sp_test")
    expect(exp.rows[0]?.["variant price aud"]).toBe("18.50")
  })

  it("expandFashionBizCatalogToTemplate fills variant price from first row of style when others omit price", () => {
    const raw = "sku,style_code,size,colour,price\nA,P1,M,Navy,12.00\nB,P1,L,Navy,\nC,P1,M,Red,"
    const parsed = parseCsv(raw)
    const exp = expandFashionBizCatalogToTemplate(parsed, "sp_test")
    expect(exp.rows.length).toBe(3)
    expect(exp.rows[0]?.["variant price aud"]).toBe("12.00")
    expect(exp.rows[1]?.["variant price aud"]).toBe("12.00")
    expect(exp.rows[2]?.["variant price aud"]).toBe("12.00")
  })

  it("normalizeSpreadsheetForImport requires shipping profile for FashionBiz CSV", () => {
    const parsed = parseCsv(`${FASHIONBIZ_HEADER}\nA,P3225,M,Navy,10,Polo`)
    expect(normalizeSpreadsheetForImport(parsed, {}).readyParsed).toBeNull()
    expect(
      normalizeSpreadsheetForImport(parsed, { defaultShippingProfileId: "sp_x" }).readyParsed?.rows.length
    ).toBe(1)
  })

  const DNC_HEADER =
    "ProductCode,Description,Description2,Description3,Barcode,Image,URL,Condition,Price,Picture 1,Picture 2,Picture 3"

  it("detects DNC Workwear CSV shape when dnc URLs are present", () => {
    const raw = `${DNC_HEADER}
1101,Parent Tee,,,,https://cdn.dncworkwear.com.au/x.jpg,https://www.dncworkwear.com.au/Product/1101,,$22.50,,,
SKUB,Child Blue M,Blue,M,931111,https://cdn.dncworkwear.com.au/y.jpg,,,$22.50,,`
    const parsed = parseCsv(raw)
    expect(detectDncWorkwearCatalog(parsed)).toBe(true)
  })

  it("does not detect DNC when URL fingerprint is missing", () => {
    const raw = `${DNC_HEADER}
1101,Parent,,,,http://othersupplier.example/l.jpg,,,$1,,`
    expect(detectDncWorkwearCatalog(parseCsv(raw))).toBe(false)
  })

  it("expandDncWorkwearCatalogToTemplate maps summary + variants", () => {
    const raw = `${DNC_HEADER}
1101,Chef Jacket SS,,,,https://cdn.dncworkwear.com.au/p.jpg,https://www.dncworkwear.com.au/Product/1101,,$20.30,,,
110110061,Chef Jacket SS Black XXS,Black,XXS,9335975124903,https://cdn.dncworkwear.com.au/v.jpg,,,$20.30,,`
    const parsed = parseCsv(raw)
    const exp = expandDncWorkwearCatalogToTemplate(parsed, "sp_dnc")
    expect(exp.rows.length).toBe(1)
    expect(exp.rows[0]?.["product handle"]).toBe("dnc-1101")
    expect(exp.rows[0]?.["product title"]).toBe("Chef Jacket SS")
    expect(exp.rows[0]?.["variant sku"]).toBe("110110061")
    expect(exp.rows[0]?.["variant barcode"]).toBe("9335975124903")
    expect(exp.rows[0]?.["variant option 1 value"]).toBe("XXS")
    expect(exp.rows[0]?.["variant option 2 value"]).toBe("Black")
    expect(computeSpreadsheetPreview(exp).validationErrors.length).toBe(0)
  })

  it("normalizeSpreadsheetForImport requires shipping profile for DNC CSV", () => {
    const raw = `${DNC_HEADER}
1101,Chef Jacket SS,,,,https://cdn.dncworkwear.com.au/p.jpg,https://www.dncworkwear.com.au/Product/1101,,20.30,,,
110110061,Jacket Black XXS,Black,XXS,9335975124903,https://cdn.dncworkwear.com.au/v.jpg,,,,20.30,,`
    const parsed = parseCsv(raw)
    expect(normalizeSpreadsheetForImport(parsed, {}).readyParsed).toBeNull()
    expect(
      normalizeSpreadsheetForImport(parsed, { defaultShippingProfileId: "sp_z" }).readyParsed?.rows.length
    ).toBe(1)
  })

  describe("multi-tag / multi-category / metadata / extra-image columns", () => {
    it("collectProductTagsFromRow reads up to 10 numbered columns and dedupes case-insensitively", () => {
      const row: Record<string, string> = {
        "product tag 1": "audience:unisex",
        "product tag 2": "material:cotton-poly",
        "product tag 3": "Audience:Unisex", // duplicate of tag 1 (case-insensitive)
        "product tag 4": "  ",
        "product tag 5": "weight:mid",
        "product tag 10": "cert:oeko-tex",
      }
      expect(collectProductTagsFromRow(row)).toEqual([
        "audience:unisex",
        "material:cotton-poly",
        "weight:mid",
        "cert:oeko-tex",
      ])
    })

    it("collectProductImageUrlsFromRow gathers up to 5 image URLs in order, drops empties + duplicates", () => {
      const row: Record<string, string> = {
        "product image 1 url": "https://example.com/a.jpg",
        "product image 2 url": "",
        "product image 3 url": "https://example.com/b.jpg",
        "product image 4 url": "https://example.com/a.jpg", // duplicate of img 1
        "product image 5 url": "https://example.com/c.jpg",
      }
      expect(collectProductImageUrlsFromRow(row)).toEqual([
        "https://example.com/a.jpg",
        "https://example.com/b.jpg",
        "https://example.com/c.jpg",
      ])
    })

    it("parseProductMetadataJsonFromRow returns parsed object or undefined for invalid/non-object cells", () => {
      expect(parseProductMetadataJsonFromRow({})).toBeUndefined()
      expect(parseProductMetadataJsonFromRow({ "product metadata json": "" })).toBeUndefined()
      expect(parseProductMetadataJsonFromRow({ "product metadata json": "not json" })).toBeUndefined()
      expect(parseProductMetadataJsonFromRow({ "product metadata json": "[1,2]" })).toBeUndefined()
      expect(
        parseProductMetadataJsonFromRow({ "product metadata json": '{"gsm":200,"composition":{"cotton":35}}' })
      ).toEqual({ gsm: 200, composition: { cotton: 35 } })
    })

    it("collectProductCategoryPathsFromRow splits on > or /, dedupes, ignores empties", () => {
      const row: Record<string, string> = {
        "product category 1 path": "Hospitality > Chefs & Waiters Jackets",
        "product category 2 path": "Apparel/Tops/T-Shirts",
        "product category 3 path": " hospitality > chefs & waiters jackets ", // duplicate (case-insensitive)
        "product category 4 path": "",
        "product category 5 path": "Workwear > Hi-Vis Tops",
      }
      expect(collectProductCategoryPathsFromRow(row)).toEqual([
        ["Hospitality", "Chefs & Waiters Jackets"],
        ["Apparel", "Tops", "T-Shirts"],
        ["Workwear", "Hi-Vis Tops"],
      ])
    })

    it("buildBatchCreatesFromParsedCsv attaches tags, extra images, merged metadata and category paths", () => {
      const r = emptyRow()
      r["product handle"] = "dnc-1101"
      r["product title"] = "Traditional Chef Jacket - Short Sleeve"
      r["product status"] = "draft"
      r["shipping profile id"] = "sp_x"
      r["product discountable"] = "TRUE"
      r["variant sku"] = "110110061"
      r["variant price aud"] = "40.60"
      r["variant option 1 name"] = "Size"
      r["variant option 1 value"] = "XXS"
      r["product image 1 url"] = "https://x/a.jpg"
      r["product image 2 url"] = "https://x/b.jpg"
      // Headers below aren't in PRODUCT_IMPORT_CSV_HEADERS but the importer reads them by name.
      // Add them via a direct CSV with extra columns:
      const extraHeaders = [
        "Product Tag 1",
        "Product Tag 2",
        "Product Tag 3",
        "Product Image 3 Url",
        "Product Image 4 Url",
        "Product Metadata JSON",
        "Product Category 1 Path",
        "Product Category 2 Path",
      ]
      const extraValues = [
        "audience:unisex",
        "material:cotton-poly",
        "weight:mid",
        "https://x/c.jpg",
        "https://x/d.jpg",
        '{"gsm":200,"composition":{"cotton":35,"polyester":65}}',
        "Hospitality > Chefs & Waiters Jackets",
        "Workwear > Hi-Vis Tops",
      ]
      const headers = [...PRODUCT_IMPORT_CSV_HEADERS, ...extraHeaders]
      const headerRow = headers.join(",")
      const dataRow = headers
        .map((h, i) => {
          if (i < PRODUCT_IMPORT_CSV_HEADERS.length) {
            return r[PRODUCT_IMPORT_CSV_HEADERS[i]!.toLowerCase()] ?? ""
          }
          const v = extraValues[i - PRODUCT_IMPORT_CSV_HEADERS.length] ?? ""
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
        })
        .join(",")
      const csv = `${headerRow}\n${dataRow}`

      const parsed = parseCsv(csv)
      const { creates, categoryPathsByHandle, tagValuesByHandle, errors } =
        buildBatchCreatesFromParsedCsv(parsed)
      expect(errors).toEqual([])
      expect(creates.length).toBe(1)
      const c = creates[0] as Record<string, unknown>
      /** Tags live in tagValuesByHandle now — the page resolves values → ids before sending the batch. */
      expect(c.tags).toBeUndefined()
      expect(tagValuesByHandle.get("dnc-1101")).toEqual([
        "audience:unisex",
        "material:cotton-poly",
        "weight:mid",
      ])
      expect(c.images).toEqual([
        { url: "https://x/a.jpg" },
        { url: "https://x/b.jpg" },
        { url: "https://x/c.jpg" },
        { url: "https://x/d.jpg" },
      ])
      const meta = c.metadata as Record<string, unknown>
      expect(meta.gsm).toBe(200)
      expect(meta.composition).toEqual({ cotton: 35, polyester: 65 })
      expect(categoryPathsByHandle.get("dnc-1101")).toEqual([
        ["Hospitality", "Chefs & Waiters Jackets"],
        ["Workwear", "Hi-Vis Tops"],
      ])
    })

    it("buildBatchCreatesFromParsedCsv preserves existing view-image metadata when merging Product Metadata JSON", () => {
      const headers = [
        ...PRODUCT_IMPORT_CSV_HEADERS,
        "Image Standard Url",
        "Product Metadata JSON",
      ]
      const r = emptyRow()
      r["product handle"] = "p1"
      r["product title"] = "Title"
      r["shipping profile id"] = "sp_x"
      r["variant sku"] = "SKU"
      r["variant price aud"] = "10"
      const dataRow = headers
        .map((h, i) => {
          if (i < PRODUCT_IMPORT_CSV_HEADERS.length) {
            return r[PRODUCT_IMPORT_CSV_HEADERS[i]!.toLowerCase()] ?? ""
          }
          const extras = ["https://x/std.jpg", '{"gsm":180}']
          const v = extras[i - PRODUCT_IMPORT_CSV_HEADERS.length] ?? ""
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
        })
        .join(",")
      const csv = `${headers.join(",")}\n${dataRow}`
      const parsed = parseCsv(csv)
      const { creates, errors } = buildBatchCreatesFromParsedCsv(parsed)
      expect(errors).toEqual([])
      const meta = (creates[0] as Record<string, unknown>).metadata as Record<string, unknown>
      expect(meta.image_standard_url).toBe("https://x/std.jpg")
      expect(meta.gsm).toBe(180)
    })
  })

  describe("supplier + dimensions + format selector", () => {
    it("buildBatchCreatesFromParsedCsv writes Product Supplier to product.metadata.supplier", () => {
      const r = emptyRow()
      r["product handle"] = "supplier-shirt"
      r["product title"] = "Supplier Shirt"
      r["product status"] = "published"
      r["shipping profile id"] = "sp_test"
      r["variant sku"] = "SUP-1"
      r["variant option 1 name"] = "Size"
      r["variant option 1 value"] = "M"
      r["variant price aud"] = "10"
      r["product supplier"] = "DNC Workwear"

      const parsed = parseCsv(buildCsv([r]))
      const { creates, errors } = buildBatchCreatesFromParsedCsv(parsed)

      expect(errors).toEqual([])
      const meta = (creates[0] as Record<string, unknown>).metadata as Record<string, unknown>
      expect(meta.supplier).toBe("DNC Workwear")
    })

    it("buildBatchCreatesFromParsedCsv parses product + variant Length/Width/Height", () => {
      const r = emptyRow()
      r["product handle"] = "dim-shirt"
      r["product title"] = "Dim Shirt"
      r["product status"] = "published"
      r["shipping profile id"] = "sp_test"
      r["variant sku"] = "DIM-1"
      r["variant option 1 name"] = "Size"
      r["variant option 1 value"] = "M"
      r["variant price aud"] = "10"
      r["product length"] = "30"
      r["product width"] = "20"
      r["product height"] = "5"
      r["variant length"] = "31"
      r["variant width"] = "21"
      r["variant height"] = "6"

      const parsed = parseCsv(buildCsv([r]))
      const { creates, errors } = buildBatchCreatesFromParsedCsv(parsed)

      expect(errors).toEqual([])
      const c = creates[0] as Record<string, unknown>
      expect(c.length).toBe(30)
      expect(c.width).toBe(20)
      expect(c.height).toBe(5)
      const v = (c.variants as Array<Record<string, unknown>>)[0]!
      expect(v.length).toBe(31)
      expect(v.width).toBe(21)
      expect(v.height).toBe(6)
    })

    it("buildBatchCreatesFromParsedCsv leaves dimensions undefined when cells are blank or non-numeric", () => {
      const r = emptyRow()
      r["product handle"] = "dim-blank"
      r["product title"] = "Dim Blank"
      r["product status"] = "published"
      r["shipping profile id"] = "sp_test"
      r["variant sku"] = "DIM-B"
      r["variant option 1 name"] = "Size"
      r["variant option 1 value"] = "M"
      r["variant price aud"] = "10"
      r["product length"] = ""
      r["product width"] = "not-a-number"

      const parsed = parseCsv(buildCsv([r]))
      const { creates, errors } = buildBatchCreatesFromParsedCsv(parsed)

      expect(errors).toEqual([])
      const c = creates[0] as Record<string, unknown>
      expect(c.length).toBeUndefined()
      expect(c.width).toBeUndefined()
    })

    it("normalizeSpreadsheetForImport with format=template skips DNC auto-expansion", () => {
      const raw = `${DNC_HEADER}
1101,Chef Jacket SS,,,,https://cdn.dncworkwear.com.au/p.jpg,https://www.dncworkwear.com.au/Product/1101,,$20.30,,,
110110061,Chef Jacket SS Black XXS,Black,XXS,9335975124903,https://cdn.dncworkwear.com.au/v.jpg,,,$20.30,,`
      const parsed = parseCsv(raw)
      // Without override, auto-detects DNC.
      expect(detectDncWorkwearCatalog(parsed)).toBe(true)
      // With format=template, header validation kicks in instead of expansion.
      const res = normalizeSpreadsheetForImport(parsed, {
        defaultShippingProfileId: "sp_x",
        format: "template",
      })
      expect(res.readyParsed).toBeNull()
      expect(res.hints.some((h) => h.includes("Missing required column"))).toBe(true)
    })

    it("normalizeSpreadsheetForImport with format=dnc-workwear forces expansion even without dnc URL fingerprint", () => {
      // URLs do NOT mention dncworkwear → auto-detect would fail.
      const raw = `${DNC_HEADER}
1101,Chef Jacket SS,,,,https://cdn.example.com/p.jpg,https://www.example.com/Product/1101,,$20.30,,,
110110061,Chef Jacket SS Black XXS,Black,XXS,9335975124903,https://cdn.example.com/v.jpg,,,$20.30,,`
      const parsed = parseCsv(raw)
      expect(detectDncWorkwearCatalog(parsed)).toBe(false)

      const res = normalizeSpreadsheetForImport(parsed, {
        defaultShippingProfileId: "sp_x",
        format: "dnc-workwear",
      })
      expect(res.readyParsed?.rows.length).toBe(1)
      expect(res.readyParsed?.rows[0]?.["product handle"]).toBe("dnc-1101")
      expect(res.readyParsed?.rows[0]?.["variant sku"]).toBe("110110061")
    })

    it("normalizeSpreadsheetForImport with format=ascolour-gold still requires shipping profile id", () => {
      const raw = `${GOLD_HEADER}\n3,1000,Parcel Tote,,,,,,50,6.95,BAGS,41000,https://example.com/p`
      const parsed = parseCsv(raw)
      expect(normalizeSpreadsheetForImport(parsed, { format: "ascolour-gold" }).readyParsed).toBeNull()
      expect(
        normalizeSpreadsheetForImport(parsed, {
          defaultShippingProfileId: "sp_x",
          format: "ascolour-gold",
        }).readyParsed?.rows.length
      ).toBe(1)
    })
  })

  describe("Honeybee wholesale catalogue (Biz Care / Biz Collection / Syzmik)", () => {
    /** Headers + sample rows matching the supplier paste (two products, one single-size, one with two colours × three sizes). */
    const BIZ_CARE_HEADER = [
      "sku",
      "style_code",
      "style_name",
      "category",
      "description",
      "stringified_description",
      "image",
      "image_url",
      "alternate_image",
      "colour_tag",
      "colour",
      "front_color_image",
      "front_color_image_url",
      "back_color_image",
      "back_color_image_url",
      "colour_code",
      "size",
      "qty1",
      "price1",
      "qty2",
      "price2",
      "qty3",
      "price3",
      "qty4",
      "price4",
      "carton_height",
      "carton_width",
      "carton_depth",
      "carton_weight",
      "carton_qty",
      "carton_cubic",
      "product_url",
      "sale_status",
    ].join(",")

    /** Helper: pad a row with empty trailing cells to match BIZ_CARE_HEADER width. */
    const bizCareRow = (cols: Record<string, string>): string => {
      const order = BIZ_CARE_HEADER.split(",")
      return order
        .map((h) => {
          const v = cols[h] ?? ""
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
        })
        .join(",")
    }

    /** One single-size accessory and one socks product across two colours × three sizes (mirrors paste). */
    const SAMPLE_ROWS = [
      bizCareRow({
        sku: "9.40104E+12",
        style_code: "CA044U",
        style_name: "Unisex Biz Care Tote Bag",
        category: "accessories;bags;unisex;cotton;aged care",
        stringified_description: "Cares: Gentle wash; Sizes: One Size.",
        image_url: "https://cdn.fashionbizapps.nz/honeybee/CA044U_Natural.jpg",
        colour_tag: "natural canvas",
        colour: "Natural",
        front_color_image_url: "https://cdn/front_natural.jpg",
        back_color_image_url: "https://cdn/back_natural.jpg",
        size: "FRE",
        qty1: "Jan-99",
        price1: "14.37",
        product_url: "https://www.biz-care.com/product/au/ca044u/",
        sale_status: "normal",
      }),
      bizCareRow({
        sku: "9.40104E+12",
        style_code: "CCS149U",
        style_name: "Unisex Happy Feet Comfort Socks",
        category: "accessories;socks;healthwear",
        stringified_description: "Cares: Warm wash; Sizes: S, M, L.",
        image_url: "https://cdn/CCS149U_hero.jpg",
        colour_tag: "sage/black",
        colour: "Sage/Black",
        front_color_image_url: "https://cdn/front_sage.jpg",
        back_color_image_url: "https://cdn/back_sage.jpg",
        size: "S",
        qty1: "Jan-99",
        price1: "7.99",
        product_url: "https://www.biz-care.com/product/au/ccs149u/",
        sale_status: "normal",
      }),
      bizCareRow({
        sku: "9.40104E+12",
        style_code: "CCS149U",
        style_name: "Unisex Happy Feet Comfort Socks",
        category: "accessories;socks;healthwear",
        stringified_description: "Cares: Warm wash; Sizes: S, M, L.",
        image_url: "https://cdn/CCS149U_hero.jpg",
        colour_tag: "sage/black",
        colour: "Sage/Black",
        front_color_image_url: "https://cdn/front_sage.jpg",
        back_color_image_url: "https://cdn/back_sage.jpg",
        size: "M",
        qty1: "Jan-99",
        price1: "7.99",
        product_url: "https://www.biz-care.com/product/au/ccs149u/",
        sale_status: "normal",
      }),
      bizCareRow({
        sku: "9.40104E+12",
        style_code: "CCS149U",
        style_name: "Unisex Happy Feet Comfort Socks",
        category: "accessories;socks;healthwear",
        stringified_description: "Cares: Warm wash; Sizes: S, M, L.",
        image_url: "https://cdn/CCS149U_hero.jpg",
        colour_tag: "navy/red",
        colour: "Navy/Red",
        front_color_image_url: "https://cdn/front_navy.jpg",
        back_color_image_url: "https://cdn/back_navy.jpg",
        size: "L",
        qty1: "Jan-99",
        price1: "7.99",
        product_url: "https://www.biz-care.com/product/au/ccs149u/",
        sale_status: "normal",
      }),
    ]
    const SAMPLE_CSV = `${BIZ_CARE_HEADER}\n${SAMPLE_ROWS.join("\n")}`

    it("detects Biz Care CSV shape", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      expect(detectHoneybeeCatalog(parsed)).toBe(true)
    })

    it("expandHoneybeeCatalogToTemplate groups by style_code and constructs unique variant SKUs", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      // 1 tote + 2 sock variants (sage S, sage M, navy L) = 4 rows
      expect(exp.rows.length).toBe(4)

      const handles = new Set(exp.rows.map((r) => r["product handle"]))
      expect(handles).toEqual(new Set(["biz-care-ca044u", "biz-care-ccs149u"]))

      const skus = exp.rows.map((r) => r["variant sku"])
      // SKUs must be distinct (real `sku` column is corrupted EAN repeated across all rows)
      expect(new Set(skus).size).toBe(skus.length)
      expect(skus).toContain("CA044U-NATURAL-CANVAS-FRE")
      expect(skus).toContain("CCS149U-SAGE-BLACK-S")
      expect(skus).toContain("CCS149U-SAGE-BLACK-M")
      expect(skus).toContain("CCS149U-NAVY-RED-L")
    })

    it("expansion stamps Product Supplier=Biz Care and surfaces Colour + Size as the two options", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      const sageS = exp.rows.find((r) => r["variant sku"] === "CCS149U-SAGE-BLACK-S")!
      expect(sageS["product supplier"]).toBe("Biz Care")
      expect(sageS["product status"]).toBe("draft")
      expect(sageS["variant option 1 name"]).toBe("Colour")
      expect(sageS["variant option 1 value"]).toBe("Sage/Black")
      expect(sageS["variant option 2 name"]).toBe("Size")
      expect(sageS["variant option 2 value"]).toBe("S")
      expect(sageS["variant price aud"]).toBe("7.99")
      expect(sageS["product description"]).toContain("Warm wash")
      expect(sageS["product external id"]).toBe("https://www.biz-care.com/product/au/ccs149u/")
    })

    it("Honeybee imports default to draft status (supplier-published prices may sit below actual cost)", () => {
      const csv = `${BIZ_CARE_HEADER}\n${bizCareRow({
        sku: "9.40104E+12",
        style_code: "BA35",
        style_name: "Barley Apron",
        category: "hospitality;aprons",
        stringified_description: "Sizes: Free.",
        image_url: "https://cdn/x.jpg",
        colour: "Black",
        front_color_image_url: "https://cdn/x.jpg",
        back_color_image_url: "https://cdn/y.jpg",
        size: "FRE",
        qty1: "Jan-99",
        price1: "14.2",
        product_url: "https://www.bizcollection.com/product/au/ba35/",
        sale_status: "normal",
      })}`
      const parsed = parseCsv(csv)
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      expect(exp.rows.every((r) => r["product status"] === "draft")).toBe(true)

      const res = normalizeSpreadsheetForImport(parsed, { defaultShippingProfileId: "sp_x" })
      expect(res.hints.some((h) => h.toLowerCase().includes("draft"))).toBe(true)
    })

    it("buildBatchCreatesFromParsedCsv ingests expanded Biz Care rows with supplier metadata + tags", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      const expanded = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      const reparsed = parseCsv(
        [
          expanded.headers.join(","),
          ...expanded.rows.map((row) =>
            expanded.headers
              .map((h) => {
                const v = row[h] ?? ""
                return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
              })
              .join(",")
          ),
        ].join("\n")
      )
      const { creates, tagValuesByHandle, errors } = buildBatchCreatesFromParsedCsv(reparsed)
      expect(errors).toEqual([])
      expect(creates.length).toBe(2)

      const socks = creates.find(
        (c) => (c as Record<string, unknown>).handle === "biz-care-ccs149u"
      ) as Record<string, unknown>
      expect(socks.title).toBe("Unisex Happy Feet Comfort Socks")
      expect((socks.metadata as Record<string, unknown>).supplier).toBe("Biz Care")
      /** Tag values live in tagValuesByHandle now; the page resolves them to ids before the batch call. */
      expect(socks.tags).toBeUndefined()
      expect(tagValuesByHandle.get("biz-care-ccs149u") ?? []).toEqual(
        expect.arrayContaining(["accessories", "socks", "healthwear"])
      )
      const variants = socks.variants as Array<{ sku: string }>
      expect(variants.length).toBe(3)
    })

    it("normalizeSpreadsheetForImport routes Biz Care CSV through Biz Care expander, not generic FashionBiz", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      // Both detectors fire on this shape; Biz Care must win.
      expect(detectHoneybeeCatalog(parsed)).toBe(true)
      const res = normalizeSpreadsheetForImport(parsed, {
        defaultShippingProfileId: "sp_x",
      })
      expect(res.readyParsed).not.toBeNull()
      // Biz Care handles use `biz-care-` prefix; generic FashionBiz would emit `biz-collection-`.
      const handles = new Set(
        res.readyParsed!.rows.map((r) => (r["product handle"] ?? "").trim())
      )
      expect([...handles].every((h) => h.startsWith("biz-care-"))).toBe(true)
      expect(res.hints.some((h) => h.toLowerCase().includes("biz care"))).toBe(true)
    })

    it("requires shipping profile id before expanding Biz Care", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      expect(normalizeSpreadsheetForImport(parsed, {}).readyParsed).toBeNull()
      expect(
        normalizeSpreadsheetForImport(parsed, { defaultShippingProfileId: "sp_x" }).readyParsed?.rows
          .length
      ).toBe(4)
    })

    it("format=biz-honeybee override forces expansion even if header signature drifts", () => {
      // Header without `front_color_image_url` — auto-detect would pass to FashionBiz; explicit override forces Honeybee.
      const headers = [
        "sku",
        "style_code",
        "style_name",
        "colour_tag",
        "colour",
        "size",
        "price1",
        "image_url",
      ].join(",")
      const row = [
        "9.40104E+12",
        "CCS999U",
        "Test",
        "blue",
        "Blue",
        "M",
        "5.50",
        "https://cdn/x.jpg",
      ].join(",")
      const parsed = parseCsv(`${headers}\n${row}`)
      expect(detectHoneybeeCatalog(parsed)).toBe(false)
      const res = normalizeSpreadsheetForImport(parsed, {
        defaultShippingProfileId: "sp_x",
        format: "biz-honeybee",
      })
      expect(res.readyParsed?.rows.length).toBe(1)
      // No URL → falls back to "Biz Care" brand prefix (most common shape).
      expect(res.readyParsed?.rows[0]?.["product handle"]).toBe("biz-care-ccs999u")
      expect(res.readyParsed?.rows[0]?.["variant sku"]).toBe("CCS999U-BLUE-M")
    })

    it("infers Biz Collection brand + bizcollection-* handle when product_url points to bizcollection.com", () => {
      const csv = `${BIZ_CARE_HEADER}\n${bizCareRow({
        sku: "9.40104E+12",
        style_code: "BA35",
        style_name: "Barley Apron",
        category: "hospitality;aprons;cotton",
        stringified_description: "Sizes: Free Size 85cm x 73cm.",
        image_url: "https://cdn.fashionbizapps.nz/honeybee/images/BA35_Black.jpg",
        colour: "Black",
        front_color_image_url: "https://cdn.fashionbizapps.nz/honeybee/images/BA35_Talent_Black.jpg",
        back_color_image_url: "https://cdn.fashionbizapps.nz/honeybee/images/BA35_bProduct_Black.jpg",
        size: "FRE",
        qty1: "Jan-99",
        price1: "14.2",
        qty2: "100-499",
        price2: "14",
        qty3: "500",
        price3: "13.5",
        product_url: "https://www.bizcollection.com/product/au/ba35/",
        sale_status: "normal",
      })}`
      const parsed = parseCsv(csv)
      expect(inferHoneybeeBrandFromRows(parsed.rows)).toEqual({
        supplier: "Biz Collection",
        handlePrefix: "biz-collection",
      })
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      expect(exp.rows[0]?.["product handle"]).toBe("biz-collection-ba35")
      expect(exp.rows[0]?.["product supplier"]).toBe("Biz Collection")
      expect(exp.rows[0]?.["variant price aud"]).toBe("14.2")
    })

    it("maps Honeybee qty/price tiers (price1=1-99, price2=100-499) onto Medusa BASE_SALE / TIER_*_PRICE columns", () => {
      const csv = `${BIZ_CARE_HEADER}\n${bizCareRow({
        sku: "9.40104E+12",
        style_code: "BA35",
        style_name: "Barley Apron",
        category: "hospitality;aprons",
        stringified_description: "Sizes: Free.",
        image_url: "https://cdn.fashionbizapps.nz/honeybee/images/BA35.jpg",
        colour: "Black",
        front_color_image_url: "https://cdn/x.jpg",
        back_color_image_url: "https://cdn/y.jpg",
        size: "FRE",
        qty1: "Jan-99",
        price1: "14.2",
        qty2: "100-499",
        price2: "14",
        qty3: "500",
        price3: "13.5",
        product_url: "https://www.bizcollection.com/product/au/ba35/",
        sale_status: "normal",
      })}`
      const parsed = parseCsv(csv)
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      const row = exp.rows[0]!
      expect(row["variant price aud"]).toBe("14.2")
      expect(row["base_sale_price"]).toBe("14.2")
      expect(row["tier_10_to_19_price"]).toBe("14.2")
      expect(row["tier_20_to_49_price"]).toBe("14.2")
      expect(row["tier_50_to_99_price"]).toBe("14.2")
      // 100+ uses price2 (100-499 band) — price3 (500+) is intentionally dropped to avoid over-discounting at qty=100.
      expect(row["tier_100_plus_price"]).toBe("14")
    })

    it("buildBatchCreatesFromParsedCsv writes Honeybee tier ladder to tierBySku for downstream pricing module application", () => {
      const csv = `${BIZ_CARE_HEADER}\n${bizCareRow({
        sku: "9.40104E+12",
        style_code: "BA35",
        style_name: "Barley Apron",
        category: "hospitality;aprons",
        stringified_description: "Sizes: Free.",
        image_url: "https://cdn/hero.jpg",
        colour: "Black",
        front_color_image_url: "https://cdn/x.jpg",
        back_color_image_url: "https://cdn/y.jpg",
        size: "FRE",
        qty1: "Jan-99",
        price1: "14.2",
        qty2: "100-499",
        price2: "14",
        product_url: "https://www.bizcollection.com/product/au/ba35/",
        sale_status: "normal",
      })}`
      const parsed = parseCsv(csv)
      const expanded = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      const reparsed = parseCsv(
        [
          expanded.headers.join(","),
          ...expanded.rows.map((r) =>
            expanded.headers
              .map((h) => {
                const v = r[h] ?? ""
                return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
              })
              .join(",")
          ),
        ].join("\n")
      )
      const { creates, tierBySku, errors } = buildBatchCreatesFromParsedCsv(reparsed)
      expect(errors).toEqual([])
      expect(creates.length).toBe(1)
      const sku = ((creates[0] as Record<string, unknown>).variants as Array<{ sku: string }>)[0]!.sku
      const tiers = tierBySku.get(sku)
      expect(tiers).toEqual({
        t1_9: 1420,
        t10_19: 1420,
        t20_49: 1420,
        t50_99: 1420,
        t100_plus: 1400,
      })
    })

    it("skips Honeybee tier columns for single-price products (price2 empty → flat AUD only)", () => {
      const csv = `${BIZ_CARE_HEADER}\n${bizCareRow({
        sku: "9.40104E+12",
        style_code: "CA044U",
        style_name: "Tote",
        category: "accessories",
        stringified_description: "Sizes: One Size.",
        image_url: "https://cdn/x.jpg",
        colour: "Natural",
        front_color_image_url: "https://cdn/x.jpg",
        back_color_image_url: "https://cdn/y.jpg",
        size: "FRE",
        qty1: "Jan-99",
        price1: "14.37",
        product_url: "https://www.biz-care.com/product/au/ca044u/",
        sale_status: "normal",
      })}`
      const parsed = parseCsv(csv)
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      const row = exp.rows[0]!
      expect(row["variant price aud"]).toBe("14.37")
      // No wholesale band → no tier columns written; resolveVariantRowPricing falls back to AUD-anchor derivation.
      expect(row["base_sale_price"]).toBe("")
      expect(row["tier_10_to_19_price"]).toBe("")
      expect(row["tier_100_plus_price"]).toBe("")
    })

    it("infers Syzmik brand + syzmik-* handle when product_url points to syzmik.com", () => {
      const csv = `${BIZ_CARE_HEADER}\n${bizCareRow({
        sku: "9.40104E+12",
        style_code: "ZC503",
        style_name: "Mens Service Overall",
        category: "overalls;industrial",
        stringified_description: "Strong poly-cotton fabric.",
        image_url: "https://cdn.fashionbizapps.nz/honeybee/products/ZC503.jpg",
        colour: "Charcoal",
        front_color_image_url: "https://cdn.fashionbizapps.nz/honeybee/images/ZC503_Charcoal_F.jpg",
        back_color_image_url: "https://cdn.fashionbizapps.nz/honeybee/images/ZC503_Charcoal_B.jpg",
        size: "82",
        qty1: "Jan-99",
        price1: "34.5",
        product_url: "https://www.syzmik.com/product/au/zc503/",
        sale_status: "normal",
      })}`
      const parsed = parseCsv(csv)
      expect(inferHoneybeeBrandFromRows(parsed.rows)).toEqual({
        supplier: "Syzmik",
        handlePrefix: "syzmik",
      })
      const exp = expandHoneybeeCatalogToTemplate(parsed, "sp_test")
      expect(exp.rows[0]?.["product handle"]).toBe("syzmik-zc503")
      expect(exp.rows[0]?.["product supplier"]).toBe("Syzmik")
    })
  })

  describe("Ramo Australia catalogue", () => {
    /** Subset of Ramo's 50+ columns — the detector + expander only read a handful. Shippable test fixture. */
    const RAMO_HEADER = [
      "name",
      "product_url",
      "product_image_url",
      "product_image_hero_url",
      "primary_category",
      "long_description",
      "price_ex_gst",
      "parent_code",
      "product_id",
      "attribute_colours",
      "attribute_size",
      "attribute_type",
    ].join(",")

    const ramoRow = (cols: Record<string, string>): string => {
      const order = RAMO_HEADER.split(",")
      return order
        .map((h) => {
          const v = cols[h] ?? ""
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
        })
        .join(",")
    }

    /** AP401S = Short Waist Apron with 3 colour variants; B103RG = Babies Raglan with 2 colour × 3 size variants. */
    const SAMPLE_ROWS = [
      ramoRow({
        name: "Short Waist Apron - 100% cotton canvas",
        product_url: "https://www.ramo.com.au/shop/item/short-waist-apron",
        product_image_url: "https://www.ramo.com.au/persistent/catalogue_images/products/AP401S_Azure.jpg",
        product_image_hero_url: "https://www.ramo.com.au/persistent/catalogue_images/products/AP401S_hero.jpg",
        primary_category: "Aprons",
        long_description: "<p>210 gsm 100% cotton canvas apron</p>",
        price_ex_gst: "9",
        parent_code: "AP401S",
        product_id: "AP401S_AZ_S",
        attribute_colours: "Azure",
        attribute_size: "S",
        attribute_type: "Apron",
      }),
      ramoRow({
        name: "Short Waist Apron - 100% cotton canvas",
        product_url: "https://www.ramo.com.au/shop/item/short-waist-apron-01",
        product_image_url: "https://www.ramo.com.au/persistent/catalogue_images/products/AP401S_Black.jpg",
        product_image_hero_url: "https://www.ramo.com.au/persistent/catalogue_images/products/AP401S_hero.jpg",
        primary_category: "Aprons",
        long_description: "<p>210 gsm 100% cotton canvas apron</p>",
        price_ex_gst: "9",
        parent_code: "AP401S",
        product_id: "AP401S_BL_S",
        attribute_colours: "Black",
        attribute_size: "S",
        attribute_type: "Apron",
      }),
      ramoRow({
        name: "Babies Raglan T-shirt",
        product_url: "https://www.ramo.com.au/shop/item/babies-raglan",
        product_image_url: "https://www.ramo.com.au/persistent/catalogue_images/products/B103RG_PinkHotPink.jpg",
        product_image_hero_url: "https://www.ramo.com.au/persistent/catalogue_images/products/B103RG_hero.jpg",
        primary_category: "Raglan",
        long_description: "<p>185gsm 100% organic cotton</p>",
        price_ex_gst: "9",
        parent_code: "B103RG",
        product_id: "B103RG_PH_0",
        attribute_colours: "Pink/Hot Pink",
        attribute_size: "0",
        attribute_type: "T-shirts",
      }),
      ramoRow({
        name: "Babies Raglan T-shirt",
        product_url: "https://www.ramo.com.au/shop/item/babies-raglan-01",
        product_image_url: "https://www.ramo.com.au/persistent/catalogue_images/products/B103RG_PinkHotPink.jpg",
        product_image_hero_url: "https://www.ramo.com.au/persistent/catalogue_images/products/B103RG_hero.jpg",
        primary_category: "Raglan",
        long_description: "<p>185gsm 100% organic cotton</p>",
        price_ex_gst: "9",
        parent_code: "B103RG",
        product_id: "B103RG_PH_2",
        attribute_colours: "Pink/Hot Pink",
        attribute_size: "2",
        attribute_type: "T-shirts",
      }),
      ramoRow({
        name: "Babies Raglan T-shirt",
        product_url: "https://www.ramo.com.au/shop/item/babies-raglan-10",
        product_image_url: "https://www.ramo.com.au/persistent/catalogue_images/products/B103RG_WhiteAzure.jpg",
        product_image_hero_url: "https://www.ramo.com.au/persistent/catalogue_images/products/B103RG_hero.jpg",
        primary_category: "Raglan",
        long_description: "<p>185gsm 100% organic cotton</p>",
        price_ex_gst: "9",
        parent_code: "B103RG",
        product_id: "B103RG_WA_0",
        attribute_colours: "White/Azure",
        attribute_size: "0",
        attribute_type: "T-shirts",
      }),
    ]
    const SAMPLE_CSV = `${RAMO_HEADER}\n${SAMPLE_ROWS.join("\n")}`

    it("detects Ramo CSV shape via parent_code + product_id + price_ex_gst + ramo.com.au URL", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      expect(detectRamoCatalog(parsed)).toBe(true)
    })

    it("does not detect Ramo when ramo.com.au URLs are absent (header alone is not enough)", () => {
      const headers = [
        "name",
        "product_url",
        "product_image_url",
        "primary_category",
        "long_description",
        "price_ex_gst",
        "parent_code",
        "product_id",
        "attribute_colours",
        "attribute_size",
        "attribute_type",
      ].join(",")
      const row = [
        "Tee",
        "https://example.com/x",
        "https://example.com/x.jpg",
        "Tees",
        "<p>desc</p>",
        "9",
        "PARENT",
        "PARENT_BL_S",
        "Black",
        "S",
        "T-shirts",
      ].join(",")
      const parsed = parseCsv(`${headers}\n${row}`)
      expect(detectRamoCatalog(parsed)).toBe(false)
    })

    it("expandRamoCatalogToTemplate groups by parent_code, uses product_id as variant SKU verbatim", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      const exp = expandRamoCatalogToTemplate(parsed, "sp_test")
      expect(exp.rows.length).toBe(5)

      const handles = new Set(exp.rows.map((r) => r["product handle"]))
      expect(handles).toEqual(new Set(["ramo-ap401s", "ramo-b103rg"]))

      const skus = exp.rows.map((r) => r["variant sku"])
      // Real per-variant SKUs come straight from product_id — must round-trip unchanged.
      expect(skus).toEqual(
        expect.arrayContaining([
          "AP401S_AZ_S",
          "AP401S_BL_S",
          "B103RG_PH_0",
          "B103RG_PH_2",
          "B103RG_WA_0",
        ])
      )
    })

    it("expansion stamps Product Supplier=Ramo, sets HTML description, attaches primary_category + attribute_type as tags", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      const exp = expandRamoCatalogToTemplate(parsed, "sp_test")
      const apron = exp.rows.find((r) => r["variant sku"] === "AP401S_AZ_S")!
      expect(apron["product supplier"]).toBe("Ramo")
      expect(apron["product status"]).toBe("draft")
      expect(apron["product description"]).toContain("210 gsm")
      expect(apron["variant option 1 name"]).toBe("Colour")
      expect(apron["variant option 1 value"]).toBe("Azure")
      expect(apron["variant option 2 name"]).toBe("Size")
      expect(apron["variant option 2 value"]).toBe("S")
      expect(apron["variant price aud"]).toBe("9")
      expect(apron["product external id"]).toBe("https://www.ramo.com.au/shop/item/short-waist-apron")
      expect(apron["product tag 1"]).toBe("Aprons")
      expect(apron["product tag 2"]).toBe("Apron")
    })

    it("buildBatchCreatesFromParsedCsv ingests expanded Ramo rows cleanly", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      const expanded = expandRamoCatalogToTemplate(parsed, "sp_test")
      const reparsed = parseCsv(
        [
          expanded.headers.join(","),
          ...expanded.rows.map((row) =>
            expanded.headers
              .map((h) => {
                const v = row[h] ?? ""
                return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
              })
              .join(",")
          ),
        ].join("\n")
      )
      const { creates, errors } = buildBatchCreatesFromParsedCsv(reparsed)
      expect(errors).toEqual([])
      expect(creates.length).toBe(2)
      const raglan = creates.find(
        (c) => (c as Record<string, unknown>).handle === "ramo-b103rg"
      ) as Record<string, unknown>
      expect((raglan.metadata as Record<string, unknown>).supplier).toBe("Ramo")
      const variants = raglan.variants as Array<{ sku: string }>
      expect(variants.length).toBe(3)
      expect(variants.map((v) => v.sku)).toEqual(
        expect.arrayContaining(["B103RG_PH_0", "B103RG_PH_2", "B103RG_WA_0"])
      )
    })

    it("normalizeSpreadsheetForImport routes Ramo CSV through Ramo expander, requires shipping profile id", () => {
      const parsed = parseCsv(SAMPLE_CSV)
      expect(normalizeSpreadsheetForImport(parsed, {}).readyParsed).toBeNull()
      const res = normalizeSpreadsheetForImport(parsed, { defaultShippingProfileId: "sp_x" })
      expect(res.readyParsed?.rows.length).toBe(5)
      expect(res.hints.some((h) => h.toLowerCase().includes("ramo"))).toBe(true)
    })
  })
})
