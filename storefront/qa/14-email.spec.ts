import { test, expect, APIRequestContext, Page } from "@playwright/test"
import { addProductToCart, qaEnv, url } from "./helpers"

/**
 * Confirms the order confirmation email is actually sent.
 *
 * This cannot be observed from the storefront, which is exactly why it went
 * unnoticed for so long: the order completes, the confirmation page renders,
 * and `subscribers/order-placed.ts` swallows the send failure with a
 * `console.error`. Three separate defects made every order email fail on
 * Railway, and the suite was green throughout.
 *
 * The evidence lives in Medusa's own notification records rather than in
 * Resend's `GET /emails` listing. That listing is eventually consistent and was
 * measured lagging several minutes behind a send that had already succeeded, so
 * asserting on it produced confident false failures. `/admin/notifications`
 * writes `status` and `external_id` (the Resend message id) the moment the
 * provider returns, which is both immediate and authoritative. Resend is still
 * consulted, but by id, which does not go through the lagging index.
 */

/**
 * Resend's own test inbox. A real-looking address would send genuine mail on
 * every run, and an @example.com address would bounce each time and erode the
 * sending domain's reputation. This one is accepted, recorded and discarded.
 */
const TEST_INBOX = "delivered@resend.dev"

const placeOrder = async (page: Page, email: string) => {
  await page.goto(url("cart"))
  await page.getByTestId("checkout-button").click()
  await expect(page).toHaveURL(/\/checkout/)

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

  await page.getByTestId("delivery-option-radio").first().click()
  await page.getByTestId("submit-delivery-option-button").click()

  await page.getByTestId("payment-option-radio").first().click()
  await page.getByTestId("submit-payment-button").click()

  await page.getByTestId("submit-order-button").click()
  await expect(page.getByTestId("order-complete-container")).toBeVisible({
    timeout: 60_000,
  })
}

/** Signs in to the Medusa admin API and returns a bearer token. */
const adminToken = async (request: APIRequestContext): Promise<string> => {
  const res = await request.post(`${qaEnv.backendURL}/auth/user/emailpass`, {
    data: { email: qaEnv.adminEmail, password: qaEnv.adminPassword },
  })
  expect(res.ok(), "admin sign-in to read notifications").toBeTruthy()
  return (await res.json()).token
}

type Notification = {
  id: string
  to: string
  template: string
  status: string
  external_id: string | null
  created_at: string
}

const recentNotifications = async (
  request: APIRequestContext,
  token: string
): Promise<Notification[]> => {
  const res = await request.get(
    `${qaEnv.backendURL}/admin/notifications` +
      `?limit=30&fields=id,to,channel,template,status,external_id,created_at`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  expect(res.ok(), "reading /admin/notifications").toBeTruthy()
  return (await res.json()).notifications ?? []
}

test.describe("Order confirmation email", () => {
  /**
   * Headroom over the suite's 120s default, not an expected duration: a
   * healthy run finishes in about ten seconds. `order.placed` goes onto the
   * Redis-backed event bus, so the subscriber runs behind the HTTP response,
   * and the margin is there for a queue that is briefly backed up rather than
   * for a send that is normally slow.
   */
  test.describe.configure({ timeout: 240_000 })

  test("placing an order sends the confirmation email", async ({
    page,
    request,
  }) => {
    const token = await adminToken(request)

    /*
     * Identify this run's notification by id rather than by timestamp.
     *
     * Comparing `created_at` against a locally captured `Date.now()` compares
     * two different clocks. This machine measured 31 seconds ahead of the
     * server, which is more than the gap between placing an order and the
     * subscriber running, so a perfectly good send looked like it happened
     * "before" the test started and was skipped. Snapshotting the ids first
     * and looking for one that was not there is immune to that.
     */
    const before = new Set(
      (await recentNotifications(request, token)).map((n) => n.id)
    )

    await addProductToCart(page, "t-shirt")
    await placeOrder(page, TEST_INBOX)

    let notification: Notification | undefined

    await expect
      .poll(
        async () => {
          const all = await recentNotifications(request, token)
          notification = all.find(
            (n) =>
              !before.has(n.id) &&
              n.to === TEST_INBOX &&
              n.template === "order-placed"
          )
          return (
            notification?.status ??
            `no new notification yet (${all.length} on record)`
          )
        },
        {
          timeout: 180_000,
          intervals: [2000],
          message:
            `Medusa never recorded an order-placed notification for ${TEST_INBOX}. ` +
            `Either the subscriber did not run or the event bus is not draining.`,
        }
      )
      // "failure" fails here rather than timing out, and the message below
      // carries the reason straight from the backend.
      .toBe("success")

    /*
     * external_id is the id Resend returned for the accepted message. Its
     * absence would mean the provider reported success without the API ever
     * confirming one, which is precisely the bug where `emails.send()` resolves
     * with `{ data, error }` and the error goes unchecked.
     */
    expect(
      notification?.external_id,
      "Medusa recorded success but stored no Resend message id"
    ).toBeTruthy()
  })

  test("the send is confirmed by Resend itself", async ({ request }) => {
    test.skip(
      !qaEnv.resendApiKey,
      "RESEND_API_KEY is not set, so Resend cannot be asked to confirm"
    )

    const token = await adminToken(request)
    const all = await recentNotifications(request, token)
    const sent = all.find(
      (n) => n.to === TEST_INBOX && n.status === "success" && n.external_id
    )

    expect(
      sent,
      "no successful order-placed notification to check against Resend"
    ).toBeTruthy()

    // Fetched by id on purpose. The list endpoint is eventually consistent and
    // lagged several minutes behind this same message during development.
    const res = await request.get(
      `https://api.resend.com/emails/${sent!.external_id}`,
      { headers: { Authorization: `Bearer ${qaEnv.resendApiKey}` } }
    )
    expect(
      res.ok(),
      `Resend does not know message ${sent!.external_id}, so Medusa recorded a send that never happened`
    ).toBeTruthy()

    const email = await res.json()
    expect(email.to).toContain(TEST_INBOX)
    expect(
      ["bounced", "failed", "complained"],
      `Resend reports this message as ${email.last_event}`
    ).not.toContain(email.last_event)
  })
})
