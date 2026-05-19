"use client"

import { Popover } from "@headlessui/react"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { clx, useToggleState } from "@medusajs/ui"
import NavLink from "@modules/common/components/nav-link"
import CountrySelect from "../country-select"
import { services } from "@modules/services/data"
import {
  brandInitials,
  getBrandPresentation,
} from "@modules/brands/data/brands"
import { HttpTypes } from "@medusajs/types"

const MENU_COLLECTIONS_CAP = 6

// Home, Search, Account, Cart are already in the sticky header — no need to duplicate here.
const SideMenuItems = {
  Store: "/store",
  Customizer: "/customizer",
  Services: "/services",
  Brands: "/brands",
  BYO: "/byo",
  "Contact Us": "/contact",
}

export type SideMenuBrowseGroup = {
  title: string
  items: Array<{ label: string; href: string }>
}

const SERVICES_GROUP: SideMenuBrowseGroup = {
  title: "Services",
  items: services.map((s) => ({
    label: s.title,
    href: `/services/${s.slug}`,
  })),
}

const discoverLinks: Array<{ label: string; href: string; testId: string }> = [
  { label: "Explore", href: "/explore", testId: "explore-link" },
  { label: "DTF builder", href: "/dtf-builder", testId: "dtf-builder-link" },
  { label: "3D Print Design", href: "/3d-print-design", testId: "3d-print-design-link" },
  { label: "FAQ", href: "/faq", testId: "faq-link" },
]

export type MenuCollectionLink = {
  handle: string
  title: string
}

export type SideMenuBrandLink = {
  handle: string
  name: string
  logoUrl: string | null
}

