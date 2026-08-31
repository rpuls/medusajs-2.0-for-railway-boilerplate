import { test, expect, APIRequestContext, Page } from "@playwright/test"
import { assertSignedIn, qaEnv, url } from "./helpers"

/**
 * Covers the password reset flow end to end, token included.
 *
 * Before this feature existed the storefront had no way to recover an account
 * at all, and the admin dashboard's own "Forgot password?" link was a dead end:
 * `POST /auth/{actor}/emailpass/reset-password` answers 201 whether or not the
 * identity exists, the workflow emits `auth.password_reset` with the token, and
 * with no subscriber listening nobody ever received it. Everything looked fine
 * from the outside, which is exactly the failure mode this suite exists for.
 *
 * The token cannot be observed from the storefront, so it is read out of the
 * sent email through Resend's retrieve-by-id endpoint, the same trick
 * 14-email.spec.ts uses to confirm an order confirmation. That makes this the
 * only spec here that proves a token issued by the backend actually works.
 */

/**
 * Resend's own test inbox, reused rather than a fresh address per run.
 *
 * A unique @example.com address would hard bounce on every run and erode the
 * sending domain's reputation, and this spec has to send a real email to get at
 * the token. One shared account is fine because the reset flow needs neither
 * the old password nor a session: the first run creates it, later runs find it
 * already there and reset it again.
 */
const RESET_INBOX = "delivered@resend.dev"

/** Changed every run, so a stale password can never make the last step pass. */
const newPassword = () => `qa-reset-${Date.now().toString(36)}`

type Notification = {
  id: string
  to: string
  template: string
  status: string
  external_id: string | null
}

