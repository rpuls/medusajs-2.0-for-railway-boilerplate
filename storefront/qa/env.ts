import fs from "fs"
import path from "path"

/**
 * Minimal .env.local reader.
 *
 * The storefront reads its configuration from .env.local, which Next.js loads
 * itself but Playwright does not. The inherited playwright.config.ts leans on
 * `import "dotenv/config.js"` even though dotenv is not a declared dependency
 * of this package - it only resolves because Playwright bundles a copy. Rather
 * than depend on that, this parses the handful of KEY=value lines we need.
 */
const parseEnvFile = (file: string): Record<string, string> => {
  const out: Record<string, string> = {}
  if (!fs.existsSync(file)) {
    return out
  }
  for (const rawLine of fs.readFileSync(file, "utf-8").split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) {
      continue
    }
    const eq = line.indexOf("=")
    if (eq === -1) {
      continue
    }
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

const fileEnv = parseEnvFile(path.resolve(__dirname, "..", ".env.local"))

/** Real environment wins, so CI can override without editing files. */
const read = (key: string, fallback: string): string =>
  process.env[key] || fileEnv[key] || fallback

export const qaEnv = {
  baseURL: read("QA_BASE_URL", read("NEXT_PUBLIC_BASE_URL", "http://localhost:8000")),
  backendURL: read("NEXT_PUBLIC_MEDUSA_BACKEND_URL", "http://localhost:9000"),
  /** Mirrors the storefront default in src/lib/util/env.ts. */
  storeName: read("NEXT_PUBLIC_STORE_NAME", "Your Store"),
  /** Must match a country covered by a region in Medusa. */
  region: read("NEXT_PUBLIC_DEFAULT_REGION", "gb").toLowerCase(),
  /** Medusa admin dashboard, served by the backend at /app. */
  adminURL: `${read("NEXT_PUBLIC_MEDUSA_BACKEND_URL", "http://localhost:9000")}/app`,
  adminEmail: read("MEDUSA_ADMIN_EMAIL", "admin@yourmail.com"),
  adminPassword: read("MEDUSA_ADMIN_PASSWORD", "supersecret"),
  searchEnabled: Boolean(read("NEXT_PUBLIC_FEATURE_SEARCH_ENABLED", "")),
  stripeConfigured: Boolean(read("NEXT_PUBLIC_STRIPE_KEY", "")),
}
