import { test, expect, APIRequestContext, Page } from "@playwright/test"
import { addProductToCart, qaEnv, url } from "./helpers"

/**
 * A real card payment, all the way through Stripe.
 *
 * 05-checkout covers the manual provider, which is what a store gets with no
 * Stripe keys set. This covers the other half, and it is the expensive one to
 * check by hand: it needs live keys, a webhook endpoint and a card typed into
 * an iframe. Provision the environment with local-tools/provision-stripe.mjs
 * and this becomes a single command.
 *
 * It skips itself when NEXT_PUBLIC_STRIPE_KEY is absent, so a default deploy
 * still gets a clean run.
 */

/**
 * Stripe's universally accepted test card. Any future expiry and CVC work.
 *
 * The postal code is numeric on purpose and is unrelated to the shipping
 * address. 4242 is a US-issued card, so the element validates that field as a
 * US ZIP and silently strips anything non-numeric: a UK postcode like
 * "SW1A 1AA" arrives as "11", which keeps the card incomplete and leaves the
 * continue button disabled with no visible error.
 */
const TEST_CARD = {
  number: "4242424242424242",
  expiry: "12/34",
  cvc: "123",
  postal: "12345",
}

const fillShippingAddress = async (page: Page, email: string) => {
  await page.getByTestId("shipping-first-name-input").fill("Quinn")
  await page.getByTestId("shipping-last-name-input").fill("Tester")
  await page.getByTestId("shipping-address-input").fill("1 Test Street")
  await page.getByTestId("shipping-postal-code-input").fill("SW1A 1AA")
  await page.getByTestId("shipping-city-input").fill("London")
  await page
    .getByTestId("shipping-country-select")
    .selectOption({ value: qaEnv.region })
  await page.getByTestId("shipping-email-input").fill(email)
  await page.getByTestId("submit-address-button").click()
}

/**
 * Types into the Stripe CardElement.
 *
 * CardElement is one iframe holding every field, unlike the newer Payment
 * Element which splits them across several. The frame is matched on its title
 * rather than an index because the page also mounts Stripe's invisible
 * fraud-detection iframes, and those come and go.
 */
const CARD_FRAME = 'iframe[title*="Secure card payment"]'

const fillCard = async (page: Page) => {
  // The element mounts asynchronously once Stripe.js has loaded, so wait for
  // the frame itself rather than letting the first fill() time out with a
  // message that says nothing about why the field was missing.
  await expect(
    page.locator(CARD_FRAME),
    "the Stripe card element never mounted"
  ).toBeAttached({ timeout: 30_000 })

  const frame = page.frameLocator(CARD_FRAME)

  /*
   * Typed one key at a time rather than fill()ed.
   *
   * These are masked inputs, and Stripe reformats them from key events as you
   * go. fill() sets the value in one shot, which leaves Stripe's own state
   * behind the DOM: the field looks right, `change` never reports complete,
   * and the continue button stays disabled with no error to explain it.
   */
  const type = async (name: string, value: string) => {
    const field = frame.locator(`[name="${name}"]`)
    await field.click()
    await field.pressSequentially(value, { delay: 40 })
  }

  await type("cardnumber", TEST_CARD.number)
  await type("exp-date", TEST_CARD.expiry)
  await type("cvc", TEST_CARD.cvc)

  // Stripe only renders the postal field for some country/locale combinations,
  // so this is conditional rather than assumed.
  if (await frame.locator('[name="postal"]').count()) {
    await type("postal", TEST_CARD.postal)
  }
}

/** Signs in to the Medusa admin API and returns a bearer token. */
const adminToken = async (request: APIRequestContext): Promise<string> => {
  const res = await request.post(`${qaEnv.backendURL}/auth/user/emailpass`, {
    data: { email: qaEnv.adminEmail, password: qaEnv.adminPassword },
  })
  expect(res.ok(), "admin sign-in for the Stripe cross-check").toBeTruthy()
  return (await res.json()).token
}

/**
 * Digs the Stripe PaymentIntent id out of an order.
 *
 * The provider stores the raw intent under the payment's `data`, so this reads
 * `data.id` where the provider id mentions Stripe. Falling back to a regex over
 * the serialised order keeps it working if the shape shifts between minor
 * versions, which is not worth a test failure on its own.
 */
