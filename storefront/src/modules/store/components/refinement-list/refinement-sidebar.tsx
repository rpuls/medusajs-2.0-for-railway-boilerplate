"use client"

import SortProducts, { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type Props = {
  sortBy: SortOptions
}

const categories = [
  { label: "T-Shirts", value: "tshirts" },
  { label: "Sweatshirts", value: "sweatshirts" },
  { label: "Accessories", value: "accessories" },
]

const collections = [
  { label: "Spring 2025", value: "spring2025" },
  { label: "Limited Edition", value: "limited" },
]

const RefinementSidebar = ({ sortBy }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString())
    params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="text-xs uppercase tracking-wider font-[505] space-y-10">
      <div>
        <SortProducts sortBy={sortBy} setQueryParams={setQueryParams} />
      </div>

      <div>
        <h3 className="mb-2 font-[505]">Categories</h3>
        <ul className="space-y-1 font-normal normal-case">
          {categories.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => setQueryParams("categoryId", c.value)}
                className="hover:underline"
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 font-[505]">Collections</h3>
        <ul className="space-y-1 font-normal normal-case">
          {collections.map((c) => (
            <li key={c.value}>
              <button
                onClick={() => setQueryParams("collectionId", c.value)}
                className="hover:underline"
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default RefinementSidebar
