"use client"

import { Fragment, useState } from "react"
import { Popover, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { useToggleState } from "@medusajs/ui"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CountrySelect from "../country-select"
import { HttpTypes } from "@medusajs/types"

const menuCategories = [
  {
    label: "Áo Nam",
    href: "/collections/ao-nam",
    sub: [
      { label: "Áo thun", href: "/collections/ao-thun" },
      { label: "Áo sơ mi", href: "/collections/ao-so-mi" },
      { label: "Áo khoác", href: "/collections/ao-khoac" },
    ],
  },
  {
    label: "Quần Nam",
    href: "/collections/quan-nam",
    sub: [
      { label: "Quần dài", href: "/collections/quan-dai" },
      { label: "Quần short", href: "/collections/quan-short" },
    ],
  },
  {
    label: "Binder",
    href: "/collections/binder",
    sub: [],
  },
  {
    label: "Phụ Kiện",
    href: "/collections/phu-kien",
    sub: [],
  },
]

const flatLinks = [
  { label: "Câu chuyện", href: "/cau-chuyen" },
  { label: "Hệ thống cửa hàng", href: "/store" },
]

const SideMenu = ({ regions }: { regions: HttpTypes.StoreRegion[] | null }) => {
  const toggleState = useToggleState()
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const toggleCategory = (label: string) => {
    setOpenCategory((prev) => (prev === label ? null : label))
  }

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <Popover.Button
                data-testid="nav-menu-button"
                className="relative h-full flex items-center font-hanken text-sm font-semibold uppercase tracking-wider text-kin-on-surface-variant hover:text-kin-primary transition-colors focus:outline-none"
              >
                Menu
              </Popover.Button>

              {/* Backdrop */}
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div
                  className="fixed inset-0 bg-black/40 z-40"
                  onClick={close}
                />
              </Transition>

              {/* Slide-in panel */}
              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Popover.Panel
                  static
                  className="fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-white z-50 flex flex-col overflow-y-auto"
                  data-testid="nav-menu-popup"
                >
                  {/* Banner image */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/kin-store-hero-4k-v1.png"
                      alt="KIN STORE"
                      fill
                      className="object-cover"
                      priority
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display =
                          "none"
                      }}
                    />
                    {/* Close button */}
                    <button
                      data-testid="close-menu-button"
                      onClick={close}
                      className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-kin-on-surface hover:bg-white transition-colors"
                    >
                      <XMark className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Accordion categories */}
                  <nav className="flex flex-col flex-1">
                    {menuCategories.map((cat) => (
                      <div
                        key={cat.label}
                        className="border-b border-kin-outline-variant"
                      >
                        <div className="flex items-center justify-between">
                          <LocalizedClientLink
                            href={cat.href}
                            onClick={close}
                            className="flex-1 px-6 py-4 font-hanken text-base font-semibold text-kin-on-surface hover:text-kin-primary transition-colors"
                          >
                            {cat.label}
                          </LocalizedClientLink>
                          {cat.sub.length > 0 && (
                            <button
                              onClick={() => toggleCategory(cat.label)}
                              className="px-4 py-4 text-kin-on-surface-variant hover:text-kin-primary transition-colors"
                              aria-label="Mở rộng"
                            >
                              <span className="material-symbols-outlined text-xl leading-none">
                                {openCategory === cat.label ? "remove" : "add"}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Sub-items */}
                        {cat.sub.length > 0 && openCategory === cat.label && (
                          <ul className="pb-2 bg-kin-surface-variant/30">
                            {cat.sub.map((sub) => (
                              <li key={sub.label}>
                                <LocalizedClientLink
                                  href={sub.href}
                                  onClick={close}
                                  className="block px-8 py-2.5 font-hanken text-sm text-kin-on-surface-variant hover:text-kin-primary transition-colors"
                                >
                                  {sub.label}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}

                    {/* Flat links */}
                    {flatLinks.map((link) => (
                      <div
                        key={link.label}
                        className="border-b border-kin-outline-variant"
                      >
                        <LocalizedClientLink
                          href={link.href}
                          onClick={close}
                          className="block px-6 py-4 font-hanken text-base font-semibold text-kin-on-surface hover:text-kin-primary transition-colors"
                        >
                          {link.label}
                        </LocalizedClientLink>
                      </div>
                    ))}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Country select */}
                    {regions && (
                      <div
                        className="px-6 py-4 border-t border-kin-outline-variant flex items-center justify-between"
                        onMouseEnter={toggleState.open}
                        onMouseLeave={toggleState.close}
                      >
                        <CountrySelect
                          toggleState={toggleState}
                          regions={regions}
                        />
                      </div>
                    )}
                  </nav>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
