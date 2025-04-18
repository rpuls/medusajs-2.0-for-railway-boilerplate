'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import { listRegions } from '@lib/data/regions'
import { StoreRegion } from '@medusajs/types'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import CartButton from '@modules/layout/components/cart-button'
import SideMenu from '@modules/layout/components/side-menu'

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  let section = ''
  if (pathname.includes('/gallery')) section = 'gallery'
  else if (pathname.includes('/about')) section = 'about'
  else if (pathname.includes('/store')) section = 'store'

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container flex items-center justify-between w-full h-full text-base font-sans tracking-wide">
          {/* Сайд-меню слева */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} />
            </div>
          </div>

          {/* Центр — логотип */}
          <div className="flex items-center h-full justify-center">
            <Link
              href="/"
              className="font-sans font-bold text-lg uppercase tracking-widest text-black"
            >
              GMORKL
              {section && <span className="text-red-500">.{section}</span>}
            </Link>
          </div>

          {/* Справа — навигация + Cart */}
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
