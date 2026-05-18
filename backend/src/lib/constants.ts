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
/**
 * Signing secret for the *dedicated* Stripe webhook that handles admin-created
 * Payment Links (deposit / balance / quote / manual scenarios).
 *
 * Distinct from `STRIPE_WEBHOOK_SECRET` (which Medusa's checkout flow uses).
 * Configure a second webhook endpoint in Stripe dashboard pointed at
 * `{backend}/hooks/stripe-payment-link` subscribed to `checkout.session.completed`.
 *
 * When unset, the admin "Create payment link" button is hidden and the webhook
 * endpoint returns 503. This keeps dev environments without Stripe config
 * quiet.
 */
export const STRIPE_PAYMENT_LINK_WEBHOOK_SECRET =
  process.env.STRIPE_PAYMENT_LINK_WEBHOOK_SECRET
export const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
export const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET
export const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID
/** Set PAYPAL_IS_SANDBOX=true to use PayPal Sandbox; any other value uses live. */
export const PAYPAL_IS_SANDBOX =
  String(process.env.PAYPAL_IS_SANDBOX).toLowerCase() === "true"
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

/**
 * Comma-separated list of inboxes that receive the monthly Reports digest
 * (1st of every month). Unset = digest is generated but not sent — useful
 * in dev. Required to be a verified Resend domain in production.
 */
export const MONTHLY_DIGEST_RECIPIENTS = process.env.MONTHLY_DIGEST_RECIPIENTS

/**
 * Used to build the "Open the full Reports page →" link in the digest email.
 * Falls back to BACKEND_URL.
 */
export const ADMIN_PUBLIC_URL = process.env.ADMIN_PUBLIC_URL

/**
 * Reorder reminder cron is opt-in. Set to "true" only after dry-running
 * the candidate list to confirm the cadence model produces sensible
 * matches against real data — the cron writes to customers' inboxes.
 */
export const REORDER_REMINDERS_ENABLED =
  String(process.env.REORDER_REMINDERS_ENABLED).toLowerCase() === "true"

/**
 * Abandoned-cart reminder cron is opt-in. Same posture as the reorder
 * reminder — keep false until you've dry-run the candidate list against
 * production and confirmed it isn't picking up carts that already
 * converted or carts from customers who opted out of marketing email.
 */
export const ABANDONED_CART_REMINDERS_ENABLED =
  String(process.env.ABANDONED_CART_REMINDERS_ENABLED).toLowerCase() === "true"

/**
 * A cart is only eligible once it's at least this many hours old (gives
 * the customer time to come back on their own) and at most this many
 * (older than the ceiling means we're never going to win them back from
 * a single snapshot — treat as lost).
 */
export const ABANDONED_CART_AGE_MIN_HOURS = parseIntEnv(
  process.env.ABANDONED_CART_AGE_MIN_HOURS,
  6
)
export const ABANDONED_CART_AGE_MAX_HOURS = parseIntEnv(
  process.env.ABANDONED_CART_AGE_MAX_HOURS,
  72
)
export const ABANDONED_CART_MAX_SENDS_PER_RUN = parseIntEnv(
  process.env.ABANDONED_CART_MAX_SENDS_PER_RUN,
  50
)

/**
 * Win-back email cron is opt-in. Fires weekly (Mondays) — pinging the
 * same customer at most once every 90 days because severity gating in
 * services/churn-queue/build-queue.ts uses the customer's median order
 * gap to avoid spamming.
 */
export const WINBACK_EMAILS_ENABLED =
  String(process.env.WINBACK_EMAILS_ENABLED).toLowerCase() === "true"

/**
 * Customer lifetime value (AUD) at or above which the admin LTV widget
 * suggests adding the "VIP" tag. Also the value most admins will type
 * into the automation-rules condition `lifetime_value gte N`.
 */
export const LTV_VIP_THRESHOLD_AUD = parseIntEnv(
  process.env.LTV_VIP_THRESHOLD_AUD,
  1500
)

/**
 * Comma-separated list of customer-tag labels (case-insensitive) that
 * grant the "free shipping" perk. The storefront displays a banner in
 * checkout when the logged-in customer has any of these tags; the
 * admin order page surfaces the perk so staff can waive shipping at
 * fulfillment. The perk is recorded on `order.metadata.applied_perks`
 * at order placement for audit. Example: `VIP,Wholesale`.
 */
