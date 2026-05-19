import { getCollectionsList } from "@lib/data/collections"
import { getInstagramProfileUrl } from "@lib/data/instagram"
import { Text, clx } from "@medusajs/ui"
import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewsletterSignup from "./newsletter-signup"

export default async function Footer() {
  const { collections } = await getCollectionsList(0, 6).catch(() => ({
    collections: [],
    count: 0,
  }))
  const instagramUrl = getInstagramProfileUrl()

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 items-start gap-y-10 gap-x-8 py-12 lg:grid-cols-4 lg:gap-y-0">
          <div className="flex min-w-0 flex-col gap-4 lg:pr-2">
            <LocalizedClientLink
              href="/"
              className="inline-flex w-fit items-center"
            >
              <Image
                src="/branding/sc-prints-logo-transparent.png"
                alt="SC Prints"
                width={158}
                height={52}
                className="h-10 w-auto"
              />
            </LocalizedClientLink>
            <p className="text-small-regular text-ui-fg-subtle max-w-[22rem]">
              Premium decorated apparel and merchandise for teams, brands, and events across
              Australia.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-small-semi text-ui-fg-subtle hover:text-ui-fg-base"
              >
                Instagram
              </a>
            </div>
          </div>

          <div className="min-w-0 text-small-regular">
            <h2 className="txt-small-plus text-ui-fg-base">Quick Links</h2>
            <ul className="mt-3 grid grid-cols-1 gap-1.5 text-ui-fg-subtle txt-small sm:grid-cols-2 sm:gap-x-6 sm:gap-y-1.5 lg:grid-cols-1">
              <li>
                <LocalizedClientLink href="/" className="hover:text-ui-fg-base">
                  Home
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/store" className="hover:text-ui-fg-base">
                  Store
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/customizer" className="hover:text-ui-fg-base">
                  Logo Customizer
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/brands" className="hover:text-ui-fg-base">
                  Brands
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/spirits" className="hover:text-ui-fg-base">
                  Custom bottles
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/byo" className="hover:text-ui-fg-base">
                  BYO merch
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/contact" className="hover:text-ui-fg-base">
                  Contact Us
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/search" className="hover:text-ui-fg-base">
                  Search
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/sitemap" className="hover:text-ui-fg-base">
                  Site map
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/account" className="hover:text-ui-fg-base">
                  Account
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/old-hero" className="hover:text-ui-fg-base">
                  Old home page animation
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/particle-logo" className="hover:text-ui-fg-base">
                  Particle logo
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/particle-flow" className="hover:text-ui-fg-base">
                  Particle Flow
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/particle-threejs" className="hover:text-ui-fg-base">
                  Particle three.js
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/jungle-scene" className="hover:text-ui-fg-base">
                  Jungle scene
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/test/animation-widgets" className="hover:text-ui-fg-base">
                  Animation widgets lab
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <div className="min-w-0 text-small-regular">
            <h2 className="txt-small-plus text-ui-fg-base">Policies</h2>
            <ul className="mt-3 flex flex-col gap-1.5 text-ui-fg-subtle txt-small">
              <li>
                <LocalizedClientLink href="/shipping-policy" className="hover:text-ui-fg-base">
                  Shipping Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/returns-policy" className="hover:text-ui-fg-base">
                  Returns Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/privacy-policy" className="hover:text-ui-fg-base">
                  Privacy Policy
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          <div className="min-w-0 text-small-regular">
            <h2 className="txt-small-plus text-ui-fg-base">Newsletter</h2>
            <p className="mt-3 text-ui-fg-subtle txt-small">
              Get product updates, promos, and print tips straight to your inbox.
            </p>
            <NewsletterSignup />
          </div>
        </div>

        {collections && collections.length > 0 && (
          <div className="border-t border-ui-border-base py-8">
            <h2 className="txt-small-plus text-ui-fg-base">Top Collections</h2>
            <ul
              className={clx(
                "mt-3 grid gap-2 text-ui-fg-subtle txt-small grid-cols-2 small:grid-cols-3 large:grid-cols-6"
              )}
            >
              {collections.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <LocalizedClientLink className="hover:text-ui-fg-base" href={`/collections/${c.handle}`}>
                    {c.title}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex w-full border-t border-ui-border-base pt-8 text-ui-fg-muted">
          <Text className="txt-compact-small" as="p">
            © {new Date().getFullYear()} SC PRINTS. All rights reserved.
          </Text>
        </div>
      </div>
    </footer>
  )
}
