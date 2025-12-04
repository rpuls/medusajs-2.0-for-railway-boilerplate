"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { getEcontStreets, getEcontQuarters, type EcontStreet, type EcontQuarter, type EcontData } from "@lib/data/econt"

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

type AddressFieldsProps = {
  cityId: number
  onAddressChange: (data: Partial<EcontData>) => void
  initialData?: EcontData | null
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  cityId,
  onAddressChange,
  initialData,
}) => {
  const [streets, setStreets] = useState<EcontStreet[]>([])
  const [quarters, setQuarters] = useState<EcontQuarter[]>([])
  const [isLoadingStreets, setIsLoadingStreets] = useState(true)
  const [isLoadingQuarters, setIsLoadingQuarters] = useState(true)

  // Form state
  const [selectedStreet, setSelectedStreet] = useState<string>(
    initialData?.street || ""
  )
  const [selectedQuarter, setSelectedQuarter] = useState<string>(
    initialData?.quarter || ""
  )
  const [streetNum, setStreetNum] = useState<string>(
    initialData?.street_num || ""
  )
  const [buildingNum, setBuildingNum] = useState<string>(
    initialData?.building_num || ""
  )
  const [entranceNum, setEntranceNum] = useState<string>(
    initialData?.entrance_num || ""
  )
  const [floorNum, setFloorNum] = useState<string>(
    initialData?.floor_num || ""
  )
  const [apartmentNum, setApartmentNum] = useState<string>(
    initialData?.apartment_num || ""
  )
  const [other, setOther] = useState<string>(initialData?.other || "")

  // Search states
  const [streetSearch, setStreetSearch] = useState("")
  const [quarterSearch, setQuarterSearch] = useState("")
  const [streetDropdownOpen, setStreetDropdownOpen] = useState(false)
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false)

  // Track which cityId we've already fetched to prevent duplicate requests (React Strict Mode)
  const fetchedCityIdRef = useRef<number | null>(null)
  const isFetchingRef = useRef(false)

  // Fetch streets and quarters once when city is selected
  useEffect(() => {
    // Skip if we've already fetched this city or are currently fetching
    if (!cityId || fetchedCityIdRef.current === cityId || isFetchingRef.current) {
      return
    }

    const fetchData = async () => {
      isFetchingRef.current = true
      try {
        setIsLoadingStreets(true)
        setIsLoadingQuarters(true)
        const [streetsData, quartersData] = await Promise.all([
          getEcontStreets(cityId),
          getEcontQuarters(cityId),
        ])
        setStreets(streetsData)
        setQuarters(quartersData)
        fetchedCityIdRef.current = cityId
      } catch (error) {
        console.error("Error fetching address data:", error)
      } finally {
        setIsLoadingStreets(false)
        setIsLoadingQuarters(false)
        isFetchingRef.current = false
      }
    }

    fetchData()
  }, [cityId])

  // Filter streets locally
  const filteredStreets = useMemo(() => {
    if (!streetSearch.trim()) {
      return streets
    }
    const query = streetSearch.toLowerCase().trim()
    return streets.filter(
      (street) =>
        street.name?.toLowerCase().includes(query) ||
        street.name_en?.toLowerCase().includes(query)
    )
  }, [streets, streetSearch])

  // Filter quarters locally
  const filteredQuarters = useMemo(() => {
    if (!quarterSearch.trim()) {
      return quarters
    }
    const query = quarterSearch.toLowerCase().trim()
    return quarters.filter(
      (quarter) =>
        quarter.name?.toLowerCase().includes(query) ||
        quarter.name_en?.toLowerCase().includes(query)
    )
  }, [quarters, quarterSearch])

  // Create address data object
  const addressData = useMemo(() => ({
    street: selectedStreet,
    quarter: selectedQuarter,
    street_num: streetNum,
    building_num: buildingNum,
    entrance_num: entranceNum,
    floor_num: floorNum,
    apartment_num: apartmentNum,
    other: other,
  }), [
    selectedStreet,
    selectedQuarter,
    streetNum,
    buildingNum,
    entranceNum,
    floorNum,
    apartmentNum,
    other,
  ])

  // Debounce address data to prevent excessive updates (500ms delay)
  const debouncedAddressData = useDebounce(addressData, 500)

  // Track last sent data to prevent duplicate calls
  const lastSentDataRef = useRef<string | null>(null)
  
  // Update parent when debounced form changes
  useEffect(() => {
    const dataKey = JSON.stringify(debouncedAddressData)
    
    // Only call onAddressChange if data actually changed
    if (lastSentDataRef.current !== dataKey) {
      lastSentDataRef.current = dataKey
      onAddressChange(debouncedAddressData)
    }
  }, [debouncedAddressData, onAddressChange])

  const handleStreetSelect = (street: EcontStreet) => {
    setSelectedStreet(street.name)
    setStreetSearch("")
    setStreetDropdownOpen(false)
  }

  const handleQuarterSelect = (quarter: EcontQuarter) => {
    setSelectedQuarter(quarter.name)
    setQuarterSearch("")
    setQuarterDropdownOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Street */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Улица (Street) *
        </label>
        <input
          type="text"
          value={streetDropdownOpen ? streetSearch : selectedStreet}
          onChange={(e) => {
            setStreetSearch(e.target.value)
            setStreetDropdownOpen(true)
          }}
          onFocus={() => setStreetDropdownOpen(true)}
          placeholder="Търсене на улица..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {streetDropdownOpen && filteredStreets.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredStreets.map((street) => (
              <button
                key={`${street.city_id}-${street.name}`}
                type="button"
                onClick={() => handleStreetSelect(street)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {street.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quarter (optional) */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Квартал (Quarter)
        </label>
        <input
          type="text"
          value={quarterDropdownOpen ? quarterSearch : selectedQuarter}
          onChange={(e) => {
            setQuarterSearch(e.target.value)
            setQuarterDropdownOpen(true)
          }}
          onFocus={() => setQuarterDropdownOpen(true)}
          placeholder="Търсене на квартал..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {quarterDropdownOpen && filteredQuarters.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredQuarters.map((quarter) => (
              <button
                key={`${quarter.city_id}-${quarter.name}`}
                type="button"
                onClick={() => handleQuarterSelect(quarter)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {quarter.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Street number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Номер (Number) *
        </label>
        <input
          type="text"
          value={streetNum}
          onChange={(e) => setStreetNum(e.target.value)}
          placeholder="Номер на улица"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Building number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Блок (Building)
        </label>
        <input
          type="text"
          value={buildingNum}
          onChange={(e) => setBuildingNum(e.target.value)}
          placeholder="Номер на блок"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Entrance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Вход (Entrance)
        </label>
        <input
          type="text"
          value={entranceNum}
          onChange={(e) => setEntranceNum(e.target.value)}
          placeholder="Номер на вход"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Floor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Етаж (Floor)
        </label>
        <input
          type="text"
          value={floorNum}
          onChange={(e) => setFloorNum(e.target.value)}
          placeholder="Номер на етаж"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Apartment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Апартамент (Apartment)
        </label>
        <input
          type="text"
          value={apartmentNum}
          onChange={(e) => setApartmentNum(e.target.value)}
          placeholder="Номер на апартамент"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Other notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Допълнителна информация (Additional Notes)
        </label>
        <textarea
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Допълнителна информация за адреса"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Close dropdowns when clicking outside */}
      {(streetDropdownOpen || quarterDropdownOpen) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setStreetDropdownOpen(false)
            setQuarterDropdownOpen(false)
          }}
        />
      )}
    </div>
  )
}

export default AddressFields

