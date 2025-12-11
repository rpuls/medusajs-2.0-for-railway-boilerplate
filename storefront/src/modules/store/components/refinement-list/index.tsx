"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { HttpTypes } from "@medusajs/types"

import FilterCollection from "./filter-collection"
import FilterCategory from "./filter-category"
import FilterPrice from "./filter-price"
import FilterBrand from "./filter-brand"
import { Brand } from "@lib/data/brands"

type RefinementListProps = {
  collections: HttpTypes.StoreCollection[]
  categories: HttpTypes.StoreProductCategory[]
  brands?: Brand[]
  search?: boolean
  'data-testid'?: string
}

const RefinementList = ({
  collections,
  categories,
  brands,
  'data-testid': dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams)
      if (Array.isArray(value)) {
        // Handle array values (for multiple selections)
        params.delete(name)
        if (value.length > 0) {
          value.forEach((v) => {
            if (v) {
              params.append(name, v)
            }
          })
        }
      } else {
        // Handle single values
        if (value) {
          params.set(name, value)
        } else {
          params.delete(name)
        }
      }
      // Reset to page 1 when filters change
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string | string[]) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  const setQueryParamsArray = (name: string, values: string[]) => {
    const query = createQueryString(name, values)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  return (
    <div className="flex small:flex-col gap-8 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <FilterCollection
        collections={collections}
        setQueryParamsArray={setQueryParamsArray}
      />
      <FilterCategory
        categories={categories}
        setQueryParamsArray={setQueryParamsArray}
      />
      <FilterBrand
        brands={brands || []}
        setQueryParamsArray={setQueryParamsArray}
      />
      <FilterPrice
        setQueryParams={setQueryParams}
      />
    </div>
  )
}

export default RefinementList
