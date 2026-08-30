import { test, expect } from "@playwright/test"
import { addProductToCart, newCustomer, qaEnv, register, url } from "./helpers"

/**
 * Everything here is driven by Headless UI primitives: Popover for the side
 * menu and cart dropdown, Dialog for modals, Listbox for the country select,
 * Disclosure for the account editors and RadioGroup for the checkout steps.
 *
 * They are grouped deliberately, so a Headless UI upgrade can be validated in
 * one run rather than discovered in production.
 */
test.describe("Interactive UI", () => {
  test("the side menu opens, lists links and closes", async ({ page }) => {
    await page.goto(url())

    await page.getByTestId("nav-menu-button").click()
    const menu = page.getByTestId("nav-menu-popup")
    await expect(menu).toBeVisible()

    await expect(menu.getByTestId("home-link")).toBeVisible()
    await expect(menu.getByTestId("store-link")).toBeVisible()
    await expect(menu.getByTestId("account-link")).toBeVisible()
    await expect(menu.getByTestId("cart-link")).toBeVisible()
    await expect(menu).toContainText(qaEnv.storeName)

    await menu.getByTestId("close-menu-button").click()
    await expect(menu).toBeHidden()
  })

  test("the side menu navigates to the store", async ({ page }) => {
    await page.goto(url())

    await page.getByTestId("nav-menu-button").click()
    await page.getByTestId("nav-menu-popup").getByTestId("store-link").click()

    await expect(page).toHaveURL(new RegExp(`/${qaEnv.region}/store`))
    await expect(page.getByTestId("store-page-title")).toBeVisible()
  })

  test("the country select offers the regions the store covers", async ({ page }) => {
    await page.goto(url())
    await page.getByTestId("nav-menu-button").click()

    const menu = page.getByTestId("nav-menu-popup")
    await menu.getByTestId("shipping-to-button").hover()

    const choices = menu.getByTestId("shipping-to-choices")
    await expect(choices).toBeVisible()
    // The seed creates one Europe region; the storefront default must be one
    // of the countries it covers.
    await expect(
      choices.getByTestId(`select-${qaEnv.region}-choice`)
    ).toBeVisible()
  })

  test("switching country moves the storefront to that region", async ({ page }) => {
    await page.goto(url())
    await page.getByTestId("nav-menu-button").click()

    const menu = page.getByTestId("nav-menu-popup")
    await menu.getByTestId("shipping-to-button").hover()
    await menu.getByTestId("shipping-to-choices").waitFor({ state: "visible" })
    await menu.getByTestId("select-de-choice").click()

    await expect(page).toHaveURL(/\/de(\/|$)/)
    await expect(page.getByTestId("nav-store-link")).toBeVisible()
  })

  test("the cart dropdown opens on hover and links to the cart", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url())

    await page.getByTestId("nav-cart-link").hover()
    const dropdown = page.getByTestId("nav-cart-dropdown")
    await expect(dropdown).toBeVisible()

    await dropdown.getByTestId("go-to-cart-button").click()
    await expect(page).toHaveURL(/\/cart/)
  })

  test("the search modal opens and closes", async ({ page }) => {
    test.skip(!qaEnv.searchEnabled, "search feature flag is off")
    await page.goto(url())

    await page.getByTestId("nav-search-link").click()
    await expect(page.getByTestId("search-modal-container")).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(page.getByTestId("search-modal-container")).toBeHidden()
  })

  test("the search modal is announced as a dialog and traps focus", async ({
    page,
  }) => {
    test.skip(!qaEnv.searchEnabled, "search feature flag is off")
    await page.goto(url())
    await page.getByTestId("nav-search-link").click()

    const dialog = page.getByTestId("search-modal-container")
    await expect(dialog).toBeVisible()
    await expect(dialog).toHaveAttribute("role", "dialog")
    await expect(dialog).toHaveAttribute("aria-modal", "true")

    // Tab used to walk straight out into the page behind the overlay, which is
    // invisible but still interactive.
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab")
    }
    const stillInside = await dialog.evaluate((el) =>
      el.contains(document.activeElement)
    )
    expect(stillInside).toBe(true)
  })

  test("the side menu close button has an accessible name", async ({ page }) => {
    await page.goto(url())
    await page.getByTestId("nav-menu-button").click()
    await expect(page.getByTestId("nav-menu-popup")).toBeVisible()

    await expect(page.getByRole("button", { name: /close menu/i })).toBeVisible()
  })

  test("search results are a real list", async ({ page }) => {
    test.skip(!qaEnv.searchEnabled, "search feature flag is off")
    await page.goto(url("search"))
    await page.getByTestId("search-input").fill("shirt")

    const results = page.getByTestId("search-results")
    await expect(results).toBeVisible()
    // The items were <li> inside a <div>, which is invalid markup.
    expect(await results.evaluate((el) => el.tagName)).toBe("UL")
  })

  test("the address modal opens, cancels and reopens", async ({ page }) => {
    const customer = newCustomer("modal")
    await register(page, customer)
    await page.goto(url("account/addresses"))

    await page.getByTestId("add-address-button").click()
    const modal = page.getByTestId("add-address-modal")
    await expect(modal).toBeVisible()

    await modal.getByTestId("cancel-button").click()
    await expect(modal).toBeHidden()

    await page.getByTestId("add-address-button").click()
    await expect(page.getByTestId("add-address-modal")).toBeVisible()
  })

  test("the account editors expand and collapse", async ({ page }) => {
    const customer = newCustomer("disclosure")
    await register(page, customer)
    await page.getByTestId("account-nav").getByTestId("profile-link").click()
    await expect(page.getByTestId("profile-page-wrapper")).toBeVisible()

    const editor = page.getByTestId("account-name-editor")
    await expect(editor.getByTestId("first-name-input")).toBeHidden()

    await editor.getByTestId("edit-button").click()
    await expect(editor.getByTestId("first-name-input")).toBeVisible()

    // The button toggles to Cancel once the editor is open.
    await editor.getByTestId("edit-button").click()
    await expect(editor.getByTestId("first-name-input")).toBeHidden()
  })

  test("the checkout delivery and payment radios are selectable", async ({
    page,
  }) => {
    await addProductToCart(page, "shorts")
    await page.goto(url("checkout?step=address"))

    await page.getByTestId("shipping-first-name-input").fill("Quinn")
    await page.getByTestId("shipping-last-name-input").fill("Tester")
    await page.getByTestId("shipping-address-input").fill("1 Test Street")
    await page.getByTestId("shipping-postal-code-input").fill("SW1A 1AA")
    await page.getByTestId("shipping-city-input").fill("London")
    await page
      .getByTestId("shipping-country-select")
      .selectOption({ value: qaEnv.region })
    await page.getByTestId("shipping-email-input").fill("radios@example.com")
    await page.getByTestId("submit-address-button").click()

    const delivery = page.getByTestId("delivery-option-radio").first()
    await expect(delivery).toBeVisible()
    await delivery.click()
    await page.getByTestId("submit-delivery-option-button").click()

    const payment = page.getByTestId("payment-option-radio").first()
    await expect(payment).toBeVisible()
    await payment.click()
    await expect(page.getByTestId("submit-payment-button")).toBeEnabled()
  })
})
