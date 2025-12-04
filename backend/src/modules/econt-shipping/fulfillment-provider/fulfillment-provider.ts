import {
  AbstractFulfillmentProviderService,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import {
  CalculateShippingOptionPriceDTO,
  CalculatedShippingOptionPrice,
  FulfillmentOption,
} from "@medusajs/framework/types"
import { ECONT_SHIPPING_MODULE } from "../index"
import EcontShippingService from "../service"

type InjectedDependencies = {
  logger: Logger
}

export interface EcontFulfillmentProviderOptions {
  username: string
  password: string
  live: boolean
}

/**
 * Econt Fulfillment Provider
 * Supports both flat rate and calculated pricing
 * Uses Econt API for real-time price calculation when possible
 */
class EcontFulfillmentProvider extends AbstractFulfillmentProviderService {
  static identifier = "econt"
  protected readonly logger_: Logger
  protected config_: EcontFulfillmentProviderOptions

  constructor(container: InjectedDependencies, options: EcontFulfillmentProviderOptions) {
    super()
    this.logger_ = container.logger
    this.config_ = options
  }

  /**
   * Get fulfillment options available for this provider
   * These options will appear in the admin UI dropdown
   */
  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      {
        id: "econt-standard",
        name: "Econt Standard Shipping",
        is_return: false,
      },
      {
        id: "econt-express",
        name: "Econt Express Shipping",
        is_return: false,
      },
      {
        id: "econt-office",
        name: "Econt Office Delivery",
        is_return: false,
      },
      {
        id: "econt-door",
        name: "Econt Door Delivery",
        is_return: false,
      },
    ]
  }

  /**
   * Check if this provider can calculate prices
   */
  async canCalculate(data: any): Promise<boolean> {
    // Support calculated pricing
    return true
  }

  /**
   * Calculate shipping price based on cart contents and destination
   * This method is called when price_type is "calculated"
   */
  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    this.logger_.info(
      `Econt calculatePrice called - hasContext: ${!!context}, contextKeys: ${context ? Object.keys(context).join(", ") : "none"}`
    )
    
    try {
      // Calculate total weight from cart items (in kg)
      // Note: We can enhance this later to call Econt API for actual price calculation
      // by resolving the ECONT_SHIPPING_MODULE service from the Medusa container
      let totalWeight = 0
      
      // Handle different context structures
      const items = (context as any)?.items || (context as any)?.cart?.items || []
      
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          // Weight is typically stored in grams, convert to kg
          const itemWeight = ((item as any).variant?.weight || (item as any).weight || 0) / 1000
          const quantity = (item as any).quantity || 1
          totalWeight += itemWeight * quantity
        }
      }

      // Default weight if not specified (in kg)
      if (totalWeight === 0) {
        totalWeight = 0.5 // Default 0.5kg
      }

      // Get Econt data from cart metadata (if available)
      // Try multiple ways to access cart metadata
      let cartMetadata: any = {}
      let econtData: any = null
      
      // Method 1: Direct from context
      cartMetadata = (context as any)?.metadata || (context as any)?.cart?.metadata || {}
      econtData = cartMetadata.econt
      
      this.logger_.info(
        `Econt metadata check: hasContextMetadata=${!!(context as any)?.metadata}, hasCartMetadata=${!!(context as any)?.cart?.metadata}, hasEcontData=${!!econtData}, cartId=${(context as any)?.id}`
      )
      
      // Method 2: Fetch cart from database if we have cart ID and scope
      if (!econtData && (context as any)?.id && (context as any)?.scope?.resolve) {
        try {
          const cartModuleService = (context as any).scope.resolve(Modules.CART)
          const cart = await cartModuleService.retrieve((context as any).id, {
            relations: ["metadata"],
          })
          if (cart?.metadata) {
            cartMetadata = cart.metadata
            econtData = cartMetadata.econt
            this.logger_.info(`Fetched cart metadata from database, hasEcontData=${!!econtData}`)
          }
        } catch (error: any) {
          // Silently fail - we'll use estimated pricing
          this.logger_.warn(`Could not fetch cart metadata for Econt price calculation: ${error.message}`)
        }
      }
      
      const shippingTo = econtData?.shipping_to || "OFFICE"

      // Try to use Econt API for real-time price calculation if we have all required data
      // Based on: https://www.econt.com/developers/21-izchislyavane-na-tsena-za-pratka-dostavka-na-stokata-vi.html
      if (econtData) {
        try {
          // Try to resolve Econt service from context scope
          // The context should have a scope with resolve method when called from API routes
          let econtService: EcontShippingService | null = null
          
          if ((context as any)?.scope?.resolve) {
            econtService = (context as any).scope.resolve(ECONT_SHIPPING_MODULE) as EcontShippingService
          }
          
          if (econtService && econtService.calculateShippingPrice) {
            // Get settings from database with fallback to constants
            const settings = await econtService.getSettingsWithFallback()
            
            // Configure service with credentials from settings
            econtService.configure({
              username: settings.username,
              password: settings.password,
              live: settings.live,
            })

            // Check if we have enough data for API calculation
            const hasOfficeData = shippingTo === "OFFICE" && econtData.office_code && econtData.city_id && econtData.postcode
            const hasDoorData = shippingTo === "DOOR" && econtData.city_id && econtData.postcode && econtData.street && econtData.street_num

            if (hasOfficeData || hasDoorData) {
              this.logger_.info(
                `Calculating shipping price via Econt API: shippingTo=${shippingTo}, hasOfficeData=${hasOfficeData}, hasDoorData=${hasDoorData}, weight=${totalWeight}kg`
              )

              // Get settings from database with fallback to constants
              const settings = await econtService.getSettingsWithFallback()

              // Build parameters based on shipping type
              const priceParams: any = {
                senderCity: settings.sender_city,
                senderPostCode: settings.sender_post_code,
                receiverCityId: econtData.city_id,
                receiverCityName: econtData.city_name,
                receiverPostCode: econtData.postcode,
                weight: totalWeight,
                shipmentType: "PACK",
                packCount: 1,
              }

              // Add sender address configuration based on sender type
              if (settings.sender_type === "OFFICE" && settings.sender_office_code) {
                priceParams.senderOfficeCode = settings.sender_office_code
              } else if (settings.sender_type === "ADDRESS" && settings.sender_street && settings.sender_street_num) {
                priceParams.senderStreet = settings.sender_street
                priceParams.senderStreetNum = settings.sender_street_num
                if (settings.sender_quarter) {
                  priceParams.senderQuarter = settings.sender_quarter
                }
              }

              // Only include office_code for office delivery
              if (shippingTo === "OFFICE" && econtData.office_code) {
                priceParams.receiverOfficeCode = econtData.office_code
              }

              // Only include address fields for door delivery
              if (shippingTo === "DOOR") {
                priceParams.receiverStreet = econtData.street
                priceParams.receiverStreetNum = econtData.street_num
                if (econtData.quarter) {
                  priceParams.receiverQuarter = econtData.quarter
                }
              }

              const priceResult = await econtService.calculateShippingPrice(priceParams)

              this.logger_.info(
                `Econt API calculated price: ${priceResult.totalPrice} ${priceResult.currency}`
              )

              return {
                calculated_amount: priceResult.totalPrice,
                is_calculated_price_tax_inclusive: false,
              }
            }
          }
        } catch (apiError: any) {
          // Log error but fall through to estimated pricing
          this.logger_.warn(`Failed to calculate price via Econt API, using estimated pricing: ${apiError.message}`)
        }
      }

      // Fallback to estimated price calculation based on weight and shipping type
      // Typical Econt prices in Bulgaria:
      // - Office delivery: 3-5 EUR for up to 1kg, +1-2 EUR per additional kg
      // - Door delivery: 4-7 EUR for up to 1kg, +1.5-2.5 EUR per additional kg
      
      // Base prices in EUR (not cents)
      let basePrice: number
      let pricePerKg: number
      
      if (shippingTo === "OFFICE") {
        // Office delivery is cheaper
        basePrice = 3.50 // 3.50 EUR base
        pricePerKg = 1.50 // 1.50 EUR per kg after first kg
      } else {
        // Door delivery is more expensive
        basePrice = 4.50 // 4.50 EUR base
        pricePerKg = 2.00 // 2.00 EUR per kg after first kg
      }
      
      // Calculate weight-based price
      // First kg is included in base price, additional kgs are charged
      const additionalWeight = Math.max(0, totalWeight - 1)
      const weightPrice = additionalWeight * pricePerKg
      
      const calculatedPrice = Math.round((basePrice + weightPrice) * 100) / 100 // Round to 2 decimal places
      
      // Log detailed calculation for debugging
      this.logger_.info(
        `Econt estimated price calculation: ` +
        `weight=${totalWeight}kg, ` +
        `shippingTo=${shippingTo}, ` +
        `basePrice=${basePrice}EUR, ` +
        `weightPrice=${weightPrice.toFixed(2)}EUR, ` +
        `total=${calculatedPrice}EUR`
      )

      // Ensure we return a valid number
      if (isNaN(calculatedPrice) || calculatedPrice <= 0) {
        this.logger_.warn("Calculated price is invalid, using default")
        return {
          calculated_amount: 4.00, // 4.00 EUR default
          is_calculated_price_tax_inclusive: false,
        }
      }

      return {
        calculated_amount: calculatedPrice,
        is_calculated_price_tax_inclusive: false,
      }
    } catch (error: any) {
      this.logger_.error("Error calculating Econt price:", error)
      // Fallback to a default price if calculation fails
      return {
        calculated_amount: 1000, // 10.00 EUR default
        is_calculated_price_tax_inclusive: false,
      }
    }
  }

  /**
   * Validate fulfillment data
   * This is called when setting up shipping methods, so we should be lenient
   * and only validate when data is actually present (user has filled in Econt details)
   */
  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Get Econt data from cart metadata (if available)
    const econtData = (context as any)?.metadata?.econt as any

    // If no Econt data yet, that's okay - user hasn't filled in details yet
    // We'll validate more strictly when the order is actually placed
    if (!econtData) {
      return {
        econt: null,
      }
    }

    // If data is present, do basic validation but don't block if incomplete
    // The frontend will handle showing validation errors to the user
    if (econtData.shipping_to === "OFFICE" && !econtData.office_code) {
      // Don't throw - just return the data as-is
      // Frontend validation will catch this
    }

    if (econtData.shipping_to === "DOOR") {
      if (!econtData.city_id || !econtData.street || !econtData.street_num) {
        // Don't throw - just return the data as-is
        // Frontend validation will catch this
      }
    }

    return {
      econt: econtData,
    }
  }

  /**
   * Validate option data
   */
  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    // Basic validation - can be enhanced
    return true
  }

  /**
   * Get fulfillment documents (not used for Econt)
   */
  async getFulfillmentDocuments(data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  /**
   * Get return documents (not used for Econt)
   */
  async getReturnDocuments(data: Record<string, unknown>): Promise<never[]> {
    return []
  }

  /**
   * Get documents (not used for Econt)
   */
  async getDocuments(): Promise<any[]> {
    return []
  }
}

export default EcontFulfillmentProvider

