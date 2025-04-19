"use client"

import { usePathname } from "next/navigation"
import { Suspense } from "react"

import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import Link from "next/link"

const sections = [
  { name: "store", href: "/" },
  { name: "gallery", href: "/gallery" },
  { name: "about", href: "/about" },
]

export default function Nav() {
  const pathname = usePathname()

  const current = sections.find((s) => pathname.includes(s.href))?.name

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-16 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="content-container flex items-center justify-between w-full h-full text-base font-sans tracking-wide">
          {/* Side Menu */}
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={[]} /> {/* Пока просто, без async */}
            </div>
          </div>

          {/* Логотип + путь */}
          <div className="flex items-center h-full font-sans font-bold text-lg uppercase tracking-widest">
            <Link href="/" className="text-black">GMORKL</Link>
            {current && (
              <>
                <span className="mx-1">.</span>
                <span className="text-red-600">{current}</span>
              </>
            )}
          </div>

          {/* Навигация */}
          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-6 h-full">
              <Link
                className="hover:text-ui-fg-base font-sans uppercase font-normal"
                href="/account"
              >
                ACCOUNT
              </Link>
            </div>
            <Suspense fallback={<Link href="/cart">CART (0)</Link>}>
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
