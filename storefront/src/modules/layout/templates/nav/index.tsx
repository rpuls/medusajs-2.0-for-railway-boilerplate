import { Suspense } from "react"
import Image from "next/image"
import { MagnifyingGlassMini } from "@medusajs/icons"

import { listBrands } from "@lib/data/brands"
import { listCategories } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu, {
  type SideMenuBrandLink,
  type SideMenuBrowseGroup,
} from "@modules/layout/components/side-menu"

const MENU_BRAND_CAP = 8

type RawCategory = {
  id?: string
  handle?: string | null
  name?: string | null
  parent_category_id?: string | null
  parent_category?: { id?: string } | null
  category_children?: RawCategory[] | null
  rank?: number | null
}

const sortByRankThenName = (a: RawCategory, b: RawCategory) => {
  const ra = typeof a.rank === "number" ? a.rank : Number.POSITIVE_INFINITY
  const rb = typeof b.rank === "number" ? b.rank : Number.POSITIVE_INFINITY
  if (ra !== rb) return ra - rb
  return (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  })
}

const buildCategoryBrowseGroups = (
  categories: RawCategory[]
): SideMenuBrowseGroup[] => {
  const topLevel = categories
    .filter((c) => {
      const parentId = c.parent_category_id ?? c.parent_category?.id ?? null
      return !parentId && c.handle && c.name
    })
    .sort(sortByRankThenName)

  const groups: SideMenuBrowseGroup[] = []
  const flatItems: SideMenuBrowseGroup["items"] = []

  for (const parent of topLevel) {
    const children = (parent.category_children ?? [])
      .filter((c) => c.handle && c.name)
      .sort(sortByRankThenName)

    if (children.length > 0) {
      groups.push({
        title: parent.name as string,
        items: [
          {
            label: `All ${parent.name}`,
            href: `/categories/${parent.handle}`,
          },
          ...children.map((c) => ({
            label: c.name as string,
            href: `/categories/${parent.handle}/${c.handle}`,
          })),
        ],
      })
    } else {
      flatItems.push({
        label: parent.name as string,
        href: `/categories/${parent.handle}`,
      })
    }
  }

  if (flatItems.length > 0) {
    groups.unshift({ title: "Shop categories", items: flatItems })
  }

  return groups
}

async function NavSideMenu() {
  const [regions, { collections }, categories, brands] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    getCollectionsList(0, 100),
    listCategories().catch(() => [] as RawCategory[]),
    listBrands().catch(() => []),
  ])

  const menuCollectionLinks = [...collections]
    .filter((c) => c.handle && c.title)
    .map((c) => ({ handle: c.handle as string, title: c.title as string }))
    .sort((a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
    )

  const categoryBrowseGroups = buildCategoryBrowseGroups(
    (categories as RawCategory[]) ?? []
  )

  // Surface up to 8 brands in the menu. Prefer top-level brands (no parent_id) so the
  // group level reads cleanly — FashionBiz children (Biz Collection / Biz Care / Syzmik /
  // Biz Corporates) still show through if there aren't enough top-level rows.
  const sortedBrands = [...brands].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  )
  const topLevel = sortedBrands.filter((b) => !b.parent_id)
  const rest = sortedBrands.filter((b) => b.parent_id)
  const brandLinks: SideMenuBrandLink[] = [...topLevel, ...rest]
    .filter((b) => b.handle && b.name)
    .slice(0, MENU_BRAND_CAP)
    .map((b) => ({
      handle: b.handle,
      name: b.name,
      logoUrl: b.logo_url,
    }))

  return (
    <SideMenu
      regions={regions}
      collectionLinks={menuCollectionLinks}
      categoryBrowseGroups={categoryBrowseGroups}
      brandLinks={brandLinks}
    />
  )
}

export default function Nav() {
  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-20 mx-auto bg-ui-fg-base duration-200">
        <nav className="content-container flex h-full w-full items-center justify-between gap-6 text-base font-medium text-white">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <Suspense
                fallback={
                  <div
                    aria-hidden
                    className="h-full w-10"
                  />
                }
              >
                <NavSideMenu />
              </Suspense>
            </div>
          </div>

          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              prefetch={false}
              className="inline-flex items-center"
              data-testid="nav-store-link"
            >
              <Image
                src="/branding/sc-prints-logo-transparent.png"
                alt="SC Prints"
                width={158}
                height={52}
                className="h-12 w-auto invert"
                priority
              />
            </LocalizedClientLink>
          </div>

          <div className="flex h-full flex-1 basis-0 items-center justify-end gap-x-6 leading-none">
            <LocalizedClientLink
              className="flex h-full min-h-10 min-w-10 items-center justify-center hover:text-[var(--brand-accent)]"
              href="/search"
              prefetch={false}
              scroll={false}
              data-testid="nav-search-link"
              aria-label="Search site"
            >
              <MagnifyingGlassMini
                className="block size-6 shrink-0 translate-y-1.5 text-[currentColor]"
                aria-hidden
              />
            </LocalizedClientLink>
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <LocalizedClientLink
                className="flex h-full items-center hover:text-[var(--brand-accent)]"
                href="/account"
                prefetch={false}
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="flex gap-2 text-base font-medium hover:text-[var(--brand-accent)]"
                  href="/cart"
                  prefetch={false}
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
