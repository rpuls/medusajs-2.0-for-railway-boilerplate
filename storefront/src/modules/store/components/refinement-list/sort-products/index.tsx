"use client"

import { ChevronUpDown } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { type ChangeEvent } from "react"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"

export type SortOptions =
  | "created_at"
  | "price_asc"
  | "price_desc"
  | "title_asc"
  | "title_desc"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  /** `inline-mobile` renders a compact `<select>` so the sort can live in the
   *  mobile filter bar next to the "Filters" button. Default is the
   *  desktop-style vertical radio list. */
  variant?: "radio" | "inline-mobile"
  "data-testid"?: string
}

const sortOptions = [
  {
    value: "created_at",
    label: "Latest Arrivals",
  },
  {
    value: "price_asc",
    label: "Price: Low -> High",
  },
  {
    value: "price_desc",
    label: "Price: High -> Low",
  },
  {
    value: "title_asc",
    label: "Name: A -> Z",
  },
  {
    value: "title_desc",
    label: "Name: Z -> A",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
  variant = "radio",
}: SortProductsProps) => {
  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
  }

  if (variant === "inline-mobile") {
    const onSelect = (event: ChangeEvent<HTMLSelectElement>) =>
      handleChange(event.target.value as SortOptions)
    return (
      <div
        className={clx(
          "relative flex items-center rounded-md border border-ui-border-base bg-ui-bg-subtle"
        )}
      >
        <select
          value={sortBy}
          onChange={onSelect}
          aria-label="Sort products"
          data-testid={dataTestId}
          className="min-h-11 w-full appearance-none truncate bg-transparent px-3 pr-8 text-sm font-medium text-ui-fg-base outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 inset-y-0 flex items-center text-ui-fg-subtle">
          <ChevronUpDown />
        </span>
      </div>
    )
  }

  return (
    <FilterRadioGroup
      title="Sort by"
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
