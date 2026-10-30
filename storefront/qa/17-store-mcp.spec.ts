import { test, expect, APIRequestContext, Page } from "@playwright/test"
import { createHash, randomBytes } from "crypto"
import { qaEnv } from "./helpers"

/**
 * The store MCP server (backend/src/store-mcp): the OAuth flow an AI app goes
 * through to connect, what its tools may and may not do, and that revoking
 * access cuts it off. Runs against any backend, local or deployed.
 *
 * It creates one draft product and deletes it again at the end. Nothing
 * published is ever changed: the "refused" checks only try to.
 */

const backend = qaEnv.backendURL.replace(/\/+$/, "")
// A loopback redirect URI, like a desktop app's. Nothing listens there: the
// browser's navigation to it is intercepted and the code read off the URL.
const REDIRECT_URI = "http://127.0.0.1:43117/callback"

const pkce = () => {
  const verifier = randomBytes(32).toString("base64url")
  const challenge = createHash("sha256").update(verifier).digest("base64url")
  return { verifier, challenge }
}

const registerClient = async (request: APIRequestContext, name: string) => {
  const res = await request.post(`${backend}/oauth/register`, {
    data: {
      client_name: name,
      redirect_uris: [REDIRECT_URI],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
    },
  })
  expect(res.status()).toBe(201)
  return (await res.json()).client_id as string
}

const authorizeURL = (clientId: string, challenge: string, state: string) =>
  `${backend}/oauth/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: "S256",
    state,
    resource: `${backend}/mcp`,
  })}`

/**
 * Fills in the consent form and returns the URL the browser was sent back to, or null when it
 * stayed on the consent page (a wrong password re-renders it with an error).
 */
const consent = async (page: Page, url: string, { password = qaEnv.adminPassword, decision = "Allow" } = {}) => {
  await page.route(`${REDIRECT_URI}**`, (route) => route.fulfill({ status: 200, body: "done" }))
  await page.goto(url)
  if (decision === "Allow") {
    await page.locator('input[name="email"]').fill(qaEnv.adminEmail)
    await page.locator('input[name="password"]').fill(password)
  }
  const redirect = page
    .waitForRequest((request) => request.url().startsWith(REDIRECT_URI), { timeout: 15_000 })
    .then((request) => request.url())
    .catch(() => null)
  await page.getByRole("button", { name: decision, exact: true }).click()
  const redirectedTo = await Promise.race([
    redirect,
    page.getByRole("alert").waitFor({ timeout: 15_000 }).then(() => null).catch(() => null),
  ])
  await page.unroute(`${REDIRECT_URI}**`)
  return redirectedTo
}

const exchangeCode = (request: APIRequestContext, clientId: string, code: string, verifier: string) =>
  request.post(`${backend}/oauth/token`, {
    form: { grant_type: "authorization_code", client_id: clientId, code, code_verifier: verifier, redirect_uri: REDIRECT_URI },
  })

let rpcId = 0
const mcp = async (request: APIRequestContext, token: string, method: string, params: Record<string, unknown> = {}) => {
  const res = await request.post(`${backend}/mcp`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json, text/event-stream" },
    data: { jsonrpc: "2.0", id: ++rpcId, method, params },
  })
  return { status: res.status(), headers: res.headers(), body: res.status() === 200 ? await res.json() : await res.text() }
}

const callTool = async (request: APIRequestContext, token: string, name: string, args: Record<string, unknown> = {}) => {
  const { status, body } = await mcp(request, token, "tools/call", { name, arguments: args })
  expect(status).toBe(200)
  const result = (body as any).result
  const text = result.content?.[0]?.text ?? ""
  let data: any = null
  try {
    data = JSON.parse(text)
  } catch {
    data = null
  }
  return { isError: Boolean(result.isError), text, data }
}

