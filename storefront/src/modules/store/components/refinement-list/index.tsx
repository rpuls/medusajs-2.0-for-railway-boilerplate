"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

import SortProducts, { SortOptions } from "./sort-products"
import FilterRadioGroup from "@modules/common/components/filter-radio-group"

const categories = [
  { value: "", label: "All Categories" },
  { value: "tshirts", label: "T-Shirts" },
  { value: "sweatshirts", label: "Sweatshirts" },
  { value: "accessories", label: "Accessories" },
]

const collections = [
  { value: "", label: "All Collections" },
  { value: "spring", label: "Spring" },
  { value: "love", label: "Love" },
]

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const RefinementList = ({ sortBy, "data-testid": dataTestId }: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

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
      <SortProducts
        sortBy={sortBy}
        setQueryParams={setQueryParams}
        data-testid={dataTestId}
      />

      <FilterRadioGroup
        title="Category"
        items={categories}
        value={searchParams.get("category") || ""}
        handleChange={(value) => setQueryParams("category", value)}
      />

      <FilterRadioGroup
        title="Collection"
        items={collections}
        value={searchParams.get("collection") || ""}
        handleChange={(value) => setQueryParams("collection", value)}
      />
    </div>
  )
}

export default RefinementList
