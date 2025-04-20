"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import SortProducts, { SortOptions } from "./sort-products"

const RefinementList = ({
  sortBy,
  "data-testid": dataTestId,
}: {
  sortBy: SortOptions
  "data-testid"?: string
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { product_categories } = await getCategoriesList(0, 100)
      const { collections } = await getCollectionsList(0, 100)
      setCategories(product_categories.filter((c) => !c.parent_category))
      setCollections(collections)
    }
    fetchData()
  }, [])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        <SortProducts
          sortBy={sortBy}
          setQueryParams={setQueryParams}
          data-testid={dataTestId}
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase text-gray-500">Category</span>
          <button
            onClick={() => setQueryParams("categoryId", "")}
            className={`text-left text-sm hover:underline ${
              !searchParams.get("categoryId") ? "font-semibold" : "text-gray-600"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setQueryParams("categoryId", cat.id)}
              className={`text-left text-sm hover:underline ${
                searchParams.get("categoryId") === cat.id ? "font-semibold" : "text-gray-600"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {collections.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase text-gray-500">Collection</span>
          <button
            onClick={() => setQueryParams("collectionId", "")}
            className={`text-left text-sm hover:underline ${
              !searchParams.get("collectionId") ? "font-semibold" : "text-gray-600"
            }`}
          >
            All Collections
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => setQueryParams("collectionId", col.id)}
              className={`text-left text-sm hover:underline ${
                searchParams.get("collectionId") === col.id ? "font-semibold" : "text-gray-600"
              }`}
            >
              {col.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RefinementList
