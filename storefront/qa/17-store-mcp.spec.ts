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

test.describe.serial("Store MCP server", () => {
  let clientId: string
  let accessToken: string
  let refreshToken: string
  let draftId: string | undefined
  let admin: string

  test.afterAll(async ({ request }) => {
    if (!draftId) return
    const token = admin ?? (await adminToken(request))
    await request.delete(`${backend}/admin/products/${draftId}`, { headers: { Authorization: `Bearer ${token}` } })
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
      expect.arrayContaining(["get_store_overview", "search_products", "get_product", "list_orders", "get_sales_summary", "create_product_draft", "suggest_product_changes"])
    )
    expect(names.filter((name) => /publish|delete|refund|cancel|export|stock_update|setting/.test(name))).toEqual([])
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

    const sales = await callTool(request, accessToken, "get_sales_summary")
    expect(sales.isError).toBe(false)
  })

  test("refuses more than 50 rows, so no tool works as an export", async ({ request }) => {
    const { body } = await mcp(request, accessToken, "tools/call", { name: "search_customers", arguments: { limit: 500 } })
    const result = (body as any).result ?? (body as any).error
    expect(JSON.stringify(result)).toMatch(/50|too_big|Too big|less than or equal/i)
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
        { title: "Large", options: { Size: "Large" }, prices: [{ currency_code: currency, amount: 15 }] },
      ],
    })
    expect(created.isError, created.text).toBe(false)
    expect(created.data.status).toBe("draft")
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

    const published = await callTool(request, accessToken, "search_products", { status: "published", limit: 1 })
    const refused = await callTool(request, accessToken, "update_product_draft", {
      id: published.data.products[0].id,
      title: "Should never be saved",
    })
    expect(refused.isError).toBe(true)
    expect(refused.text).toMatch(/not a draft/)
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