export const FREE_SHIPPING_TAGS = (process.env.FREE_SHIPPING_TAGS ?? "VIP,Wholesale")
  .split(",")
  .map((t) => t.trim().toLowerCase())
  .filter((t) => t.length > 0)

/**
 * NPS feedback request cron. Opt-in. Fires once per delivered order
 * after `NPS_REQUEST_DAYS_AFTER_DELIVERED` days, and never more than
 * once every `NPS_MIN_GAP_DAYS_PER_CUSTOMER` per customer. Idempotency
 * stamped onto `order.metadata.nps_request_sent_at` and customer's
 * `last_nps_request_sent_at`.
 */
export const NPS_REQUESTS_ENABLED =
  String(process.env.NPS_REQUESTS_ENABLED).toLowerCase() === "true"
export const NPS_REQUEST_DAYS_AFTER_DELIVERED = parseIntEnv(
  process.env.NPS_REQUEST_DAYS_AFTER_DELIVERED,
  14
)
export const NPS_MIN_GAP_DAYS_PER_CUSTOMER = parseIntEnv(
  process.env.NPS_MIN_GAP_DAYS_PER_CUSTOMER,
  90
)
export const NPS_MAX_SENDS_PER_RUN = parseIntEnv(
  process.env.NPS_MAX_SENDS_PER_RUN,
  25
)
/**
 * Secret string mixed into the NPS capture URL signature so customers
 * can't forge scores by guessing other order IDs. Must be set in prod;
 * a placeholder is used in dev so the URL still verifies.
 */
export const NPS_LINK_SECRET =
  process.env.NPS_LINK_SECRET || "nps-dev-secret-do-not-use-in-prod"

/**
 * PostHog cohort → customer_tag sync. Opt-in. Daily cron looks up the
 * cohorts named in `POSTHOG_COHORT_SYNC_LIST` (comma-separated; each
 * "cohort_id:tag_label[:color]"), reads cohort members via PostHog's
 * REST API, and upserts the matching `customer_tag` rows. Used to
 * surface PostHog-derived segments ("Engaged this week", "Cart but no
 * checkout") in the Medusa admin and feed the automation rule engine.
 *
 * Without this var the cron is a no-op so dev environments stay quiet.
 *
 * Example:
 *   POSTHOG_COHORT_SYNC_LIST="123:Engaged this week:teal,456:Cart but no checkout:amber"
 */
export const POSTHOG_COHORT_SYNC_ENABLED =
  String(process.env.POSTHOG_COHORT_SYNC_ENABLED).toLowerCase() === "true"
export const POSTHOG_COHORT_SYNC_LIST = process.env.POSTHOG_COHORT_SYNC_LIST

/**
 * Algorithmic cross-sell ("Frequently bought together"). Daily cron
 * walks order line items, counts co-purchase pairs, writes the top-K
 * to `product.metadata.cross_sell_product_ids`. Opt-in via
 * `CROSS_SELL_ENABLED=true` — staying disabled keeps the storefront
 * PDP from rendering an empty/awkward block while you accumulate the
 * order volume to make recommendations meaningful.
 *
 *   - `CROSS_SELL_MIN_CO_OCCURRENCE` — minimum number of orders a pair
 *     must appear in before it's recommended. Default 2 keeps noise
 *     down on small catalogs; raise to 3-5 for noisier data.
 *   - `CROSS_SELL_MAX_PER_PRODUCT` — top-K recommendations per
 *     product. Default 5 — storefront component caps display at 4-5
 *     cards.
 */
export const CROSS_SELL_ENABLED =
  String(process.env.CROSS_SELL_ENABLED).toLowerCase() === "true"
export const CROSS_SELL_MIN_CO_OCCURRENCE = parseIntEnv(
  process.env.CROSS_SELL_MIN_CO_OCCURRENCE,
  2
)
export const CROSS_SELL_MAX_PER_PRODUCT = parseIntEnv(
  process.env.CROSS_SELL_MAX_PER_PRODUCT,
  5
)

/**
 * Stale-order alerts: daily cron stamps `metadata.is_stale = true` on
 * orders whose current production stage hasn't advanced in
 * STALE_ORDER_THRESHOLD_DAYS days. Admin shows a red badge. Optional
 * Slack webhook posts a digest of newly-stale orders.
 */