const adminToken = async (request: APIRequestContext): Promise<string> => {
  const res = await request.post(`${qaEnv.backendURL}/auth/user/emailpass`, {
    data: { email: qaEnv.adminEmail, password: qaEnv.adminPassword },
  })
  expect(res.ok(), "admin sign-in to read notifications").toBeTruthy()
  return (await res.json()).token
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

/**
 * Makes sure the shared account exists, without caring which run created it.
 *
 * Registering an address that is already taken is the expected outcome on every
 * run after the first, so both endings are accepted: signed in, or the register
 * form reporting the conflict.
 */
const ensureAccount = async (page: Page) => {
  await page.goto(url("account"))
  await page.getByTestId("register-button").click()
  await expect(page.getByTestId("register-page")).toBeVisible()

  await page.getByTestId("first-name-input").fill("Quinn")
  await page.getByTestId("last-name-input").fill("Tester")
  await page.getByTestId("email-input").fill(RESET_INBOX)
  await page.getByTestId("password-input").fill(`seed-${Date.now().toString(36)}`)
  await page.getByTestId("register-button").click()

  const signedIn = page.getByTestId("mobile-account-nav")
  const conflict = page.getByTestId("register-error")

  await expect
    .poll(
      async () =>
        (await signedIn.count()) > 0
          ? "registered"
          : (await conflict.count()) > 0
            ? "already exists"
            : "waiting",
      {
        timeout: 30_000,
        message: `Registering ${RESET_INBOX} neither succeeded nor reported a conflict.`,
      }
    )
    .not.toBe("waiting")

  // Sign out if this run created the account, so the reset is exercised the way
  // a locked-out shopper would meet it.
  if ((await signedIn.count()) > 0) {
    await page.getByTestId("account-nav").getByTestId("logout-button").click()
    await expect(page.getByTestId("login-page")).toBeVisible()
  }
}

/** Pulls the reset link out of the HTML Resend actually sent. */
const resetLinkFromEmail = async (
  request: APIRequestContext,
  messageId: string
): Promise<string> => {
  const res = await request.get(`https://api.resend.com/emails/${messageId}`, {
    headers: { Authorization: `Bearer ${qaEnv.resendApiKey}` },
  })
  expect(
    res.ok(),
    `Resend does not know message ${messageId}, so Medusa recorded a send that never happened`
  ).toBeTruthy()

  const html: string = (await res.json()).html ?? ""
  const match = html.match(/https?:\/\/[^"'\s]*\/reset-password\?[^"'\s]*/)

  expect(
    match,
    "The reset email carries no /reset-password link. Check the resetLink built in backend/src/subscribers/password-reset.ts."
  ).toBeTruthy()

  // The link is HTML, so ampersands between query params are entity-encoded.
  return match![0].replace(/&amp;/g, "&")
}

test.describe("Password reset", () => {
  /** Headroom for the event bus, not an expected duration. */
  test.describe.configure({ timeout: 240_000 })

  test.skip(
    !qaEnv.resendApiKey,
    "RESEND_API_KEY is not set, so the reset token cannot be read back out of the email"
  )

  test("a shopper can reset a forgotten password and sign in with it", async ({
    page,
    request,
  }) => {
    const token = await adminToken(request)
    await ensureAccount(page)

    // Snapshot ids first. Comparing created_at against a local clock is what
    // broke 14-email.spec.ts: this machine measured 31 seconds ahead of the
    // server, which is more than the gap being measured.
    const before = new Set(
      (await recentNotifications(request, token)).map((n) => n.id)
    )

    await page.goto(url("account"))
    await page.getByTestId("forgot-password-button").click()
    await expect(page.getByTestId("forgot-password-page")).toBeVisible()

    await page.getByTestId("forgot-password-email-input").fill(RESET_INBOX)
    await page.getByTestId("send-reset-link-button").click()

    // Deliberately neutral wording: the backend answers the same for an unknown
    // address so the form cannot be used to enumerate accounts.
    await expect(page.getByTestId("forgot-password-sent")).toBeVisible()

    let notification: Notification | undefined
    await expect
      .poll(
        async () => {
          const all = await recentNotifications(request, token)
          notification = all.find(
            (n) =>
              !before.has(n.id) &&
              n.to === RESET_INBOX &&
              n.template === "reset-password"
          )
          return notification?.status ?? "no new notification yet"
        },
        {
          timeout: 180_000,
          intervals: [2000],
          message:
            `Medusa never recorded a reset-password notification for ${RESET_INBOX}. ` +
            `Either backend/src/subscribers/password-reset.ts did not run, or the event bus is not draining.`,
        }
      )
      .toBe("success")

    expect(
      notification?.external_id,
      "Medusa recorded success but stored no Resend message id"
    ).toBeTruthy()

    const emailedLink = await resetLinkFromEmail(request, notification!.external_id!)
    const resetToken = new URL(emailedLink).searchParams.get("token")
    expect(resetToken, "the emailed link carries no token").toBeTruthy()

    /*
     * Navigated on the base URL under test rather than by following the emailed
     * origin. The origin is worth checking too, but it depends on the backend's
     * STOREFRONT_URL / STORE_CORS, so it gets its own test below where a
     * mismatch reads as a configuration problem instead of a broken token.
     */
    await page.goto(`${url("reset-password")}?token=${resetToken}`)
    await expect(page.getByTestId("reset-password-page")).toBeVisible()

    const password = newPassword()
    await page.getByTestId("new-password-input").fill(password)
    await page.getByTestId("confirm-password-input").fill(password)
    await page.getByTestId("reset-password-button").click()

    await expect(page.getByTestId("reset-password-success")).toBeVisible()

    // The whole point. A green form that did not change the password would be
    // the same class of bug as the change-password form that reported success
    // while doing nothing.
    await page.goto(url("account"))
    await expect(page.getByTestId("login-page")).toBeVisible()
    await page.getByTestId("email-input").fill(RESET_INBOX)
    await page.getByTestId("password-input").fill(password)
    await page.getByTestId("sign-in-button").click()
    await assertSignedIn(page)
  })

  test("the emailed link points at this storefront", async ({ request }) => {
    const token = await adminToken(request)
    const sent = (await recentNotifications(request, token)).find(
      (n) =>
        n.to === RESET_INBOX &&
        n.template === "reset-password" &&
        n.status === "success" &&
        n.external_id
    )

    expect(
      sent,
      "no successful reset-password notification to inspect; run the test above first"
    ).toBeTruthy()

    const emailedLink = await resetLinkFromEmail(request, sent!.external_id!)

    expect(
      new URL(emailedLink).origin,
      `The reset email links to ${emailedLink}, which is not this storefront. ` +
        `The backend builds it from STOREFRONT_URL, falling back to the first origin in STORE_CORS. ` +
        `A shopper following that link would land somewhere other than your shop.`
    ).toBe(new URL(qaEnv.baseURL).origin)
  })

  test("a reset link with no token explains itself", async ({ page }) => {
    await page.goto(url("reset-password"))

    await expect(page.getByText(/this link is incomplete/i)).toBeVisible()
    await expect(page.getByTestId("reset-password-page")).toHaveCount(0)
  })

  test("an expired or reused token is reported, not swallowed", async ({
    page,
  }) => {
    // Shaped like a JWT so it reaches the backend rather than being rejected by
    // the form. It has no valid signature, so the update route refuses it, which
    // is the same answer a reused or expired token gets.
    await page.goto(`${url("reset-password")}?token=not.a.token`)
    await expect(page.getByTestId("reset-password-page")).toBeVisible()

    await page.getByTestId("new-password-input").fill("a-long-enough-password")
    await page.getByTestId("confirm-password-input").fill("a-long-enough-password")
    await page.getByTestId("reset-password-button").click()

    await expect(
      page.getByTestId("reset-password-error-message")
    ).toContainText(/no longer valid/i)
  })

  test("mismatched passwords are refused before anything is sent", async ({
    page,
  }) => {
    await page.goto(`${url("reset-password")}?token=not.a.token`)

    await page.getByTestId("new-password-input").fill("a-long-enough-password")
    await page
      .getByTestId("confirm-password-input")
      .fill("a-different-password")
    await page.getByTestId("reset-password-button").click()

    await expect(
      page.getByTestId("reset-password-error-message")
    ).toContainText(/do not match/i)
  })
})
