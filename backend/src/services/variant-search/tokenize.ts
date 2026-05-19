/**
 * Pure helpers for the multi-term variant search.
 *
 * Lowercases the search query and splits on whitespace so each token can be
 * AND-matched against a per-variant search blob. Backslash, percent, and
 * underscore are escaped so a customer typing "100%" or a SKU containing an
 * underscore can't degenerate into a wildcard match.
 */

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
}

export function escapeForLike(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
}
