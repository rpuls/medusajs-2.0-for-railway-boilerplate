import { test, expect, APIRequestContext } from "@playwright/test"
import { qaEnv, url } from "./helpers"

/**
 * The shopper side of agentic commerce (src/lib/ucp): the UCP profile at
 * /.well-known/ucp, the MCP server at /ucp/mcp that ChatGPT or Claude call as
 * a custom connector, and the continue_url that hands the cart to the shopper
 * to pay. The flow under test is the one a viewer sees: the assistant
 * searches, builds a checkout, and the shopper clicks the link and pays here.
 *
 * Talks only to the storefront, with no sign-in, exactly as an assistant does.
 * It creates guest carts and one guest order.
 */

const TOOLS = [
  "search_catalog",
  "lookup_catalog",
  "get_product",
  "create_cart",
  "get_cart",
  "update_cart",
  "cancel_cart",
  "create_checkout",
  "get_checkout",
  "update_checkout",
  "complete_checkout",
  "cancel_checkout",
]

const ADDRESS = {
  first_name: "Quinn",
  last_name: "Tester",
  street_address: "1 Test Street",
  address_locality: "London",
  postal_code: "SW1A 1AA",
  address_country: qaEnv.region.toUpperCase(),
}

let rpcId = 0
const mcp = async (
  request: APIRequestContext,
  method: string,
  params: Record<string, unknown> = {}
) => {
  const res = await request.post("/ucp/mcp", {
    headers: { Accept: "application/json, text/event-stream" },
    data: { jsonrpc: "2.0", id: ++rpcId, method, params },
    maxRedirects: 0,
  })
  expect(res.status(), `${method} answers 200`).toBe(200)
  return res.json()
}

const callTool = async (
  request: APIRequestContext,
  name: string,
  args: Record<string, unknown> = {}
) => {
  const { result } = await mcp(request, "tools/call", { name, arguments: args })
  // The text content and structuredContent carry the same body; read the text,
  // which is what an older client sees.
  return {
    isError: Boolean(result.isError),
    data: JSON.parse(result.content[0].text),
  }
}

/** A variant of the seeded T-shirt that is in stock in the default region. */
const findTShirt = async (request: APIRequestContext) => {
  const { isError, data } = await callTool(request, "search_catalog", {
    catalog: { query: "t-shirt", context: { address_country: qaEnv.region } },
  })
  expect(isError).toBe(false)
  const product = data.products.find((p: any) => p.handle === "t-shirt")
  expect(product, "the seeded T-shirt is found by search").toBeTruthy()
  const variant = product.variants.find((v: any) => v.availability.available)
  expect(variant, "a T-shirt variant is in stock").toBeTruthy()
  return { product, variant }
}

/** The continue_url names the storefront by its own NEXT_PUBLIC_BASE_URL, which may differ from QA_BASE_URL. */
const pathOf = (link: string) => {
  const { pathname, search } = new URL(link)
  return `${pathname}${search}`
}

