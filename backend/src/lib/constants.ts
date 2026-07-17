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
 * (optional) S3-compatible file storage configuration.
 * Works with any S3-compatible provider: Railway buckets, AWS S3, Cloudflare R2, MinIO, ...
 *
 * When no S3_* variable is set, legacy MINIO_* variables (used by older
 * versions of this template) are mapped to their S3 equivalents so existing
 * deployments keep working. The two variable sets are never mixed: as soon as
 * any S3_* variable is present, MINIO_* variables are ignored entirely.
 */
const HAS_S3_CONFIG = Boolean(
  process.env.S3_FILE_URL ||
  process.env.S3_ACCESS_KEY_ID ||
  process.env.S3_SECRET_ACCESS_KEY ||
  process.env.S3_BUCKET ||
  process.env.S3_ENDPOINT
);

const normalizeLegacyMinioUrl = (endpoint?: string): string | undefined => {
  if (!endpoint) return undefined;
  const withScheme = /^https?:\/\//.test(endpoint) ? endpoint : `https://${endpoint}`;
  return new URL(withScheme).toString().replace(/\/+$/, '');
};

const LEGACY_MINIO_URL = HAS_S3_CONFIG ? undefined : normalizeLegacyMinioUrl(process.env.MINIO_ENDPOINT);
const LEGACY_MINIO_BUCKET = process.env.MINIO_BUCKET || 'medusa-media';

const parseBoolean = (value: string | undefined, fallback: boolean): boolean =>
  value === undefined ? fallback : ['true', '1', 'yes'].includes(value.toLowerCase());

export const S3_ACCESS_KEY_ID = HAS_S3_CONFIG ? process.env.S3_ACCESS_KEY_ID : process.env.MINIO_ACCESS_KEY;
export const S3_SECRET_ACCESS_KEY = HAS_S3_CONFIG ? process.env.S3_SECRET_ACCESS_KEY : process.env.MINIO_SECRET_KEY;
export const S3_BUCKET = HAS_S3_CONFIG ? process.env.S3_BUCKET : (LEGACY_MINIO_URL ? LEGACY_MINIO_BUCKET : undefined);
export const S3_ENDPOINT = HAS_S3_CONFIG ? process.env.S3_ENDPOINT : LEGACY_MINIO_URL;
export const S3_REGION = process.env.S3_REGION || 'us-east-1';
// Public base URL files are served from. For MinIO-style path access this is <endpoint>/<bucket>.
export const S3_FILE_URL = HAS_S3_CONFIG
  ? process.env.S3_FILE_URL
  : (LEGACY_MINIO_URL ? `${LEGACY_MINIO_URL}/${LEGACY_MINIO_BUCKET}` : undefined);
// Path-style addressing is required by MinIO and some other S3-compatible providers.
export const S3_FORCE_PATH_STYLE = parseBoolean(process.env.S3_FORCE_PATH_STYLE, Boolean(LEGACY_MINIO_URL));
// Per-object ACL applied to uploads (e.g. 'public-read'). Most modern providers
// (Railway buckets, Cloudflare R2, new AWS buckets) reject ACLs - leave unset to omit
// the ACL header entirely and manage public read access with a bucket policy instead.
export const S3_ACL: string | false = process.env.S3_ACL || false;

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
 * Worker mode
 */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as 'worker' | 'server' | 'shared' | undefined) ?? 'shared'

/**
 * Disable Admin
 */
export const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true'