const SideMenu = ({
  regions,
  collectionLinks,
  categoryBrowseGroups = [],
  brandLinks = [],
}: {
  regions: HttpTypes.StoreRegion[] | null
  collectionLinks: MenuCollectionLink[]
  categoryBrowseGroups?: SideMenuBrowseGroup[]
  brandLinks?: SideMenuBrandLink[]
}) => {
  const toggleState = useToggleState()
  const safeCollectionLinks = collectionLinks ?? []
  const collectionPreview = safeCollectionLinks.slice(0, MENU_COLLECTIONS_CAP)

  const browseGroups: SideMenuBrowseGroup[] = [
    ...categoryBrowseGroups,
    SERVICES_GROUP,
  ].filter((g) => g.items.length > 0)

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  data-no-squish
                  className="relative h-full flex items-center text-base font-medium text-[var(--brand-secondary)] transition-all ease-out duration-200 focus:outline-none hover:text-[var(--brand-accent)]"
                >
                  Menu
                </Popover.Button>
              </div>

              <Popover.Overlay className="fixed inset-0 z-[35] bg-[var(--brand-primary)]/35 backdrop-blur-sm" />
              <Popover.Panel
                data-testid="nav-menu-popup"
                className="fixed inset-x-0 top-20 z-40 flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden border-t-2 border-white/20 bg-[rgba(12,17,23,0.82)] text-sm text-[#F8FAFC] shadow-lg outline-none backdrop-blur-2xl"
              >
                <div className="content-container flex min-h-0 flex-1 flex-col py-6">
                  <div className="flex shrink-0 justify-end pb-4">
                    <button
                      data-testid="close-menu-button"
                      data-no-squish
                      type="button"
                      onClick={close}
                      className="rounded-full p-1 text-[rgba(248,250,252,0.95)] transition-colors hover:text-[var(--brand-secondary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]"
                    >
                      <XMark className="size-6" aria-hidden />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto pr-1 no-scrollbar">
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
                      <div className="lg:col-span-3">
                        <h2 className="mb-3 txt-compact-small uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                          Quick links
                        </h2>
                        <ul className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 lg:grid-cols-1">
                          {Object.entries(SideMenuItems).map(([name, href]) => (
                            <li key={name}>
                              <NavLink
                                href={href}
                                onClick={close}
                                className="text-base font-medium leading-snug text-[rgba(248,250,252,0.96)] transition-colors hover:text-[var(--brand-secondary)]"
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-[var(--brand-accent)]/35 pt-8 lg:col-span-6 lg:border-t-0 lg:pt-0">
                        <h2 className="mb-4 border-t border-[var(--brand-accent)]/35 pt-6 txt-compact-small uppercase tracking-[0.12em] text-[var(--brand-accent)] lg:border-t-0 lg:pt-0">
                          Services
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                          {browseGroups.map((group) => (
                            <div key={group.title} className="min-w-0">
                              <h3 className="mb-2 txt-compact-small text-[var(--brand-accent)]">
                                {group.title}
                              </h3>
                              <ul className="space-y-1">
                                {group.items.map((item) => (
                                  <li key={`${group.title}-${item.label}`}>
                                    <NavLink
                                      href={item.href}
                                      onClick={close}
                                      className="text-sm leading-6 text-[rgba(248,250,252,0.95)] transition-colors hover:text-[var(--brand-secondary)]"
                                    >
                                      {item.label}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-8 border-t border-[var(--brand-accent)]/35 pt-8 lg:col-span-3 lg:border-t-0 lg:pt-0">
                        <div>
                          <h2 className="mb-3 txt-compact-small uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                            Discover
                          </h2>
                          <ul className="space-y-1.5">
                            {discoverLinks.map((item) => (
                              <li key={item.href}>
                                <NavLink
                                  href={item.href}
                                  onClick={close}
                                  className="text-sm leading-6 text-[rgba(248,250,252,0.95)] transition-colors hover:text-[var(--brand-secondary)]"
                                  data-testid={item.testId}
                                >
                                  {item.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h2 className="mb-3 txt-compact-small uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                            Collections
                          </h2>
                          <ul className="space-y-1.5">
                            {collectionPreview.map((c) => (
                              <li key={c.handle}>
                                <NavLink
                                  href={`/collections/${c.handle}`}
                                  onClick={close}
                                  className="text-sm leading-6 text-[rgba(248,250,252,0.95)] transition-colors hover:text-[var(--brand-secondary)]"
                                  data-testid={`nav-menu-collection-${c.handle}`}
                                >
                                  {c.title}
                                </NavLink>
                              </li>
                            ))}
                            <li>
                              <NavLink
                                href="/sitemap"
                                onClick={close}
                                className="text-sm font-medium leading-6 text-[var(--brand-secondary)] transition-colors hover:text-[var(--brand-accent)]"
                                data-testid="nav-menu-sitemap-link"
                              >
                                Browse all →
                              </NavLink>
                            </li>
                          </ul>
                        </div>

                      </div>
                    </div>

                    {brandLinks.length > 0 ? (
                      <div className="mt-10 border-t border-[var(--brand-accent)]/35 pt-8">
                        <h2 className="mb-4 txt-compact-small uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                          Brands
                        </h2>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                          {brandLinks.map((brand) => {
                            const presentation = getBrandPresentation(brand.handle)
                            const logoSrc = brand.logoUrl ?? presentation.logoSrc ?? null
                            return (
                              <li key={brand.handle}>
                                <NavLink
                                  href={`/brands/${brand.handle}`}
                                  onClick={close}
                                  className="group flex items-center gap-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
                                  data-testid={`menu-brand-${brand.handle}-link`}
                                >
                                  <span
                                    className={clx(
                                      "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md",
                                      !logoSrc && presentation.bgClass
                                    )}
                                  >
                                    {logoSrc ? (
                                      <img
                                        src={logoSrc}
                                        alt={brand.name}
                                        className="h-8 w-auto max-w-full object-contain"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <span className="text-xs font-semibold uppercase tracking-wide text-white">
                                        {brandInitials(brand.name)}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-sm leading-snug text-[rgba(248,250,252,0.95)] group-hover:text-[var(--brand-secondary)]">
                                    {brand.name}
                                  </span>
                                </NavLink>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 shrink-0 border-t border-[var(--brand-accent)]/20 pt-4">
                    <div
                      className="flex justify-between text-[var(--brand-secondary)]"
                      onMouseEnter={toggleState.open}
                      onMouseLeave={toggleState.close}
                    >
                      {regions && (
                        <CountrySelect
                          toggleState={toggleState}
                          regions={regions}
                        />
                      )}
                      <ArrowRightMini
                        className={clx(
                          "size-5 shrink-0 transition-transform duration-150",
                          toggleState.state ? "-rotate-90" : ""
                        )}
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
              </Popover.Panel>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
