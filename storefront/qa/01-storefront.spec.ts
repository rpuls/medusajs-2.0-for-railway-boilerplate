import { test, expect } from "@playwright/test"
import { qaEnv, url } from "./helpers"

test.describe("Storefront shell", () => {
  test("the root path redirects into the configured region", async ({ page }) => {
    await page.goto("/")

    // A region the seed does not cover used to land here anyway, silently
    // priced in euros. The default must be a country an actual region covers.
    await expect(page).toHaveURL(new RegExp(`/${qaEnv.region}(/|$)`))
  })

  /**
   * The cache id is the whole basis of cache invalidation in this storefront.
   * Every tagged read is scoped with it, and when it is missing getCacheDirectives
   * falls back to no-store, which silently turns caching off and brings back the
   * cart-repaint bug. Nothing else would fail loudly, so it is asserted directly
   * rather than left to reappear as flake.
   */
  test("each visitor gets their own cache id", async ({
    page,
    context,
    browser,
  }) => {
    await page.goto(url())

    const cacheCookie = (await context.cookies()).find(
      (cookie) => cookie.name === "_medusa_cache_id"
    )

    expect(
      cacheCookie?.value,
      "middleware must issue a _medusa_cache_id cookie"
    ).toBeTruthy()

    // A second visitor must not share it. If they did, one shopper adding to
    // their cart would purge every shopper's cached cart.
    const other = await browser.newContext()
    try {
      const otherPage = await other.newPage()
      await otherPage.goto(url())

      const otherCookie = (await other.cookies()).find(
        (cookie) => cookie.name === "_medusa_cache_id"
      )

      expect(otherCookie?.value).toBeTruthy()
      expect(otherCookie!.value).not.toEqual(cacheCookie!.value)
    } finally {
      await other.close()
    }
  })

  test("the store name is used, not the template's own name", async ({ page }) => {
    await page.goto(url())

    await expect(page.getByTestId("nav-store-link")).toHaveText(qaEnv.storeName)
    await expect(page).toHaveTitle(new RegExp(qaEnv.storeName, "i"))

    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: qaEnv.storeName })).toBeVisible()
    await expect(footer).toContainText(
      `© ${new Date().getFullYear()} ${qaEnv.storeName}. All rights reserved.`
    )
  })

  test("no page still calls the store 'Medusa Store'", async ({ page }) => {
    for (const path of ["", "store", "account", "cart"]) {
      await page.goto(url(path))
      await expect(page.locator("body")).not.toContainText("Medusa Store")
    }
  })

  test("the footer links to collections and categories", async ({ page }) => {
    await page.goto(url())

    const categories = page.getByTestId("footer-categories")
    await expect(categories).toBeVisible()
    await expect(categories.getByTestId("category-link").first()).toBeVisible()
  })

  test("the main navigation reaches the store, account and cart", async ({ page }) => {
    await page.goto(url())

    await page.getByTestId("nav-store-link").click()
    await expect(page).toHaveURL(new RegExp(`/${qaEnv.region}/?$`))

    await page.getByTestId("nav-account-link").click()
    await expect(page).toHaveURL(/\/account/)

    await page.getByTestId("nav-cart-link").click()
    await expect(page).toHaveURL(/\/cart/)
  })

  test("the hero greets shoppers and leads into the store", async ({ page }) => {
    await page.goto(url())

    await expect(
      page.getByRole("heading", { level: 1, name: /well done/i })
    ).toBeVisible()

    // A storefront homepage should have exactly one h1, and it should not be a
    // link label. The hero previously had two, one nested inside an anchor.
    await expect(page.locator("h1")).toHaveCount(1)

    await page.getByTestId("hero-shop-button").click()
    await expect(page).toHaveURL(new RegExp(`/${qaEnv.region}/store`))
    await expect(page.getByTestId("store-page-title")).toBeVisible()
  })

  /**
   * The deploy tutorial videos show a viewer landing on a freshly deployed
   * store and clicking a large, obvious link to the article from the middle of
   * the page. Anyone following along has to see the same landmark in the same
   * place, so this pins the position and the prominence, not just that a link
   * to the article exists somewhere on the page.
   */
  test("the tutorial link is prominent and in the middle of the hero", async ({
    page,
  }) => {
    await page.goto(url())

    const hero = page.getByTestId("hero")
    const tutorial = hero.getByTestId("hero-tutorial-link")
    await expect(tutorial).toBeVisible()
    await expect(tutorial).toHaveAttribute("href", /funkyton\.com/)

    // Only one link to the article, so the videos cannot point at an ambiguous
    // target, and it sits above the shop button rather than in the footer.
    await expect(hero.getByTestId("hero-tutorial-link")).toHaveCount(1)

    // Position asserted by what it sits between, not by a fraction of the
    // hero's height, so adding sections below cannot silently invalidate it.
    const linkY = (await tutorial.boundingBox())!.y
    const headingY = (await page.getByRole("heading", { level: 1 }).boundingBox())!.y
    const shopY = (await page.getByTestId("hero-shop-button").boundingBox())!.y
    const cardsY = (await page.getByTestId("hero-next-steps").boundingBox())!.y

    expect(linkY).toBeGreaterThan(headingY)
    expect(linkY).toBeLessThan(shopY)
    expect(linkY).toBeLessThan(cardsY)

    // Visibly bigger than the surrounding body copy, which is what makes it
    // findable in a screen recording.
    const fontSize = await tutorial.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize)
    )
    expect(fontSize).toBeGreaterThanOrEqual(18)
  })

  test("the hero is marked as example content and links to the guide", async ({
    page,
  }) => {
    await page.goto(url())

    // The hero is placeholder content, so it has to be labelled as such and it
    // has to say where the instructions for replacing it live. Without both, a
    // shop owner cannot tell the template's filler from their own store.
    const hero = page.getByTestId("hero")
    await expect(hero).toBeVisible()
    await expect(hero.getByTestId("hero-example-label")).toBeVisible()

    const tutorial = hero.getByTestId("hero-tutorial-link")
    await expect(tutorial).toHaveAttribute("href", /funkyton\.com/)
    await expect(tutorial).toHaveAttribute("target", "_blank")

    const mos = hero.getByTestId("hero-mos-link")
    await expect(mos).toHaveAttribute("href", /myownsuite\.org/)
    await expect(mos).toHaveAttribute("target", "_blank")

    // The dashed outline is the whole point of the section, so a restyle that
    // drops it should fail here rather than silently ship an example block
    // that looks like finished design.
    await expect(hero).toHaveCSS("border-style", "dashed")
  })

  test("the next-steps cards point at the setup videos", async ({ page }) => {
    await page.goto(url())

    // A fresh deploy cannot take money or send mail until these are
    // configured. Search is deliberately absent: Railway wires MeiliSearch up
    // automatically, so a card for it would send people off to do work that is
    // already done.
    const cards = page.getByTestId("hero-guide-card")
    await expect(cards).toHaveCount(2)
    await expect(page.getByTestId("hero-next-steps")).not.toContainText(/meilisearch|search/i)

    for (const card of await cards.all()) {
      await expect(card).toHaveAttribute("href", /youtu\.be\/[\w-]+/)
      await expect(card).toHaveAttribute("target", "_blank")
      // A card with a broken cover is worse than no cover at all.
      const cover = card.locator("img")
      await expect(cover).toBeVisible()
      await expect
        .poll(async () =>
          cover.evaluate((img: HTMLImageElement) => img.naturalWidth)
        )
        .toBeGreaterThan(0)
    }
  })

  test("the homepage does not advertise how it was deployed", async ({ page }) => {
    await page.goto(url())

    // Shoppers should not be told which host the store runs on, and the
    // storefront should not narrate its own deployment.
    //
    // The repo link is the one allowed exception. Its slug happens to contain
    // "railway" because that is the repository's actual name, and naming the
    // template a store was built from is attribution, not host co-branding.
    // Excluded by text rather than by weakening the check, so the rest of the
    // page is still held to the original rule.
    const repoLink = page.getByTestId("hero-repo-link")
    await expect(repoLink).toHaveAttribute("href", /github\.com/)
    const repoText = (await repoLink.innerText()).trim()

    const body = (await page.locator("body").innerText()).split(repoText).join("")
    expect(body).not.toMatch(/railway/i)
    expect(body).not.toMatch(/successfully deployed/i)
  })

  test("the homepage shows products even with no collections", async ({ page }) => {
    await page.goto(url())

    // The featured section is collection-driven and the seed creates none, so
    // without a fallback the page below the hero is blank.
    const rail = page
      .getByTestId("latest-products")
      .or(page.getByTestId("products-list"))
    await expect(rail.first()).toBeVisible()
    await expect(page.getByTestId("product-wrapper").first()).toBeVisible()
  })

  test("the search link is shown when search is enabled", async ({ page }) => {
    test.skip(!qaEnv.searchEnabled, "search feature flag is off")

    await page.goto(url())
    await expect(page.getByTestId("nav-search-link")).toBeVisible()
  })
})
