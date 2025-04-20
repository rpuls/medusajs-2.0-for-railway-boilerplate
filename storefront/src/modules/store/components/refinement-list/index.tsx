"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { SortOptions } from "./sort-products"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

type Category = {
  id: string
  name: string
  handle: string
  category_children?: Category[]
  parent_category?: string
}

type Collection = {
  id: string
  title: string
  handle: string
}

const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.product_categories || []))

    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => setCollections(data.collections || []))
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
    <div className="flex flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem] text-sm tracking-wider font-sans">
      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="uppercase text-xs text-gray-500">Categories</span>
          <ul className="grid grid-cols-1 gap-2">
            {categories.map((c) => {
              if (c.parent_category) return null
              const isActive = searchParams.get("category") === c.handle
              return (
                <li key={c.id}>
                  <button
                    className={`hover:underline ${
                      isActive ? "font-semibold" : "text-gray-600"
                    }`}
                    onClick={() => setQueryParams("category", c.handle)}
                  >
                    {c.name}
                  </button>
                  {c.category_children?.length > 0 && (
                    <ul className="ml-4 mt-1">
                      {c.category_children.map((child) => (
                        <li key={child.id}>
                          <button
                            className={`hover:underline ${
                              searchParams.get("category") === child.handle
                                ? "font-semibold"
                                : "text-gray-600"
                            }`}
                            onClick={() => setQueryParams("category", child.handle)}
                          >
                            {child.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <div className="flex flex-col gap-y-2">
          <span className="uppercase text-xs text-gray-500">Collections</span>
          <ul className="grid grid-cols-1 gap-2">
            {collections.map((c) => (
              <li key={c.id}>
                <button
                  className={`hover:underline ${
                    searchParams.get("collection") === c.handle
                      ? "font-semibold"
                      : "text-gray-600"
                  }`}
                  onClick={() => setQueryParams("collection", c.handle)}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default RefinementList
