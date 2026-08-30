import { test, expect, Page } from "@playwright/test"
import { addProductToCart, qaEnv, url } from "./helpers"

/**
 * Confirms the order confirmation email is actually sent.
 *
 * This cannot be observed from the storefront, which is precisely why it went
 * unnoticed for so long: the order completes, the confirmation page renders,
 * and the subscriber swallows the send failure with a `console.error`. Placing
 * a real order and then asking Resend whether it received the send is the only
 * way to hold this honest, so the spec talks to the Resend API the same way
 * qa/13-payment.spec.ts talks to Stripe.
 *
 * Three separate defects made every order email fail before this existed:
 * `react`/`react-dom` were devDependencies while postBuild installs the
 * production server with `pnpm i --prod`, so rendering a React email template
 * threw; the provider's catch block read axios-shaped fields off a fetch-based
 * SDK, so the real cause was reported as "undefined - unknown error"; and
 * `resend.emails.send()` resolves with `{ data, error }` rather than throwing,
 * so an API-level rejection was logged as a success.
 */

/**
 * Resend's own test inbox. Using a real-looking address would send genuine mail
 * on every run, and using @example.com would generate a bounce each time and
 * erode the sending domain's reputation. This address is accepted, recorded and
 * discarded by Resend, which is all the spec needs.
 */
const TEST_INBOX = "delivered@resend.dev"

const RESEND_API = "https://api.resend.com"

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

type ResendEmail = {
  id: string
  to: string[]
  subject?: string
  created_at: string
  last_event?: string
}

const listRecentEmails = async (): Promise<ResendEmail[]> => {
  const res = await fetch(`${RESEND_API}/emails?limit=100`, {
    headers: { Authorization: `Bearer ${qaEnv.resendApiKey}` },
  })
  if (!res.ok) {
    throw new Error(`Resend GET /emails failed: ${res.status} ${await res.text()}`)
  }
  const body = await res.json()
  return body.data ?? []
}

test.describe("Order confirmation email", () => {
  test.skip(
    !qaEnv.resendApiKey,
    "RESEND_API_KEY is not set, so Resend cannot be asked whether the email was sent"
  )

  test("placing an order sends the confirmation email through Resend", async ({
    page,
  }) => {
    // Recorded before the order so a send from an earlier run cannot satisfy
    // the assertion. Resend timestamps are UTC; a second of slack absorbs any
    // clock skew between this machine and theirs.
    const placedAfter = new Date(Date.now() - 1000)

    await addProductToCart(page, "t-shirt")
    await placeOrder(page, TEST_INBOX)

    /*
     * The order is placed; the email is not sent yet. `order.placed` goes
     * through the event bus, which is a Redis queue on a real deploy, so the
     * subscriber runs after the HTTP response has already been returned.
     * Poll rather than assume a delay.
     */
    await expect
      .poll(
        async () => {
          const emails = await listRecentEmails()
          return emails.filter(
            (e) =>
              (e.to ?? []).includes(TEST_INBOX) &&
              new Date(e.created_at) >= placedAfter
          ).length
        },
        {
          timeout: 90_000,
          intervals: [2000],
          message:
            `Resend recorded no email to ${TEST_INBOX} after the order was placed. ` +
            `Check the backend logs for "Failed to send" or "Resend rejected".`,
        }
      )
      .toBeGreaterThan(0)
  })

  test("the confirmation email is not silently reported as sent when it failed", async () => {
    /*
     * A guard on the failure mode rather than the happy path.
     *
     * `resend.emails.send()` resolves with `{ data, error }` instead of
     * throwing, so the provider used to log "Successfully sent" for rejected
     * sends. Anything Resend rejects is visible on the listing as an email
     * whose last_event is a failure, so a run that leaves failures behind
     * should not be called green.
     */
    const emails = await listRecentEmails()
    const recent = emails.filter(
      (e) => Date.now() - new Date(e.created_at).getTime() < 30 * 60 * 1000
    )
    const failed = recent.filter((e) =>
      ["bounced", "failed", "complained"].includes(e.last_event ?? "")
    )

    expect(
      failed.map((e) => `${e.id} -> ${e.to?.join(", ")} (${e.last_event})`),
      "Resend reports recent sends that did not arrive"
    ).toEqual([])
  })
})
