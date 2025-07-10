"use client"

import { useState, useEffect } from "react"
import { InPostLocker, fetchInPostLockers, getCurrentLocation } from "@lib/data/inpost"

interface InPostLockerSelectorProps {
  onLockerSelect: (locker: InPostLocker | null) => void
  selectedLocker: InPostLocker | null
  shippingAddress?: {
    city?: string
    postal_code?: string
    country_code?: string
  }
}

export default function InPostLockerSelector({ 
  onLockerSelect, 
  selectedLocker,
  shippingAddress 
}: InPostLockerSelectorProps) {
  const [lockers, setLockers] = useState<InPostLocker[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useState({
    city: shippingAddress?.city || '',
    postcode: shippingAddress?.postal_code || '',
    country_code: shippingAddress?.country_code || 'PL'
  })

  const searchLockers = async (useLocation = false) => {
    setLoading(true)
    setError(null)
    
    try {
      let searchQuery: any = {
        country_code: searchParams.country_code,
        limit: 20
      }

      if (useLocation) {
        const location = await getCurrentLocation()
        if (location) {
          searchQuery.latitude = location.latitude
          searchQuery.longitude = location.longitude
          searchQuery.radius = 5000 // 5km radius
        } else {
          setError('Unable to get your location. Please search by city or postal code.')
          setLoading(false)
          return
        }
      } else {
        if (searchParams.city) {
          searchQuery.city = searchParams.city
        }
        if (searchParams.postcode) {
          searchQuery.postcode = searchParams.postcode
        }
      }

      const response = await fetchInPostLockers(searchQuery)
      
      if (response && response.lockers) {
        setLockers(response.lockers)
        if (response.lockers.length === 0) {
          setError('No InPost lockers found in your area. Please try a different search.')
        }
      } else {
        setError('Failed to load InPost lockers. Please try again.')
      }
    } catch (err) {
      setError('Failed to load InPost lockers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-search when shipping address is available
  useEffect(() => {
    if (shippingAddress?.city || shippingAddress?.postal_code) {
      searchLockers()
    }
  }, [shippingAddress])

  const handleInputChange = (field: string, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLockerSelect = (lockerId: string) => {
    const locker = lockers.find(l => l.id === lockerId)
    onLockerSelect(locker || null)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Select InPost Locker</h3>
        
        {/* Search Controls */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Enter city name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={searchParams.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value)}
              placeholder="Enter postal code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="country_code" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              id="country_code"
              name="country_code"
              value={searchParams.country_code}
              onChange={(e) => handleInputChange('country_code', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PL">Poland</option>
              <option value="GB">United Kingdom</option>
              <option value="IT">Italy</option>
            </select>
          </div>
        </div>

        {/* Search Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => searchLockers(false)}
            disabled={loading || (!searchParams.city && !searchParams.postcode)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Search Lockers'}
          </button>
          <button
            onClick={() => searchLockers(true)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching...' : 'Use My Location'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Selected Locker */}
      {selectedLocker && (
        <div className="rounded-md bg-green-50 p-3">
          <h4 className="font-medium text-green-800">Selected Locker:</h4>
          <p className="text-sm text-green-700">
            {selectedLocker.name} - {selectedLocker.address.line1}, {selectedLocker.address.city}
          </p>
        </div>
      )}

      {/* Lockers List */}
      {lockers.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Available Lockers ({lockers.length})</h4>
          <div className="max-h-60 space-y-2 overflow-y-auto">
            {lockers.map((locker) => (
              <div
                key={locker.id}
                className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50 ${
                  selectedLocker?.id === locker.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => handleLockerSelect(locker.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium">{locker.name}</h5>
                    <p className="text-sm text-gray-600">
                      {locker.address.line1}
                      {locker.address.line2 && `, ${locker.address.line2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {locker.address.city}, {locker.address.postcode}
                    </p>
                    <p className="text-xs text-gray-500">
                      Hours: {locker.opening_hours}
                    </p>
                    {locker.payment_available && (
                      <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs text-green-800 mr-1 mt-1">
                        Payment Available
                      </span>
                    )}
                    {locker.recommended && (
                      <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-800 mr-1 mt-1">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <input
                      type="radio"
                      name="locker"
                      checked={selectedLocker?.id === locker.id}
                      onChange={() => handleLockerSelect(locker.id)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {!loading && lockers.length === 0 && !error && (
        <div className="rounded-md bg-gray-50 p-4 text-center text-gray-600">
          <p>Search for InPost lockers using the form above.</p>
        </div>
      )}
    </div>
  )
} 