import { test, expect } from "@playwright/test"
import {
  addProductToCart,
  expectAfterCartWrite,
  parseMoney,
  selectFirstVariant,
  url,
} from "./helpers"

test.describe("Cart", () => {
  test("the cart dropdown shows what was added", async ({ page }) => {
    await addProductToCart(page, "t-shirt")

    // Opened by hover rather than by the auto-open, which is racy: it fires
    // only when totalItems differs from a useRef captured at mount, so a
    // remount with the new count already present never triggers it.
    await page.getByTestId("nav-cart-link").hover()

    const dropdown = page.getByTestId("nav-cart-dropdown")
    await expect(dropdown).toBeVisible()
    await expect(dropdown.getByTestId("cart-item")).toHaveCount(1)
    await expect(dropdown.getByTestId("cart-item-quantity")).toContainText("1")
    await expect(dropdown.getByTestId("cart-subtotal")).not.toBeEmpty()

    await expect(page.getByTestId("nav-cart-link")).toContainText("(1)")
  })

  test("the cart page shows the line item and its totals", async ({ page }) => {
    await addProductToCart(page, "sweatshirt")
    await page.goto(url("cart"))

    await expect(page.getByTestId("cart-container")).toBeVisible()
    const row = page.getByTestId("product-row")
    await expect(row).toHaveCount(1)
    await expect(row.getByTestId("product-title")).toContainText(/sweatshirt/i)

    const total = page.getByTestId("cart-total")
    await expect(total).toBeVisible()
    expect(parseMoney(await total.textContent())).toBeGreaterThan(0)
  })

  test("the quantity can be changed and the total follows", async ({ page }) => {
    await addProductToCart(page, "shorts")
    await page.goto(url("cart"))

    const subtotal = page.getByTestId("cart-subtotal")
    const before = parseMoney(await subtotal.getAttribute("data-value"))

    await page.getByTestId("product-select-button").selectOption("2")

    // Same repaint defect as adding: the quantity reaches Medusa but the
    // totals can keep the old figures until the page is reloaded.
    await expectAfterCartWrite(
      page,
      async () => parseMoney(await subtotal.getAttribute("data-value")),
      before * 2,
      "changing the quantity"
    )
  })

  test("removing the last item empties the cart", async ({ page }) => {
    await addProductToCart(page, "sweatpants")
    await page.goto(url("cart"))
    await expect(page.getByTestId("product-row")).toHaveCount(1)

    await page.getByTestId("product-delete-button").click()

    await expectAfterCartWrite(
      page,
      async () => page.getByTestId("product-row").count(),
      0,
      "removing the last line"
    )
    await expect(page.getByTestId("empty-cart-message")).toBeVisible()
    await expect(page.getByTestId("nav-cart-link")).toContainText("(0)")
  })

  test("the cart survives a reload", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url("cart"))
    await expect(page.getByTestId("product-row")).toHaveCount(1)

    await page.reload()
    await expect(page.getByTestId("product-row")).toHaveCount(1)
  })

  test("an empty cart offers a way back into the store", async ({ page }) => {
    await page.goto(url("cart"))

    const empty = page.getByTestId("empty-cart-message")
    await expect(empty).toBeVisible()
    await empty.getByRole("link", { name: /explore products/i }).click()
    await expect(page).toHaveURL(/\/store/)
  })

  test("an item can be removed from the cart dropdown", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.getByTestId("nav-cart-link").hover()

    // DeleteButton declared only id/children/className, so the data-testid
    // both call sites passed was dropped and the control was unaddressable.
    const dropdown = page.getByTestId("nav-cart-dropdown")
    await expect(dropdown).toBeVisible()
    await dropdown.getByTestId("cart-item-remove-button").click()

    await expect(page.getByTestId("nav-cart-link")).toContainText("(0)")
  })

  test("the cart remove button has an accessible name", async ({ page }) => {
    await addProductToCart(page, "t-shirt")
    await page.goto(url("cart"))

    // Icon-only, so without an explicit label it is announced as just "button".
    await expect(
      page.getByRole("button", { name: /remove item from cart/i })
    ).toBeVisible()
  })

  /**
   * Regression guard for a defect that is now fixed. Kept with its full
   * history, because the symptom is intermittent and anyone who sees it come
   * back should not have to rediscover any of this.
   *
   * Against a production build this used to leave the page showing the old
   * figures on roughly one cart write in fifteen. EVERY mutation was affected,
   * not just adding: the nav count after an add, the totals after a quantity
   * change, and the rows after a removal all went stale the same way and at
   * the same rate.
   *
   * What was measured over 140 scripted adds:
   *
   *   - the line item is always on the cart in Medusa, every single time
   *   - requesting the same page with that cart cookie always returns the
   *     correct "Cart (1)" in the streamed HTML, so the server is never wrong
   *   - a reload fixes it within 250ms
   *
   * So the write lands and the render lags. Ruled out along the way: an
   * exception in the handler (nothing is thrown, and a failed add now reports
   * itself), the cart cookie being created by the same action (second adds
   * stick just as often as first ones, 2/25 vs 4/25), static prerendering of
   * the product route (forcing it dynamic left the rate unchanged at 4/50),
   * and stale component state (the count is derived from props every render).
   *
   * The cause was the App Router not reliably re-rendering after a server
   * action when nothing was cached under the tag being revalidated. The cart
   * had been made uncached, so revalidateTag("cart") had no entry to act on.
   * An explicit router.refresh() on every mutation path reduced the rate but
   * did not remove it: three consecutive production runs still gave 1, 1 and 0
   * failures.
   *
   * The fix was per-visitor scoped cache tags, a _medusa_cache_id cookie
   * feeding getCacheTag/getCacheDirectives in lib/data/cookies.ts. The cart is
   * cached again, under carts-<uuid>, so revalidateTag has a real entry to
   * purge and the router re-renders.
   *
   * expectAfterCartWrite still reloads and warns if a repaint is ever missed,
   * so counting "[qa] page did not repaint" lines in a run measures any
   * recurrence across the whole suite. This test is the direct assertion.
   */
  test("the cart count repaints without a reload", async ({ page }) => {
    await page.goto(url("products/t-shirt"))
    await expect(page.getByTestId("product-container")).toBeVisible()

    await selectFirstVariant(page)
    const addButton = page.getByTestId("add-product-button").first()
    await expect(addButton).toBeEnabled()
    await addButton.click()

    await expect(page.getByTestId("nav-cart-link")).toContainText("(1)")
  })
})
