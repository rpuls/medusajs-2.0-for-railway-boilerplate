'use client'

/**
 * Example: Econt City Selector using Material UI Autocomplete
 * 
 * This demonstrates how to use MUI Autocomplete for better UX
 * compared to a basic select dropdown.
 */

import { Autocomplete, TextField, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { getEcontCities, type EcontCity } from '@lib/data/econt'

type CitySelectorMUIProps = {
  value: EcontCity | null
  onChange: (city: EcontCity | null) => void
  disabled?: boolean
}

export function CitySelectorMUI({ value, onChange, disabled }: CitySelectorMUIProps) {
  const [cities, setCities] = useState<EcontCity[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open && cities.length === 0 && !loading) {
      loadCities()
    }
  }, [open])

  const loadCities = async () => {
    setLoading(true)
    try {
      const data = await getEcontCities()
      setCities(data)
    } catch (error) {
      console.error('Failed to load cities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={cities}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(option) => {
        if (!option) return ''
        return `гр. ${option.name} [п.к.: ${option.post_code}${option.region ? ` област: ${option.region}` : ''}]`
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Изберете град"
          placeholder="Търсене на град..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      className="w-full"
      // Filter options locally (client-side filtering)
      filterOptions={(options, { inputValue }) => {
        if (!inputValue) return options
        const searchLower = inputValue.toLowerCase()
        return options.filter((city) =>
          city.name.toLowerCase().includes(searchLower) ||
          city.post_code.includes(searchLower) ||
          (city.region && city.region.toLowerCase().includes(searchLower))
        )
      }}
    />
  )
}