const adminToken = async (request: APIRequestContext) => {
  const res = await request.post(`${backend}/auth/user/emailpass`, {
    data: { email: qaEnv.adminEmail, password: qaEnv.adminPassword },
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()).token as string
}

const signInToAdmin = async (page: Page) => {
  await page.goto(`${qaEnv.adminURL}/login`)
  await page.locator('input[name="email"]').fill(qaEnv.adminEmail)
  await page.locator('input[name="password"]').fill(qaEnv.adminPassword)
  await page.getByRole("button", { name: /continue with email/i }).click()
  await expect(page).toHaveURL(/\/app(\/|$)(?!login)/, { timeout: 60_000 })
}

// The store setup test sells to Iceland, a country the seed leaves out, under names that
// mark everything it creates as QA data.
const QA_COUNTRY = "is"
const QA_REGION = "QA Iceland"
const QA_ZONE = "QA Iceland zone"
const QA_SHIPPING = "QA Iceland post"
const QA_PROFILE = "QA Bulky"
const QA_FREIGHT = "QA Bulky freight"
const QA_WAREHOUSE = "QA Warehouse"

/** Removes what the store setup tests apply, so the next run starts from the seed's setup */
const removeQaSetup = async (request: APIRequestContext, token: string) => {
  const headers = { Authorization: `Bearer ${token}` }
  const { shipping_options } = await (
    await request.get(`${backend}/admin/shipping-options?limit=500&fields=id,name`, { headers })
  ).json()
  for (const option of shipping_options.filter((o: any) => o.name === QA_FREIGHT)) {
    await request.delete(`${backend}/admin/shipping-options/${option.id}`, { headers })
  }
  const { shipping_profiles } = await (await request.get(`${backend}/admin/shipping-profiles?limit=200`, { headers })).json()
  for (const profile of shipping_profiles.filter((p: any) => p.name === QA_PROFILE)) {
    await request.delete(`${backend}/admin/shipping-profiles/${profile.id}`, { headers })
  }
  const { regions } = await (await request.get(`${backend}/admin/regions?limit=200`, { headers })).json()
  for (const region of regions.filter((r: any) => r.name === QA_REGION)) {
    await request.delete(`${backend}/admin/regions/${region.id}`, { headers })
  }
  const { tax_regions } = await (await request.get(`${backend}/admin/tax-regions?limit=500`, { headers })).json()
  for (const tax of tax_regions.filter((t: any) => t.country_code === QA_COUNTRY && !t.province_code)) {
    await request.delete(`${backend}/admin/tax-regions/${tax.id}`, { headers })
  }
  const { stock_locations } = await (
    await request.get(`${backend}/admin/stock-locations?limit=50&fields=id,name,*fulfillment_sets,*fulfillment_sets.service_zones`, { headers })
  ).json()
  for (const set of stock_locations.flatMap((l: any) => l.fulfillment_sets ?? [])) {
    for (const zone of (set.service_zones ?? []).filter((z: any) => z.name === QA_ZONE)) {
      await request.delete(`${backend}/admin/fulfillment-sets/${set.id}/service-zones/${zone.id}`, { headers })
    }
  }
  for (const location of stock_locations.filter((l: any) => l.name === QA_WAREHOUSE)) {
    for (const set of location.fulfillment_sets ?? []) {
      await request.delete(`${backend}/admin/fulfillment-sets/${set.id}`, { headers })
    }
    await request.delete(`${backend}/admin/stock-locations/${location.id}`, { headers })
  }
}

test.describe.serial("Store MCP server", () => {
  let clientId: string
  let accessToken: string
  let refreshToken: string
  let draftId: string | undefined
  let admin: string

  test.afterAll(async ({ request }) => {
    const token = admin ?? (await adminToken(request))
    // The draft first: a shipping profile that still holds a product cannot be deleted
    if (draftId) {
      await request.delete(`${backend}/admin/products/${draftId}`, { headers: { Authorization: `Bearer ${token}` } })
    }
    await removeQaSetup(request, token)
  })

  test("advertises itself to MCP clients through OAuth discovery", async ({ request }) => {
    const anonymous = await request.post(`${backend}/mcp`, { data: { jsonrpc: "2.0", id: 1, method: "tools/list" } })
    expect(anonymous.status()).toBe(401)
    expect(anonymous.headers()["www-authenticate"]).toContain(
      `resource_metadata="${backend}/.well-known/oauth-protected-resource/mcp"`
    )

    const resource = await (await request.get(`${backend}/.well-known/oauth-protected-resource/mcp`)).json()
    expect(resource.resource).toBe(`${backend}/mcp`)
    expect(resource.authorization_servers).toEqual([backend])

    const server = await (await request.get(`${backend}/.well-known/oauth-authorization-server`)).json()
    expect(server.issuer).toBe(backend)
    expect(server.code_challenge_methods_supported).toEqual(["S256"])
    expect(server.registration_endpoint).toBe(`${backend}/oauth/register`)
  })

  test("registration refuses redirect URIs that are neither https nor loopback", async ({ request }) => {
    const res = await request.post(`${backend}/oauth/register`, {
      data: { client_name: "Bad", redirect_uris: ["http://evil.example.com/cb"], token_endpoint_auth_method: "none" },
    })
    expect(res.status()).toBe(400)
    expect((await res.json()).error).toBe("invalid_redirect_uri")
  })

  test("the consent page explains the limits and rejects a wrong password", async ({ page, request }) => {
    clientId = await registerClient(request, "QA Assistant")
    const { challenge } = pkce()
    const url = authorizeURL(clientId, challenge, "wrong-password")

    await page.goto(url)
    await expect(page.getByRole("heading", { level: 1 })).toContainText("QA Assistant")
    await expect(page.locator("body")).toContainText(/Publish, unpublish or delete anything/)
    await expect(page.locator("body")).toContainText(/Create new products as drafts/)

    const redirected = await consent(page, url, { password: "definitely-wrong" })
    expect(redirected).toBeNull()
    await expect(page.getByRole("alert")).toContainText(/do not match an admin account/)
  })

  test("Deny sends the app back with access_denied", async ({ page }) => {
    const { challenge } = pkce()
    const redirected = await consent(page, authorizeURL(clientId, challenge, "deny-state"), { decision: "Deny" })
    expect(redirected).not.toBeNull()
    const params = new URL(redirected!).searchParams
    expect(params.get("error")).toBe("access_denied")
    expect(params.get("state")).toBe("deny-state")
    expect(params.get("code")).toBeNull()
  })

  test("an admin who allows the app gets it a token, and only with the right PKCE verifier", async ({ page, request }) => {
    const { verifier, challenge } = pkce()
    const redirected = await consent(page, authorizeURL(clientId, challenge, "allow-state"))
    expect(redirected).not.toBeNull()
    const params = new URL(redirected!).searchParams
    expect(params.get("state")).toBe("allow-state")
    expect(params.get("iss")).toBe(backend)
    const code = params.get("code")!
    expect(code).toBeTruthy()

    const wrong = await exchangeCode(request, clientId, code, pkce().verifier)
    expect(wrong.status()).toBe(400)
    expect((await wrong.json()).error).toBe("invalid_grant")

    const res = await exchangeCode(request, clientId, code, verifier)
    expect(res.status()).toBe(200)
    const tokens = await res.json()
    expect(tokens.token_type).toBe("Bearer")
    accessToken = tokens.access_token
    refreshToken = tokens.refresh_token
  })

  test("the admin's AI assistants page shows the server URL and the connected app", async ({ page }) => {
    await signInToAdmin(page)
    await page.goto(`${qaEnv.adminURL}/ai-assistants`)
    await expect(page.getByTestId("store-mcp-url")).toHaveText(`${backend}/mcp`, { timeout: 60_000 })
    await expect(page.getByRole("cell", { name: /QA Assistant/ }).first()).toBeVisible()
  })

  test("lists read tools and draft tools, and nothing that publishes, deletes or refunds", async ({ request }) => {
    const init = await mcp(request, accessToken, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "qa", version: "1" },
    })
    expect(init.status).toBe(200)
    expect((init.body as any).result.serverInfo.name).toBe("store-mcp")

    const { body } = await mcp(request, accessToken, "tools/list")
    const names: string[] = (body as any).result.tools.map((tool: any) => tool.name)
    expect(names).toEqual(
      expect.arrayContaining([
        "get_store_overview",
        "search_products",
        "get_product",
        "list_orders",
        "get_sales_summary",
        "create_product_draft",
        "suggest_product_changes",
        "get_store_setup",
        "propose_store_setup",
        "propose_stock_changes",
      ])
    )
    expect(names.filter((name) => /publish|delete|refund|cancel|export|stock_update|setting/.test(name))).toEqual([])

    const prompts = await mcp(request, accessToken, "prompts/list")
    expect((prompts.body as any).result.prompts.map((p: any) => p.name)).toEqual(
      expect.arrayContaining(["store_report", "restock_check", "improve_product", "draft_product", "sell_to_country", "ship_separately"])
    )
  })

  test("reads the store, its products and its orders", async ({ request }) => {
    const overview = await callTool(request, accessToken, "get_store_overview")
    expect(overview.isError).toBe(false)
    expect(overview.data.acting_as).toBe(qaEnv.adminEmail)
    expect(overview.data.products_by_status.published).toBeGreaterThan(0)

    const products = await callTool(request, accessToken, "search_products", { status: "published", limit: 5 })
    expect(products.data.products.length).toBeGreaterThan(0)

    const product = await callTool(request, accessToken, "get_product", { id: products.data.products[0].id })
    expect(product.data.variants.length).toBeGreaterThan(0)
    expect(product.data.editable_by_you).toMatch(/no/)

    const orders = await callTool(request, accessToken, "list_orders", { limit: 3 })
    expect(orders.isError).toBe(false)
    for (const order of orders.data.orders) {
      // Customer data stops at name, email and country
      expect(Object.keys(order.customer).sort()).toEqual(["email", "name"])
      expect(order).not.toHaveProperty("shipping_address")
    }
    // The totals add up: items, shipping, tax, minus discount (Medusa's own subtotal counts shipping)
    const paid = orders.data.orders.find((o: any) => o.total > 0)
    if (paid) {
      const { totals } = (await callTool(request, accessToken, "get_order", { id: paid.id })).data
      expect(totals.items + totals.shipping + totals.tax - totals.discount).toBeCloseTo(totals.total, 2)
    }

    const sales = await callTool(request, accessToken, "get_sales_summary")
    expect(sales.isError).toBe(false)
  })

  test("refuses more than 50 rows, deep paging and batches, so no tool works as an export", async ({ request }) => {
    const tooMany = await mcp(request, accessToken, "tools/call", { name: "search_customers", arguments: { limit: 500 } })
    expect(JSON.stringify((tooMany.body as any).result ?? (tooMany.body as any).error)).toMatch(/50|too_big|Too big|less than or equal/i)

    const tooDeep = await mcp(request, accessToken, "tools/call", { name: "search_customers", arguments: { offset: 5000 } })
    expect(JSON.stringify((tooDeep.body as any).result ?? (tooDeep.body as any).error)).toMatch(/200|too_big|Too big|less than or equal/i)

    const batch = await request.post(`${backend}/mcp`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json, text/event-stream" },
      data: Array.from({ length: 5 }, (_, i) => ({ jsonrpc: "2.0", id: 1000 + i, method: "tools/list" })),
    })
    expect(batch.status()).toBe(400)
  })

  test("a malformed sign-in link shows an error instead of redirecting anywhere", async ({ request }) => {
    const res = await request.get(`${backend}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`, {
      maxRedirects: 0,
    })
    expect(res.status()).toBe(400)
    expect(res.headers()["location"]).toBeUndefined()
  })

  test("drafts a product, edits the draft, and is refused on a published one", async ({ request }) => {
    const overview = await callTool(request, accessToken, "get_store_overview")
    const currency = overview.data.currencies.find((c: any) => c.default)?.code ?? overview.data.currencies[0].code

    const created = await callTool(request, accessToken, "create_product_draft", {
      title: "QA MCP Draft Mug",
      description: "Created by the store MCP QA spec.",
      options: [{ title: "Size", values: ["Small", "Large"] }],
      variants: [
        { title: "Small", options: { Size: "Small" }, prices: [{ currency_code: currency, amount: 12 }] },
        { title: "Large", options: { Size: "Large" }, prices: [{ currency_code: currency, amount: 15 }], stock: 20 },
      ],
    })
    expect(created.isError, created.text).toBe(false)
    expect(created.data.status).toBe("draft")
    // Stocked at the default warehouse in the same call, so it can be bought once published
    expect(created.data.stock.set).toEqual([{ variant: "QA MCP Draft Mug / Large", units: 20 }])
    expect(created.data.stock.note).toBeNull()
    draftId = created.data.id

    const small = created.data.variants.find((v: any) => v.title === "Small")
    const edited = await callTool(request, accessToken, "update_product_draft", {
      id: draftId,
      subtitle: "Edited while a draft",
      variant_prices: [{ variant_id: small.id, prices: [{ currency_code: currency, amount: 13 }] }],
    })
    expect(edited.isError, edited.text).toBe(false)

    const draft = await callTool(request, accessToken, "get_product", { id: draftId })
    expect(draft.data.subtitle).toBe("Edited while a draft")
    expect(draft.data.variants).toHaveLength(2)
    expect(draft.data.variants.find((v: any) => v.title === "Small").prices[0].amount).toBe(13)

    // Images must already be in the store's storage, so a thumbnail cannot carry data elsewhere
    const outside = await mcp(request, accessToken, "tools/call", {
      name: "update_product_draft",
      arguments: { id: draftId, thumbnail: "https://example.com/pixel.png?d=leak" },
    })
    expect(JSON.stringify((outside.body as any).result ?? (outside.body as any).error)).toMatch(/already be uploaded to the store/)

    const published = await callTool(request, accessToken, "search_products", { status: "published", limit: 1 })
    const refused = await callTool(request, accessToken, "update_product_draft", {
      id: published.data.products[0].id,
      title: "Should never be saved",
    })
    expect(refused.isError).toBe(true)
    expect(refused.text).toMatch(/not a draft/)
  })

  test("the product page says which assistant drafted it, with Publish at hand", async ({ page }) => {
    await signInToAdmin(page)
    await page.goto(`${qaEnv.adminURL}/products/${draftId}`)
    const banner = page.getByTestId("ai-draft")
    await expect(banner).toContainText("Drafted by")
    await expect(banner.getByRole("button", { name: "Publish" })).toBeVisible()
    // Publishing stays the admin's click; cancel here, later tests need the draft
    await banner.getByRole("button", { name: "Publish" }).click()
    await expect(page.getByRole("alertdialog")).toContainText("Shoppers can see and buy it right away.")
    await page.getByRole("alertdialog").getByRole("button", { name: "Cancel" }).click()
    await expect(banner).toBeVisible()
  })

  test("a suggestion waits for an admin, who applies it", async ({ request }) => {
    admin = await adminToken(request)
    const suggested = await callTool(request, accessToken, "suggest_product_changes", {
      product_id: draftId,
      changes: { title: "QA MCP Draft Mug, renamed" },
      note: "Clearer title",
    })
    expect(suggested.isError, suggested.text).toBe(false)

    const list = await request.get(`${backend}/admin/store-mcp/suggestions?product_id=${draftId}`, {
      headers: { Authorization: `Bearer ${admin}` },
    })
    const { suggestions } = await list.json()
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].app_name).toBe("QA Assistant")

    const applied = await request.post(`${backend}/admin/store-mcp/suggestions/${suggestions[0].id}`, {
      headers: { Authorization: `Bearer ${admin}` },
      data: { action: "apply" },
    })
    expect(applied.ok()).toBeTruthy()
    const product = await callTool(request, accessToken, "get_product", { id: draftId })
    expect(product.data.title).toBe("QA MCP Draft Mug, renamed")
  })

  test("store setup is only proposed, and changes the store when an admin applies it", async ({ page, request }) => {
    admin = await adminToken(request)
    const headers = { Authorization: `Bearer ${admin}` }
    await removeQaSetup(request, admin)

    const setup = await callTool(request, accessToken, "get_store_setup")
    expect(setup.isError, setup.text).toBe(false)
    expect(setup.data.regions.length).toBeGreaterThan(0)
    const fulfillmentSetId = setup.data.ships_from[0].fulfillment_set_id

    // Checked against the store before anything is saved
    const taken = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: a country that is already sold to",
      new_regions: [{ name: "QA Taken", currency_code: "eur", countries: [qaEnv.region] }],
    })
    expect(taken.isError).toBe(true)
    expect(taken.text).toMatch(/already in region/)
    const foreign = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: a currency the store does not sell in",
      new_regions: [{ name: "QA Yen", currency_code: "jpy", countries: ["jp"] }],
    })
    expect(foreign.isError).toBe(true)
    expect(foreign.text).toMatch(/does not sell in JPY/)

    const proposed = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: start selling to Iceland",
      new_regions: [{ name: QA_REGION, currency_code: "eur", countries: [QA_COUNTRY] }],
      tax_rates: [{ country_code: QA_COUNTRY, rate: 24, name: "VAT" }],
      new_shipping_zones: [
        {
          name: QA_ZONE,
          countries: [QA_COUNTRY],
          fulfillment_set_id: fulfillmentSetId,
          shipping_options: [{ name: QA_SHIPPING, prices: [{ currency_code: "eur", amount: 15 }] }],
        },
      ],
    })
    expect(proposed.isError, proposed.text).toBe(false)
    expect(proposed.data.status).toBe("pending")
    expect(proposed.data.will_do).toHaveLength(3)
    // Priced, taxed and shippable, so there is nothing to warn about
    expect(proposed.data.warnings).toEqual([])

    // Nothing has changed yet
    const before = await (await request.get(`${backend}/admin/regions?limit=200`, { headers })).json()
    expect(before.regions.map((r: any) => r.name)).not.toContain(QA_REGION)

    await signInToAdmin(page)
    await page.goto(`${qaEnv.adminURL}/ai-assistants`)
    const card = page.getByTestId("setup-proposal").filter({ hasText: "QA: start selling to Iceland" })
    await expect(card).toContainText(`Create region "${QA_REGION}" for Iceland, in EUR`, { timeout: 60_000 })
    await expect(card).toContainText("Set the tax rate for Iceland to 24% (VAT)")
    await expect(card).toContainText(`${QA_SHIPPING} (€15.00)`)
    await card.getByRole("button", { name: "Apply" }).click()
    await page.getByRole("alertdialog").getByRole("button", { name: "Apply" }).click()
    await expect(page.getByText("Changes applied")).toBeVisible()

    const { regions } = await (await request.get(`${backend}/admin/regions?limit=200&fields=id,name,currency_code,*countries`, { headers })).json()
    const region = regions.find((r: any) => r.name === QA_REGION)
    expect(region?.currency_code).toBe("eur")
    expect(region.countries.map((c: any) => c.iso_2)).toEqual([QA_COUNTRY])

    const { tax_regions } = await (await request.get(`${backend}/admin/tax-regions?limit=500&fields=id,country_code,province_code,*tax_rates`, { headers })).json()
    const tax = tax_regions.find((t: any) => t.country_code === QA_COUNTRY && !t.province_code)
    expect(tax.tax_rates.find((r: any) => r.is_default)?.rate).toBe(24)

    const { shipping_options } = await (await request.get(`${backend}/admin/shipping-options?limit=200&fields=id,name,*prices`, { headers })).json()
    const shipping = shipping_options.find((o: any) => o.name === QA_SHIPPING)
    expect(shipping.prices.find((p: any) => p.currency_code === "eur")?.amount).toBe(15)

    const after = await callTool(request, accessToken, "get_store_setup")
    const mine = after.data.your_proposals.find((p: any) => p.summary === "QA: start selling to Iceland")
    expect(mine.status).toBe("applied")
    const again = await request.post(`${backend}/admin/store-mcp/setup-proposals/${mine.id}`, { headers, data: { action: "apply" } })
    expect(again.ok()).toBe(false)
  })

  test("a shipping profile comes with its options and its products, in one proposal", async ({ request }) => {
    const headers = { Authorization: `Bearer ${admin}` }
    const setup = await callTool(request, accessToken, "get_store_setup")
    const zone = setup.data.ships_from
      .flatMap((set: any) => set.zones)
      .find((z: any) => z.countries.includes(qaEnv.region))
    expect(zone, "a shipping zone must cover the default region").toBeTruthy()

    const unknown = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: an option for a profile nobody creates",
      new_shipping_options: [
        { service_zone_id: zone.id, name: QA_FREIGHT, shipping_profile_name: "No such profile", prices: [{ currency_code: "eur", amount: 49 }] },
      ],
    })
    expect(unknown.isError).toBe(true)
    expect(unknown.text).toMatch(/no shipping profile called "No such profile"/)

    const proposed = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: bulky items ship by freight",
      new_shipping_profiles: [{ name: QA_PROFILE }],
      new_shipping_options: [
        {
          service_zone_id: zone.id,
          name: QA_FREIGHT,
          shipping_profile_name: QA_PROFILE,
          prices: [
            { currency_code: "eur", amount: 49 },
            { currency_code: "usd", amount: 49 },
          ],
        },
      ],
      assign_products_to_profiles: [{ shipping_profile_name: QA_PROFILE, product_ids: [draftId] }],
    })
    expect(proposed.isError, proposed.text).toBe(false)
    const steps: string[] = proposed.data.will_do
    expect(steps).toHaveLength(3)
    expect(steps[0]).toBe(`Create shipping profile "${QA_PROFILE}".`)
    expect(steps[1]).toContain(`for shipping profile "${QA_PROFILE}"`)
    expect(steps[2]).toMatch(new RegExp(`^Move ".+" to shipping profile "${QA_PROFILE}"\\.$`))
    expect(proposed.data.warnings.join(" ")).not.toMatch(/has no shipping options/)

    const { proposals } = await (await request.get(`${backend}/admin/store-mcp/setup-proposals`, { headers })).json()
    const pending = proposals.find((p: any) => p.summary === "QA: bulky items ship by freight")
    const applied = await request.post(`${backend}/admin/store-mcp/setup-proposals/${pending.id}`, { headers, data: { action: "apply" } })
    expect(applied.ok()).toBeTruthy()
    expect((await applied.json()).proposal.status).toBe("applied")

    const { product } = await (await request.get(`${backend}/admin/products/${draftId}?fields=id,*shipping_profile`, { headers })).json()
    expect(product.shipping_profile?.name).toBe(QA_PROFILE)
    const { shipping_options } = await (
      await request.get(`${backend}/admin/shipping-options?limit=500&fields=id,name,shipping_profile_id`, { headers })
    ).json()
    expect(shipping_options.find((o: any) => o.name === QA_FREIGHT)?.shipping_profile_id).toBe(product.shipping_profile.id)
  })

  test("a draft gets its stock directly; a published product's stock waits for an admin", async ({ request }) => {
    const headers = { Authorization: `Bearer ${admin}` }
    const apply = async (summary: string) => {
      const { proposals } = await (await request.get(`${backend}/admin/store-mcp/setup-proposals`, { headers })).json()
      const proposal = proposals.find((p: any) => p.summary === summary)
      const res = await request.post(`${backend}/admin/store-mcp/setup-proposals/${proposal.id}`, { headers, data: { action: "apply" } })
      expect(res.ok(), await res.text()).toBeTruthy()
      expect((await res.json()).proposal.status).toBe("applied")
    }
    const stockOf = async (productId: string, variantId: string) =>
      (await callTool(request, accessToken, "get_product", { id: productId })).data.variants.find((v: any) => v.id === variantId)

    // A draft: set at once, at the default warehouse, with no stock level there beforehand
    const draft = await callTool(request, accessToken, "get_product", { id: draftId })
    const draftVariant = draft.data.variants.find((v: any) => v.title === "Small").id
    const stocked = await callTool(request, accessToken, "update_product_draft", {
      id: draftId,
      variant_stock: [{ variant_id: draftVariant, units: 12 }],
    })
    expect(stocked.isError, stocked.text).toBe(false)
    const afterDraft = await stockOf(draftId!, draftVariant)
    expect(afterDraft.stock).toBe(12)
    expect(afterDraft.stock_by_location).toHaveLength(1)

    // A published product: refused directly, and a delivery is proposed with add
    const shirt = await callTool(request, accessToken, "get_product", { handle: "t-shirt" })
    const shirtVariant = shirt.data.variants[0]
    const refused = await callTool(request, accessToken, "update_product_draft", {
      id: shirt.data.id,
      variant_stock: [{ variant_id: shirtVariant.id, units: 1 }],
    })
    expect(refused.isError).toBe(true)
    const ambiguous = await callTool(request, accessToken, "propose_stock_changes", {
      summary: "QA: both set_to and add",
      stock_levels: [{ variant_id: shirtVariant.id, set_to: 5, add: 5 }],
    })
    expect(ambiguous.isError).toBe(true)
    expect(ambiguous.text).toMatch(/either set_to or add/)

    const delivery = await callTool(request, accessToken, "propose_stock_changes", {
      summary: "QA: a delivery of 5",
      stock_levels: [{ variant_id: shirtVariant.id, add: 5 }],
    })
    expect(delivery.isError, delivery.text).toBe(false)
    expect(delivery.data.will_do[0]).toMatch(/^Add 5 of "Medusa T-Shirt \/ .+" at .+: from \d+ to \d+\.$/)
    expect((await stockOf(shirt.data.id, shirtVariant.id)).stock).toBe(shirtVariant.stock)
    await apply("QA: a delivery of 5")
    expect((await stockOf(shirt.data.id, shirtVariant.id)).stock).toBe(shirtVariant.stock + 5)

    // And back, so repeated runs do not pile stock up
    await callTool(request, accessToken, "propose_stock_changes", {
      summary: "QA: return the 5",
      stock_levels: [{ variant_id: shirtVariant.id, add: -5 }],
    })
    await apply("QA: return the 5")
    expect((await stockOf(shirt.data.id, shirtVariant.id)).stock).toBe(shirtVariant.stock)
  })

  test("a new warehouse comes with its shipping and its stock, in one proposal", async ({ request }) => {
    const headers = { Authorization: `Bearer ${admin}` }
    const pendingSummaries = async () =>
      ((await (await request.get(`${backend}/admin/store-mcp/setup-proposals`, { headers })).json()).proposals as any[]).map((p) => p.summary)
    const draft = await callTool(request, accessToken, "get_product", { id: draftId })
    const [small, large] = ["Small", "Large"].map((title) => draft.data.variants.find((v: any) => v.title === title).id)
    const warehouse = { name: QA_WAREHOUSE, country_code: "dk", city: "Aarhus" }
    const zone = {
      name: `${QA_WAREHOUSE} zone`,
      countries: [qaEnv.region],
      ships_from_location_name: QA_WAREHOUSE,
      shipping_options: [{ name: `${QA_WAREHOUSE} post`, prices: [{ currency_code: "eur", amount: 7 }, { currency_code: "usd", amount: 7 }] }],
    }

    // Asked to add the stock afterwards, the assistant replaces its pending proposal instead of adding a second one
    const first = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: a second warehouse, no stock yet",
      new_stock_locations: [warehouse],
      new_shipping_zones: [zone],
    })
    expect(first.isError, first.text).toBe(false)
    const proposed = await callTool(request, accessToken, "propose_store_setup", {
      summary: "QA: a second warehouse",
      replaces_proposal_id: first.data.proposal_id,
      new_stock_locations: [warehouse],
      new_shipping_zones: [zone],
      stock_levels: [small, large].map((variant_id) => ({ variant_id, set_to: 3, stock_location_name: QA_WAREHOUSE })),
    })
    expect(proposed.isError, proposed.text).toBe(false)
    expect(proposed.data.replaced).toBe(first.data.proposal_id)
    // Every variant of the product with the same new quantity is one line, not one per variant
    expect(proposed.data.will_do).toEqual([
      `Create warehouse "${QA_WAREHOUSE}" in Aarhus, Denmark, selling through the default sales channel.`,
      expect.stringContaining(`shipping from ${QA_WAREHOUSE}`),
      // The suggestion test above renamed the product
      expect.stringMatching(new RegExp(`^Stock 3 of each of the 2 variants of "QA MCP Draft Mug.*" at ${QA_WAREHOUSE}, which had none there\\.$`)),
    ])
    expect(proposed.data.warnings.join(" ")).not.toMatch(/Nothing ships from/)
    const summaries = await pendingSummaries()
    expect(summaries).toContain("QA: a second warehouse")
    expect(summaries).not.toContain("QA: a second warehouse, no stock yet")

    const { proposals } = await (await request.get(`${backend}/admin/store-mcp/setup-proposals`, { headers })).json()
    const pending = proposals.find((p: any) => p.summary === "QA: a second warehouse")
    const applied = await request.post(`${backend}/admin/store-mcp/setup-proposals/${pending.id}`, { headers, data: { action: "apply" } })
    expect(applied.ok(), await applied.text()).toBeTruthy()
    expect((await applied.json()).proposal.status, "every step applied").toBe("applied")

    // An applied proposal cannot be replaced any more
    const late = await callTool(request, accessToken, "propose_stock_changes", {
      summary: "QA: too late to replace",
      replaces_proposal_id: pending.id,
      stock_levels: [{ variant_id: small, set_to: 1, stock_location_name: QA_WAREHOUSE }],
    })
    expect(late.isError).toBe(true)
    expect(late.text).toMatch(/is applied/)

    const setup = await callTool(request, accessToken, "get_store_setup")
    const created = setup.data.stock_locations.find((l: any) => l.name === QA_WAREHOUSE)
    expect(created).toMatchObject({ city: "Aarhus", country: "dk", sells_through_default_channel: true, ships: true })
    const levels = (await callTool(request, accessToken, "get_product", { id: draftId })).data.variants[0].stock_by_location
    expect(levels.find((l: any) => l.location === QA_WAREHOUSE)?.stocked).toBe(3)

    // A draft takes stock for several warehouses in one call
    const both = await callTool(request, accessToken, "update_product_draft", {
      id: draftId,
      variant_stock: [
        { variant_id: small, units: 4 },
        { variant_id: small, units: 6, stock_location_id: created.id },
      ],
    })
    expect(both.isError, both.text).toBe(false)
    const smallLevels = (await callTool(request, accessToken, "get_product", { id: draftId })).data.variants.find((v: any) => v.id === small)
      .stock_by_location
    expect(smallLevels.find((l: any) => l.location === QA_WAREHOUSE)?.stocked).toBe(6)
    expect(smallLevels.find((l: any) => l.location !== QA_WAREHOUSE)?.stocked).toBe(4)

    const overview = await callTool(request, accessToken, "get_store_overview")
    const currency = overview.data.currencies.find((c: any) => c.default)?.code ?? overview.data.currencies[0].code
    const cap = await callTool(request, accessToken, "create_product_draft", {
      title: "QA MCP Two Warehouse Cap",
      variants: [{ title: "One size", prices: [{ currency_code: currency, amount: 9 }], stock: [{ units: 2 }, { stock_location_id: created.id, units: 5 }] }],
    })
    try {
      expect(cap.isError, cap.text).toBe(false)
      expect(cap.data.stock.set).toEqual([
        { variant: "QA MCP Two Warehouse Cap / One size", location: expect.any(String), units: 2 },
        { variant: "QA MCP Two Warehouse Cap / One size", location: QA_WAREHOUSE, units: 5 },
      ])
    } finally {
      if (cap.data?.id) await request.delete(`${backend}/admin/products/${cap.data.id}`, { headers })
    }
  })

  test("a refreshed token works, and the spent refresh token is refused", async ({ request }) => {
    const refresh = () =>
      request.post(`${backend}/oauth/token`, {
        form: { grant_type: "refresh_token", client_id: clientId, refresh_token: refreshToken },
      })
    const first = await refresh()
    expect(first.status()).toBe(200)
    const rotated = await first.json()
    expect(rotated.refresh_token).not.toBe(refreshToken)
    expect((await mcp(request, rotated.access_token, "tools/list")).status).toBe(200)
    accessToken = rotated.access_token

    // Replaying the old one counts as a leak, so the server revokes the whole grant
    const replay = await refresh()
    expect(replay.status()).toBe(400)
    expect((await mcp(request, accessToken, "tools/list")).status).toBe(401)
  })

  test("revoking a connected app in the admin cuts it off on its next call", async ({ page, request }) => {
    const { verifier, challenge } = pkce()
    const redirected = await consent(page, authorizeURL(clientId, challenge, "again"))
    const code = new URL(redirected!).searchParams.get("code")!
    const tokens = await (await exchangeCode(request, clientId, code, verifier)).json()
    expect((await mcp(request, tokens.access_token, "tools/list")).status).toBe(200)

    const overview = await (await request.get(`${backend}/admin/store-mcp`, { headers: { Authorization: `Bearer ${admin}` } })).json()
    const grant = overview.connected_apps.find((app: any) => app.app_name === "QA Assistant")
    expect(grant).toBeTruthy()

    const revoked = await request.delete(`${backend}/admin/store-mcp/grants/${grant.id}`, {
      headers: { Authorization: `Bearer ${admin}` },
    })
    expect(revoked.ok()).toBeTruthy()

    const after = await mcp(request, tokens.access_token, "tools/list")
    expect(after.status).toBe(401)
    const refreshed = await request.post(`${backend}/oauth/token`, {
      form: { grant_type: "refresh_token", client_id: clientId, refresh_token: tokens.refresh_token },
    })
    expect(refreshed.status()).toBe(400)
  })

  test("a replayed authorization code is refused", async ({ page, request }) => {
    const replayClient = await registerClient(request, "QA Replay")
    const { verifier, challenge } = pkce()
    const code = new URL((await consent(page, authorizeURL(replayClient, challenge, "replay")))!).searchParams.get("code")!
    expect((await exchangeCode(request, replayClient, code, verifier)).status()).toBe(200)
    const second = await exchangeCode(request, replayClient, code, verifier)
    expect(second.status()).toBe(400)
    expect((await second.json()).error).toBe("invalid_grant")
  })
})
