import { test, expect, APIRequestContext, Page } from "@playwright/test"
import { qaEnv, url } from "./helpers"

/**
 * The product feeds in src/app/feeds: /feeds/google/{country}.xml, which
 * Google Merchant Center fetches on a schedule, and /feeds/openai/{country}.csv,
 * which the backend pushes to OpenAI over SFTP.
 *
 * Both programs reject an item whose required fields are missing or whose
 * price differs from its landing page, and neither says so anywhere the
 * store owner looks first. So this checks the fields against each spec and
 * the price against the product page the item links to.
 *
 * Read-only: it creates nothing.
 */

const GOOGLE_NS = "http://base.google.com/ns/1.0"
const GOOGLE_REQUIRED = [
  "id",
  "title",
  "description",
  "link",
  "availability",
  "price",
  "brand",
  "condition",
]
const OPENAI_REQUIRED = [
  "item_id",
  "title",
  "description",
  "url",
  "brand",
  "seller_name",
  "image_url",
  "availability",
  "price",
]
/** "79.99 USD", never a localised "79,99 €". */
const MONEY = /^\d+(\.\d+)? [A-Z]{3}$/

type GoogleItem = Record<string, string>

/** Parsed in the browser, whose DOMParser rejects anything that is not well-formed XML. */
const parseGoogleFeed = async (page: Page, xml: string) =>
  page.evaluate(
    ({ xml, ns }) => {
      const doc = new DOMParser().parseFromString(xml, "application/xml")
      const error = doc.querySelector("parsererror")
      if (error) return { error: error.textContent ?? "parse error", items: [] }
      const items = Array.from(doc.getElementsByTagName("item")).map((item) => {
        const fields: Record<string, string> = {}
        for (const child of Array.from(item.children)) {
          if (child.namespaceURI === ns && !(child.localName in fields)) {
            fields[child.localName] = child.textContent ?? ""
          }
        }
        return fields
      })
      return { error: null, items }
    },
    { xml, ns: GOOGLE_NS }
  )

/** RFC 4180: quoted cells may hold commas, doubled quotes and line breaks. */
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ",") {
      row.push(cell)
      cell = ""
    } else if (char === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else if (char !== "\r") {
      cell += char
    }
  }
  if (cell || row.length) rows.push([...row, cell])
  return rows
}

const fetchGoogleFeed = async (request: APIRequestContext, page: Page) => {
  const response = await request.get(`/feeds/google/${qaEnv.region}.xml`, {
    maxRedirects: 0,
  })
  // Root-level like llms.txt: the middleware must not 307 it to /gb/feeds/...
  expect(response.status(), "the Google feed answers 200, not a redirect").toBe(200)
  expect(response.headers()["content-type"]).toContain("xml")
  const { error, items } = await parseGoogleFeed(page, await response.text())
  expect(error, "the Google feed is well-formed XML").toBeNull()
  return items as GoogleItem[]
}

