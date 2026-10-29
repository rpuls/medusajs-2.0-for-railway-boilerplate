import { test, expect } from "@playwright/test"
import { qaEnv, url } from "./helpers"

/**
 * Asks the backend whether it has a Search Module at all. Every store this
 * template deploys has one (MeiliSearch when configured, Medusa's Postgres
 * provider otherwise), but a store can switch the module off, and then
 * `POST /store/search` answers 400 with exactly this message. That is a store
 * without search, not a broken one, so the specs skip and say so instead of
 * failing on every search box.
 */
const backendHasSearch = async (): Promise<boolean> => {
  const { publishableApiKey } = await fetch(
    `${qaEnv.backendURL}/key-exchange`
  ).then((res) => res.json())
  const res = await fetch(`${qaEnv.backendURL}/store/search`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": publishableApiKey,
    },
    body: JSON.stringify({ entity: "products", filters: { q: "shirt" } }),
  })
  const body = await res.text()
  return !(res.status === 400 && /Search Module is not installed/.test(body))
}

test.describe("Search", () => {
  test.skip(!qaEnv.searchEnabled, "search feature flag is off")

  let hasSearch = true
  test.beforeAll(async () => {
    hasSearch = await backendHasSearch()
  })
  test.beforeEach(() => {
    test.skip(!hasSearch, "the backend has no Search Module")
  })

  test("searching from the nav returns matching products", async ({ page }) => {
    await page.goto(url())
    await page.getByTestId("nav-search-link").click()

    await expect(page.getByTestId("search-modal-container")).toBeVisible()
    await page.getByTestId("search-input").fill("shirt")

    const results = page.getByTestId("search-results")
    await expect(results).toBeVisible()
    await expect(
      results.getByTestId("search-result-title").first()
    ).toContainText(/shirt/i)
  })

  test("a search result opens its product page", async ({ page }) => {
    await page.goto(url("search"))
    await page.getByTestId("search-input").fill("shirt")

    const first = page.getByTestId("search-result").first()
    await expect(first).toBeVisible()
    await first.click()

    await expect(page).toHaveURL(/\/products\//)
    await expect(page.getByTestId("product-container")).toBeVisible()
  })

  test("a search with no matches says so", async ({ page }) => {
    await page.goto(url("search"))
    await page.getByTestId("search-input").fill("zzzzznotaproduct")

    await expect(page.getByTestId("no-search-results-container")).toBeVisible()
  })

  test("the results page lists matches for a query", async ({ page }) => {
    await page.goto(url("results/shirt"))

    // Search silently returned nothing when the API key fell back to
    // "test_key", which authenticates against no Meilisearch instance.
    await expect(page.getByTestId("product-wrapper").first()).toBeVisible()
  })

  test("the results count does not change between server and client render", async ({
    page,
  }) => {
    const hydrationErrors: string[] = []
    page.on("console", (message) => {
      const text = message.text()
      if (/hydrat|did not match|Text content does not match/i.test(text)) {
        hydrationErrors.push(text)
      }
    })

    await page.goto(url("results/shirt"))
    await expect(page.getByTestId("product-wrapper").first()).toBeVisible()

    // The count used to read window.innerWidth during render, which differs
    // between the server and the browser.
    expect(hydrationErrors).toEqual([])
  })
})
