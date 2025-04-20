"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { SortOptions } from "./sort-products"
import SortProducts from "./sort-products"

export type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    getCategoriesList(0, 100).then(({ product_categories }) => {
      setCategories(product_categories.filter((c) => !c.parent_category))
    })
    getCollectionsList(0, 100).then(({ collections }) => {
      setCollections(collections)
    })
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
            className={`text-left text-sm hover:underline ${!searchParams.get("categoryId") ? "font-semibold" : "text-gray-600"}`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setQueryParams("categoryId", c.id)}
              className={`text-left text-sm hover:underline ${searchParams.get("categoryId") === c.id ? "font-semibold" : "text-gray-600"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {collections.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase text-gray-500">Collection</span>
          <button
            onClick={() => setQueryParams("collectionId", "")}
            className={`text-left text-sm hover:underline ${!searchParams.get("collectionId") ? "font-semibold" : "text-gray-600"}`}
          >
            All Collections
          </button>
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => setQueryParams("collectionId", c.id)}
              className={`text-left text-sm hover:underline ${searchParams.get("collectionId") === c.id ? "font-semibold" : "text-gray-600"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default RefinementList