export const STALE_ORDER_ALERTS_ENABLED =
  String(process.env.STALE_ORDER_ALERTS_ENABLED).toLowerCase() === "true"
export const STALE_ORDER_THRESHOLD_DAYS = parseIntEnv(
  process.env.STALE_ORDER_THRESHOLD_DAYS,
  3
)
export const SLACK_PRODUCTION_WEBHOOK_URL =
  process.env.SLACK_PRODUCTION_WEBHOOK_URL

/**
 * Per-order inbound email aliases. When set, transactional emails for
 * an order use `inbox+ord<order-id>@${ORDER_INBOX_DOMAIN}` as their
 * Reply-To. Customer replies land at that alias, which (with a DNS
 * MX → inbound-email provider config) hits the
 * /hooks/inbound-email webhook and gets attached to the order's
 * timeline as an order_comment.
 *
 * Without the env var, replyTo falls back to SUPPORT_REPLY_TO_EMAIL.
 *
 * INBOUND_EMAIL_SECRET is a shared secret the provider sends in a
 * header so the webhook can reject unauthorised inbound traffic.
 */
export const ORDER_INBOX_DOMAIN = process.env.ORDER_INBOX_DOMAIN
export const INBOUND_EMAIL_SECRET = process.env.INBOUND_EMAIL_SECRET

/**
 * AI copy generation (product descriptions etc). Provider-agnostic:
 * set AI_PROVIDER + the corresponding API key. The route returns 503
 * when no provider is configured so the admin widget can show a
 * "configure an AI provider to use this" hint instead of crashing.
 *
 *   AI_PROVIDER=openai      → uses OPENAI_API_KEY + OPENAI_MODEL (default: gpt-4o-mini)
 *   AI_PROVIDER=anthropic   → uses ANTHROPIC_API_KEY + ANTHROPIC_MODEL (default: claude-haiku-4-5)
 *
 * AI_REQUEST_TIMEOUT_MS bounds per-request latency so a slow provider
 * doesn't lock up a staff member's admin session.
 */
export const AI_PROVIDER =
  (process.env.AI_PROVIDER ?? "openai").toLowerCase() as "openai" | "anthropic"
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5"
export const AI_REQUEST_TIMEOUT_MS = parseIntEnv(
  process.env.AI_REQUEST_TIMEOUT_MS,
  30000
)

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
 * FashionBiz Public API v3 (Biz Collection, Biz Care, Biz Corporates, Syzmik,
 * Good-Mates). Token issued per-customer by FashionBiz; branch is the country
 * shorthand (au/nz/ca). When the token is missing the module simply isn't
 * registered, so the importer/job become no-ops — dev environments without a
 * token still boot cleanly.
 */
export const FASHIONBIZ_API_TOKEN = process.env.FASHIONBIZ_API_TOKEN
export const FASHIONBIZ_BRANCH = process.env.FASHIONBIZ_BRANCH || "au"
export const FASHIONBIZ_BASE_URL =
  process.env.FASHIONBIZ_BASE_URL || "https://www.fashionbizapis.com/api/v3"
/**
 * The FashionBiz Public API exposes a "1-99" wholesale tier price, but the
 * price SC Prints is actually charged (visible on FashionBiz's distributor
 * storefront — `au-store.fashionbizapps.com`) sits ~15% higher than that
 * tier. Observed 2026-05-13 across P400MS, BP2616MS, BP2610MS, P515MS:
 * storefront/API ratios were 1.1505, 1.1498, 1.1498, 1.1541 respectively.
 *
 * This multiplier is applied to the API "1-99" price before it's fed into
 * the bulk-price ladder, so retail markups stay correct.
 *
 * Default 1.0 = ingest API price as-is (no adjustment). Set to e.g. 1.15
 * to match observed customer pricing. Tune per-environment if FashionBiz
 * changes their pricing model.
 */
export const FASHIONBIZ_COST_ADJUSTMENT = Number.parseFloat(
  process.env.FASHIONBIZ_COST_ADJUSTMENT || "1.0"
)

