import { test, expect } from "@playwright/test"
import { newCustomer, register, login, url } from "./helpers"

/**
 * These cover the bug that made customer accounts unusable: getAuthHeaders()
 * is async, and customer.ts called it without awaiting, so the authorization
 * header was spread from a pending Promise and came out empty. Every
 * authenticated read 401'd, and getCustomer() turned that into null, so a
 * signed-in shopper was reported as signed out.
 */
test.describe("Customer accounts", () => {
  test("a shopper can register and lands on their account", async ({ page }) => {
    const customer = newCustomer("register")
    await register(page, customer)

    await expect(page.getByTestId("welcome-message")).toContainText(
      customer.firstName
    )
    await expect(page.getByTestId("customer-email")).toContainText(customer.email)
  })

  /**
   * The account read is force-cached under a Next data-cache entry, so this
   * asserts the thing that would be catastrophic if the cache key ever stopped
   * including the authorization header: one signed-in shopper seeing another
   * shopper's account.
   *
   * /store/customers/me is the same URL for every customer, so the header is
   * the only thing separating the two entries. Nothing else in the suite would
   * catch a regression here, and the failure mode is a privacy breach across
   * every store deployed from this template rather than a rendering glitch.
   */
  test("one shopper never sees another shopper's account", async ({
    browser,
  }) => {
    const first = newCustomer("isolation-a")
    const second = newCustomer("isolation-b")

    const contextA = await browser.newContext()
    const contextB = await browser.newContext()

    try {
      const pageA = await contextA.newPage()
      const pageB = await contextB.newPage()

      await register(pageA, first)
      await register(pageB, second)

      // Re-read both after the second registration, so a shared cache entry
      // written by whoever got there first would show up here.
      for (const [page, customer, other] of [
        [pageA, first, second],
        [pageB, second, first],
      ] as const) {
        await page.goto(url("account"))
        await expect(page.getByTestId("customer-email")).toContainText(
          customer.email
        )
        await expect(page.getByTestId("customer-email")).not.toContainText(
          other.email
        )
      }
    } finally {
      await contextA.close()
      await contextB.close()
    }
  })

  test("the session survives a reload and a fresh navigation", async ({ page }) => {
    const customer = newCustomer("session")
    await register(page, customer)

    // The 401-swallowed-into-null bug showed up exactly here: the account page
    // rendered the login form again on any subsequent request.
    await page.reload()
    await expect(page.getByTestId("welcome-message")).toBeVisible()

    await page.goto(url())
    await page.getByTestId("nav-account-link").click()
    await expect(page.getByTestId("welcome-message")).toBeVisible()
    await expect(page.getByTestId("login-page")).toHaveCount(0)
  })

  test("a shopper can sign out and back in", async ({ page }) => {
    const customer = newCustomer("signout")
    await register(page, customer)

    await page.getByTestId("account-nav").getByTestId("logout-button").click()
    await expect(page.getByTestId("login-page")).toBeVisible()

    await login(page, customer)
    await expect(page.getByTestId("welcome-message")).toContainText(
      customer.firstName
    )
  })

  test("wrong credentials show an error rather than a generic failure", async ({
    page,
  }) => {
    await page.goto(url("account"))
    await page.getByTestId("email-input").fill("nobody@example.com")
    await page.getByTestId("password-input").fill("definitely-wrong")
    await page.getByTestId("sign-in-button").click()

    const error = page.getByTestId("login-error-message")
    await expect(error).toBeVisible()

    // medusa-error.ts tested error.response and error.request, which are axios
    // properties. The SDK is fetch-based, so every error used to fall through
    // to "Error setting up the request".
    await expect(error).not.toContainText("Error setting up the request")
  })

  test("registering an address that already exists is rejected", async ({ page }) => {
    const customer = newCustomer("dupe")
    await register(page, customer)
    await page.getByTestId("account-nav").getByTestId("logout-button").click()
    await expect(page.getByTestId("login-page")).toBeVisible()

    await page.goto(url("account"))
    await page.getByTestId("register-button").click()
    await page.getByTestId("first-name-input").fill(customer.firstName)
    await page.getByTestId("last-name-input").fill(customer.lastName)
    await page.getByTestId("email-input").fill(customer.email)
    await page.getByTestId("password-input").fill(customer.password)
    await page.getByTestId("register-button").click()

    await expect(page.getByTestId("register-error")).toBeVisible()
  })

  test("the profile page saves a name and a phone number", async ({ page }) => {
    const customer = newCustomer("profile")
    await register(page, customer)

    await page.getByTestId("account-nav").getByTestId("profile-link").click()
    await expect(page.getByTestId("profile-page-wrapper")).toBeVisible()

    const nameEditor = page.getByTestId("account-name-editor")
    await nameEditor.getByTestId("edit-button").click()
    await nameEditor.getByTestId("first-name-input").fill("Renamed")
    await nameEditor.getByTestId("save-button").click()
    await expect(nameEditor.getByTestId("success-message")).toBeVisible()

    const phoneEditor = page.getByTestId("account-phone-editor")
    await phoneEditor.getByTestId("edit-button").click()
    await phoneEditor.getByTestId("phone-input").fill("5555550123")
    await phoneEditor.getByTestId("save-button").click()
    await expect(phoneEditor.getByTestId("success-message")).toBeVisible()

    // A write that only appears to work is the failure mode being guarded
    // against here, so re-read it from the server.
    await page.reload()
    await expect(nameEditor.getByTestId("current-info")).toContainText("Renamed")
    await expect(phoneEditor.getByTestId("current-info")).toContainText("5555550123")
  })

  test("email and password are read-only, not fake-editable", async ({ page }) => {
    const customer = newCustomer("readonly")
    await register(page, customer)
    await page.getByTestId("account-nav").getByTestId("profile-link").click()
    await expect(page.getByTestId("profile-page-wrapper")).toBeVisible()

    // Both forms used to report success while saving nothing. The store API
    // forbids changing the email outright (StoreUpdateCustomer omits it), and
    // the password flow needs a reset token the backend never issues.
    const emailEditor = page.getByTestId("account-email-editor")
    await expect(emailEditor).toBeVisible()
    await expect(emailEditor.getByTestId("edit-button")).toHaveCount(0)
    await expect(emailEditor.getByTestId("current-info")).toContainText(customer.email)

    const passwordEditor = page.getByTestId("account-password-editor")
    await expect(passwordEditor).toBeVisible()
    await expect(passwordEditor.getByTestId("edit-button")).toHaveCount(0)
  })

  test("a new shopper has no orders and is told so", async ({ page }) => {
    const customer = newCustomer("orders")
    await register(page, customer)

    // The overview lists recent orders, the orders page lists all of them.
    // Both are authenticated reads through orders.ts, which had the same
    // missing await as customer.ts.
    await expect(page.getByTestId("no-orders-message")).toBeVisible()

    await page.goto(url("account/orders"))
    await expect(page.getByTestId("no-orders-container")).toBeVisible()
  })
})
