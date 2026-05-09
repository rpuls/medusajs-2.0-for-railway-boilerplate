/**
 * UTM-tag every outbound email link so GA4 can attribute the resulting
 * traffic + revenue back to the campaign that sent it. GA4's standard
 * `sessionMedium = "email"` filter then makes the channel queryable in
 * the email-channel-roi report.
 *
 * Convention:
 *   utm_source   = "email"
 *   utm_medium   = "transactional" | "marketing" | "ops"
 *   utm_campaign = template name (e.g. "reorder_reminder", "winback_at_risk")
 *
 * `transactional` is for emails the customer expects (order placed,
 * shipping, production updates). `marketing` is for nudges (reorder,
 * winback). `ops` is internal-only emails like the monthly digest.
 */

export type UtmMedium = "transactional" | "marketing" | "ops"

export type UtmContent = {
  source?: string
  medium: UtmMedium
  campaign: string
  content?: string
}

const SOURCE_DEFAULT = "email"

/**
 * Append UTM params to a URL without disturbing existing query string.
 * If the URL is null/undefined or doesn't parse, returns it unchanged
 * — never throws so the email send path stays defensive.
 */
export const tagUrl = (
  url: string | null | undefined,
  utm: UtmContent
): string | null => {
  if (!url || typeof url !== "string") return url ?? null
  try {
    const parsed = new URL(url)
    parsed.searchParams.set("utm_source", utm.source ?? SOURCE_DEFAULT)
    parsed.searchParams.set("utm_medium", utm.medium)
    parsed.searchParams.set("utm_campaign", utm.campaign)
    if (utm.content) parsed.searchParams.set("utm_content", utm.content)
    return parsed.toString()
  } catch {
    return url
  }
}
