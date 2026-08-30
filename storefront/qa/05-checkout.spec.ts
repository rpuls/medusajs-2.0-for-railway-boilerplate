import { test, expect, Page } from "@playwright/test"
import { addProductToCart, qaEnv, url } from "./helpers"

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

const chooseDelivery = async (page: Page) => {
  await expect(page.getByTestId("delivery-options-container")).toBeVisible()
  await page.getByTestId("delivery-option-radio").first().click()
  await page.getByTestId("submit-delivery-option-button").click()
}

test.describe("Checkout", () => {
  test("a guest can complete an order end to end", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url("cart"))
    await page.getByTestId("checkout-button").click()

    await expect(page).toHaveURL(/\/checkout/)
    await fillShippingAddress(page, "guest-checkout@example.com")
    await chooseDelivery(page)

    // Without STRIPE_API_KEY the backend registers only the manual provider,
    // which is what a default deploy gets. The submit button stays disabled
    // until a method is picked, and PaymentContainer carried no testid at all.
    await page.getByTestId("payment-option-radio").first().click()
    await page.getByTestId("submit-payment-button").click()

    const placeOrder = page.getByTestId("submit-order-button")
    await expect(placeOrder).toBeEnabled()
    await placeOrder.click()

    await expect(page.getByTestId("order-complete-container")).toBeVisible({
      timeout: 60_000,
    })
    await expect(page).toHaveURL(/\/order\/confirmed\//)
  })

  test("the checkout header carries the store name and returns to the cart", async ({
    page,
  }) => {
    await addProductToCart(page, "shorts")
    await page.goto(url("checkout?step=address"))

    await expect(page.getByTestId("store-link")).toHaveText(qaEnv.storeName)
    await page.getByTestId("back-to-cart-link").click()
    await expect(page).toHaveURL(/\/cart/)
  })

  test("the address step refuses to advance while required fields are empty", async ({
    page,
  }) => {
    await addProductToCart(page, "sweatshirt")
    await page.goto(url("checkout?step=address"))

    await page.getByTestId("submit-address-button").click()

    // Still on the address step rather than silently moving on.
    await expect(page.getByTestId("shipping-first-name-input")).toBeVisible()
  })

  test("a missing Stripe key explains itself instead of blanking checkout", async ({
    page,
  }) => {
    test.skip(qaEnv.stripeConfigured, "Stripe is configured in this environment")

    await addProductToCart(page, "sweatpants")
    await page.goto(url("checkout?step=address"))
    await fillShippingAddress(page, "stripe-check@example.com")
    await chooseDelivery(page)

    // stripe-wrapper used to throw during render, and with no error.tsx
    // anywhere the whole payment step went blank. Reaching the payment step at
    // all is the assertion here.
    await expect(page.getByTestId("submit-payment-button")).toBeVisible()
    await expect(page.locator("body")).not.toContainText(
      /application error|client-side exception/i
    )
  })

  test("a European address without a province is accepted", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url("checkout?step=address"))

    // Checkout marked State / Province required while all three account
    // address forms left it optional, so shoppers in the countries the seed
    // covers could not get past the first step.
    await expect(page.getByTestId("shipping-province-input")).not.toHaveAttribute(
      "required",
      ""
    )

    await fillShippingAddress(page, "no-province@example.com")
    await expect(page.getByTestId("delivery-options-container")).toBeVisible()
  })

  test("checkout is reachable straight from the cart page", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url("cart"))

    const checkout = page.getByTestId("checkout-button")
    await expect(checkout).toBeEnabled()
    await checkout.click()
    await expect(page).toHaveURL(/\/checkout/)
  })
})
