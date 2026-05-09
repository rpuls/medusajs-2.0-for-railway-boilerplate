import { loadEnv } from '@medusajs/framework/utils'
import { assertValue } from 'utils/assert-value'

// Load environment variables based on the current environment
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * 1. CORE SERVER CONFIG
 */
export const IS_DEV = process.env.NODE_ENV === 'development'

export const BACKEND_URL = 
  process.env.BACKEND_PUBLIC_URL ?? 
  process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ?? 
  'http://localhost:9000'

// Use assertValue for critical infrastructure variables to fail fast if missing
export const DATABASE_URL = assertValue(
  process.env.DATABASE_URL,
  'Environment variable DATABASE_URL is required for the backend to start.'
)

export const JWT_SECRET = assertValue(
  process.env.JWT_SECRET,
  'Environment variable JWT_SECRET is required for security.'
)

export const COOKIE_SECRET = assertValue(
  process.env.COOKIE_SECRET,
  'Environment variable COOKIE_SECRET is required.'
)

/**
 * 2. CORS SETTINGS (Crucial for Vercel/Storefront connectivity)
 * We use the '??' operator to ensure we only fall back to empty strings 
 * if the environment variable is null or undefined.
 */
export const ADMIN_CORS = process.env.ADMIN_CORS ?? ""
export const AUTH_CORS = process.env.AUTH_CORS ?? ""
export const STORE_CORS = process.env.STORE_CORS ?? ""

/**
 * 3. OPTIONAL SERVICES (Redis, Storage, Email, Payments)
 */
export const REDIS_URL = process.env.REDIS_URL
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
export const SHIPSTATION_API_KEY = process.env.SHIPSTATION_API_KEY
export const SHIPSTATION_WEBHOOK_SECRET = process.env.SHIPSTATION_WEBHOOK_SECRET
export const SHIPSTATION_WAREHOUSE_POSTCODE = process.env.SHIPSTATION_WAREHOUSE_POSTCODE
export const SHIPSTATION_WAREHOUSE_COUNTRY_CODE =
  process.env.SHIPSTATION_WAREHOUSE_COUNTRY_CODE || "AU"
export const SHIPSTATION_WAREHOUSE_CITY = process.env.SHIPSTATION_WAREHOUSE_CITY
export const SHIPSTATION_WAREHOUSE_STATE = process.env.SHIPSTATION_WAREHOUSE_STATE
export const SHIPSTATION_WAREHOUSE_NAME =
  process.env.SHIPSTATION_WAREHOUSE_NAME || "Warehouse"
export const SHIPSTATION_WAREHOUSE_ADDRESS_1 =
  process.env.SHIPSTATION_WAREHOUSE_ADDRESS_1
export const SHIPSTATION_WAREHOUSE_PHONE = process.env.SHIPSTATION_WAREHOUSE_PHONE

/** Nominal parcel dimensions for ShipStation rate quotes (cm). Carriers often require L×W×H. */
const parsePackageDimCm = (raw: string | undefined, fallback: number) => {
  const n = Number.parseFloat(raw ?? "")
  if (!Number.isFinite(n) || n <= 0 || n > 200) {
    return fallback
  }
  return n
}
export const SHIPSTATION_PACKAGE_LENGTH_CM = parsePackageDimCm(
  process.env.SHIPSTATION_PACKAGE_LENGTH_CM,
  40
)
export const SHIPSTATION_PACKAGE_WIDTH_CM = parsePackageDimCm(
  process.env.SHIPSTATION_PACKAGE_WIDTH_CM,
  30
)
export const SHIPSTATION_PACKAGE_HEIGHT_CM = parsePackageDimCm(
  process.env.SHIPSTATION_PACKAGE_HEIGHT_CM,
  15
)

