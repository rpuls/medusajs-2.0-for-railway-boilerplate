import { MedusaService } from "@medusajs/framework/utils"
import { Logger, DAL } from "@medusajs/framework/types"
import { EcontCity, EcontOffice, EcontStreet, EcontQuarter, EcontShipment, EcontSettings } from "./models/index"
import {
  ECONT_USERNAME,
  ECONT_PASSWORD,
  ECONT_LIVE,
  ECONT_SENDER_TYPE,
  ECONT_SENDER_CITY,
  ECONT_SENDER_POST_CODE,
  ECONT_SENDER_OFFICE_CODE,
  ECONT_SENDER_STREET,
  ECONT_SENDER_STREET_NUM,
  ECONT_SENDER_QUARTER,
  ECONT_SENDER_BUILDING_NUM,
  ECONT_SENDER_ENTRANCE_NUM,
  ECONT_SENDER_FLOOR_NUM,
  ECONT_SENDER_APARTMENT_NUM,
} from "../../lib/constants"

type InjectedDependencies = {
  logger: Logger
  econtShipmentRepository: DAL.RepositoryService<any>
  econtSettingsRepository: DAL.RepositoryService<any>
  // Removed: City, Office, Street, Quarter repositories (using cache instead)
}

export interface EcontServiceConfig {
  username: string
  password: string
  live: boolean // true for production, false for test
}

export interface EcontCityData {
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

export interface EcontOfficeData {
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

export interface EcontStreetData {
  city_id: number
  name: string
  name_en?: string
}

export interface EcontQuarterData {
  city_id: number
  name: string
  name_en?: string
}

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class EcontShippingService extends MedusaService({
  EcontShipment, // Shipment data
  EcontSettings, // Settings configuration
}) {
  protected readonly logger_: Logger
  protected readonly econtShipmentRepository_: DAL.RepositoryService<any>
  protected readonly econtSettingsRepository_: DAL.RepositoryService<any>
  protected config_: EcontServiceConfig | null = null
  
  // In-memory cache with TTL (1 day = 86400000 ms)
  private cache_: Map<string, CacheEntry<any>> = new Map()
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 1 day

  constructor(container: InjectedDependencies) {
    // @ts-ignore - MedusaService constructor
    super(...arguments)
    this.logger_ = container.logger
    this.econtShipmentRepository_ = container.econtShipmentRepository
    this.econtSettingsRepository_ = container.econtSettingsRepository
    
    // Clean up expired cache entries every hour
    setInterval(() => this.cleanupCache(), 60 * 60 * 1000)
  }
  
  /**
   * Get Econt settings from database with fallback to constants
   * Returns settings object with all required fields
   */
  async getSettingsWithFallback(): Promise<{
    username: string
    password: string
    live: boolean
    sender_type: "OFFICE" | "ADDRESS"
    sender_city: string
    sender_post_code: string
    sender_office_code?: string | null
    sender_street?: string | null
    sender_street_num?: string | null
    sender_quarter?: string | null
    sender_building_num?: string | null
    sender_entrance_num?: string | null
    sender_floor_num?: string | null
    sender_apartment_num?: string | null
  }> {
    try {
      const settings = await this.listEcontSettings()
      if (settings.length > 0) {
        const dbSettings = {
          ...settings[0],
          sender_type: settings[0].sender_type as "OFFICE" | "ADDRESS",
        }
        
        // Always use database settings if they exist (database is source of truth)
        // Log warnings if credentials are missing, but still return database settings
        if (!dbSettings.username || !dbSettings.password) {
          this.logger_.warn("Econt settings in database missing username/password - API calls will fail")
        } else {
          this.logger_.info("Using Econt settings from database")
        }
        
        // Return database settings even if incomplete - let the caller handle validation
        return dbSettings
      }
    } catch (error: any) {
      this.logger_.warn(`Error fetching Econt settings from database, using constants: ${error.message}`)
    }
    
    // Fallback to constants only if no database settings exist
    // This should only happen on first setup before admin UI is configured
    this.logger_.info("No Econt settings found in database, using environment variables as fallback")
    
    const fallbackSettings = {
      username: ECONT_USERNAME || "",
      password: ECONT_PASSWORD || "",
      live: ECONT_LIVE,
      sender_type: ECONT_SENDER_TYPE,
      sender_city: ECONT_SENDER_CITY,
      sender_post_code: ECONT_SENDER_POST_CODE,
      sender_office_code: ECONT_SENDER_OFFICE_CODE || null,
      sender_street: ECONT_SENDER_STREET || null,
      sender_street_num: ECONT_SENDER_STREET_NUM || null,
      sender_quarter: ECONT_SENDER_QUARTER || null,
      sender_building_num: ECONT_SENDER_BUILDING_NUM || null,
      sender_entrance_num: ECONT_SENDER_ENTRANCE_NUM || null,
      sender_floor_num: ECONT_SENDER_FLOOR_NUM || null,
      sender_apartment_num: ECONT_SENDER_APARTMENT_NUM || null,
    }
    
    // Log if credentials are missing from constants
    if (!fallbackSettings.username || !fallbackSettings.password) {
      this.logger_.warn("Econt credentials (ECONT_USERNAME/ECONT_PASSWORD) are not set in environment variables. Please configure Econt settings in the admin UI.")
    }
    
    return fallbackSettings
  }

  /**
   * Configure the service with Econt credentials
   */
  configure(config: EcontServiceConfig) {
    this.config_ = config
  }

  /**
   * Cache helper methods
   */
  private getCacheKey(type: string, key: string): string {
    return `econt:${type}:${key}`
  }

  private get<T>(cacheKey: string): T | null {
    const entry = this.cache_.get(cacheKey)
    if (!entry) return null
    
    if (Date.now() > entry.expiresAt) {
      this.cache_.delete(cacheKey)
      return null
    }
    
    return entry.data as T
  }

  private set<T>(cacheKey: string, data: T, ttlMs: number = this.CACHE_TTL_MS): void {
    this.cache_.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttlMs,
    })
  }

