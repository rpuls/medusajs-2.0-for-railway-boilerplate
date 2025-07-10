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

export interface InPostSearchParams {
  latitude?: number
  longitude?: number
  city?: string
  postcode?: string
  country_code?: string
  radius?: number
  limit?: number
}

export interface InPostShippingData {
  locker_id: string
  locker_name: string
  locker_address: InPostLocker['address']
}

export interface InPostApiConfig {
  api_key: string
  organization_id: string
  environment: 'sandbox' | 'production'
} 