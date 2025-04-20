"use client"

import { usePathname } from "next/navigation"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function RefinementList() {
  const pathname = usePathname()
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const { product_categories } = await getCategoriesList(0, 100)
      const { collections } = await getCollectionsList(0, 100)
      setCategories(product_categories || [])
      setCollections(collections || [])
    }
    fetchData()
  }, [])

  const currentPath = pathname.split("?")[0]

  return (
    <div className="flex flex-col gap-y-8 text-small-regular">
      {/* Sort By */}
      <div className="flex flex-col gap-y-2">
        <span className="uppercase text-ui-fg-base text-sm">Sort by</span>
        <ul className="flex flex-col gap-2 text-ui-fg-subtle text-sm">
          <li>
            <LocalizedClientLink
              href={`${currentPath}?sortBy=created_at`}
              className="hover:underline"
            >
              Latest Arrivals
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href={`${currentPath}?sortBy=price_asc`}
              className="hover:underline"
            >
              Price: Low → High
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink
              href={`${currentPath}?sortBy=price_desc`}
              className="hover:underline"
            >
              Price: High → Low
            </LocalizedClientLink>
          </li>
        </ul>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="uppercase text-ui-fg-base text-sm">Category</span>
          <ul className="flex flex-col gap-2 text-ui-fg-subtle text-sm">
            {categories
              .filter((c) => !c.parent_category)
              .map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="hover:underline"
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="uppercase text-ui-fg-base text-sm">Collection</span>
          <ul className="flex flex-col gap-2 text-ui-fg-subtle text-sm">
            {collections.map((collection) => (
              <li key={collection.id}>
                <LocalizedClientLink
                  href={`/collections/${collection.handle}`}
                  className="hover:underline"
                >
                  {collection.title}
                </LocalizedClientLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