  private cleanupCache(): void {
    const now = Date.now()
    let cleaned = 0
    for (const [key, entry] of this.cache_.entries()) {
      if (now > entry.expiresAt) {
        this.cache_.delete(key)
        cleaned++
      }
    }
    if (cleaned > 0) {
      this.logger_.info(`Cleaned up ${cleaned} expired cache entries`)
    }
  }

  /**
   * Get the base URL for Econt API
   */
  /**
   * Get base URL for Econt JSON API
   */
  private getBaseUrl(): string {
    if (!this.config_) {
      throw new Error("Econt service not configured. Call configure() first.")
    }
    // Test/demo environment
    if (!this.config_.live) {
      return "https://demo.econt.com/ee/services"
    }
    // Production environment
    return "https://ee.econt.com/services"
  }

  /**
   * Make a request to Econt JSON API
   */
  private async jsonApiRequest(
    serviceName: string,
    methodName: string,
    requestBody: any
  ): Promise<any> {
    if (!this.config_) {
      throw new Error("Econt service not configured")
    }

    const baseUrl = this.getBaseUrl()
    const url = `${baseUrl}/${serviceName}/${methodName}.json`

    // Create basic auth header
    const auth = Buffer.from(
      `${this.config_.username}:${this.config_.password}`
    ).toString("base64")

    this.logger_.info(`Econt JSON API Request - URL: ${url}`)
    this.logger_.info(`Request body: ${JSON.stringify(requestBody).substring(0, 300)}`)

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(requestBody),
      })

      this.logger_.info(`Econt API HTTP Response - Status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        this.logger_.error(`Econt API HTTP error! Status: ${response.status}, Body: ${errorText.substring(0, 500)}`)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`)
      }

      const responseData = await response.json()
      
      // Log response structure for debugging
      this.logger_.info(`Econt API response structure: ${JSON.stringify(responseData).substring(0, 500)}`)
      
      return responseData
    } catch (error: any) {
      this.logger_.error("Econt API error:", error)
      throw new Error(
        `Econt API request failed: ${error.message || "Unknown error"}`
      )
    }
  }

  /**
   * Make a request to Econt XML API (for operations that don't have JSON endpoints)
   * This is kept for backward compatibility with label creation, shipment status, etc.
   */
  private async xmlApiRequest(
    requestType: string,
    xmlDataObj?: any
  ): Promise<any> {
    if (!this.config_) {
      throw new Error("Econt service not configured")
    }

    // XML API uses different endpoints
    const xmlUrl = this.config_.live
      ? "https://www.econt.com/e-econt/xml_service_tool.php"
      : "https://demo.econt.com/e-econt/xml_service_tool.php"

    // Import XML parser/builder only when needed
    const { XMLParser, XMLBuilder } = await import("fast-xml-parser")
    
    const xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    })
    
    const xmlBuilder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      format: true,
    })

    // Build XML request
    const requestObj: any = {
      request: {
        client: {
          username: this.config_.username,
          password: this.config_.password,
        },
        request_type: requestType,
        mediator: "medusajs",
      },
    }

    if (xmlDataObj) {
      requestObj.request = { ...requestObj.request, ...xmlDataObj }
    }

    const xmlRequest = xmlBuilder.build(requestObj)

    this.logger_.info(`Econt XML API Request - URL: ${xmlUrl}, Request Type: ${requestType}`)

    try {
      const formData = new URLSearchParams()
      formData.append("xml", xmlRequest)

      const auth = Buffer.from(
        `${this.config_.username}:${this.config_.password}`
      ).toString("base64")

      const response = await fetch(xmlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        this.logger_.error(`Econt XML API HTTP error! Status: ${response.status}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      
      if (!responseText || responseText.length === 0) {
        throw new Error("Econt API returned empty response")
      }

      const parsed = xmlParser.parse(responseText)
      return parsed
    } catch (error: any) {
      this.logger_.error("Econt XML API error:", error)
      throw new Error(`Econt XML API request failed: ${error.message || "Unknown error"}`)
    }
  }

  /**
   * Get all cities in Bulgaria (cached for 1 day)
   */
  async getCities(): Promise<EcontCityData[]> {
    // Check cache first
    const cacheKey = this.getCacheKey("cities", "all")
    const cached = this.get<EcontCityData[]>(cacheKey)
    if (cached) {
      this.logger_.info(`Returning ${cached.length} cities from cache`)
      return cached
    }

    try {
      this.logger_.info("Fetching cities from Econt JSON API with countryCode=BGR...")
      
      const result = await this.jsonApiRequest(
        "Nomenclatures",
        "NomenclaturesService.getCities",
        { countryCode: "BGR" }
      )

      this.logger_.info("Econt API response received, parsing...")
      
      if (result?.error) {
        const errorMsg = result.error?.message || "Failed to fetch cities"
        this.logger_.error(`Econt API error: ${errorMsg}`)
        throw new Error(errorMsg)
      }

      const cities: EcontCityData[] = []
      
      // JSON API response structure: { cities: [...] }
      const citiesArray = result?.cities || []
      
      if (!Array.isArray(citiesArray) || citiesArray.length === 0) {
        this.logger_.warn(`No cities found in response. Response keys: ${Object.keys(result || {}).join(", ")}`)
        return cities
      }

      this.logger_.info(`Parsing ${citiesArray.length} cities from response...`)
      
      for (let i = 0; i < citiesArray.length; i++) {
          const city = citiesArray[i]
          try {
            if (!city) {
              this.logger_.warn(`Skipping null/undefined city at index ${i}`)
              continue
            }

            // JSON API uses camelCase: id, postCode, name, etc.
            const cityId = city.id
            const cityName = city.name
            const postCode = city.postCode || city.post_code

            if (!cityId || !cityName || !postCode) {
              if (i < 5) { // Only log first few for debugging
                this.logger_.warn(`Skipping city at index ${i} with missing required fields: id=${cityId}, name=${cityName}, postCode=${postCode}`)
              }
              continue
            }

            // Extract country info from nested country object
            const country = city.country || {}
            const countryCode = country.code2 || country.code3 || "BG"
            const countryId = country.id || 1033

            cities.push({
              city_id: parseInt(String(cityId), 10),
              post_code: String(postCode),
              type: city.type || "",
              name: String(cityName).trim(),
              name_en: city.nameEn || undefined,
              region: city.regionName || undefined,
              region_en: city.regionNameEn || undefined,
              zone_id: city.zoneId || 3,
              country_id: countryId,
              office_id: city.officeId || 0,
              country_code: countryCode === "BGR" ? "BG" : countryCode, // Normalize BGR to BG
            })
          } catch (parseError: any) {
            this.logger_.warn(`Error parsing city at index ${i}: ${parseError.message}`)
            // Continue with other cities
          }
      }

      // API already filtered by countryCode=BGR, so all cities should be Bulgarian
      // No need for additional filtering - trust the API
      this.logger_.info(`Successfully parsed ${cities.length} Bulgarian cities (API filtered by countryCode=BGR)`)
      
      // Cache the result for 1 day
      this.set(cacheKey, cities)
      this.logger_.info(`Cached ${cities.length} cities for 24 hours`)
      
      return cities
    } catch (error: any) {
      this.logger_.error("Error fetching cities:", error)
      if (error.stack) {
        this.logger_.error(`Error stack: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Get all offices for a city (Bulgaria only, cached for 1 day)
   */
  async getOffices(cityId: number): Promise<EcontOfficeData[]> {
    // Check cache first
    const cacheKey = this.getCacheKey("offices", cityId.toString())
    const cached = this.get<EcontOfficeData[]>(cacheKey)
    if (cached) {
      this.logger_.info(`Returning ${cached.length} offices for city ${cityId} from cache`)
      return cached
    }

    // First verify the city is Bulgarian by checking cities cache
    const citiesCacheKey = this.getCacheKey("cities", "all")
    let allCities = this.get<EcontCityData[]>(citiesCacheKey)
    
    if (!allCities) {
      // If cities cache is empty, fetch cities first to verify
      this.logger_.info(`Cities cache empty, fetching cities first to verify city ${cityId} is Bulgarian`)
      try {
        allCities = await this.getCities()
      } catch (error: any) {
        this.logger_.warn(`Failed to fetch cities to verify city ${cityId}, will fetch offices anyway but filter by coordinates: ${error.message}`)
      }
    }
    
    if (allCities) {
      const city = allCities.find(c => c.city_id === cityId)
      if (city) {
        const isBulgarian = city.country_code === "BG" || city.country_code === "BGR" || city.country_id === 1033
        if (!isBulgarian) {
          this.logger_.warn(`City ${cityId} (${city.name}) is not Bulgarian (country_code: ${city.country_code}), rejecting office fetch`)
          // Cache empty result to avoid repeated API calls
          this.set(cacheKey, [])
          return []
        }
        this.logger_.info(`Verified city ${cityId} (${city.name}) is Bulgarian, fetching offices`)
      } else {
        // City not found in Bulgarian cities list - REJECT the request
        this.logger_.warn(`City ${cityId} not found in Bulgarian cities list, rejecting office fetch`)
        // Cache empty result to avoid repeated API calls
        this.set(cacheKey, [])
        return []
      }
    } else {
      // If we can't verify the city (cities cache unavailable), reject for safety
      this.logger_.warn(`Cannot verify city ${cityId} (cities cache unavailable), rejecting office fetch`)
      this.set(cacheKey, [])
      return []
    }

    try {
      const result = await this.jsonApiRequest(
        "Nomenclatures",
        "NomenclaturesService.getOffices",
        { cityID: cityId.toString() }
      )

      if (result?.error) {
        const errorMsg = result.error?.message || "Failed to fetch offices"
        throw new Error(errorMsg)
      }

      const offices: EcontOfficeData[] = []
      const officeArray = result?.offices || []
      
      if (!Array.isArray(officeArray)) {
        this.logger_.warn(`No offices found in response for city ${cityId}`)
        return offices
      }

      this.logger_.info(`Parsing ${officeArray.length} offices from response...`)
      
      for (const office of officeArray) {
        if (!office) continue

        // JSON API uses camelCase and nested structures
        const address = office.address || {}
        const city = address.city || {}
        // Coordinates are in address.location, not office.location
        const location = address.location || {}

        // Extract coordinates - they might be null, so check for valid numbers
        const lat = location.latitude
        const lng = location.longitude
        const latitude = (lat !== null && lat !== undefined && !isNaN(parseFloat(String(lat)))) 
          ? parseFloat(String(lat)) 
          : undefined
        const longitude = (lng !== null && lng !== undefined && !isNaN(parseFloat(String(lng)))) 
          ? parseFloat(String(lng)) 
          : undefined

        // Extract working hours from timestamps (if needed, we can format them later)
        // JSON API provides: normalBusinessHoursFrom/To, halfDayBusinessHoursFrom/To (Unix timestamps in ms)
        // For now, we'll leave working_time fields as undefined since JSON API doesn't provide formatted strings
        
        offices.push({
          office_code: office.code || "",
          name: office.name || "",
          name_en: office.nameEn || undefined,
          // Trim leading/trailing spaces from fullAddress (API sometimes includes them)
          address: address.fullAddress ? address.fullAddress.trim() : (address.address || ""),
          address_en: address.fullAddressEn ? address.fullAddressEn.trim() : (address.addressEn || undefined),
          city_id: cityId,
          city_name: city.name || "",
          post_code: city.postCode || city.post_code || "",
          phone: office.phones?.[0] || undefined,
          // JSON API doesn't provide formatted working time strings
          // It provides timestamps: normalBusinessHoursFrom/To, halfDayBusinessHoursFrom/To
          working_time: undefined, // Not available in JSON API response
          working_time_saturday: undefined, // Not available in JSON API response
          working_time_sunday: undefined, // Not available in JSON API response
          // JSON API returns coordinates in address.location (no swapping needed)
          latitude,
          longitude,
          is_machine: office.isMPS === true || office.isAPS === true,
        })
      }

      // Filter to Bulgarian offices only
      // Since we verified the city is Bulgarian, offices should be Bulgarian too
      // But keep safety checks in case API returns unexpected data
      // API returns offices for the city_id we pass (which is verified as Bulgarian)
      // No need for additional filtering - trust the API
      // Only ensure offices match the requested city_id
      const filteredOffices = offices.filter(office => office.city_id === cityId)

      this.logger_.info(`Fetched ${filteredOffices.length} offices for Bulgarian city ${cityId} (API filtered by city_id)`)

      // Cache the result for 1 day
      this.set(cacheKey, filteredOffices)
      this.logger_.info(`Cached ${filteredOffices.length} offices for city ${cityId} for 24 hours`)
      
      return filteredOffices
    } catch (error: any) {
      this.logger_.error("Error fetching offices:", error)
      throw error
    }
  }

  /**
   * Get all streets for a city (cached for 1 day)
   */
  async getStreets(cityId: number): Promise<EcontStreetData[]> {
    // Check cache first
    const cacheKey = this.getCacheKey("streets", cityId.toString())
    const cached = this.get<EcontStreetData[]>(cacheKey)
    if (cached) {
      this.logger_.info(`Returning ${cached.length} streets for city ${cityId} from cache`)
      return cached
    }

    try {
      const result = await this.jsonApiRequest(
        "Nomenclatures",
        "NomenclaturesService.getStreets",
        { cityID: cityId.toString() }
      )

      if (result?.error) {
        const errorMsg = result.error?.message || "Failed to fetch streets"
        throw new Error(errorMsg)
      }

      const streets: EcontStreetData[] = []
      const streetArray = result?.streets || []
      
      if (Array.isArray(streetArray)) {
        for (const street of streetArray) {
          if (!street) continue
          streets.push({
            city_id: cityId,
            name: street.name || "",
            name_en: street.nameEn || undefined,
          })
        }
      }

      // Cache the result for 1 day
      this.set(cacheKey, streets)
      this.logger_.info(`Cached ${streets.length} streets for city ${cityId} for 24 hours`)

      return streets
    } catch (error: any) {
      this.logger_.error("Error fetching streets:", error)
      throw error
    }
  }

  /**
   * Get all quarters (neighborhoods) for a city
   */
  async getQuarters(cityId: number): Promise<EcontQuarterData[]> {
    try {
      const result = await this.jsonApiRequest(
        "Nomenclatures",
        "NomenclaturesService.getQuarters",
        { cityID: cityId.toString() }
      )

      if (result?.error) {
        const errorMsg = result.error?.message || "Failed to fetch quarters"
        throw new Error(errorMsg)
      }

      const quarters: EcontQuarterData[] = []
      const quarterArray = result?.quarters || []
      
      if (Array.isArray(quarterArray)) {
        for (const quarter of quarterArray) {
          if (!quarter) continue
          quarters.push({
            city_id: cityId,
            name: quarter.name || "",
            name_en: quarter.nameEn || undefined,
          })
        }
      }

      return quarters
    } catch (error: any) {
      this.logger_.error("Error fetching quarters:", error)
      throw error
    }
  }

  /**
   * Calculate shipping price using Econt API
   * Based on: https://www.econt.com/developers/21-izchislyavane-na-tsena-za-pratka-dostavka-na-stokata-vi.html
   * Uses JSON API with mode: "calculate" to get real-time pricing
   */
  async calculateShippingPrice(params: {
    senderCity: string
    senderPostCode: string
    senderOfficeCode?: string // Optional: if provided, sender is from office
    senderStreet?: string // Optional: if provided with senderStreetNum, sender is from address
    senderStreetNum?: string // Optional: required if senderStreet is provided
    senderQuarter?: string // Optional
    receiverCityId?: number
    receiverCityName?: string
    receiverPostCode?: string
    receiverOfficeCode?: string
    receiverStreet?: string
    receiverStreetNum?: string
    receiverQuarter?: string
    weight: number // in kg
    shipmentType?: string // PACK, POST, etc.
    packCount?: number
  }): Promise<{ totalPrice: number; currency: string }> {
    try {
      if (!this.config_) {
        throw new Error("Econt service not configured")
      }

      // Build receiver address based on shipping type
      let receiverAddress: any

      if (params.receiverOfficeCode) {
        // Office delivery - use office code
        receiverAddress = {
          office: {
            code: params.receiverOfficeCode,
          },
          city: {
            country: {
              code3: "BGR",
            },
          },
        }
      } else if (params.receiverCityId && params.receiverPostCode && params.receiverStreet && params.receiverStreetNum) {
        // Door delivery - use full address (requires street and street_num)
        receiverAddress = {
          city: {
            country: {
              code3: "BGR",
            },
            name: params.receiverCityName || "",
            postCode: params.receiverPostCode,
          },
          street: params.receiverStreet,
          num: params.receiverStreetNum,
        }
        
        // Add optional quarter if provided
        if (params.receiverQuarter) {
          receiverAddress.quarter = params.receiverQuarter
        }
      } else {
        throw new Error(
          "Insufficient receiver address information for price calculation. " +
          "Office delivery requires: office_code, city_id, postcode. " +
          "Door delivery requires: city_id, city_name, postcode, street, street_num."
        )
      }

      // Build sender address based on sender type
      let senderAddress: any = {
        city: {
          country: {
            code3: "BGR",
          },
          name: params.senderCity,
          postCode: params.senderPostCode,
        },
      }

      // If sender office code is provided, use office sender
      if (params.senderOfficeCode) {
        senderAddress.office = {
          code: params.senderOfficeCode,
        }
      } else if (params.senderStreet && params.senderStreetNum) {
        // If sender street and street_num are provided, use address sender
        senderAddress.street = params.senderStreet
        senderAddress.num = params.senderStreetNum
        if (params.senderQuarter) {
          senderAddress.quarter = params.senderQuarter
        }
      }
      // Otherwise, use city-only sender (default)

      // Build label request with mode: "calculate"
      const requestBody = {
        label: {
          senderAddress,
          receiverAddress,
          packCount: params.packCount || 1,
          shipmentType: params.shipmentType || "PACK",
          weight: params.weight,
          shipmentDescription: "Online order",
        },
        mode: "calculate",
      }

      const deliveryType = params.receiverOfficeCode ? "OFFICE" : "DOOR"
      const senderType = params.senderOfficeCode ? "OFFICE" : (params.senderStreet && params.senderStreetNum ? "ADDRESS" : "CITY_ONLY")
      this.logger_.info(
        `Calculating shipping price via Econt API: ` +
        `deliveryType=${deliveryType}, ` +
        `senderType=${senderType}, ` +
        `senderCity=${params.senderCity}, ` +
        `senderOfficeCode=${params.senderOfficeCode || "N/A"}, ` +
        `senderStreet=${params.senderStreet || "N/A"}, ` +
        `receiverOfficeCode=${params.receiverOfficeCode || "N/A"}, ` +
        `receiverCityId=${params.receiverCityId}, ` +
        `receiverCityName=${params.receiverCityName || "N/A"}, ` +
        `receiverStreet=${params.receiverStreet || "N/A"}, ` +
        `receiverStreetNum=${params.receiverStreetNum || "N/A"}, ` +
        `weight=${params.weight}kg`
      )

      const result = await this.jsonApiRequest(
        "Shipments",
        "ShipmentsService.createLabel",
        requestBody
      )

      if (result?.error) {
        const errorMsg = result.error?.message || "Failed to calculate shipping price"
        this.logger_.error(`Econt price calculation error: ${errorMsg}`)
        throw new Error(errorMsg)
      }

      // Extract price from response
      // Econt API returns price in EUR (e.g., 3.50 for 3.50 EUR)
      const totalPrice = result.totalPrice || result.price?.totalPrice || 0
      const currency = result.currency || result.price?.currency || "EUR"

      // Ensure price is a number in EUR (not cents)
      const priceInEUR = typeof totalPrice === "number" 
        ? totalPrice
        : parseFloat(String(totalPrice))

      this.logger_.info(
        `Econt API calculated price: ${priceInEUR} ${currency}`
      )

      return {
        totalPrice: priceInEUR,
        currency,
      }
    } catch (error: any) {
      this.logger_.error("Error calculating shipping price via Econt API:", error)
      throw error
    }
  }

  /**
   * Create a shipment (label) via Econt JSON API
   * Uses LabelService.createLabel endpoint
   */
  async createLabel(loadingData: any): Promise<any> {
    try {
      // Build sender address from loadingData
      const senderAddress: any = {
        city: {
          name: loadingData.sender_city,
          postCode: loadingData.sender_post_code,
          country: {
            code3: "BGR",
          },
        },
      }

      // Add sender office or address based on sender type
      if (loadingData.sender_office_code) {
        senderAddress.office = {
          code: loadingData.sender_office_code,
        }
      } else if (loadingData.sender_street && loadingData.sender_street_num) {
        senderAddress.street = loadingData.sender_street
        senderAddress.num = loadingData.sender_street_num
        if (loadingData.sender_quarter) {
          senderAddress.quarter = loadingData.sender_quarter
        }
        if (loadingData.sender_street_bl) {
          senderAddress.bl = loadingData.sender_street_bl
        }
        if (loadingData.sender_street_vh) {
          senderAddress.vh = loadingData.sender_street_vh
        }
        if (loadingData.sender_street_et) {
          senderAddress.et = loadingData.sender_street_et
        }
        if (loadingData.sender_street_ap) {
          senderAddress.ap = loadingData.sender_street_ap
        }
      }

      // Build receiver address from loadingData
      const receiverAddress: any = {
        city: {
          name: loadingData.receiver_city,
          postCode: loadingData.receiver_post_code,
          country: {
            code3: "BGR",
          },
        },
      }

      // Add receiver office or address based on shipping_to
      if (loadingData.receiver_shipping_to === "OFFICE" && loadingData.receiver_office_code) {
        receiverAddress.office = {
          code: loadingData.receiver_office_code,
        }
      } else if (loadingData.receiver_street && loadingData.receiver_street_num) {
        receiverAddress.street = loadingData.receiver_street
        receiverAddress.num = loadingData.receiver_street_num
        if (loadingData.receiver_quarter) {
          receiverAddress.quarter = loadingData.receiver_quarter
        }
        if (loadingData.receiver_street_bl) {
          receiverAddress.bl = loadingData.receiver_street_bl
        }
        if (loadingData.receiver_street_vh) {
          receiverAddress.vh = loadingData.receiver_street_vh
        }
        if (loadingData.receiver_street_et) {
          receiverAddress.et = loadingData.receiver_street_et
        }
        if (loadingData.receiver_street_ap) {
          receiverAddress.ap = loadingData.receiver_street_ap
        }
      }

      // Build label request body (same structure as calculateShippingPrice but without mode)
      const requestBody: any = {
        label: {
          senderAddress,
          receiverAddress,
          receiverName: loadingData.receiver_name || loadingData.receiver_name_person,
          receiverPhone: loadingData.receiver_phone_num,
          receiverEmail: loadingData.receiver_email,
          packCount: loadingData.pack_count || 1,
          shipmentType: loadingData.shipment_type || "PACK",
          weight: loadingData.weight || 1.0,
          shipmentDescription: loadingData.shipment_description || `Order ${loadingData.order_num || ""}`,
        },
        // No mode parameter - defaults to create
      }

      // Add optional fields
      if (loadingData.declaredValue) {
        requestBody.label.declaredValue = loadingData.declaredValue
      }
      if (loadingData.codAmount) {
        requestBody.label.codAmount = loadingData.codAmount
      }
      if (loadingData.payAfterAccept) {
        requestBody.label.payAfterAccept = loadingData.payAfterAccept
      }
      if (loadingData.payAfterTest) {
        requestBody.label.payAfterTest = loadingData.payAfterTest
      }

      this.logger_.info(`Creating label via Econt JSON API for order: ${loadingData.order_num || "unknown"}`)

      // Use same service as calculateShippingPrice but without mode (or with mode: "create")
      // According to Econt API documentation, use ShipmentsService.createLabel
      const result = await this.jsonApiRequest(
        "Shipments",
        "ShipmentsService.createLabel",
        requestBody
      )

      if (result?.error) {
        const errorMsg = result.error?.message || result.error || "Failed to create label"
        throw new Error(errorMsg)
      }

      return result
    } catch (error: any) {
      this.logger_.error("Error creating label:", error)
      throw error
    }
  }

  /**
   * Get shipment status/tracking
   */
  async getShipmentStatus(loadingNum: string): Promise<any> {
    try {
      const xmlDataObj = {
        shipments: {
          "@_full_tracking": "ON",
          num: loadingNum,
        },
      }

      const result = await this.xmlApiRequest("shipments", xmlDataObj)

      const responseData = result.response || result
      if (responseData?.error || result.error) {
        const errorMsg = responseData?.error?.message || result.error?.message || "Failed to get shipment status"
        throw new Error(errorMsg)
      }

      return result
    } catch (error: any) {
      this.logger_.error("Error getting shipment status:", error)
      throw error
    }
  }

  /**
   * Delete/cancel a shipment
   */
  async deleteLabel(loadingNum: string): Promise<any> {
    try {
      const xmlDataObj = {
        cancel_shipments: {
          num: loadingNum,
        },
      }

      const result = await this.xmlApiRequest("cancel_shipments", xmlDataObj)

      const responseData = result.response || result
      if (responseData?.error || result.error) {
        const errorMsg = responseData?.error?.message || result.error?.message || "Failed to delete label"
        throw new Error(errorMsg)
      }

      return result
    } catch (error: any) {
      this.logger_.error("Error deleting label:", error)
      throw error
    }
  }

  /**
   * Sync cities from Econt API to database
   */
  /**
   * Helper function to remove undefined and null values from objects
   */
  private cleanData(data: any): any {
    const cleaned: any = {}
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        cleaned[key] = data[key]
      }
    }
    return cleaned
  }

  /**
   * @deprecated - Cities are now cached in memory with 1-day TTL, not stored in database
   * This method is kept for backwards compatibility but does nothing
   */
  async syncCities(): Promise<void> {
    this.logger_.warn("syncCities() is deprecated - cities are now cached in memory with 1-day TTL")
    // No-op - cities are fetched and cached on-demand via getCities()
  }

  /**
   * @deprecated - Offices are now cached in memory with 1-day TTL, not stored in database
   * This method is kept for backwards compatibility but does nothing
   */
  async syncOffices(cityId: number): Promise<void> {
    this.logger_.warn("syncOffices() is deprecated - offices are now cached in memory with 1-day TTL")
    // No-op - offices are fetched and cached on-demand via getOffices()
  }

  /**
   * @deprecated - Streets are now cached in memory with 1-day TTL, not stored in database
   * This method is kept for backwards compatibility but does nothing
   */
  async syncStreets(cityId: number): Promise<void> {
    this.logger_.warn("syncStreets() is deprecated - streets are now cached in memory with 1-day TTL")
    // No-op - streets are fetched and cached on-demand via getStreets()
  }

  /**
   * @deprecated - Quarters are now cached in memory with 1-day TTL, not stored in database
   * This method is kept for backwards compatibility but does nothing
   */
  async syncQuarters(cityId: number): Promise<void> {
    this.logger_.warn("syncQuarters() is deprecated - quarters are now cached in memory with 1-day TTL")
    // No-op - quarters are fetched and cached on-demand via getQuarters()
  }
}

export default EcontShippingService

