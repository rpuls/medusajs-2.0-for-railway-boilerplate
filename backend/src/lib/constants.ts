import { loadEnv } from '@medusajs/utils'

import { assertValue } from '@/utils/assert-value'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Is development environment
 */
export const IS_DEV = process.env.NODE_ENV === 'development'

/**
 * Is testing environment
 */
export const IS_TEST = process.env.NODE_ENV === 'test'

/**
 * Is preview environment
 */
export const IS_PREVIEW = process.env.NODE_ENV === 'preview'

/**
 * Is production environment
 */
export const IS_PROD = process.env.NODE_ENV === 'production'

/**
 * Public URL for the backend
 */
export const BACKEND_URL = process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ?? 'http://localhost:9000'

/**
 * Database URL for Postgres instance used by the backend
 */
export const DATABASE_URL = assertValue(
  process.env.DATABASE_URL,
  'Environment variable for DATABASE_URL is not set',
)

/**
 * Redis URL for Redis instance used by the backend
 */
export const REDIS_URL = assertValue(
  process.env.REDIS_URL,
  'Environment variable for REDIS_URL is not set',
)

/**
 * Admin CORS origins
 */
export const ADMIN_CORS = assertValue(
  process.env.ADMIN_CORS,
  'Environment variable for ADMIN_CORS is not set',
)

/**
 * Auth CORS origins
 */
export const AUTH_CORS = assertValue(
  process.env.AUTH_CORS,
  'Environment variable for AUTH_CORS is not set',
)

/**
 * Store/frontend CORS origins
 */
export const STORE_CORS = assertValue(
  process.env.STORE_CORS,
  'Environment variable for STORE_CORS is not set',
)

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
 * Resend API Key
 */
export const RESEND_API_KEY = assertValue(
  process.env.RESEND_API_KEY,
  'Environment variable for RESEND_API_KEY is not set',
)

/**
 * Resend from Email
 */
export const RESEND_FROM_EMAIL = assertValue(
  process.env.RESEND_FROM,
  'Environment variable for RESEND_FROM is not set',
)

/**
 * SendGrid API Key
 */
// export const SENDGRID_API_KEY = assertValue(
//   process.env.SENDGRID_API_KEY,
//   'Environment variable for SENDGRID_API_KEY is not set',
// )

/**
 * SendGrid from Email
 */
// export const SENDGRID_FROM_EMAIL = assertValue(
//   process.env.SENDGRID_FROM_EMAIL,
//   'Environment variable for SENDGRID_FROM_EMAIL is not set',
// )

/**
 * Stripe API key
 */
export const STRIPE_API_KEY = assertValue(
  process.env.STRIPE_API_KEY,
  'Environment variable for STRIPE_API_KEY is not set',
)

/**
 * Stripe webhook secret
 */
export const STRIPE_WEBHOOK_SECRET = assertValue(
  process.env.STRIPE_WEBHOOK_SECRET,
  'Environment variable for STRIPE_WEBHOOK_SECRET is not set',
)

/**
 * Worker mode
 */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as 'worker' | 'server' | 'shared' | undefined) ?? 'shared'

/**
 * Disable Admin
 */
export const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true'