const paymentIntentId = (order: any): string | null => {
  const payments = (order?.payment_collections ?? []).flatMap(
    (collection: any) => collection.payments ?? []
  )
  const stripePayment = payments.find((payment: any) =>
    String(payment?.provider_id ?? "").includes("stripe")
  )
  const direct = stripePayment?.data?.id
  if (typeof direct === "string" && direct.startsWith("pi_")) {
    return direct
  }
  return JSON.stringify(order ?? {}).match(/"(pi_[A-Za-z0-9_]+)"/)?.[1] ?? null
}

test.describe("Card payment", () => {
  test.skip(
    !qaEnv.stripeConfigured,
    "NEXT_PUBLIC_STRIPE_KEY is not set, so this store has no card payments"
  )

  test("a card order completes and Stripe confirms the charge", async ({
    page,
    request,
  }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url("cart"))
    await page.getByTestId("checkout-button").click()

    await expect(page).toHaveURL(/\/checkout/)
    await fillShippingAddress(page, "card-payment@example.com")

    await expect(page.getByTestId("delivery-options-container")).toBeVisible()
    await page.getByTestId("delivery-option-radio").first().click()
    await page.getByTestId("submit-delivery-option-button").click()

    // Pick Stripe specifically. A store can have both the manual and the card
    // provider enabled, and the manual one sorts first.
    const stripeOption = page.locator(
      '[data-testid="payment-option-radio"][data-value*="stripe"]'
    )
    await expect(
      stripeOption,
      "no Stripe payment option was offered. The backend registers the payment " +
        "module only when STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET are both set " +
        "at startup, so check those and that it redeployed afterwards."
    ).toHaveCount(1)
    await stripeOption.click()

    /*
     * The same button is pressed twice, and it has to be.
     *
     * Payment renders the card element on `isStripe`, which is derived from the
     * cart's active payment session rather than from the radio selection. So
     * the first press is what calls initiatePaymentSession, and only then does
     * the element mount. Its label says so: it reads "Enter card details"
     * before the session exists and "Continue to review" afterwards.
     */
    const submitPayment = page.getByTestId("submit-payment-button")
    await expect(submitPayment).toBeEnabled()
    await submitPayment.click()

    await fillCard(page)

    // Now gated on Stripe reporting the card complete, so this doubles as the
    // assertion that the element accepted the input.
    await expect(submitPayment).toBeEnabled()
    await submitPayment.click()

    const placeOrder = page.getByTestId("submit-order-button")
    await expect(placeOrder).toBeEnabled()
    await placeOrder.click()

    // Stripe confirmation plus order placement is the slowest step in the suite.
    await expect(page.getByTestId("order-complete-container")).toBeVisible({
      timeout: 120_000,
    })
    await expect(page).toHaveURL(/\/order\/confirmed\//)

    const orderId = page.url().match(/\/order\/confirmed\/([^/?#]+)/)?.[1]
    expect(orderId, "order id in the confirmation URL").toBeTruthy()

    // Everything above proves the storefront thinks it worked. The rest proves
    // Stripe agrees, which is the failure mode worth catching: a misconfigured
    // provider can still produce a confirmation page with no money moved.
    test.skip(
      !qaEnv.stripeSecretKey,
      "STRIPE_API_KEY is not available to the test run, so the charge cannot be cross-checked"
    )

    const token = await adminToken(request)
    const orderRes = await request.get(
      `${qaEnv.backendURL}/admin/orders/${orderId}?fields=*payment_collections.payments`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(orderRes.ok(), "fetching the order from the admin API").toBeTruthy()
    const { order } = await orderRes.json()

    const intentId = paymentIntentId(order)
    expect(intentId, "a Stripe PaymentIntent id on the order").toBeTruthy()

    const intentRes = await request.get(
      `https://api.stripe.com/v1/payment_intents/${intentId}`,
      { headers: { Authorization: `Bearer ${qaEnv.stripeSecretKey}` } }
    )
    expect(intentRes.ok(), "fetching the PaymentIntent from Stripe").toBeTruthy()
    const intent = await intentRes.json()

    // Both states mean the card was accepted and the money is committed.
    // Which one you get depends on whether the provider captures automatically,
    // so asserting only on "succeeded" would fail on a manual-capture setup
    // that is working perfectly well.
    expect(
      ["succeeded", "requires_capture"],
      `Stripe reports the intent as "${intent.status}"`
    ).toContain(intent.status)
    expect(intent.amount).toBeGreaterThan(0)
  })
})
