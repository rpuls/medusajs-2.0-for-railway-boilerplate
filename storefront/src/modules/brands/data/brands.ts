/**
 * Presentation styles for brand tiles on the storefront. The canonical list of brands lives in
 * the backend Brand module — fetch it via `getBrands()` in `@lib/data/brands`. This file is
 * presentation only: the brand `bgClass`, `initials`, and `logoSrc` keyed by brand handle.
 *
 * New brands without an entry here get a generic fallback. Edit this map (handle → style)
 * when adding presentation for a new brand; or, better, store the logo URL on the Brand row
 * itself (`logo_url`) and the storefront will use that instead.
 */

const LOGO_BASE = "/images/brands/logos"

export type BrandPresentation = {
  initials: string
  bgClass: string
  logoSrc?: string
}

const BRAND_PRESENTATION_BY_HANDLE: Record<string, BrandPresentation> = {
  "as-colour": { initials: "AS", bgClass: "bg-zinc-900", logoSrc: `${LOGO_BASE}/as-colour.png` },
  gildan: { initials: "G", bgClass: "bg-blue-700", logoSrc: `${LOGO_BASE}/gildan.png` },
  syzmik: { initials: "SY", bgClass: "bg-slate-800", logoSrc: `${LOGO_BASE}/syzmik-workwear.svg` },
  "biz-collection": { initials: "B+", bgClass: "bg-rose-800", logoSrc: `${LOGO_BASE}/biz-collection.svg` },
  "american-apparel": { initials: "AA", bgClass: "bg-neutral-800", logoSrc: `${LOGO_BASE}/american-apparel.png` },
  anvil: { initials: "A", bgClass: "bg-slate-700", logoSrc: `${LOGO_BASE}/anvil.png` },
  "dnc-workwear": { initials: "DNC", bgClass: "bg-zinc-600", logoSrc: `${LOGO_BASE}/dnc.png` },
  grace: { initials: "GC", bgClass: "bg-stone-500", logoSrc: `${LOGO_BASE}/grace.svg` },
  ramo: { initials: "R", bgClass: "bg-emerald-800", logoSrc: `${LOGO_BASE}/ramo.svg` },
  "aussie-pacific": { initials: "AP", bgClass: "bg-sky-900" },
  "winning-spirit": { initials: "WS", bgClass: "bg-indigo-900" },
  fashionbiz: { initials: "FZ", bgClass: "bg-rose-900" },
  "biz-care": { initials: "BC", bgClass: "bg-teal-700" },
  "biz-corporates": { initials: "BC", bgClass: "bg-blue-800" },
  "stanley-stella": { initials: "SS", bgClass: "bg-stone-700" },
  "next-level": { initials: "NL", bgClass: "bg-zinc-800" },
  honeybee: { initials: "HB", bgClass: "bg-amber-700" },
}

const FALLBACK_PRESENTATION: BrandPresentation = {
  initials: "B",
  bgClass: "bg-stone-500",
}

export function getBrandPresentation(handle: string): BrandPresentation {
  return BRAND_PRESENTATION_BY_HANDLE[handle.toLowerCase()] ?? FALLBACK_PRESENTATION
}

export function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3)
}