/**
 * Aussie Pacific Public API v1 (https://api.aussiepacific.com.au/docs/).
 * Bearer token issued per-customer by AP. When the token is missing the
 * module is not registered, so the importer/job become no-ops and dev
 * environments without a token still boot cleanly.
 *
 * `AUSSIE_PACIFIC_COST_ADJUSTMENT` is the calibration dial for the retail
 * price ladder. We currently assume AP's API `price` is ex-GST cost (same
 * convention as AS Colour and the FashionBiz "1-99" tier), so default 1.0.
 * Adjust per-environment if real invoices disagree.
 *
 * Workshop ship-to address for dropship orders is reused from the
 * `ASCOLOUR_WORKSHOP_*` vars — same physical address. If AP ever needs a
 * different destination introduce a parallel `AUSSIE_PACIFIC_WORKSHOP_*`
 * set then.
 */
export const AUSSIE_PACIFIC_API_TOKEN = process.env.AUSSIE_PACIFIC_API_TOKEN
export const AUSSIE_PACIFIC_BASE_URL =
  process.env.AUSSIE_PACIFIC_BASE_URL || "https://api.aussiepacific.com.au"
export const AUSSIE_PACIFIC_COST_ADJUSTMENT = Number.parseFloat(
  process.env.AUSSIE_PACIFIC_COST_ADJUSTMENT || "1.0"
)
export const AUSSIE_PACIFIC_DEFAULT_SHIPPING_METHOD =
  process.env.AUSSIE_PACIFIC_DEFAULT_SHIPPING_METHOD

/**
 * Google Search Console + Google Analytics 4 (read-only).
 *
 * `GOOGLE_SERVICE_ACCOUNT_JSON` is the full JSON key for a service account.
 *
 * Two access patterns are supported, both read-only:
 *
 *  1. **Direct grant** (default): the service account is added as a Restricted
 *     user in GSC and a Viewer in GA4, and authenticates as itself. Simple but
 *     blocked when Google's IAM rejects external service account emails (a
 *     common Workspace org constraint).
 *
 *  2. **Domain-Wide Delegation (DWD)**: set `SEO_IMPERSONATION_USER` to a
 *     Workspace user that already has access (e.g. info@scprints.com.au, who is
 *     the GSC Owner and GA4 admin). The SA must have DWD enabled in GCP and
 *     its Client ID must be authorized in admin.google.com → Security → API
 *     Controls → Domain-wide Delegation with these scopes:
 *       - https://www.googleapis.com/auth/webmasters.readonly
 *       - https://www.googleapis.com/auth/analytics.readonly
 *     With DWD configured, no IAM grant on the GSC/GA4 properties is required;
 *     the SA inherits the impersonated user's permissions.
 *
 * All four are intentionally NOT wrapped in assertValue() — the rest of the
 * app must boot without SEO config so dev environments aren't blocked. Job +
 * routes detect missing config at call time and log a warning.
 */
export const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
export const GSC_SITE_URL = process.env.GSC_SITE_URL
export const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID
export const SEO_IMPERSONATION_USER = process.env.SEO_IMPERSONATION_USER

/**
 * PostHog — read access for the operational tile.
 *
 * Two different keys are used:
 *
 *  - `POSTHOG_API_KEY` (already set, read by lib/posthog.ts): the **Project**
 *    API key. Used by the SDK to *send* events (pageviews, identifies, etc).
 *    It can't read insights.
 *
 *  - `POSTHOG_PERSONAL_API_KEY`: a **Personal** API key (Settings → Personal
 *    API keys in PostHog). Required to *read* via PostHog's HTTP API. Treat
 *    as a secret — it has the same permissions as your user account.
 *
 * `POSTHOG_PROJECT_ID` is the numeric project ID (visible in the URL when
 * you're in a project, e.g. `app.posthog.com/project/12345/...`).
 *
 * `POSTHOG_HOST` defaults to `https://us.i.posthog.com` if unset; set it to
 * `https://eu.i.posthog.com` for EU cloud or your self-hosted URL. Trailing
 * slash is fine.
 *
 * All three are optional — when unset, the PostHog tile falls back to a
 * static deep-link instead of live data.
 */
export const POSTHOG_HOST = process.env.POSTHOG_HOST
export const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY
export const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID

/**
 * 4. SYSTEM MODES
 */
export const WORKER_MODE = (process.env.MEDUSA_WORKER_MODE) || 'shared'
export const SHOULD_DISABLE_ADMIN = String(process.env.MEDUSA_DISABLE_ADMIN).toLowerCase() === 'true'