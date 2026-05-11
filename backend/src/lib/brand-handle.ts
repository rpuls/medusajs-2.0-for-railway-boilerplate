// Combining diacritical marks: U+0300 to U+036F
const COMBINING_DIACRITIC_RE = /[̀-ͯ]/g

export function slugifyBrandHandle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITIC_RE, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function brandValueKey(value: string): string {
  return value.trim().toLowerCase()
}
