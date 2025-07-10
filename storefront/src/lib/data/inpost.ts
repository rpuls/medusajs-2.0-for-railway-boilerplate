export interface InPostLocker {
  id: string
  name: string
  description: string
  address: {
    line1: string
    line2?: string
    city: string
    postcode: string
    country: string
  }
  location: {
    latitude: number
    longitude: number
  }
  opening_hours: string
  payment_available: boolean
  is_next: boolean
  recommended: boolean
  image_url: string
  status: string
}

export interface InPostLockersResponse {
  lockers: InPostLocker[]
  total: number
}

// Fetch InPost lockers based on location
export async function fetchInPostLockers(params: {
  latitude?: number
  longitude?: number
  city?: string
  postcode?: string
  country_code?: string
  radius?: number
  limit?: number
}): Promise<InPostLockersResponse | null> {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.latitude && params.longitude) {
      queryParams.append('latitude', params.latitude.toString())
      queryParams.append('longitude', params.longitude.toString())
    }
    
    if (params.city) queryParams.append('city', params.city)
    if (params.postcode) queryParams.append('postcode', params.postcode)
    if (params.country_code) queryParams.append('country_code', params.country_code)
    if (params.radius) queryParams.append('radius', params.radius.toString())
    if (params.limit) queryParams.append('limit', params.limit.toString())

    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const response = await fetch(`${baseUrl}/store/inpost/lockers?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch InPost lockers:', response.statusText)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching InPost lockers:', error)
    return null
  }
}

// Get user's current location
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        resolve(null)
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 60000,
      }
    )
  })
} 