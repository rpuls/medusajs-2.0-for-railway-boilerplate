"use client"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

const RefinementList = () => {
  const pathname = usePathname()
  const [categories, setCategories] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { product_categories } = await getCategoriesList(0, 100)
      const { collections } = await getCollectionsList(0, 100)
      setCategories(product_categories)
      setCollections(collections)
    }

    fetchData()
  }, [])

  const currentPath = pathname.split("/")[1] // e.g. "de" or "en"

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem] uppercase text-xs text-gray-700">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-gray-500">Categories</span>
          {categories.map((c) => (
            <LocalizedClientLink
              key={c.id}
              href={`/${currentPath}/categories/${c.handle}`}
              className="text-left text-sm text-gray-600 hover:underline"
            >
              {c.name}
            </LocalizedClientLink>
          ))}
        </div>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-gray-500">Collections</span>
          {collections.map((c) => (
            <LocalizedClientLink
              key={c.id}
              href={`/${currentPath}/collections/${c.handle}`}
              className="text-left text-sm text-gray-600 hover:underline"
            >
              {c.title}
            </LocalizedClientLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default RefinementList
