"use client"

import { useState, useEffect, useMemo } from "react"
import { getEcontCities, type EcontCity } from "@lib/data/econt"

// Debounce utility hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

type CitySelectorProps = {
  onCitySelect: (cityId: number, cityName: string, postcode: string) => void
  selectedCityId: number | null
  selectedCityName?: string | null
  selectedCityPostcode?: string | null
}

const CitySelector: React.FC<CitySelectorProps> = ({
  onCitySelect,
  selectedCityId,
  selectedCityName,
  selectedCityPostcode,
}) => {
  const [cities, setCities] = useState<EcontCity[]>([])
  const [selectedCity, setSelectedCity] = useState<EcontCity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce search query (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Update selectedCity when selectedCityId changes or when cities array updates
  useEffect(() => {
    if (selectedCityId) {
      // Try to find in current cities first
      const found = cities.find((c) => c.city_id === selectedCityId)
      if (found) {
        // Only update if it's different from current selectedCity
        if (!selectedCity || selectedCity.city_id !== found.city_id) {
          setSelectedCity(found)
        }
      } else if (selectedCityName) {
        // If not found in cities array but we have the name from parent, create a minimal city object
        // Only update if we don't already have this city selected
        if (!selectedCity || selectedCity.city_id !== selectedCityId) {
          setSelectedCity({
            city_id: selectedCityId,
            name: selectedCityName,
            post_code: selectedCityPostcode || "",
            type: "гр.",
            name_en: undefined,
            region: undefined,
            region_en: undefined,
            zone_id: 0,
            country_id: 1033,
            office_id: 0,
            country_code: "BG",
          })
        }
      }
    } else {
      // Clear selected city if selectedCityId is cleared
      if (selectedCity) {
        setSelectedCity(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId, selectedCityName, selectedCityPostcode])
  
  // Separate effect to update when cities array changes (but only if we have a selectedCityId)
  useEffect(() => {
    if (selectedCityId && cities.length > 0) {
      const found = cities.find((c) => c.city_id === selectedCityId)
      if (found && (!selectedCity || selectedCity.city_id !== found.city_id)) {
        setSelectedCity(found)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities])

  // Fetch cities only when search query has 2+ characters
  useEffect(() => {
    // Only fetch if search query has at least 2 characters
    if (debouncedSearchQuery.trim().length < 2) {
      // Don't clear cities if we have a selected city - keep them for display
      // But if we're actively searching (isOpen), we can clear
      if (!selectedCityId || !isOpen) {
        setCities([])
      }
      setIsLoading(false)
      return
    }

    const fetchCities = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const fetchedCities = await getEcontCities(debouncedSearchQuery.trim())
        // Deduplicate cities by city_id
        const uniqueCities = Array.from(
          new Map(fetchedCities.map((city) => [city.city_id, city])).values()
        )
        setCities(uniqueCities)
      } catch (err: any) {
        setError(err.message || "Failed to load cities")
        console.error("Error fetching cities:", err)
        setCities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCities()
  }, [debouncedSearchQuery, selectedCityId])

  // Use cities directly (already filtered by backend)
  const filteredCities = useMemo(() => {
    return cities
  }, [cities])

  const handleCityClick = (city: EcontCity) => {
    setSelectedCity(city)
    onCitySelect(city.city_id, city.name, city.post_code)
    setIsOpen(false)
    // Don't clear search query - keep it so the city name shows in the input
    // setSearchQuery("")
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Град (City) *
      </label>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchQuery : (selectedCity ? `${selectedCity.type} ${selectedCity.name}` : "")}
          onChange={(e) => {
            const newValue = e.target.value
            setSearchQuery(newValue)
            // If user starts typing, clear selection to allow new search
            if (newValue && newValue !== selectedCity?.name) {
              setSelectedCity(null)
            }
            setIsOpen(true)
          }}
          onFocus={() => {
            // When focusing, if we have a selected city and no search query, show city name
            if (selectedCity && !searchQuery) {
              setSearchQuery(selectedCity.name)
            }
            setIsOpen(true)
          }}
          placeholder={selectedCity ? "" : "Въведете поне 2 символа за търсене..."}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchQuery.trim().length < 2 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                Въведете поне 2 символа за търсене
              </div>
            ) : isLoading ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                Зареждане на градове...
              </div>
            ) : error ? (
              <div className="px-4 py-2 text-sm text-red-500">
                Грешка: {error}
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                Няма намерени градове
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city.city_id}
                  type="button"
                  onClick={() => handleCityClick(city)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium">
                    {city.type} {city.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    п.к.: {city.post_code}
                    {city.region && ` | област: ${city.region}`}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {selectedCity && (
        <div className="mt-2 text-sm text-gray-600">
          Избран: {selectedCity.type} {selectedCity.name} ({selectedCity.post_code})
        </div>
      )}
      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default CitySelector

