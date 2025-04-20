// src/modules/store/components/refinement-list/index.tsx

"use client"

import { usePathname } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { getCollectionsList } from "@lib/data/collections"
import { getCategoriesList } from "@lib/data/categories"
import { useEffect, useState } from "react"
import Link from "next/link"
import { clx } from "@medusajs/ui"

export default function RefinementList({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const sortBy = searchParams.get("sortBy") || "created_at"
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    getCategoriesList(0, 100).then(({ product_categories }) => {
      setCategories(product_categories.filter((c) => !c.parent_category))
    })
    getCollectionsList(0, 100).then(({ collections }) => {
      setCollections(collections)
    })
  }, [])

  const buildLink = (base: string) => {
    return `/${countryCode}${base}${sortBy ? `?sortBy=${sortBy}` : ""}`
  }

  const updateSort = (sort: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set("sortBy", sort)
    router.replace(`${pathname}?${newParams.toString()}`)
  }

  return (
    <div className="w-full px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-0 lg:pt-10">
      <div className="flex flex-col gap-y-8 text-sm tracking-wider">
        <div className="flex flex-col gap-2">
          <span className="font-medium text-ui-fg-base uppercase">Sort by</span>
          <ul className="grid grid-cols-1 gap-1">
            <li>
              <button
                onClick={() => updateSort("created_at")}
                className={clx("hover:underline", sortBy === "created_at" && "font-semibold")}
              >
                Latest Arrivals
              </button>
            </li>
            <li>
              <button
                onClick={() => updateSort("price_asc")}
                className={clx("hover:underline", sortBy === "price_asc" && "font-semibold")}
              >
                Price: Low → High
              </button>
            </li>
            <li>
              <button
                onClick={() => updateSort("price_desc")}
                className={clx("hover:underline", sortBy === "price_desc" && "font-semibold")}
              >
                Price: High → Low
              </button>
            </li>
          </ul>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-col gap-2 pt-4">
            <span className="font-medium text-ui-fg-base uppercase">Category</span>
            <ul className="grid grid-cols-1 gap-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildLink(`/categories/${c.handle}`)}
                    className={clx("hover:underline", pathname.includes(c.handle) && "font-semibold")}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {collections.length > 0 && (
          <div className="flex flex-col gap-2 pt-4">
            <span className="font-medium text-ui-fg-base uppercase">Collection</span>
            <ul className="grid grid-cols-1 gap-1">
              {collections.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildLink(`/collections/${c.handle}`)}
                    className={clx("hover:underline", pathname.includes(c.handle) && "font-semibold")}
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
