import { loadEnv } from '@medusajs/framework/utils'

import { assertValue } from 'utils/assert-value'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Is development environment
 */
export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Public URL for the backend
 */
export const BACKEND_URL = process.env.BACKEND_PUBLIC_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ?? 'http://localhost:9000'

/**
 * Public URL for the admin UI (frontend)
 * This should point to where your admin dashboard is hosted (e.g., Railway backend-ui service)
 */
export const ADMIN_UI_URL = process.env.ADMIN_UI_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:9000'

/**
 * Database URL for Postgres instance used by the backend
 */
export const DATABASE_URL = assertValue(
  process.env.DATABASE_URL,
  'Environment variable for DATABASE_URL is not set',
)

/**
 * (optional) Redis URL for Redis instance used by the backend
 */
export const REDIS_URL = process.env.REDIS_URL;

/**
 * Admin CORS origins
 */
export const ADMIN_CORS = process.env.ADMIN_CORS;

/**
 * Auth CORS origins
 */
export const AUTH_CORS = process.env.AUTH_CORS;

/**
 * Store/frontend CORS origins
 */
export const STORE_CORS = process.env.STORE_CORS;

/**
 * JWT Secret used for signing JWT tokens
 */
export const JWT_SECRET = assertValue(
  process.env.JWT_SECRET,
  'Environment variable for JWT_SECRET is not set',
)

/**
 * Cookie secret used for signing cookies
 */
export const COOKIE_SECRET = assertValue(
  process.env.COOKIE_SECRET,
  'Environment variable for COOKIE_SECRET is not set',
)

/**
 * (optional) Minio configuration for file storage
 */
export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
export const MINIO_BUCKET = process.env.MINIO_BUCKET; // Optional, if not set bucket will be called: medusa-media

/**
 * (optional) Resend API Key and from Email - do not set if using SendGrid
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;

/**
 * (optionl) SendGrid API Key and from Email - do not set if using Resend
 */
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM;

/**
 * (optional) Stripe API key and webhook secret
 */
export const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * (optional) Meilisearch configuration
 */
export const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
export const MEILISEARCH_ADMIN_KEY = process.env.MEILISEARCH_ADMIN_KEY;

/**
 * Econt shipping configuration
 */
export const ECONT_USERNAME = process.env.ECONT_USERNAME || (IS_DEV ? "demo" : "");
export const ECONT_PASSWORD = process.env.ECONT_PASSWORD || (IS_DEV ? "demo" : "");
export const ECONT_LIVE = process.env.ECONT_LIVE === "true"; // Default to false (test), set to "true" for production

/**
 * Sender address configuration
 * Sender type: "OFFICE" (send from Econt office) or "ADDRESS" (send from address)
 */
export const ECONT_SENDER_TYPE = (process.env.ECONT_SENDER_TYPE || "OFFICE").toUpperCase() as "OFFICE" | "ADDRESS";
export const ECONT_SENDER_CITY = process.env.ECONT_SENDER_CITY || "София";
export const ECONT_SENDER_POST_CODE = process.env.ECONT_SENDER_POST_CODE || "1000";
export const ECONT_SENDER_OFFICE_CODE = process.env.ECONT_SENDER_OFFICE_CODE || "1000-1"; // Required if SENDER_TYPE=OFFICE
export const ECONT_SENDER_STREET = process.env.ECONT_SENDER_STREET || ""; // Required if SENDER_TYPE=ADDRESS
export const ECONT_SENDER_STREET_NUM = process.env.ECONT_SENDER_STREET_NUM || ""; // Required if SENDER_TYPE=ADDRESS
export const ECONT_SENDER_QUARTER = process.env.ECONT_SENDER_QUARTER || ""; // Optional
export const ECONT_SENDER_BUILDING_NUM = process.env.ECONT_SENDER_BUILDING_NUM || ""; // Optional
export const ECONT_SENDER_ENTRANCE_NUM = process.env.ECONT_SENDER_ENTRANCE_NUM || ""; // Optional
export const ECONT_SENDER_FLOOR_NUM = process.env.ECONT_SENDER_FLOOR_NUM || ""; // Optional
export const ECONT_SENDER_APARTMENT_NUM = process.env.ECONT_SENDER_APARTMENT_NUM || ""; // Optional

/**
 * Worker mode
 */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as 'worker' | 'server' | 'shared' | undefined) ?? 'shared'

/**
 * Disable Admin
 */
export const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true'