test.describe("UCP: shopping from an AI assistant", () => {
  test("the UCP profile is served at the root and points at the MCP server", async ({
    request,
  }) => {
    // Root-level like llms.txt, so it must not be redirected to /gb/.well-known.
    const res = await request.get("/.well-known/ucp", { maxRedirects: 0 })
    expect(res.status()).toBe(200)
    const { ucp } = await res.json()

    const services = ucp.services["dev.ucp.shopping"]
    const mcpService = services.find((s: any) => s.transport === "mcp")
    expect(new URL(mcpService.endpoint).pathname).toBe("/ucp/mcp")
    expect(Object.keys(ucp.capabilities)).toEqual(
      expect.arrayContaining([
        "dev.ucp.shopping.catalog.search",
        "dev.ucp.shopping.checkout",
      ])
    )

    // Every page tells an agent where the profile is.
    const home = await request.get(url())
    expect(home.headers()["link"]).toContain('</.well-known/ucp>; rel="ucp"')
  })

  test("the MCP server initializes and lists its shopping tools", async ({
    request,
  }) => {
    const init = await mcp(request, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "qa", version: "1" },
    })
    expect(init.result.protocolVersion).toBe("2025-06-18")
    expect(init.result.serverInfo.name).toContain(qaEnv.storeName)
    expect(init.result.capabilities.tools).toBeTruthy()

    // A notification has no id and gets an empty 202.
    const notified = await request.post("/ucp/mcp", {
      data: { jsonrpc: "2.0", method: "notifications/initialized" },
      maxRedirects: 0,
    })
    expect(notified.status()).toBe(202)

    const { result } = await mcp(request, "tools/list")
    const tools = new Map<string, any>(
      result.tools.map((tool: any) => [tool.name, tool])
    )
    expect([...tools.keys()].sort()).toEqual([...TOOLS].sort())
    // Read-only, so ChatGPT does not ask the shopper to confirm every search.
    expect(tools.get("search_catalog").annotations.readOnlyHint).toBe(true)
    expect(tools.get("create_checkout").annotations.readOnlyHint).toBe(false)

    // Stateless: no stream to open.
    const get = await request.get("/ucp/mcp", { maxRedirects: 0 })
    expect(get.status()).toBe(405)
  })

  test("a catalogue search finds the seeded T-shirt with prices in minor units", async ({
    request,
  }) => {
    const { product, variant } = await findTShirt(request)

    expect(new URL(product.url).pathname).toBe(url("products/t-shirt"))
    expect(variant.id).toMatch(/^variant_/)
    expect(Number.isInteger(variant.price.amount)).toBe(true)
    expect(variant.price.amount).toBeGreaterThan(0)
    expect(variant.price.currency).toMatch(/^[A-Z]{3}$/)
  })

  test("a checkout session hands the shopper a link that opens the cart", async ({
    page,
    request,
  }) => {
    const { variant } = await findTShirt(request)

    const { isError, data: checkout } = await callTool(request, "create_checkout", {
      checkout: {
        line_items: [{ item: { id: variant.id }, quantity: 2 }],
        buyer: { email: "ucp-handoff@example.com" },
        fulfillment: { methods: [{ type: "shipping", destinations: [ADDRESS] }] },
      },
    })
    expect(isError).toBe(false)
    expect(checkout.status).toBe("requires_escalation")
    expect(checkout.line_items[0].quantity).toBe(2)
    expect(checkout.messages.map((m: any) => m.code)).toContain("payment_required")
    // No delivery chosen yet, so no shipping figure an assistant could read as free.
    expect(checkout.totals.map((t: any) => t.type)).not.toContain("fulfillment")
    expect(checkout.links.map((l: any) => new URL(l.url).pathname)).toEqual(
      expect.arrayContaining([url("terms"), url("privacy")])
    )

    // Email and address are on the cart, so the link skips to delivery.
    await page.goto(pathOf(checkout.continue_url))
    await expect(page).toHaveURL(/\/checkout\?step=delivery/)
    const row = page.getByTestId("items-table").getByTestId("product-row")
    await expect(row).toHaveCount(1)
    await expect(row.getByTestId("product-title")).toContainText(/t-shirt/i)
    await expect(page.getByTestId("shipping-address-summary")).toContainText(
      "1 Test Street"
    )
    // Billing is filled in from the same address, as the address step does,
    // which the summary reports as one address rather than an empty block.
    await expect(page.getByTestId("billing-address-summary")).toContainText(
      /are the same/i
    )
    await expect(page.getByTestId("delivery-options-container")).toBeVisible()

    await page.goto(url("cart"))
    await expect(page.getByTestId("product-row")).toHaveCount(1)
  })

  /**
   * The reason the cart cookie is SameSite=lax. The shopper clicks the link on
   * the assistant's own site, and the browser treats the whole redirect chain
   * as cross-site, so a strict cookie set by the resume route would be held
   * back from the checkout request: a 404 with an empty cart. A page.goto would
   * not show it, because a typed URL counts as same-site.
   */
  test("the link works when clicked on the assistant's site", async ({
    page,
    request,
  }) => {
    const { variant } = await findTShirt(request)
    const { data: cart } = await callTool(request, "create_cart", {
      cart: {
        line_items: [{ item: { id: variant.id }, quantity: 1 }],
        context: { address_country: qaEnv.region },
      },
    })
    expect(cart.continue_url).toBeTruthy()

    const link = new URL(pathOf(cart.continue_url), qaEnv.baseURL).toString()
    await page.route("https://assistant.invalid/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<a id="pay" href="${link}">Pay for your order</a>`,
      })
    )
    await page.goto("https://assistant.invalid/chat")
    await page.locator("#pay").click()

    // No address yet, so it opens on the address step, with the item.
    await expect(page).toHaveURL(/\/checkout\?step=address/)
    await expect(
      page.getByTestId("items-table").getByTestId("product-row")
    ).toHaveCount(1)
  })

  test("the shopper pays on the store and the agent sees the order", async ({
    page,
    request,
  }) => {
    test.skip(
      qaEnv.stripeConfigured,
      "Pays with the manual provider, which is not the first choice once Stripe is configured"
    )

    const { variant } = await findTShirt(request)
    const { data: checkout } = await callTool(request, "create_checkout", {
      checkout: {
        line_items: [{ item: { id: variant.id }, quantity: 1 }],
        buyer: { email: "ucp-order@example.com" },
        fulfillment: { methods: [{ type: "shipping", destinations: [ADDRESS] }] },
      },
    })

    await page.goto(pathOf(checkout.continue_url))
    await page.getByTestId("delivery-option-radio").first().click()
    await page.getByTestId("submit-delivery-option-button").click()
    await page.getByTestId("payment-option-radio").first().click()
    await page.getByTestId("submit-payment-button").click()
    const placeOrder = page.getByTestId("submit-order-button")
    await expect(placeOrder).toBeEnabled()
    await placeOrder.click()
    await expect(page.getByTestId("order-complete-container")).toBeVisible({
      timeout: 60_000,
    })

    const { data: after } = await callTool(request, "get_checkout", {
      id: checkout.id,
    })
    expect(after.status).toBe("completed")
    expect(after.continue_url).toBeUndefined()
    expect(after.order.id).toMatch(/^order_/)
    // The permalink is this storefront's own confirmation route.
    expect(new URL(after.order.permalink_url).pathname).toBe(
      url(`order/confirmed/${after.order.id}`)
    )
    expect(new URL(page.url()).pathname).toBe(
      new URL(after.order.permalink_url).pathname
    )

    // A paid checkout cannot be canceled.
    const { isError, data: refused } = await callTool(request, "cancel_checkout", {
      id: checkout.id,
    })
    expect(isError).toBe(true)
    expect(refused.messages[0].code).toBe("already_completed")
  })

  test("a canceled checkout's link has expired", async ({ request }) => {
    const { variant } = await findTShirt(request)
    const { data: checkout } = await callTool(request, "create_checkout", {
      checkout: { line_items: [{ item: { id: variant.id }, quantity: 1 }] },
    })
    expect(checkout.status).toBe("incomplete")

    const { data: canceled } = await callTool(request, "cancel_checkout", {
      id: checkout.id,
    })
    expect(canceled.status).toBe("canceled")
    expect(canceled.continue_url).toBeUndefined()

    const resume = await request.get(pathOf(checkout.continue_url), {
      maxRedirects: 0,
    })
    expect(resume.status()).toBe(410)
  })

  test("unknown items and unserved countries come back as tool errors", async ({
    request,
  }) => {
    const unknown = await callTool(request, "create_cart", {
      cart: { line_items: [{ item: { id: "variant_qa_missing" }, quantity: 1 }] },
    })
    expect(unknown.isError).toBe(true)
    expect(unknown.data.messages[0].code).toBe("item_unavailable")

    // Antarctica: no store deployed from this template sells there.
    const elsewhere = await callTool(request, "search_catalog", {
      catalog: { query: "shirt", context: { address_country: "AQ" } },
    })
    expect(elsewhere.isError).toBe(true)
    expect(elsewhere.data.messages[0].code).toBe("unsupported_country")
  })

  test("a /buy permalink opens the checkout with the item", async ({
    page,
    request,
  }) => {
    const { variant } = await findTShirt(request)
    await page.goto(`/buy/${variant.id}:1`)
    await expect(page).toHaveURL(/\/checkout\?step=address/)
    await expect(
      page.getByTestId("items-table").getByTestId("product-row")
    ).toHaveCount(1)

    const unknown = await request.get("/buy/variant_qa_missing:1", {
      maxRedirects: 0,
    })
    expect(unknown.status()).toBe(404)
  })

  test("a product page carries JSON-LD and a Markdown version", async ({
    request,
  }) => {
    const { variant } = await findTShirt(request)

    const html = await (await request.get(url("products/t-shirt"))).text()
    const jsonLd = html.match(
      /<script type="application\/ld\+json">(.*?)<\/script>/
    )
    expect(jsonLd, "the product page has JSON-LD").toBeTruthy()
    const data = JSON.parse(jsonLd![1])
    expect(["Product", "ProductGroup"]).toContain(data["@type"])
    expect(JSON.stringify(data)).toContain("https://schema.org/InStock")

    const md = await request.get(url("products/t-shirt.md"))
    expect(md.status()).toBe(200)
    expect(md.headers()["content-type"]).toContain("text/markdown")
    expect(await md.text()).toContain(variant.id)

    // The same URL, asked for Markdown.
    const negotiated = await request.get(url("products/t-shirt"), {
      headers: { Accept: "text/markdown" },
    })
    expect(negotiated.headers()["content-type"]).toContain("text/markdown")
  })

  test("the policy pages the checkout links to exist and are in the footer", async ({
    page,
  }) => {
    await page.goto(url())
    const links = page.getByTestId("footer-policies").getByRole("link")
    await expect(links).toHaveCount(4)

    for (const path of ["shipping", "returns", "terms", "privacy"]) {
      const res = await page.goto(url(path))
      expect(res?.status(), `/${path}`).toBe(200)
      // Placeholder text, and it says so.
      await expect(page.getByTestId("policy-example-label")).toBeVisible()
    }
  })
})
