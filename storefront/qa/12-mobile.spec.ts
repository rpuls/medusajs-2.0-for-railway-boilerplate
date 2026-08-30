import { test, expect, devices } from "@playwright/test"
import { expectCartCount, newCustomer, qaEnv, register, url } from "./helpers"

/**
 * The storefront ships a separate mobile experience: a sticky action bar on
 * product pages, a bottom-sheet variant picker, and a drill-down account nav.
 * None of it renders at desktop widths, so it was completely untested.
 */
test.use({ ...devices["Pixel 7"] })


/**
 * The sticky bar is shown when the in-page add-to-cart scrolls out of view,
 * and Headless UI unmounts it entirely while hidden. Lazy-loaded images in the
 * related-products rail shift layout as they arrive, which can scroll the
 * desktop actions back into view and unmount the bar again, so settle the page
 * first and then wait for the bar itself.
 */
const revealMobileBar = async (page: import("@playwright/test").Page) => {
  await page.getByTestId("product-container").waitFor({ state: "visible" })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState("networkidle").catch(() => {})
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(page.getByTestId("mobile-actions")).toBeVisible()
}


/** Picks one choice per option group inside the sheet, then closes it. */
const chooseVariantInSheet = async (page: import("@playwright/test").Page) => {
  await page.getByTestId("mobile-actions-button").click()
  const sheet = page.getByTestId("mobile-actions-modal")
  await expect(sheet).toBeVisible()

  // Products can have several option groups (the t-shirt has size and colour),
  // and the sheet stays open until the shopper dismisses it.
  const groups = sheet.getByTestId("product-options")
  const count = await groups.count()
  for (let i = 0; i < count; i++) {
    await groups.nth(i).getByTestId("option-button").first().click()
  }

  await page.getByTestId("close-modal-button").click()
  await expect(sheet).toBeHidden()
}

test.describe("Mobile", () => {
  test("the sticky product action bar appears when scrolled past", async ({
    page,
  }) => {
    await page.goto(url("products/t-shirt"))
    await revealMobileBar(page)

    await expect(
      page.getByTestId("mobile-actions").getByTestId("mobile-title")
    ).toContainText(/t-shirt/i)
  })

  test("a variant can be picked and added from the mobile sheet", async ({
    page,
  }) => {
    await page.goto(url("products/t-shirt"))
    await revealMobileBar(page)

    await chooseVariantInSheet(page)

    const addButton = page.getByTestId("mobile-cart-button")
    await expect(addButton).toBeEnabled()
    await addButton.click()

    // What this test is for is that the sheet resolves a variant and the add
    // lands, not that the nav repaints. The repaint defect has its own test.
    await expectCartCount(page, 1, "adding from the mobile sheet")
  })

  test("the mobile account nav drills into the profile and back", async ({
    page,
  }) => {
    const customer = newCustomer("mobile")
    await register(page, customer)

    const nav = page.getByTestId("mobile-account-nav")
    await expect(nav).toBeVisible()

    await nav.getByTestId("profile-link").click()
    await expect(page.getByTestId("profile-page-wrapper")).toBeVisible()

    await page.getByTestId("account-main-link").click()
    await expect(page.getByTestId("mobile-account-nav")).toBeVisible()
  })

  test("the side menu works on a small screen", async ({ page }) => {
    await page.goto(url())

    await page.getByTestId("nav-menu-button").click()
    const menu = page.getByTestId("nav-menu-popup")
    await expect(menu).toBeVisible()
    await expect(menu.getByTestId("store-link")).toBeVisible()

    await menu.getByTestId("close-menu-button").click()
    await expect(menu).toBeHidden()
  })

  test("checkout is completable on a phone", async ({ page }) => {
    await page.goto(url("products/shorts"))
    await revealMobileBar(page)
    await chooseVariantInSheet(page)
    await page.getByTestId("mobile-cart-button").click()
    await expectCartCount(page, 1, "adding from the mobile bar")

    await page.goto(url("cart"))
    await page.getByTestId("checkout-button").click()

    await page.getByTestId("shipping-first-name-input").fill("Quinn")
    await page.getByTestId("shipping-last-name-input").fill("Tester")
    await page.getByTestId("shipping-address-input").fill("1 Test Street")
    await page.getByTestId("shipping-postal-code-input").fill("SW1A 1AA")
    await page.getByTestId("shipping-city-input").fill("London")
    await page
      .getByTestId("shipping-country-select")
      .selectOption({ value: qaEnv.region })
    await page.getByTestId("shipping-email-input").fill("mobile@example.com")
    await page.getByTestId("submit-address-button").click()

    await page.getByTestId("delivery-option-radio").first().click()
    await page.getByTestId("submit-delivery-option-button").click()
    await page.getByTestId("payment-option-radio").first().click()
    await page.getByTestId("submit-payment-button").click()
    await page.getByTestId("submit-order-button").click()

    await expect(page.getByTestId("order-complete-container")).toBeVisible({
      timeout: 60_000,
    })
  })
})
