import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      {/* Top announcement bar */}
      <div className="bg-kin-forest text-white py-2 text-center w-full">
        <p className="font-hanken text-xs font-semibold uppercase tracking-widest">
          Miễn phí đổi size lần đầu | Đóng gói kín đáo
        </p>
      </div>

      {/* Main navigation */}
      <header className="bg-kin-surface border-b border-kin-outline-variant">
        <nav className="max-w-kin mx-auto px-5 md:px-12 flex items-center justify-between h-20">
          {/* Left links */}
          <div className="hidden md:flex items-center gap-8">
            <LocalizedClientLink
              href="/collections/binder"
              className="font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors uppercase tracking-wider"
            >
              Binder
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/collections/thoi-trang"
              className="font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors uppercase tracking-wider"
            >
              Thời trang
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors uppercase tracking-wider"
            >
              Tất cả
            </LocalizedClientLink>
          </div>

          {/* Center logo */}
          <LocalizedClientLink
            href="/"
            className="font-hanken text-3xl font-extrabold tracking-tighter text-kin-primary absolute left-1/2 -translate-x-1/2"
            data-testid="nav-store-link"
          >
            KIN STORE
          </LocalizedClientLink>

          {/* Mobile menu */}
          <div className="md:hidden flex-1">
            <SideMenu regions={regions} />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-auto">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <LocalizedClientLink
                href="/chon-size"
                className="font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors uppercase tracking-wider"
              >
                Chọn size
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/blog"
                className="font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors uppercase tracking-wider"
              >
                Nhật ký
              </LocalizedClientLink>
            </div>
            <LocalizedClientLink
              href="/search"
              className="text-kin-primary hover:opacity-70 transition-opacity"
              aria-label="Tìm kiếm"
              data-testid="nav-search-link"
            >
              <span className="material-symbols-outlined text-2xl">search</span>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account"
              className="text-kin-primary hover:opacity-70 transition-opacity"
              aria-label="Tài khoản"
              data-testid="nav-account-link"
            >
              <span className="material-symbols-outlined text-2xl">person</span>
            </LocalizedClientLink>
            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  className="text-kin-primary hover:opacity-70 transition-opacity"
                  data-testid="nav-cart-link"
                >
                  <span className="material-symbols-outlined text-2xl">shopping_bag</span>
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
