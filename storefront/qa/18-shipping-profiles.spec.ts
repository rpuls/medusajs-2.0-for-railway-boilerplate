import { test, expect, APIRequestContext } from "@playwright/test"
import { addProductToCart, qaEnv, url } from "./helpers"

/**
 * A store with a second shipping profile, say a sofa that ships by freight.
 *
 * Medusa completes a cart only when it has one shipping method per shipping
 * profile among its items, but it lists every option for the address in one
 * list. Upstream's delivery step showed that list and saved one choice, so a
 * cart with a T-shirt and a sofa failed at "Place order" with "The cart items
 * require shipping profiles that are not satisfied". The delivery step now asks
 * once per profile. This sets up such a store through the admin API, buys from
 * it, and removes what it created.
 */

const backend = qaEnv.backendURL.replace(/\/+$/, "")
const runId = Date.now().toString(36)
const PROFILE = `QA Freight profile ${runId}`
const FREIGHT = `QA Freight ${runId}`
const SOFA = `QA Sofa ${runId}`
const SOFA_HANDLE = `qa-sofa-${runId}`

const adminHeaders = async (request: APIRequestContext) => {
  const res = await request.post(`${backend}/auth/user/emailpass`, {
    data: { email: qaEnv.adminEmail, password: qaEnv.adminPassword },
  })
  expect(res.ok()).toBeTruthy()
  return { Authorization: `Bearer ${(await res.json()).token}` }
}