test.describe("Product feeds", () => {
  test("the Google feed has every field Merchant Center requires, one item per variant", async ({
    request,
    page,
  }) => {
    const items = await fetchGoogleFeed(request, page)
    expect(items.length, "the feed lists the catalogue").toBeGreaterThan(0)

    const ids = new Set<string>()
    const currencies = new Set<string>()
    for (const item of items) {
      for (const field of GOOGLE_REQUIRED) {
        expect(item[field], `item ${item.id} has ${field}`).toBeTruthy()
      }
      expect(ids.has(item.id), `item id ${item.id} is unique`).toBe(false)
      ids.add(item.id)

      expect(["in_stock", "out_of_stock", "backorder"]).toContain(item.availability)
      expect(item.condition).toBe("new")
      expect(item.price, `${item.id} price`).toMatch(MONEY)
      if (item.sale_price) expect(item.sale_price).toMatch(MONEY)
      currencies.add(item.price.split(" ")[1])

      expect(item.link).toContain(`/${qaEnv.region}/products/`)
      expect(item.link).toMatch(/^https?:\/\//)
      if (item.image_link) expect(item.image_link).toMatch(/^https?:\/\//)
      if (!item.gtin && !item.mpn) expect(item.identifier_exists).toBe("no")
    }

    // One region, one currency: the feed is per country so Google never sees
    // a price in a currency the landing page does not show.
    expect([...currencies], "every price is in one currency").toHaveLength(1)

    // The seeded T-shirt has four sizes in two colours, one item each, linked
    // by item_group_id, and its photos.
    const shirts = items.filter((item) => item.link.includes("/products/t-shirt?v_id="))
    expect(shirts.length, "every T-shirt variant is an item").toBeGreaterThan(1)
    expect(new Set(shirts.map((item) => item.item_group_id)).size).toBe(1)
    for (const shirt of shirts) {
      expect(shirt.image_link, "the T-shirt has its photo").toBeTruthy()
      expect(shirt.color, "the colour option is sent as color").toBeTruthy()
      expect(shirt.size, "the size option is sent as size").toBeTruthy()
    }
  })

  test("a feed item's link opens its variant at the feed's price and currency", async ({
    request,
    page,
  }) => {
    const items = await fetchGoogleFeed(request, page)
    const shirt = items.find(
      (item) =>
        item.link.includes("/products/t-shirt?v_id=") &&
        item.availability === "in_stock"
    )
    expect(shirt, "an in-stock T-shirt variant is in the feed").toBeTruthy()

    const [amount, currency] = (shirt!.sale_price || shirt!.price).split(" ")

    // The link's path on this server, whatever origin the feed was built for.
    const link = new URL(shirt!.link)
    const price = page.getByTestId("product-price").first()

    // Without ?v_id= the page shows "From" the cheapest variant...
    await page.goto(link.pathname)
    await expect(page.getByTestId("product-container")).toBeVisible()
    await expect(price.locator("xpath=..")).toContainText("From")

    // ...and with it, that variant's own price. That is what Merchant Center
    // compares with the feed.
    await page.goto(`${link.pathname}${link.search}`)
    await expect(page.getByTestId("product-container")).toBeVisible()
    await expect(price).toHaveAttribute("data-value", String(Number(amount)))
    await expect(price.locator("xpath=..")).not.toContainText("From")

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent()
    expect(jsonLd, "the product page carries JSON-LD").toContain(
      `"priceCurrency":"${currency}"`
    )
  })

  test("the OpenAI feed has the spec's required columns and legal values", async ({
    request,
    page,
  }) => {
    const response = await request.get(`/feeds/openai/${qaEnv.region}.csv`, {
      maxRedirects: 0,
    })
    expect(response.status(), "the OpenAI feed answers 200, not a redirect").toBe(200)
    expect(response.headers()["content-type"]).toContain("text/csv")

    const [header, ...rows] = parseCsv(await response.text())
    for (const column of OPENAI_REQUIRED) {
      expect(header, `the header has ${column}`).toContain(column)
    }
    const column = (row: string[], name: string) => row[header.indexOf(name)]

    // The same catalogue as the Google feed, row for row.
    const googleItems = await fetchGoogleFeed(request, page)
    expect(rows.length).toBe(googleItems.length)

    for (const row of rows) {
      expect(row.length, "every row has every column").toBe(header.length)
      const id = column(row, "item_id")
      for (const name of OPENAI_REQUIRED) {
        // A product without a photo is sent anyway and OpenAI rejects that
        // row, which tells the owner what to fix. Every other required
        // field is always there.
        if (name === "image_url") continue
        expect(column(row, name), `${id} has ${name}`).toBeTruthy()
      }
      expect(["in_stock", "out_of_stock", "pre_order", "backorder", "unknown"]).toContain(
        column(row, "availability")
      )
      expect(column(row, "price")).toMatch(MONEY)
      expect(column(row, "is_eligible_search")).toBe("true")
      expect(column(row, "is_eligible_checkout")).toBe("false")

      if (column(row, "listing_has_variations") === "true") {
        expect(column(row, "group_id")).toBeTruthy()
        expect(column(row, "group_id")).not.toBe(id)
        expect(() => JSON.parse(column(row, "variant_dict"))).not.toThrow()
      } else {
        expect(column(row, "listing_has_variations")).toBe("false")
      }
    }
  })

  test("a country no region covers is a 404, never an empty feed", async ({ request }) => {
    for (const path of [
      "/feeds/google/zz.xml",
      "/feeds/openai/zz.csv",
      `/feeds/google/${qaEnv.region}.csv`,
    ]) {
      const response = await request.get(path, { maxRedirects: 0 })
      expect(response.status(), path).toBe(404)
    }
  })

  test("product pages stay open to Google's and OpenAI's crawlers", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text()
    // One rule for every agent, and nothing in it covers product pages or feeds.
    expect(robots).not.toMatch(/User-agent:\s*(Googlebot|Storebot-Google|OAI-SearchBot)/i)
    expect(robots).not.toMatch(/Disallow:\s*\/\*?\/?products/i)
    expect(robots).not.toMatch(/Disallow:\s*\/feeds/i)

    const page = await request.get(url("products/t-shirt"))
    expect(page.status()).toBe(200)
    expect(page.headers()["x-robots-tag"] ?? "").not.toMatch(/noindex/i)
  })
})
