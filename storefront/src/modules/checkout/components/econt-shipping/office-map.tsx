"use client"

import { useEffect, useRef, useState } from "react"
import type { EcontOffice } from "@lib/data/econt"

type OfficeMapProps = {
  offices: EcontOffice[]
  selectedOfficeCode: string | null
  onOfficeSelect: (officeCode: string) => void
}

const OfficeMap: React.FC<OfficeMapProps> = ({
  offices,
  selectedOfficeCode,
  onOfficeSelect,
}) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const isInitializingRef = useRef<boolean>(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  // Filter offices with valid coordinates
  const officesWithCoords = offices.filter(
    (office) => office.latitude && office.longitude
  )

  useEffect(() => {
    // Only load map on client side
    if (typeof window === "undefined" || !mapRef.current || officesWithCoords.length === 0) {
      return
    }

    // Prevent concurrent initializations
    if (isInitializingRef.current) {
      return
    }

    // Clean up existing map if it exists (to prevent "already initialized" error)
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove()
      } catch (error) {
        // Map might already be removed
      }
      mapInstanceRef.current = null
      markersRef.current = []
    }
    
    // Clear leaflet ID from container if it exists
    if (mapRef.current && (mapRef.current as any)._leaflet_id) {
      delete (mapRef.current as any)._leaflet_id
    }
    
    isInitializingRef.current = true

    let L: any = null
    let map: any = null

    const loadMap = async () => {
      try {
        // Load Leaflet from CDN (avoids npm dependency conflicts)
        if (typeof window !== "undefined" && !(window as any).L) {
          // Load CSS first
          if (!document.querySelector('link[href*="leaflet"]')) {
            const cssLink = document.createElement("link")
            cssLink.rel = "stylesheet"
            cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            cssLink.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            cssLink.crossOrigin = ""
            document.head.appendChild(cssLink)
          }

          // Load Leaflet JS
          await new Promise<void>((resolve, reject) => {
            if ((window as any).L) {
              resolve()
              return
            }
            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            script.crossOrigin = ""
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Leaflet"))
            document.head.appendChild(script)
          })
        }
        
        L = (window as any).L
        
        // Check if map container is already initialized
        if (mapRef.current && (mapRef.current as any)._leaflet_id) {
          // Container already has a map, remove it first
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove()
            mapInstanceRef.current = null
          }
          // Clear the leaflet ID
          delete (mapRef.current as any)._leaflet_id
        }

        // Calculate center point from all offices
        const avgLat =
          officesWithCoords.reduce((sum, o) => sum + (o.latitude || 0), 0) /
          officesWithCoords.length
        const avgLng =
          officesWithCoords.reduce((sum, o) => sum + (o.longitude || 0), 0) /
          officesWithCoords.length

        // Initialize map
        map = L.map(mapRef.current!, {
          center: [avgLat, avgLng],
          zoom: 13,
          scrollWheelZoom: true,
        })

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Create custom pin icon for markers
        const createPinIcon = (isSelected: boolean) => {
          const color = isSelected ? "#3b82f6" : "#ef4444" // Blue for selected, red for unselected
          const pinSize = 32
          const pinHeight = 40
          
          // Create SVG pin icon
          const svgIcon = `
            <svg width="${pinSize}" height="${pinHeight}" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 28 12 28s12-20 12-28C24 5.373 18.627 0 12 0z" 
                    fill="${color}" 
                    stroke="white" 
                    stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
            </svg>
          `
          
          return L.divIcon({
            className: "custom-pin-marker",
            html: svgIcon,
            iconSize: [pinSize, pinHeight],
            iconAnchor: [pinSize / 2, pinHeight], // Anchor at the bottom point of the pin
            popupAnchor: [0, -pinHeight], // Popup appears above the pin
          })
        }

        // Add markers for each office
        const markers: any[] = []
        officesWithCoords.forEach((office) => {
          if (office.latitude && office.longitude) {
            const isSelected = office.office_code === selectedOfficeCode
            
            // Debug: log coordinates to check values
            console.log(`Office ${office.name}: lat=${office.latitude}, lng=${office.longitude}`)
            
            // Use coordinates as-is (Leaflet expects [lat, lng])
            const lat = office.latitude
            const lng = office.longitude
            
            const marker = L.marker([lat, lng], {
              icon: createPinIcon(isSelected),
            }).addTo(map)

            // Add popup with office info
            const popupContent = `
              <div style="min-width: 200px;">
                <strong>${office.name}</strong><br/>
                ${office.phone ? `📞 ${office.phone}<br/>` : ""}
                <button 
                  onclick="window.selectOffice('${office.office_code}')"
                  style="
                    margin-top: 8px;
                    padding: 4px 12px;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                  "
                >
                  Избери
                </button>
              </div>
            `
            marker.bindPopup(popupContent)

            // Add click handler
            marker.on("click", () => {
              onOfficeSelect(office.office_code)
            })

            markers.push(marker)
          }
        })

        markersRef.current = markers
        mapInstanceRef.current = map
        setMapLoaded(true)
        setMapError(null)
        isInitializingRef.current = false

        // Fit map to show all markers
        if (markers.length > 0) {
          const group = new L.featureGroup(markers)
          map.fitBounds(group.getBounds().pad(0.1))
        }

        // Expose selectOffice function globally for popup buttons
        ;(window as any).selectOffice = (officeCode: string) => {
          onOfficeSelect(officeCode)
        }
      } catch (error: any) {
        console.error("Error loading map:", error)
        setMapError("Failed to load map. Please refresh the page.")
        setMapLoaded(false)
        isInitializingRef.current = false
      }
    }

    loadMap()

    // Cleanup
    return () => {
      isInitializingRef.current = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          // Map might already be removed
          console.warn("Error removing map:", error)
        }
        mapInstanceRef.current = null
      }
      markersRef.current = []
      if ((window as any).selectOffice) {
        delete (window as any).selectOffice
      }
      // Clear leaflet ID from container
      if (mapRef.current && (mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officesWithCoords.map(o => o.office_code).join(',')]) // Re-run when office codes change

  // Update markers when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || markersRef.current.length === 0 || !(window as any).L) {
      return
    }

    const L = (window as any).L
    
    // Update marker icons based on selection
    markersRef.current.forEach((marker, index) => {
      const office = officesWithCoords[index]
      if (office && office.latitude && office.longitude) {
        const isSelected = office.office_code === selectedOfficeCode
        const color = isSelected ? "#3b82f6" : "#ef4444"
        const pinSize = 32
        const pinHeight = 40
        
        const svgIcon = `
          <svg width="${pinSize}" height="${pinHeight}" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 28 12 28s12-20 12-28C24 5.373 18.627 0 12 0z" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="2"/>
            <circle cx="12" cy="12" r="4" fill="white"/>
          </svg>
        `
        
        const newIcon = L.divIcon({
          className: "custom-pin-marker",
          html: svgIcon,
          iconSize: [pinSize, pinHeight],
          iconAnchor: [pinSize / 2, pinHeight],
          popupAnchor: [0, -pinHeight],
        })
        marker.setIcon(newIcon)
      }
    })
  }, [selectedOfficeCode, mapLoaded, officesWithCoords])

  if (officesWithCoords.length === 0) {
    return (
      <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Офиси на карта (Offices on Map)
        </h3>
        <p className="text-sm text-gray-500">
          Няма офиси с координати за показване на картата.
        </p>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Офиси на карта (Offices on Map)
        </h3>
        <p className="text-sm text-red-500">{mapError}</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden relative">
      <h3 className="text-sm font-medium text-gray-700 p-4 bg-gray-50 border-b">
        Офиси на карта (Offices on Map)
      </h3>
      <div
        ref={mapRef}
        style={{
          height: "400px",
          width: "100%",
          zIndex: 0,
        }}
        className="leaflet-container"
      />
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-90 z-10">
          <p className="text-sm text-gray-500">Зареждане на карта...</p>
        </div>
      )}
    </div>
  )
}

export default OfficeMap
