import {
  buildProductImportTemplateRows,
  PRODUCT_IMPORT_CSV_HEADERS,
} from "../product-import-template-csv"

const idx = (h: string) => PRODUCT_IMPORT_CSV_HEADERS.indexOf(h)

describe("buildProductImportTemplateRows", () => {
  it("each row has the same width as PRODUCT_IMPORT_CSV_HEADERS", () => {
    const products = [
      {
        id: "p1",
        handle: "test-handle",
        title: "Test",
        subtitle: "",
        description: "",
        status: "published",
        thumbnail: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        hs_code: "",
        origin_country: "",
        mid_code: "",
        material: "",
        shipping_profile_id: "",
        discountable: true,
        external_id: "",
        variants: [
          {
            id: "v1",
            title: "Default",
            sku: "SKU1",
            barcode: "",
            allow_backorder: false,
            manage_inventory: true,
            weight: "",
            length: "",
            width: "",
            height: "",
            hs_code: "",
            origin_country: "",
            mid_code: "",
            material: "",
            prices: [],
            options: [],
            metadata: {
              bulk_pricing: {
                currency_code: "aud",
                tiers: [
                  { min_quantity: 1, max_quantity: 9, amount: 1000 },
                  { min_quantity: 10, max_quantity: 49, amount: 900 },
                  { min_quantity: 50, max_quantity: 99, amount: 800 },
                  { min_quantity: 100, amount: 700 },
                ],
              },
            },
          },
        ],
        collection: null,
        type: null,
        sales_channels: [],
        tags: [],
        images: [],
        options: [],
        metadata: {
          image_standard_url: "https://std.example/a.jpg",
          image_front_url: "https://front.example/b.jpg",
          image_back_url: "https://back.example/c.jpg",
          image_side_url: "https://side.example/d.jpg",
        },
      },
    ]

    const rows = buildProductImportTemplateRows(products as unknown[])
    expect(rows).toHaveLength(1)
    expect(rows[0].length).toBe(PRODUCT_IMPORT_CSV_HEADERS.length)
    expect(rows[0][idx("Image Standard Url")]).toBe("https://std.example/a.jpg")
    expect(rows[0][idx("Image Front Url")]).toBe("https://front.example/b.jpg")
    expect(rows[0][idx("Image Back Url")]).toBe("https://back.example/c.jpg")
    expect(rows[0][idx("Image Side Url")]).toBe("https://side.example/d.jpg")
  })

  it("maps bulk_pricing tiers to AUD supplemental columns (major units)", () => {
    const products = [
      {
        id: "p1",
        handle: "h",
        title: "T",
        subtitle: "",
        description: "",
        status: "published",
        thumbnail: "",
        weight: "",
        length: "",
        width: "",
        height: "",
        hs_code: "",
        origin_country: "",
        mid_code: "",
        material: "",
        shipping_profile_id: "",
        discountable: true,
        external_id: "",
        variants: [
          {
            id: "v1",
            title: "Default",
            sku: "S",
            barcode: "",
            allow_backorder: false,
            manage_inventory: true,
            weight: "",
            length: "",
            width: "",
            height: "",
            hs_code: "",
            origin_country: "",
            mid_code: "",
            material: "",
            prices: [],
            options: [],
            metadata: {
              bulk_pricing: {
                currency_code: "aud",
                tiers: [
                  { min_quantity: 1, max_quantity: 9, amount: 1000 },
                  { min_quantity: 10, max_quantity: 49, amount: 900 },
                  { min_quantity: 50, max_quantity: 99, amount: 800 },
                  { min_quantity: 100, amount: 700 },
                ],
              },
            },
          },
        ],
        collection: null,
        type: null,
        sales_channels: [],
        tags: [],
        images: [],
        options: [],
      },
    ]

    const row = buildProductImportTemplateRows(products as unknown[])[0]
    expect(row[idx("BASE_SALE_PRICE")]).toBe("10")
    expect(row[idx("TIER_10_TO_19_PRICE")]).toBe("9")
    expect(row[idx("TIER_20_TO_49_PRICE")]).toBe("9")
    expect(row[idx("TIER_50_TO_99_PRICE")]).toBe("8")
    expect(row[idx("TIER_100_PLUS_PRICE")]).toBe("7")
    expect(row[idx("TIER_10_TO_49_PRICE")]).toBe("9")
    expect(row[idx("Variant Price AUD")]).toBe("7")
    expect(row[idx("Variant Bulk Pricing JSON")]).toContain('"tiers"')
  })

  it("emits Product Brand from linked product.brand.name", () => {
    const products = [
      {
        id: "p1",
        handle: "h",
        title: "T",
        subtitle: "",
        description: "",
        status: "published",
        thumbnail: "",
        weight: "",
        hs_code: "",
        origin_country: "",
        mid_code: "",
        material: "",
        shipping_profile_id: "",
        discountable: true,
        external_id: "",
        variants: [
          {
            id: "v1",
            title: "Default",
            sku: "S",
            barcode: "",
            allow_backorder: false,
            manage_inventory: true,
            weight: "",
            hs_code: "",
            origin_country: "",
            mid_code: "",
            material: "",
            prices: [],
            options: [],
            metadata: {},
          },
        ],
        collection: null,
        type: null,
        sales_channels: [],
        tags: [],
        images: [],
        options: [],
        metadata: {},
        brand: { id: "brand_asc", name: "AS Colour", handle: "as-colour" },
      },
    ]

    const row = buildProductImportTemplateRows(products as unknown[])[0]
    expect(row[idx("Product Brand")]).toBe("AS Colour")
  })

  it("falls back to legacy metadata.brand when no link is present", () => {
    const products = [
      {
        id: "p1",
        handle: "h",
        title: "T",
        subtitle: "",
        description: "",
        status: "published",
        thumbnail: "",
        weight: "",
        hs_code: "",
        origin_country: "",
        mid_code: "",
        material: "",
        shipping_profile_id: "",
        discountable: true,
        external_id: "",
        variants: [
          {
            id: "v1",
            title: "Default",
            sku: "S",
            barcode: "",
            allow_backorder: false,
            manage_inventory: true,
            weight: "",
            hs_code: "",
            origin_country: "",
            mid_code: "",
            material: "",
            prices: [],
            options: [],
            metadata: {},
          },
        ],
        collection: null,
        type: null,
        sales_channels: [],
        tags: [],
        images: [],
        options: [],
        metadata: { supplier: "AS Colour" },
      },
    ]

    const row = buildProductImportTemplateRows(products as unknown[])[0]
    expect(row[idx("Product Brand")]).toBe("AS Colour")
  })
})
