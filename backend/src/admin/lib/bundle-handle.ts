const COMBINING_DIACRITIC_RE = /[̀-ͯ]/g

export function slugifyBundleHandle(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITIC_RE, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
