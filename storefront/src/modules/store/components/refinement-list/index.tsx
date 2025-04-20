"use client"

import { usePathname } from "next/navigation"
import { useMemo } from "react"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function RefinementList() {
  const pathname = usePathname()

  const { product_categories } = await getCategoriesList(0, 100)
  const { collections } = await getCollectionsList(0, 100)

  const sortOptions = [
    { value: "created_at", label: "Latest Arrivals" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
  ]

  const currentSort = useMemo(() => {
    const url = new URL(window.location.href)
    return url.searchParams.get("sortBy") || "created_at"
  }, [])

  return (
    <aside className="flex flex-col gap-y-8 text-base">
      {/* Sort By */}
      <div className="flex flex-col gap-y-2">
        <span className="uppercase font-semibold text-xs">Sort By</span>
        <ul className="flex flex-col gap-y-1">
          {sortOptions.map((option) => (
            <li key={option.value}>
              <LocalizedClientLink
                href={`${pathname.split("?")[0]}?sortBy=${option.value}`}
                className={`hover:underline ${
                  currentSort === option.value ? "font-semibold" : ""
                }`}
              >
                {option.label}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      {product_categories?.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="uppercase font-semibold text-xs">Category</span>
          <ul className="flex flex-col gap-y-1">
            {product_categories
              .filter((cat) => !cat.parent_category)
              .map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className={`hover:underline ${
                      pathname.includes(`/categories/${category.handle}`)
                        ? "font-semibold"
                        : ""
                    }`}
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Collections */}
      {collections?.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="uppercase font-semibold text-xs">Collection</span>
          <ul className="flex flex-col gap-y-1">
            {collections.map((col) => (
              <li key={col.id}>
                <LocalizedClientLink
                  href={`/collections/${col.handle}`}
                  className={`hover:underline ${
                    pathname.includes(`/collections/${col.handle}`)
                      ? "font-semibold"
                      : ""
                  }`}
                >
                  {col.title}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
