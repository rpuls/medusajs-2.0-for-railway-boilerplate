import { defineConfig, devices } from "@playwright/test"
import { qaEnv } from "./qa/env"

/**
 * Smoke suite that runs against a already-running local stack:
 *
 *   docker compose up -d
 *   cd backend && pnpm ib && pnpm dev
 *   cd storefront && pnpm dev
 *   cd storefront && pnpm test:qa
 *
 * This is deliberately separate from playwright.config.ts. That suite is
 * inherited from the Medusa starter and drives a dedicated test_medusa_db
 * through a template-database reset between runs, which needs its own
 * postgres role, its own backend pointed at that database and an e2e/.env.
 * This one touches no database directly, so it works on a stock
 * docker-compose setup and on a deployed store.
 *
 * It writes as little as it can, and namespaces what it must write (accounts
 * use a per-run email) so repeated runs stay independent.
 */

/**
 * Headed runs are for watching, and Playwright drives far faster than an eye
 * can follow, so slow it down when a browser is actually on screen. Reading
 * argv rather than adding cross-env keeps this dependency-free on Windows,
 * where `QA_SLOW_MO=400 playwright ...` is not valid shell syntax anyway.
 * Set QA_SLOW_MO to override, including QA_SLOW_MO=0 for headed at full speed.
 */
const headed = process.argv.includes("--headed")
const slowMo = Number(process.env.QA_SLOW_MO ?? (headed ? 400 : 0))

export default defineConfig({
  testDir: "./qa",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Next.js compiles each route on first request in dev, which can take a
  // while for checkout. These are sized for `next dev`, not a production build.
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "qa-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "qa-report" }]],
  use: {
    baseURL: qaEnv.baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    launchOptions: { slowMo },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