const parseIntEnv = (raw: string | undefined, fallback: number) => {
  if (!raw) {
    return fallback
  }
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * Hybrid shipping threshold: anything ≤ this weight (incl. packaging overhead)
 * is offered the manual flat-rate tiers. Anything heavier suppresses flat rates
 * and surfaces ShipStation calculated quotes.
 */
export const SHIPPING_FLAT_RATE_MAX_GRAMS = parseIntEnv(
  process.env.SHIPPING_FLAT_RATE_MAX_GRAMS,
  3000
)
export const SHIPPING_PACKAGING_OVERHEAD_GRAMS = parseIntEnv(
  process.env.SHIPPING_PACKAGING_OVERHEAD_GRAMS,
  150
)

export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY
export const MINIO_BUCKET = process.env.MINIO_BUCKET

export const RESEND_API_KEY = process.env.RESEND_API_KEY
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM
export const CONTACT_NOTIFICATION_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL

/**
 * Comma-separated inboxes for internal "new order" alerts. Falls back to CONTACT_NOTIFICATION_EMAIL.
 * Requires notification module (Resend or SendGrid) like contact emails.
 */
export const ORDER_NOTIFICATION_EMAIL = process.env.ORDER_NOTIFICATION_EMAIL

/**
 * Reply-To on transactional customer emails (order placed, shipped). Falls back to verified from-address.
 */
export const SUPPORT_REPLY_TO_EMAIL =
  process.env.SUPPORT_REPLY_TO_EMAIL?.trim() ||
  RESEND_FROM_EMAIL?.trim() ||
  SENDGRID_FROM_EMAIL?.trim() ||
  undefined

/**
 * Who receives "new newsletter subscriber" alerts. Falls back to CONTACT_NOTIFICATION_EMAIL.
 */
export const NEWSLETTER_NOTIFICATION_EMAIL = process.env.NEWSLETTER_NOTIFICATION_EMAIL

/** If set, GET /key-exchange requires header x-medusa-key-exchange-secret (same value). */
export const KEY_EXCHANGE_SECRET = process.env.KEY_EXCHANGE_SECRET

export const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST
export const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY

/**
 * AS Colour API credentials + workshop ship-to address. The workshop
 * address is used as the shipping address on every dropship order placed
 * with AS Colour (we decorate the garments before shipping to the customer).
 */
export const ASCOLOUR_SUBSCRIPTION_KEY = process.env.ASCOLOUR_SUBSCRIPTION_KEY
export const ASCOLOUR_EMAIL = process.env.ASCOLOUR_EMAIL
export const ASCOLOUR_PASSWORD = process.env.ASCOLOUR_PASSWORD
export const ASCOLOUR_BASE_URL =
  process.env.ASCOLOUR_BASE_URL || "https://api.ascolour.com.au/v1"
export const ASCOLOUR_DEFAULT_SHIPPING_METHOD =
  process.env.ASCOLOUR_DEFAULT_SHIPPING_METHOD

export const ASCOLOUR_WORKSHOP_COMPANY = process.env.ASCOLOUR_WORKSHOP_COMPANY || "SC Prints"
export const ASCOLOUR_WORKSHOP_FIRST_NAME = process.env.ASCOLOUR_WORKSHOP_FIRST_NAME
export const ASCOLOUR_WORKSHOP_LAST_NAME = process.env.ASCOLOUR_WORKSHOP_LAST_NAME
export const ASCOLOUR_WORKSHOP_ADDRESS_1 = process.env.ASCOLOUR_WORKSHOP_ADDRESS_1
export const ASCOLOUR_WORKSHOP_ADDRESS_2 = process.env.ASCOLOUR_WORKSHOP_ADDRESS_2
export const ASCOLOUR_WORKSHOP_CITY = process.env.ASCOLOUR_WORKSHOP_CITY
export const ASCOLOUR_WORKSHOP_STATE = process.env.ASCOLOUR_WORKSHOP_STATE
export const ASCOLOUR_WORKSHOP_ZIP = process.env.ASCOLOUR_WORKSHOP_ZIP
export const ASCOLOUR_WORKSHOP_COUNTRY_CODE =
  process.env.ASCOLOUR_WORKSHOP_COUNTRY_CODE || "AU"
export const ASCOLOUR_WORKSHOP_EMAIL = process.env.ASCOLOUR_WORKSHOP_EMAIL
export const ASCOLOUR_WORKSHOP_PHONE = process.env.ASCOLOUR_WORKSHOP_PHONE

/**
 * Google Search Console + Google Analytics 4 (read-only).
 *
 * `GOOGLE_SERVICE_ACCOUNT_JSON` is the full JSON key for a service account that has
 * been granted "Restricted" access in the GSC property and "Viewer" access in the GA4
 * property. Paste the JSON unmodified — newlines in env vars are fine on Railway.
 *
 * All three are intentionally NOT wrapped in assertValue() — the rest of the app
 * must boot without SEO config so dev environments aren't blocked. Job + routes
 * detect missing config at call time and log a warning.
 */
export const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
export const GSC_SITE_URL = process.env.GSC_SITE_URL
export const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID

/**
 * 4. SYSTEM MODES
 */
export const WORKER_MODE = (process.env.MEDUSA_WORKER_MODE) || 'shared'
export const SHOULD_DISABLE_ADMIN = String(process.env.MEDUSA_DISABLE_ADMIN).toLowerCase() === 'true'