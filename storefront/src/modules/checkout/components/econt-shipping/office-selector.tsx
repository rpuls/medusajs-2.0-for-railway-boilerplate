"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { getEcontOffices, type EcontOffice } from "@lib/data/econt"
import dynamic from "next/dynamic"

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("./office-map"), {
  ssr: false,
})

type OfficeSelectorProps = {
  cityId: number
  onOfficeSelect: (officeCode: string) => void
  selectedOfficeCode: string | null
}

const OfficeSelector: React.FC<OfficeSelectorProps> = ({
  cityId,
  onOfficeSelect,
  selectedOfficeCode,
}) => {
  const [offices, setOffices] = useState<EcontOffice[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // Start as false, only true when actually loading
  const [error, setError] = useState<string | null>(null)

  // Track which cityId we've already fetched to prevent duplicate requests (React Strict Mode)
  const fetchedCityIdRef = useRef<number | null>(null)
  const isFetchingRef = useRef(false)

  // Fetch all offices for the city once - only if cityId is valid
  useEffect(() => {
    // Clear everything if no valid cityId
    if (!cityId || cityId <= 0 || !Number.isInteger(cityId)) {
      setOffices([])
      setIsLoading(false)
      setError(null)
      setSearchQuery("")
      setIsOpen(false)
      fetchedCityIdRef.current = null
      return
    }

    // Skip if we've already fetched this city or are currently fetching
    if (fetchedCityIdRef.current === cityId || isFetchingRef.current) {
      return
    }

    let cancelled = false

    const fetchOffices = async () => {
      isFetchingRef.current = true
      try {
        setIsLoading(true)
        setError(null)
        setOffices([]) // Clear previous offices immediately
        setSearchQuery("") // Clear search
        setIsOpen(false) // Close dropdown
        
        console.log(`[OfficeSelector] Fetching offices for city_id=${cityId}`)
        const allOffices = await getEcontOffices(cityId)
        console.log(`[OfficeSelector] Received ${allOffices.length} offices from API`)
        console.log(`[OfficeSelector] Offices with coordinates: ${allOffices.filter(o => o.latitude && o.longitude).length}`)
        
        // API already filters offices by city_id and country, no need for additional filtering
        // Only set offices if request wasn't cancelled and we still have the same cityId
        if (!cancelled && cityId) {
          setOffices(allOffices)
          fetchedCityIdRef.current = cityId
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Failed to load offices")
          console.error("Error fetching offices:", err)
          setOffices([]) // Clear on error
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          isFetchingRef.current = false
        }
      }
    }

    fetchOffices()

    // Cleanup: cancel request if cityId changes
    return () => {
      cancelled = true
      setOffices([])
    }
  }, [cityId])

  // Filter offices locally based on search query
  const filteredOffices = useMemo(() => {
    if (!searchQuery.trim()) {
      return offices
    }

    const query = searchQuery.toLowerCase().trim()
    return offices.filter((office) => {
      const name = office.name?.toLowerCase() || ""
      const nameEn = office.name_en?.toLowerCase() || ""
      const address = office.address?.toLowerCase() || ""
      const officeCode = office.office_code?.toLowerCase() || ""

      return (
        name.includes(query) ||
        nameEn.includes(query) ||
        address.includes(query) ||
        officeCode.includes(query)
      )
    })
  }, [offices, searchQuery])

  const selectedOffice = offices.find(
    (o) => o.office_code === selectedOfficeCode
  )

  const handleOfficeClick = (office: EcontOffice) => {
    onOfficeSelect(office.office_code)
    setIsOpen(false)
    setSearchQuery("")
  }

  // Don't render if no valid cityId - this is the first check
  if (!cityId || cityId <= 0 || !Number.isInteger(cityId)) {
    return null
  }

  // Get offices with coordinates for map
  const officesWithCoords = offices.filter(
    (o) => o.latitude && o.longitude
  )

  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">Зареждане на офиси...</div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Грешка при зареждане на офиси: {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Офис (Office) *
      </label>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchQuery : selectedOffice?.name || ""}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Търсене на офис..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredOffices.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                Няма намерени офиси
              </div>
            ) : (
              filteredOffices.map((office) => (
                <button
                  key={office.office_code}
                  type="button"
                  onClick={() => handleOfficeClick(office)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium">{office.name}</div>
                  <div className="text-sm text-gray-500">{office.address}</div>
                  {office.phone && (
                    <div className="text-xs text-gray-400">{office.phone}</div>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {selectedOffice && (
        <div className="mt-2 text-sm text-gray-600">
          Избран: {selectedOffice.name} - {selectedOffice.address}
        </div>
      )}

      {/* Map showing office locations */}
      {offices.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Изберете офис от списъка или картата:
          </h3>
          {officesWithCoords.length > 0 ? (
            <MapComponent
              offices={officesWithCoords}
              selectedOfficeCode={selectedOfficeCode}
              onOfficeSelect={onOfficeSelect}
            />
          ) : (
            <div className="text-sm text-gray-500 p-4 border border-gray-200 rounded-md bg-gray-50">
              Няма офиси с координати за показване на картата. Моля, изберете офис от списъка по-горе.
            </div>
          )}
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

export default OfficeSelector

