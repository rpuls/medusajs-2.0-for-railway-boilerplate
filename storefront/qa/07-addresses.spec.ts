import { test, expect } from "@playwright/test"
import { newCustomer, qaEnv, register, url } from "./helpers"

/**
 * Address writes go through createAddress, updateAddress and deleteAddress in
 * customer.ts, all of which passed an unawaited getAuthHeaders(), so every one
 * of them was unauthenticated.
 */
test.describe("Address book", () => {
  test("an address can be added, edited and deleted", async ({ page }) => {
    const customer = newCustomer("address")
    await register(page, customer)

    await page.goto(url("account/addresses"))
    await expect(page.getByTestId("addresses-page-wrapper")).toBeVisible()

    await test.step("add", async () => {
      await page.getByTestId("add-address-button").click()
      const modal = page.getByTestId("add-address-modal")
      await expect(modal).toBeVisible()

      await modal.getByTestId("first-name-input").fill("Quinn")
      await modal.getByTestId("last-name-input").fill("Tester")
      await modal.getByTestId("address-1-input").fill("1 Test Street")
      await modal.getByTestId("postal-code-input").fill("SW1A 1AA")
      await modal.getByTestId("city-input").fill("London")
      await modal.getByTestId("country-select").selectOption({ value: qaEnv.region })
      await modal.getByTestId("save-button").click()

      await expect(modal).toBeHidden()
      const card = page.getByTestId("address-container")
      await expect(card).toHaveCount(1)
      await expect(card.getByTestId("address-name")).toContainText("Quinn Tester")
      await expect(card.getByTestId("address-address")).toContainText(
        "1 Test Street"
      )
    })

    await test.step("edit", async () => {
      await page.getByTestId("address-edit-button").click()
      const modal = page.getByTestId("edit-address-modal")
      await expect(modal).toBeVisible()

      await modal.getByTestId("city-input").fill("Manchester")
      await modal.getByTestId("save-button").click()
      await expect(modal).toBeHidden()

      await expect(
        page.getByTestId("address-container").getByTestId("address-postal-city")
      ).toContainText("Manchester")
    })

    await test.step("persist across a reload", async () => {
      await page.reload()
      await expect(
        page.getByTestId("address-container").getByTestId("address-postal-city")
      ).toContainText("Manchester")
    })

    await test.step("delete", async () => {
      await page.getByTestId("address-delete-button").click()
      await expect(page.getByTestId("address-container")).toHaveCount(0)
    })
  })

  test("the saved address count reflects what was added", async ({ page }) => {
    const customer = newCustomer("addrcount")
    await register(page, customer)

    await expect(page.getByTestId("addresses-count")).toContainText("0")

    await page.goto(url("account/addresses"))
    await page.getByTestId("add-address-button").click()
    const modal = page.getByTestId("add-address-modal")
    await modal.getByTestId("first-name-input").fill("Quinn")
    await modal.getByTestId("last-name-input").fill("Tester")
    await modal.getByTestId("address-1-input").fill("2 Test Street")
    await modal.getByTestId("postal-code-input").fill("SW1A 1AA")
    await modal.getByTestId("city-input").fill("London")
    await modal.getByTestId("country-select").selectOption({ value: qaEnv.region })
    await modal.getByTestId("save-button").click()
    await expect(modal).toBeHidden()

    await page.goto(url("account"))
    await expect(page.getByTestId("addresses-count")).toContainText("1")
  })
})
