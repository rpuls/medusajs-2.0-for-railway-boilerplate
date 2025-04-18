"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return <NavClient regions={regions} />
}

function NavClient({ regions }: { regions: StoreRegion[] }) {
  const pathname = usePathname()

  let section = ""
  if (pathname.includes("/gallery")) section = "GALLERY"
  else if (pathname.includes("/about")) section = "ABOUT"
  else if (pathname === "/" || pathname.includes("/store")) section = "STORE"

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container flex items-center justify-between w-full h-full text-base font-sans tracking-wide">
          {/* Side Menu */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          {/* Logo / Section */}
          <div className="flex items-center h-full">
            <LocalizedClientLink
              href="/"
              className="hover:text-ui-fg-base font-sans font-bold text-lg uppercase tracking-widest flex items-center gap-1"
              data-testid="nav-store-link"
            >
              <span className="text-black">GMORKL</span>
              {section && <span className="text-rose-600">.{section}</span>}
            </LocalizedClientLink>
          </div>

          {/* Right Side Links */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              {process.env.NEXT_PUBLIC_FEATURE_SEARCH_ENABLED && (
                <LocalizedClientLink
                  className="hover:text-ui-fg-base font-sans uppercase font-normal"
                  href="/search"
                  scroll={false}
                  data-testid="nav-search-link"
                >
                  SEARCH
                </LocalizedClientLink>
              )}
              <LocalizedClientLink
                className="hover:text-ui-fg-base font-sans uppercase font-normal"
                href="/account"
                data-testid="nav-account-link"
              >
                ACCOUNT
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2 font-sans uppercase font-normal"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  CART (0)
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
