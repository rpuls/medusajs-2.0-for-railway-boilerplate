import { Suspense } from "react"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import { getCollectionsList } from "@lib/data/collections" // Importă funcția getCollectionsList
import { RxAvatar } from "react-icons/rx"

export default async function Nav() {
  const regions = await listRegions().then((regions: StoreRegion[]) => regions)
  const { collections } = await getCollectionsList() // Obține colecțiile din funcția getCollectionsList

  const SideMenuItems = {
    Magazin: "/", // Înlocuim acest link cu dropdown pentru colecții
    Cursuri: "/cursuri",
    "Despre Noi": "/despre-noi",
    Contact: "/contact",
    "Cursuri Profesionale": "/cursuri",
  }

  return (
    <div className="sticky top-0 inset-x-0 z-50">
      <header className="relative h-24 mx-auto border-b duration-200 bg-white border-ui-border-base">
        <nav className="flex flex-col content-container txt-xsmall-plus text-ui-fg-subtle items-center justify-center w-full h-full text-small-regular">
          <div className="flex justify-center items-center gap-[16px] h-full w-[900px]">
            <div className="flex-1 flex items-center justify-center">
              <LocalizedClientLink
                href="/"
                className="txt-compact-xlarge-plus hover:text-ui-fg-base uppercase"
                data-testid="nav-store-link"
              >
                LorenaLash
              </LocalizedClientLink>
            </div>
            <div className="h-[40px] w-[400px] border-[1px] border-black" />

            <div className="flex items-center gap-x-6 flex-1 justify-center">
              <LocalizedClientLink
                className="flex flex-row items-center gap-1 text-lg hover:text-ui-fg-base "
                href="/account"
                data-testid="nav-account-link"
              >
                <span className="text-[24px]"><RxAvatar /></span>
                <span>Contul Meu</span>
              </LocalizedClientLink>
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="hover:text-ui-fg-base flex flex-row gap-1 "
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    <span>Cos (0)</span>
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>
          <span className="h-[1px] w-screen bg-gray-300" />

          <ul className="flex gap-[16px] items-center justify-center gap-[24px]">
            {/* Renderizare dinamică pentru meniul lateral */}
            {Object.entries(SideMenuItems).map(([name, href]) => {
              // Dropdown pentru Produse
              if (name === "Magazin") {
                return (
                  <li key={name} className="relative group">
                    {/* Numai "Produse" va activa dropdown-ul */}
                    <span className="text-lg leading-10 hover:text-ui-fg-disabled cursor-pointer">
                      {name}
                    </span>
                    {/* Dropdown pentru colecții */}
                    <ul className="absolute hidden group-hover:block bg-white border w-[200px] p-4 shadow-lg z-50">
                    <li  className="py-2">
                          <LocalizedClientLink
                            href={`/magazin`}
                            className="text-sm text-gray-700 hover:text-ui-fg-base"
                          >
                            TOATE PRODUSELE
                          </LocalizedClientLink>
                        </li>
                      {collections?.map((collection) => (
                        <li key={collection.id} className="py-2">
                          <LocalizedClientLink
                            href={`/collections/${collection.handle}`}
                            className="text-sm text-gray-700 hover:text-ui-fg-base"
                          >
                            {collection.title.toUpperCase()}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              }

              // Pentru restul elementelor din meniu
              return (
                <li key={name}>
                  <LocalizedClientLink
                    href={href}
                    className="text-lg leading-10 hover:text-ui-fg-disabled"
                    data-testid={`${name.toLowerCase()}-link`}
                  >
                    {name}
                  </LocalizedClientLink>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>
    </div>
  )
}
