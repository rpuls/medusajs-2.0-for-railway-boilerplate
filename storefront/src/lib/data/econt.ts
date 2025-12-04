// Use Next.js API routes (server-side proxy) instead of direct backend calls
// This keeps credentials secure on the server
const API_BASE_URL = "/api/econt"

export interface EcontCity {
  city_id: number
  post_code: string
  type: string
  name: string
  name_en?: string
  region?: string
  region_en?: string
  zone_id: number
  country_id: number
  office_id: number
  country_code: string
}

export interface EcontOffice {
  office_code: string
  name: string
  name_en?: string
  address: string
  address_en?: string
  city_id: number
  city_name: string
  post_code: string
  phone?: string
  working_time?: string
  working_time_saturday?: string
  working_time_sunday?: string
  latitude?: number
  longitude?: number
  is_machine: boolean
}

export interface EcontStreet {
  city_id: number
  name: string
  name_en?: string
}

export interface EcontQuarter {
  city_id: number
  name: string
  name_en?: string
}

export interface EcontData {
  shipping_to: "OFFICE" | "DOOR" | "MACHINE"
  city_id?: number
  city_name?: string
  postcode?: string
  office_code?: string
  machine_code?: string
  street?: string
  quarter?: string
  street_num?: string
  building_num?: string
  entrance_num?: string
  floor_num?: string
  apartment_num?: string
  other?: string
}

/**
 * Get cities from Econt API (via Next.js API route - server-side)
 * @param searchQuery - Optional search query to filter cities by name, postcode, or region
 */
export async function getEcontCities(searchQuery?: string): Promise<EcontCity[]> {
  const url = searchQuery && searchQuery.length >= 2
    ? `${API_BASE_URL}/cities?q=${encodeURIComponent(searchQuery)}`
    : `${API_BASE_URL}/cities`
  
  const response = await fetch(url, {
    cache: "no-store", // Always fetch fresh data when searching
  })

  if (!response.ok) {
    throw new Error("Failed to fetch cities")
  }

  const data = await response.json()
  return data.cities || []
}

/**
 * Get all offices for a city (via Next.js API route - server-side)
 */
export async function getEcontOffices(cityId: number): Promise<EcontOffice[]> {
  const response = await fetch(
    `${API_BASE_URL}/offices?city_id=${cityId}`,
    {
      // Use ISR: revalidate every 24 hours, but allow stale-while-revalidate
      next: {
        revalidate: 86400, // Revalidate once per day
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch offices")
  }

  const data = await response.json()
  return data.offices || []
}

/**
 * Get all streets for a city (via Next.js API route - server-side)
 */
export async function getEcontStreets(cityId: number): Promise<EcontStreet[]> {
  const response = await fetch(
    `${API_BASE_URL}/streets?city_id=${cityId}`,
    {
      // Use ISR: revalidate every 24 hours, but allow stale-while-revalidate
      next: {
        revalidate: 86400, // Revalidate once per day
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch streets")
  }

  const data = await response.json()
  return data.streets || []
}

/**
 * Get all quarters for a city (via Next.js API route - server-side)
 */
export async function getEcontQuarters(cityId: number): Promise<EcontQuarter[]> {
  const response = await fetch(
    `${API_BASE_URL}/quarters?city_id=${cityId}`,
    {
      // Use ISR: revalidate every 24 hours, but allow stale-while-revalidate
      next: {
        revalidate: 86400, // Revalidate once per day
      },
    }
  )

  if (!response.ok) {
    throw new Error("Failed to fetch quarters")
  }

  const data = await response.json()
  return data.quarters || []
}

/**
 * Save Econt data to cart metadata (via Next.js API route - server-side)
 */
export async function saveEcontCartData(
  cartId: string,
  data: EcontData
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error("Failed to save Econt data")
  }
}

