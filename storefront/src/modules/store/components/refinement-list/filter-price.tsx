'use client'

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Slider, TextField, Box, Typography } from '@mui/material'
import { useTranslation } from "@lib/i18n/hooks/use-translation"

// Debounce utility hook
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

type FilterPriceProps = {
  setQueryParams: (name: string, value: string) => void
  maxPrice?: number
  "data-testid"?: string
}

// Default price range
const MIN_PRICE = 0
const DEFAULT_MAX_PRICE = 500
const STEP = 1

const FilterPrice = ({
  setQueryParams,
  maxPrice: propMaxPrice,
  "data-testid": dataTestId,
}: FilterPriceProps) => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const priceParam = searchParams.get("price") || ""

  // Use dynamic max price or fallback to default
  const MAX_PRICE = propMaxPrice || DEFAULT_MAX_PRICE

  // Parse price range from URL (format: "min-max" or empty string)
  const [minPrice, maxPrice] = useMemo(() => {
    if (!priceParam) {
      return [MIN_PRICE, MAX_PRICE]
    }
    
    const parts = priceParam.split("-")
    if (parts.length === 2) {
      const min = parseInt(parts[0], 10)
      const max = parts[1] === "+" ? MAX_PRICE : parseInt(parts[1], 10)
      return [
        isNaN(min) ? MIN_PRICE : Math.max(MIN_PRICE, min),
        isNaN(max) ? MAX_PRICE : Math.min(MAX_PRICE, max)
      ]
    }
    
    return [MIN_PRICE, MAX_PRICE]
  }, [priceParam, MAX_PRICE])

  // Local state for slider and inputs (for immediate UI updates)
  const [sliderValue, setSliderValue] = useState<number[]>([minPrice, maxPrice])
  const [minInput, setMinInput] = useState<string>(minPrice === MIN_PRICE ? "" : minPrice.toString())
  const [maxInput, setMaxInput] = useState<string>(maxPrice >= MAX_PRICE ? "" : maxPrice.toString())

  // Sync local state with URL params
  useEffect(() => {
    setSliderValue([minPrice, maxPrice])
    // Show empty for default values, actual values otherwise
    setMinInput(minPrice === MIN_PRICE ? "" : minPrice.toString())
    setMaxInput(maxPrice >= MAX_PRICE ? "" : maxPrice.toString())
  }, [minPrice, maxPrice, MAX_PRICE])

  // Update slider max when MAX_PRICE changes (e.g., when products load)
  useEffect(() => {
    setSliderValue((prev) => {
      if (prev[1] > MAX_PRICE) {
        setMaxInput("")
        return [prev[0], MAX_PRICE]
      }
      return prev
    })
  }, [MAX_PRICE])

  // Debounced function to update URL params
  const updatePrice = useCallback((min: number, max: number) => {
    // Format: "min-max" or "min-+" for max price
    let priceValue = ""
    if (min > MIN_PRICE || max < MAX_PRICE) {
      if (max >= MAX_PRICE) {
        priceValue = `${min}-+`
      } else {
        priceValue = `${min}-${max}`
      }
    }
    setQueryParams("price", priceValue)
  }, [setQueryParams, MAX_PRICE])

  const debouncedUpdatePrice = useDebounce(updatePrice, 300)

  // Handle slider change
  const handleSliderChange = useCallback((_event: Event, newValue: number | number[]) => {
    const values = newValue as number[]
    setSliderValue(values)
    setMinInput(values[0] === MIN_PRICE ? "" : values[0].toString())
    setMaxInput(values[1] >= MAX_PRICE ? "" : values[1].toString())
    debouncedUpdatePrice(values[0], values[1])
  }, [debouncedUpdatePrice, MAX_PRICE])

  // Handle min input change
  const handleMinInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMinInput(value)
    
    if (value === "") {
      // Empty means min price
      setSliderValue([MIN_PRICE, sliderValue[1]])
      debouncedUpdatePrice(MIN_PRICE, sliderValue[1])
      return
    }

    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(MIN_PRICE, Math.min(numValue, sliderValue[1] - STEP))
      setSliderValue([clampedValue, sliderValue[1]])
      debouncedUpdatePrice(clampedValue, sliderValue[1])
    }
  }, [sliderValue, debouncedUpdatePrice])

  // Handle max input change
  const handleMaxInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMaxInput(value)
    
    if (value === "") {
      // Empty means max price
      setSliderValue([sliderValue[0], MAX_PRICE])
      debouncedUpdatePrice(sliderValue[0], MAX_PRICE)
      return
    }

    const numValue = parseInt(value, 10)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(sliderValue[0] + STEP, Math.min(numValue, MAX_PRICE))
      setSliderValue([sliderValue[0], clampedValue])
      debouncedUpdatePrice(sliderValue[0], clampedValue)
    }
  }, [sliderValue, debouncedUpdatePrice, MAX_PRICE])

  // Handle input blur (apply value even if debounce hasn't fired)
  const handleMinInputBlur = useCallback(() => {
    if (minInput === "") {
      // Empty means min price
      setSliderValue([MIN_PRICE, sliderValue[1]])
      debouncedUpdatePrice(MIN_PRICE, sliderValue[1])
      return
    }
    
    const numValue = parseInt(minInput, 10)
    if (isNaN(numValue) || numValue < MIN_PRICE) {
      setMinInput("")
      setSliderValue([MIN_PRICE, sliderValue[1]])
      debouncedUpdatePrice(MIN_PRICE, sliderValue[1])
    } else if (numValue >= sliderValue[1]) {
      const clampedValue = sliderValue[1] - STEP
      setMinInput(clampedValue === MIN_PRICE ? "" : clampedValue.toString())
      setSliderValue([clampedValue, sliderValue[1]])
      debouncedUpdatePrice(clampedValue, sliderValue[1])
    }
  }, [minInput, sliderValue, debouncedUpdatePrice])

  const handleMaxInputBlur = useCallback(() => {
    if (maxInput === "") {
      return // Already handled
    }
    
    const numValue = parseInt(maxInput, 10)
    if (isNaN(numValue) || numValue > MAX_PRICE) {
      setMaxInput("")
      setSliderValue([sliderValue[0], MAX_PRICE])
      debouncedUpdatePrice(sliderValue[0], MAX_PRICE)
    } else if (numValue <= sliderValue[0]) {
      const clampedValue = sliderValue[0] + STEP
      setMaxInput(clampedValue.toString())
      setSliderValue([sliderValue[0], clampedValue])
      debouncedUpdatePrice(sliderValue[0], clampedValue)
    }
  }, [maxInput, sliderValue, debouncedUpdatePrice, MAX_PRICE])

  // Clear filter handler
  const handleClear = useCallback(() => {
    setSliderValue([MIN_PRICE, MAX_PRICE])
    setMinInput("")
    setMaxInput("")
    setQueryParams("price", "")
  }, [setQueryParams, MAX_PRICE])

  const hasActiveFilter = minPrice > MIN_PRICE || maxPrice < MAX_PRICE

  return (
    <div className="flex gap-x-3 flex-col" data-testid={dataTestId}>
      <Box className="flex items-center justify-between mb-2">
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          {t("filters.price")}
        </Typography>
        {hasActiveFilter && (
          <button
            onClick={handleClear}
            className="text-xs text-primary hover:underline"
            type="button"
          >
            {t("filters.clearFilters")}
          </button>
        )}
      </Box>

      {/* Price Range Slider */}
      <Box className="px-2 mb-4">
        <Slider
          value={sliderValue}
          onChange={handleSliderChange}
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `€${value}`}
          sx={{
            '& .MuiSlider-thumb': {
              width: 18,
              height: 18,
            },
            '& .MuiSlider-track': {
              height: 4,
            },
            '& .MuiSlider-rail': {
              height: 4,
            },
          }}
        />
      </Box>

      {/* Manual Input Fields */}
      <Box className="flex gap-2 items-center">
        <TextField
          size="small"
          label={t("filters.minPrice") || "Min"}
          type="number"
          value={minInput}
          onChange={handleMinInputChange}
          onBlur={handleMinInputBlur}
          inputProps={{
            min: MIN_PRICE,
            max: sliderValue[1] - STEP,
            step: STEP,
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
            },
          }}
        />
        <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
          -
        </Typography>
        <TextField
          size="small"
          label={t("filters.maxPrice") || "Max"}
          type="number"
          value={maxInput}
          onChange={handleMaxInputChange}
          onBlur={handleMaxInputBlur}
          inputProps={{
            min: sliderValue[0] + STEP,
            max: MAX_PRICE,
            step: STEP,
          }}
          placeholder={`${MAX_PRICE}+`}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
            },
          }}
        />
      </Box>
    </div>
  )
}

export default FilterPrice
