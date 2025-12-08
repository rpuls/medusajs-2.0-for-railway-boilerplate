'use client'

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"
import { Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material'
import { KeyboardArrowDown } from '@mui/icons-material'
import { useTranslation } from "@lib/i18n/hooks/use-translation"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortDropdownProps = {
  "data-testid"?: string
}

const SortDropdown = ({
  "data-testid": dataTestId,
}: SortDropdownProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const sortBy = (searchParams.get("sortBy") as SortOptions) || "created_at"

  const sortOptions = useMemo(() => [
    {
      value: "created_at" as const,
      label: t("filters.latestArrivals"),
    },
    {
      value: "price_asc" as const,
      label: t("filters.priceLowToHigh"),
    },
    {
      value: "price_desc" as const,
      label: t("filters.priceHighToLow"),
    },
  ], [t])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 when sort changes
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  const handleChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value as SortOptions
    const query = createQueryString("sortBy", value)
    router.push(`${pathname}?${query}`, { scroll: false })
  }

  return (
    <div className="flex items-center gap-2" data-testid={dataTestId}>
      <span className="text-sm text-gray-600">{t("filters.sortBy")}:</span>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 180,
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
          },
        }}
      >
        <Select
          value={sortBy}
          onChange={handleChange}
          displayEmpty
          IconComponent={KeyboardArrowDown}
          sx={{
            fontSize: '0.875rem',
            '& .MuiSelect-select': {
              padding: '8px 32px 8px 12px',
            },
          }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  )
}

export default SortDropdown

