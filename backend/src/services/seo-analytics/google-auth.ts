import { GOOGLE_SERVICE_ACCOUNT_JSON } from "../../lib/constants"

type ServiceAccountKey = {
  client_email: string
  private_key: string
  project_id?: string
}

let cachedKey: ServiceAccountKey | null = null

/**
 * Parses GOOGLE_SERVICE_ACCOUNT_JSON once and caches the result. Throws a clear,
 * actionable error if the env var is missing or malformed so misconfiguration is
 * obvious in boot logs rather than buried in a 500.
 */
export function getServiceAccountKey(): ServiceAccountKey {
  if (cachedKey) return cachedKey

  if (!GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is not set — paste the full service-account JSON key into env."
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON)
  } catch (err: any) {
    throw new Error(
      `GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON: ${err?.message ?? err}`
    )
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    typeof (parsed as any).client_email !== "string" ||
    typeof (parsed as any).private_key !== "string"
  ) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key."
    )
  }

  cachedKey = parsed as ServiceAccountKey
  return cachedKey
}

export function isSeoConfigured(): boolean {
  return Boolean(GOOGLE_SERVICE_ACCOUNT_JSON)
}
