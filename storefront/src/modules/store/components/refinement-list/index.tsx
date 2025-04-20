"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { SortOptions } from "./sort-products"

const sortOptions = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low -> High" },
  { value: "price_desc", label: "Price: High -> Low" },
]

type RefinementListProps = {
  sortBy: SortOptions
  "data-testid"?: string
}

const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const [categories, setCategories] = useState<{ name: string; handle: string; id: string }[]>([])
  const [collections, setCollections] = useState<{ title: string; handle: string; id: string }[]>([])
  const pathname = usePathname()

  useEffect(() => {
    getCategoriesList(0, 10).then(({ product_categories }) => {
      const flatCategories = product_categories
        .filter((c: any) => !c.parent_category)
        .map((c: any) => ({ name: c.name, handle: c.handle, id: c.id }))
      setCategories(flatCategories)
    })
    getCollectionsList(0, 10).then(({ collections }) => {
      setCollections(collections.map((c: any) => ({ title: c.title, handle: c.handle, id: c.id })))
    })
  }, [])

  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem] text-sm tracking-wider uppercase">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-gray-500">Sort by</span>
        {sortOptions.map(({ value, label }) => (
          <Link
            key={value}
            href={`${pathname}?sortBy=${value}`}
            className={`hover:underline ${sortBy === value ? "font-semibold" : "text-gray-600"}`}
            data-testid={dataTestId}
          >
            {label}
          </Link>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">Category</span>
          <Link
            href="/store"
            className={`hover:underline ${pathname === "/store" ? "font-semibold" : "text-gray-600"}`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="hover:underline text-gray-600"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {collections.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-gray-500">Collection</span>
          <Link
            href="/store"
            className={`hover:underline ${pathname === "/store" ? "font-semibold" : "text-gray-600"}`}
          >
            All Collections
          </Link>
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.handle}`}
              className="hover:underline text-gray-600"
            >
              {col.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default RefinementList
