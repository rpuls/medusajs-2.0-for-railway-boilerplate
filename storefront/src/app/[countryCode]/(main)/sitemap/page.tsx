import { Metadata } from "next"
import { listBrands } from "@lib/data/brands"
import { getCollectionsList } from "@lib/data/collections"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { services } from "@modules/services/data"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/sitemap`
  const description =
    "Browse a structured list of key pages, services, brands, and collections on the SC PRINTS store."

  return {
    title: "Site map",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Site map | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Site map | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

type LinkGroup = {
  eyebrow: string
  title: string
  description?: string
  items: { href: string; label: string }[]
}

const STATIC_GROUPS: LinkGroup[] = [
  {
    eyebrow: "Group 01",
    title: "Shop & discover",
    items: [
      { href: "/", label: "Home" },
      { href: "/store", label: "Store" },
      { href: "/brands", label: "Brands" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    eyebrow: "Group 02",
    title: "Tools & services",
    items: [
      { href: "/services", label: "All services" },
      { href: "/customizer", label: "Customizer" },
      { href: "/dtf-builder", label: "DTF builder" },
      { href: "/3d-print-design", label: "3D print design" },
      { href: "/byo", label: "BYO — bring your own" },
    ],
  },
  {
    eyebrow: "Group 03",
    title: "Account & help",
    items: [
      { href: "/account", label: "Account" },
      { href: "/cart", label: "Cart" },
      { href: "/contact", label: "Contact us" },
      { href: "/faq", label: "FAQ" },
      { href: "/guides/cmyk-dtf", label: "CMYK guide for DTF" },
    ],
  },
  {
    eyebrow: "Group 04",
    title: "Policies",
    items: [
      { href: "/shipping-policy", label: "Shipping policy" },
      { href: "/returns-policy", label: "Returns policy" },
      { href: "/privacy-policy", label: "Privacy policy" },
    ],
  },
]

export default async function SitemapPage() {
  const [{ collections }, brandsList] = await Promise.all([
    getCollectionsList(0, 100),
    listBrands().catch(() => []),
  ])

  const sortedCollections = [...collections].sort((a, b) =>
    (a.title ?? "").localeCompare(b.title ?? "", undefined, { sensitivity: "base" })
  )

  const sortedBrands = [...brandsList]
    .filter((b) => b.handle && b.name)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))

  return (
    <div className="content-container py-14 small:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Navigation
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">Site map</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          Jump to the main areas of the store, services, policies, brands, and
          product collections.
        </p>
      </header>

      <div className="mt-10 grid gap-5 large:grid-cols-2">
        {STATIC_GROUPS.map((group) => (
          <section
            key={group.title}
            className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              {group.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
              {group.title}
            </h2>
            <ul className="mt-5 grid list-none gap-2 p-0 text-sm">
              {group.items.map((item) => (
                <li key={item.href}>
                  <LocalizedClientLink
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-ui-fg-subtle transition hover:text-[var(--brand-secondary)]"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/50 transition group-hover:bg-[var(--brand-secondary)]" />
                    {item.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8 large:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Group 05
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Services
          </h2>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Decoration and production services with dedicated detail pages.
          </p>
          <ul className="mt-5 grid list-none gap-2 p-0 text-sm small:grid-cols-2 large:grid-cols-3">
            <li>
              <LocalizedClientLink
                href="/services"
                className="group inline-flex items-center gap-1.5 text-ui-fg-subtle transition hover:text-[var(--brand-secondary)]"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/50 transition group-hover:bg-[var(--brand-secondary)]" />
                All services
              </LocalizedClientLink>
            </li>
            {services.map((s) => (
              <li key={s.slug}>
                <LocalizedClientLink
                  href={`/services/${s.slug}`}
                  className="group inline-flex items-center gap-1.5 text-ui-fg-subtle transition hover:text-[var(--brand-secondary)]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/50 transition group-hover:bg-[var(--brand-secondary)]" />
                  {s.title}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </section>

        {sortedBrands.length > 0 && (
          <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8 large:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Group 06
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
              Brands
            </h2>
            <p className="mt-2 text-sm text-ui-fg-subtle">
              Dedicated landing pages for each brand we stock.
            </p>
            <ul className="mt-5 grid list-none gap-2 p-0 text-sm small:grid-cols-2 large:grid-cols-3">
              <li>
                <LocalizedClientLink
                  href="/brands"
                  className="group inline-flex items-center gap-1.5 text-ui-fg-subtle transition hover:text-[var(--brand-secondary)]"
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/50 transition group-hover:bg-[var(--brand-secondary)]" />
                  All brands
                </LocalizedClientLink>
              </li>
              {sortedBrands.map((b) => (
                <li key={b.handle}>
                  <LocalizedClientLink
                    href={`/brands/${b.handle}`}
                    className="group inline-flex items-center gap-1.5 text-ui-fg-subtle transition hover:text-[var(--brand-secondary)]"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/50 transition group-hover:bg-[var(--brand-secondary)]" />
                    {b.name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sortedCollections.length > 0 && (
          <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8 large:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Group {sortedBrands.length > 0 ? "07" : "06"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
              Collections
            </h2>
            <p className="mt-2 text-sm text-ui-fg-subtle">
              Browsable product groupings; individual products also appear
              under Store and collection pages.
            </p>
            <ul className="mt-5 grid list-none gap-2 p-0 text-sm small:grid-cols-2 large:grid-cols-3">
              {sortedCollections.map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink
                    href={`/collections/${c.handle}`}
                    className="group inline-flex items-center gap-1.5 text-ui-fg-subtle transition hover:text-[var(--brand-secondary)]"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand-secondary)]/50 transition group-hover:bg-[var(--brand-secondary)]" />
                    {c.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
