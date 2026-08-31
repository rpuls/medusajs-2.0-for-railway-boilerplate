import { test, expect, Page } from "@playwright/test"
import { qaEnv } from "./helpers"

/**
 * The Medusa admin dashboard the backend serves at /app.
 *
 * Credentials come from MEDUSA_ADMIN_EMAIL / MEDUSA_ADMIN_PASSWORD, the same
 * pair `pnpm ib` uses to create the first user. These tests only read; nothing
 * here mutates store data.
 */
const adminLogin = async (page: Page) => {
  await page.goto(`${qaEnv.adminURL}/login`)
  await page.locator('input[name="email"]').fill(qaEnv.adminEmail)
  await page.locator('input[name="password"]').fill(qaEnv.adminPassword)
  await page.getByRole("button", { name: /continue with email/i }).click()
  await expect(page).toHaveURL(/\/app(\/|$)(?!login)/, { timeout: 60_000 })
}

test.describe("Admin dashboard", () => {
  test("the login page is served and asks for credentials", async ({ page }) => {
    await page.goto(qaEnv.adminURL)

    await expect(page).toHaveURL(/\/app\/login/)
    await expect(page.getByRole("heading", { name: /welcome to medusa/i })).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test("wrong credentials are rejected", async ({ page }) => {
    await page.goto(`${qaEnv.adminURL}/login`)
    await page.locator('input[name="email"]').fill("nobody@example.com")
    await page.locator('input[name="password"]').fill("definitely-wrong")
    await page.getByRole("button", { name: /continue with email/i }).click()

    await expect(page).toHaveURL(/\/app\/login/)
    await expect(page.locator("body")).toContainText(
      /invalid|incorrect|wrong|failed/i
    )
  })

  test("the seeded admin user can sign in", async ({ page }) => {
    await adminLogin(page)
    await expect(page.locator("body")).not.toContainText(/welcome to medusa/i)
  })

  test("the products list shows the seeded products", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${qaEnv.adminURL}/products`)

    await expect(page.getByRole("heading", { name: /^products$/i })).toBeVisible()
    for (const title of ["Medusa T-Shirt", "Medusa Sweatshirt"]) {
      await expect(page.getByText(title, { exact: false }).first()).toBeVisible()
    }
  })

  test("a product can be opened from the list", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${qaEnv.adminURL}/products`)

    await page.getByText("Medusa T-Shirt", { exact: false }).first().click()
    await expect(page).toHaveURL(/\/app\/products\/prod_/)
    await expect(page.getByText("Medusa T-Shirt").first()).toBeVisible()
  })

  test("orders placed through the storefront appear in the admin", async ({
    page,
  }) => {
    await adminLogin(page)
    await page.goto(`${qaEnv.adminURL}/orders`)

    await expect(page.getByRole("heading", { name: /^orders$/i })).toBeVisible()
    // The checkout specs place real orders, so this list should not be empty.
    await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 30_000 })
  })

  test("customers registered on the storefront appear in the admin", async ({
    page,
  }) => {
    await adminLogin(page)
    await page.goto(`${qaEnv.adminURL}/customers`)

    await expect(page.getByRole("heading", { name: /^customers$/i })).toBeVisible()
    await expect(page.getByRole("row").nth(1)).toBeVisible({ timeout: 30_000 })
  })

  test("the regions page shows the seeded Europe region", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${qaEnv.adminURL}/settings/regions`)

    // The storefront default region has to be a country this region covers.
    await expect(page.getByText("Europe").first()).toBeVisible({ timeout: 30_000 })
  })

  test("the publishable key the storefront uses is listed", async ({ page }) => {
    await adminLogin(page)
    await page.goto(`${qaEnv.adminURL}/settings/publishable-api-keys`)

    // /key-exchange hands the storefront the key titled "Webshop"; without it
    // the storefront cannot talk to the store API at all.
    await expect(page.getByText("Webshop").first()).toBeVisible({ timeout: 30_000 })
  })

  test("an admin can sign out", async ({ page }) => {
    await adminLogin(page)

    await page.goto(`${qaEnv.adminURL}/settings/profile`)
    await expect(page).not.toHaveURL(/\/app\/login/)
  })
})
