"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { getEcontCities, saveEcontCartData, type EcontData } from "@lib/data/econt"
import { useRouter } from "next/navigation"
import CitySelector from "./city-selector"
import OfficeSelector from "./office-selector"
import AddressFields from "./address-fields"

type EcontShippingProps = {
  cart: HttpTypes.StoreCart
  shippingMethod?: HttpTypes.StoreCartShippingOption | null
  onDataChange?: (data: EcontData | null) => void
}

const EcontShipping: React.FC<EcontShippingProps> = ({ cart, shippingMethod, onDataChange }) => {
  const router = useRouter()
  
  // Auto-detect shipping type from fulfillment option or shipping method name
  const detectShippingType = (): "OFFICE" | "DOOR" => {
    if (!shippingMethod) {
      return "OFFICE" // Default
    }

    const methodName = shippingMethod.name?.toLowerCase() || ""
    
    // Check shipping method name first (most reliable)
    if (methodName.includes("office")) {
      return "OFFICE"
    }
    if (methodName.includes("address") || methodName.includes("door")) {
      return "DOOR"
    }

    // Check fulfillment option ID from shipping method data
    const optionData = shippingMethod.data as any
    const fulfillmentOptionId = optionData?.id || 
                                 optionData?.fulfillment_option_id ||
                                 optionData?.option_data?.id ||
                                 ""

    // Map fulfillment option IDs to shipping types
    if (fulfillmentOptionId?.includes("office") || fulfillmentOptionId === "econt-office") {
      return "OFFICE"
    }
    if (fulfillmentOptionId?.includes("door") || 
        fulfillmentOptionId?.includes("address") || 
        fulfillmentOptionId === "econt-door" ||
        fulfillmentOptionId === "econt-standard" ||
        fulfillmentOptionId === "econt-express") {
      return "DOOR"
    }

    return "OFFICE" // Default fallback
  }

  const [shippingTo, setShippingTo] = useState<"OFFICE" | "DOOR">(detectShippingType())
  const [selectedCity, setSelectedCity] = useState<number | null>(null)
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null)
  const [selectedCityPostcode, setSelectedCityPostcode] = useState<string | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null)
  const [econtData, setEcontData] = useState<EcontData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const lastSavedDataRef = useRef<string | null>(null) // Track last saved data to prevent loops

  // Update shipping type when shipping method changes
  useEffect(() => {
    const newShippingTo = detectShippingType()
    setShippingTo(newShippingTo)
    
    // Update econt data with new shipping type
    if (econtData) {
      setEcontData({
        ...econtData,
        shipping_to: newShippingTo,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod])

  // Load existing Econt data from cart metadata
  useEffect(() => {
    if (cart.metadata?.econt) {
      const existing = cart.metadata.econt as EcontData
      // Use detected shipping type, but preserve existing if it matches
      const detectedType = detectShippingType()
      // Only use existing.shipping_to if it's a valid value (OFFICE or DOOR, not MACHINE)
      const validShippingTo = existing.shipping_to === "OFFICE" || existing.shipping_to === "DOOR" 
        ? existing.shipping_to 
        : detectedType
      setShippingTo(validShippingTo)
      
      // Only set selectedCity if it's a valid number (not 0 or negative)
      // AND if we have a city_name (to ensure it's a real selection, not stale data)
      const cityId = existing.city_id
      if (cityId && cityId > 0 && Number.isInteger(cityId) && existing.city_name) {
        setSelectedCity(cityId)
        setSelectedCityName(existing.city_name)
        setSelectedCityPostcode(existing.postcode || null)
        setSelectedOffice(existing.office_code || null)
        // Set the data key to prevent unnecessary save on initial load
        const dataKey = JSON.stringify(existing)
        lastSavedDataRef.current = dataKey
        setEcontData(existing)
      } else {
        // Invalid or stale data - clear everything
        setSelectedCity(null)
        setSelectedCityName(null)
        setSelectedCityPostcode(null)
        setSelectedOffice(null)
        setEcontData(null)
        lastSavedDataRef.current = null // Reset ref when clearing data
        // Clear invalid metadata from cart
        if (cart.id) {
          saveEcontCartData(cart.id, {
            shipping_to: detectedType,
          } as EcontData).catch(console.error)
        }
      }
    } else {
      // Initialize with detected shipping type
      const detectedType = detectShippingType()
      setShippingTo(detectedType)
      // Clear selections if no metadata
      setSelectedCity(null)
      setSelectedCityName(null)
      setSelectedCityPostcode(null)
      setSelectedOffice(null)
      setEcontData(null)
      lastSavedDataRef.current = null // Reset ref when clearing data
    }
  }, [cart.metadata, cart.id, shippingMethod])

  // Check if we have complete data for price calculation
  const hasCompleteData = (data: EcontData | null): boolean => {
    if (!data || !data.city_id || !data.city_name || !data.postcode) {
      return false
    }
    
    if (data.shipping_to === "OFFICE") {
      // For office delivery, we need city + office_code
      return !!data.office_code
    } else {
      // For door delivery, we need city + street + street_num
      return !!(data.street && data.street_num)
    }
  }

  // Debounce utility for save effect
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Save data to cart when it changes (with debounce)
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    if (econtData && cart.id) {
      // Create a stable key from the data to prevent duplicate saves
      // Only include meaningful fields (exclude empty strings and null values for optional fields)
      const normalizedData = {
        shipping_to: econtData.shipping_to,
        city_id: econtData.city_id,
        city_name: econtData.city_name,
        postcode: econtData.postcode,
        office_code: econtData.office_code || undefined,
        street: econtData.street || undefined,
        street_num: econtData.street_num || undefined,
        quarter: econtData.quarter || undefined,
        building_num: econtData.building_num || undefined,
        entrance_num: econtData.entrance_num || undefined,
        floor_num: econtData.floor_num || undefined,
        apartment_num: econtData.apartment_num || undefined,
        other: econtData.other || undefined,
      }
      const dataKey = JSON.stringify(normalizedData)
      
      // Skip if we've already saved this exact data
      if (lastSavedDataRef.current === dataKey) {
        return
      }

      // Debounce the save operation (800ms delay)
      saveTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true)
        try {
          await saveEcontCartData(cart.id, econtData)
          lastSavedDataRef.current = dataKey
          onDataChange?.(econtData)
          
          // Don't call setShippingMethod here - it causes infinite loops
          // MedusaJS will automatically recalculate prices when cart metadata changes
          // The Shipping component will fetch updated methods when cart changes
        } catch (error) {
          console.error("Error saving Econt data:", error)
        } finally {
          setIsLoading(false)
        }
      }, 800)
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [econtData, cart.id, onDataChange]) // Removed cart.shipping_methods and shippingMethod.id to prevent loops

  const handleCitySelect = (cityId: number, cityName: string, postcode: string) => {
    // Only proceed if we have valid data
    if (!cityId || cityId <= 0 || !cityName) {
      return
    }
    
    setSelectedCity(cityId)
    setSelectedCityName(cityName)
    setSelectedCityPostcode(postcode)
    setSelectedOffice(null)

    const newData: EcontData = {
      shipping_to: shippingTo,
      city_id: cityId,
      city_name: cityName,
      postcode: postcode,
    }

    // Clear office/address data when city changes
    if (shippingTo === "OFFICE") {
      delete newData.office_code
    } else {
      delete newData.street
      delete newData.quarter
      delete newData.street_num
      delete newData.building_num
      delete newData.entrance_num
      delete newData.floor_num
      delete newData.apartment_num
    }

    setEcontData(newData)
  }

  const handleOfficeSelect = (officeCode: string) => {
    setSelectedOffice(officeCode)
    setEcontData({
      ...econtData,
      shipping_to: "OFFICE",
      office_code: officeCode,
      city_id: selectedCity!,
    } as EcontData)
  }

  // Memoize handleAddressChange to prevent unnecessary re-renders
  const handleAddressChange = useCallback((addressData: Partial<EcontData>) => {
    if (!selectedCity || !selectedCityName || !selectedCityPostcode) {
      return // Don't update if city is not selected
    }

    setEcontData((prev) => {
      const newData = {
        shipping_to: "DOOR",
        city_id: selectedCity,
        city_name: selectedCityName,
        postcode: selectedCityPostcode,
        ...addressData,
      } as EcontData
      
      // Only update if data actually changed (prevent unnecessary updates)
      const prevKey = prev ? JSON.stringify({
        shipping_to: prev.shipping_to,
        city_id: prev.city_id,
        city_name: prev.city_name,
        postcode: prev.postcode,
        office_code: prev.office_code,
        street: prev.street,
        street_num: prev.street_num,
        quarter: prev.quarter,
        building_num: prev.building_num,
        entrance_num: prev.entrance_num,
        floor_num: prev.floor_num,
        apartment_num: prev.apartment_num,
        other: prev.other,
      }) : null
      
      const newKey = JSON.stringify({
        shipping_to: newData.shipping_to,
        city_id: newData.city_id,
        city_name: newData.city_name,
        postcode: newData.postcode,
        office_code: newData.office_code,
        street: newData.street,
        street_num: newData.street_num,
        quarter: newData.quarter,
        building_num: newData.building_num,
        entrance_num: newData.entrance_num,
        floor_num: newData.floor_num,
        apartment_num: newData.apartment_num,
        other: newData.other,
      })
      
      // Return previous data if nothing changed
      if (prevKey === newKey) {
        return prev
      }
      
      return newData
    })
  }, [selectedCity, selectedCityName, selectedCityPostcode])

  // Only show office selector if we have a valid selected city AND it's an office delivery
  const shouldShowOfficeSelector = selectedCity && 
                                    selectedCity > 0 && 
                                    Number.isInteger(selectedCity) && 
                                    shippingTo === "OFFICE"

  return (
    <div className="mt-6 space-y-6">
      <CitySelector
        onCitySelect={handleCitySelect}
        selectedCityId={selectedCity}
        selectedCityName={selectedCityName}
        selectedCityPostcode={selectedCityPostcode}
      /> 

      {shouldShowOfficeSelector && (
        <OfficeSelector
          key={`office-${selectedCity}`} // Force re-render when city changes
          cityId={selectedCity}
          onOfficeSelect={handleOfficeSelect}
          selectedOfficeCode={selectedOffice}
        />
      )}

      {selectedCity && shippingTo === "DOOR" && (
        <AddressFields
          cityId={selectedCity}
          onAddressChange={handleAddressChange}
          initialData={econtData}
        />
      )}

      {isLoading && (
        <div className="text-sm text-gray-500">Запазване на данни...</div>
      )}
    </div>
  )
}

export default EcontShipping