test.describe.serial("Products in a second shipping profile", () => {
  const created: { profile?: string; option?: string; product?: string } = {}

  test.beforeAll(async ({ request }) => {
    const headers = await adminHeaders(request)

    const { stock_locations } = await (
      await request.get(
        `${backend}/admin/stock-locations?limit=50&fields=id,*fulfillment_sets,*fulfillment_sets.service_zones,*fulfillment_sets.service_zones.geo_zones`,
        { headers }
      )
    ).json()
    const zone = stock_locations
      .flatMap((location: any) => location.fulfillment_sets ?? [])
      .flatMap((set: any) => set.service_zones ?? [])
      .find((z: any) =>
        (z.geo_zones ?? []).some((g: any) => g.country_code === qaEnv.region)
      )
    expect(zone, "a shipping zone must cover the default region").toBeTruthy()

    const profile = await request.post(`${backend}/admin/shipping-profiles`, {
      headers,
      data: { name: PROFILE, type: "custom" },
    })
    expect(profile.ok(), await profile.text()).toBeTruthy()
    created.profile = (await profile.json()).shipping_profile.id

    const option = await request.post(`${backend}/admin/shipping-options`, {
      headers,
      data: {
        name: FREIGHT,
        service_zone_id: zone.id,
        shipping_profile_id: created.profile,
        provider_id: "manual_manual",
        price_type: "flat",
        type: { label: "Freight", description: "QA freight", code: "freight" },
        prices: [
          { currency_code: "eur", amount: 25 },
          { currency_code: "usd", amount: 25 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    })
    expect(option.ok(), await option.text()).toBeTruthy()
    created.option = (await option.json()).shipping_option.id

    const { stores } = await (await request.get(`${backend}/admin/stores`, { headers })).json()
    const salesChannelId = stores[0].default_sales_channel_id

    const product = await request.post(`${backend}/admin/products`, {
      headers,
      data: {
        title: SOFA,
        handle: SOFA_HANDLE,
        status: "published",
        shipping_profile_id: created.profile,
        sales_channels: [{ id: salesChannelId }],
        options: [{ title: "Default option", values: ["Default option value"] }],
        variants: [
          {
            title: "Default",
            options: { "Default option": "Default option value" },
            manage_inventory: false,
            prices: [
              { currency_code: "eur", amount: 300 },
              { currency_code: "usd", amount: 300 },
            ],
          },
        ],
      },
    })
    expect(product.ok(), await product.text()).toBeTruthy()
    created.product = (await product.json()).product.id
  })

  test.afterAll(async ({ request }) => {
    const headers = await adminHeaders(request)
    if (created.product) await request.delete(`${backend}/admin/products/${created.product}`, { headers })
    if (created.option) await request.delete(`${backend}/admin/shipping-options/${created.option}`, { headers })
    if (created.profile) await request.delete(`${backend}/admin/shipping-profiles/${created.profile}`, { headers })
  })

  /**
   * The reason for the per-profile delivery step, pinned through the Store API:
   * if Medusa ever stops requiring a method per profile, this fails and the
   * storefront change can be reconsidered.
   */
  test("Medusa refuses a two-profile cart with one shipping method", async ({ request }) => {
    const { publishableApiKey } = await (await request.get(`${backend}/key-exchange`)).json()
    const headers = { "x-publishable-api-key": publishableApiKey }
    const store = (path: string, data?: unknown) =>
      data === undefined
        ? request.get(`${backend}/store${path}`, { headers })
        : request.post(`${backend}/store${path}`, { headers, data })

    const { regions } = await (await store("/regions")).json()
    const region = regions.find((r: any) => r.countries.some((c: any) => c.iso_2 === qaEnv.region))
    const variantOf = async (handle: string) =>
      (await (await store(`/products?handle=${handle}&region_id=${region.id}`)).json()).products[0].variants[0].id

    const { cart } = await (await store("/carts", { region_id: region.id })).json()
    for (const handle of ["t-shirt", SOFA_HANDLE]) {
      expect((await store(`/carts/${cart.id}/line-items`, { variant_id: await variantOf(handle), quantity: 1 })).ok()).toBeTruthy()
    }
    await store(`/carts/${cart.id}`, {
      email: "api-two-profiles@example.com",
      shipping_address: { first_name: "Quinn", last_name: "Tester", address_1: "1 Test Street", city: "London", postal_code: "SW1A 1AA", country_code: qaEnv.region },
    })

    // Medusa lists the options of both profiles together, for the address alone
    const { shipping_options } = await (await store(`/shipping-options?cart_id=${cart.id}`)).json()
    expect(shipping_options.some((o: any) => o.shipping_profile_id === created.profile)).toBe(true)
    expect(shipping_options.some((o: any) => o.shipping_profile_id !== created.profile)).toBe(true)

    const shirtOption = shipping_options.find((o: any) => o.shipping_profile_id !== created.profile)
    await store(`/carts/${cart.id}/shipping-methods`, { option_id: shirtOption.id })
    const { payment_collection } = await (await store("/payment-collections", { cart_id: cart.id })).json()
    await store(`/payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" })

    const completed = await store(`/carts/${cart.id}/complete`, {})
    expect(JSON.stringify(await completed.json())).toMatch(/require shipping profiles that are not satisfied/)
  })

  test("a cart mixing two profiles asks for delivery per profile and completes", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await addProductToCart(page, SOFA_HANDLE)
    await page.goto(url("cart"))
    await page.getByTestId("checkout-button").click()
    await expect(page).toHaveURL(/\/checkout/)

    await page.getByTestId("shipping-first-name-input").fill("Quinn")
    await page.getByTestId("shipping-last-name-input").fill("Tester")
    await page.getByTestId("shipping-address-input").fill("1 Test Street")
    await page.getByTestId("shipping-postal-code-input").fill("SW1A 1AA")
    await page.getByTestId("shipping-city-input").fill("London")
    await page.getByTestId("shipping-country-select").selectOption({ value: qaEnv.region })
    await page.getByTestId("shipping-email-input").fill("two-profiles@example.com")
    await page.getByTestId("submit-address-button").click()

    // One list per profile, each with only its own options
    const groups = page.getByTestId("delivery-group")
    await expect(groups).toHaveCount(2)
    const sofaGroup = groups.filter({ hasText: SOFA })
    const shirtGroup = groups.filter({ hasText: "T-Shirt" })
    await expect(sofaGroup.getByTestId("delivery-option-radio")).toHaveCount(1)
    await expect(sofaGroup).toContainText(FREIGHT)
    await expect(shirtGroup).not.toContainText(FREIGHT)

    const submit = page.getByTestId("submit-delivery-option-button")
    const shirtOption = shirtGroup.getByTestId("delivery-option-radio").first()
    await shirtOption.click()
    await expect(shirtOption).toHaveAttribute("data-headlessui-state", /checked/)
    // A choice for the T-shirt alone is not enough
    await expect(submit).toBeDisabled()

    const sofaOption = sofaGroup.getByTestId("delivery-option-radio").first()
    await sofaOption.click()
    await expect(sofaOption).toHaveAttribute("data-headlessui-state", /checked/)
    await expect(submit).toBeEnabled()
    await submit.click()

    await page.getByTestId("payment-option-radio").first().click()
    await page.getByTestId("submit-payment-button").click()
    const placeOrder = page.getByTestId("submit-order-button")
    await expect(placeOrder).toBeEnabled()
    await placeOrder.click()

    await expect(page.getByTestId("order-complete-container")).toBeVisible({ timeout: 60_000 })
    await expect(page.getByTestId("shipping-method-summary")).toContainText(FREIGHT)
  })

  test("a cart with only the default profile keeps the single list", async ({ page }) => {
    await addProductToCart(page, "shorts")
    await page.goto(url("checkout?step=address"))
    await page.getByTestId("shipping-first-name-input").fill("Quinn")
    await page.getByTestId("shipping-last-name-input").fill("Tester")
    await page.getByTestId("shipping-address-input").fill("1 Test Street")
    await page.getByTestId("shipping-postal-code-input").fill("SW1A 1AA")
    await page.getByTestId("shipping-city-input").fill("London")
    await page.getByTestId("shipping-country-select").selectOption({ value: qaEnv.region })
    await page.getByTestId("shipping-email-input").fill("one-profile@example.com")
    await page.getByTestId("submit-address-button").click()

    await expect(page.getByTestId("delivery-options-container")).toBeVisible()
    await expect(page.getByTestId("delivery-group")).toHaveCount(0)
    // The freight option belongs to the other profile, so it is not offered here
    await expect(page.getByTestId("delivery-options-container")).not.toContainText(FREIGHT)
  })
})
