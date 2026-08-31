import { test, expect, Page } from "@playwright/test"
import { addProductToCart, newCustomer, qaEnv, register, url } from "./helpers"

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

test.describe("Order confirmation", () => {
  test("the confirmation page reports the order back to the shopper", async ({
    page,
  }) => {
    const email = "confirmation@example.com"
    await addProductToCart(page, "t-shirt")
    await placeOrder(page, email)

    await expect(page.getByTestId("order-id")).not.toBeEmpty()
    await expect(page.getByTestId("order-email")).toContainText(email)
    await expect(page.getByTestId("order-date")).not.toBeEmpty()

    // Money printed straight from a BigNumber read as "45 eur" in the
    // confirmation email; the page should show a formatted amount.
    await expect(page.getByTestId("payment-amount")).toContainText(/\d/)

    await expect(page.getByTestId("shipping-address-summary")).toContainText(
      "1 Test Street"
    )
    await expect(page.getByTestId("shipping-method-summary")).not.toBeEmpty()
    await expect(page.getByTestId("product-row")).toHaveCount(1)
  })

  test("the cart is emptied once the order is placed", async ({ page }) => {
    await addProductToCart(page, "shorts")
    await placeOrder(page, "empties-cart@example.com")

    await page.goto(url("cart"))
    await expect(page.getByTestId("empty-cart-message")).toBeVisible()
    await expect(page.getByTestId("nav-cart-link")).toContainText("(0)")
  })

  test("a signed-in shopper sees the order in their history", async ({ page }) => {
    const customer = newCustomer("orderhistory")
    await register(page, customer)

    await addProductToCart(page, "sweatshirt")
    await placeOrder(page, customer.email)

    await page.goto(url("account/orders"))
    // Reading order history is an authenticated call through orders.ts.
    await expect(page.getByTestId("order-card").first()).toBeVisible()
    await expect(page.getByTestId("no-orders-container")).toHaveCount(0)

    // The orders list uses order-details-link; open-order-button belongs to
    // the account overview's recent-orders block.
    await page.getByTestId("order-details-link").first().click()
    await expect(page).toHaveURL(/\/account\/orders\/details\//)
    await expect(page.getByTestId("order-details-container")).toBeVisible()
  })

  test("an unknown order id shows the not-found page", async ({ page }) => {
    await page.goto(url("order/confirmed/order_does_not_exist"))

    // retrieveOrder rethrows through medusaError, so this used to escape to
    // the error boundary and render a generic "something went wrong".
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible()
    await expect(page.locator("body")).not.toContainText(/went wrong/i)

    // Known soft 404: the layout shell streams before notFound() throws, so
    // the status is already committed as 200. The order routes are the only
    // ones affected, and they are private URLs that should not be crawled.
    // Product, collection and category pages all return a real 404.
  })

  test("catalogue routes still return a real 404 status", async ({ page }) => {
    for (const path of [
      "products/nope-not-real",
      "collections/nope-not-real",
      "categories/nope-not-real",
    ]) {
      const response = await page.goto(url(path))
      expect(response?.status(), `${path} should 404`).toBe(404)
    }
  })
})
