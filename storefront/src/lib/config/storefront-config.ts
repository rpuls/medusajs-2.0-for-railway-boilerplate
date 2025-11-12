/**
 * Storefront configuration system
 * Centralized configuration for storefront behavior settings
 * Easy to customize for different clients
 */

export interface ProductGridColumns {
  mobile: number
  tablet: number
  desktop: number
}

export interface StorefrontConfig {
  // Cart configuration
  cart: {
    type: "slide-in" | "full-page" | "both"
    defaultView: "slide-in" | "full-page"
  }

  // Quick buy functionality
  quickBuy: {
    enabled: boolean
    showOnProductCard: boolean
    showOnPDP: boolean
  }

  // Payment methods
  payment: {
    googlePay: {
      enabled: boolean
    }
    applePay: {
      enabled: boolean
    }
  }

  // Product display
  product: {
    gridColumns: ProductGridColumns
    showReviews: boolean
    enableWishlist: boolean
    showRelatedProducts: boolean
  }

  // Search configuration
  search: {
    provider: "algolia" | "meilisearch" | "medusa"
  }

  // Features
  features: {
    newsletterSignup: boolean
    socialSharing: boolean
    productComparison: boolean
  }
}

/**
 * Default storefront configuration
 * Can be overridden per client
 */
export const defaultStorefrontConfig: StorefrontConfig = {
  cart: {
    type: "both",
    defaultView: "slide-in", // Default to slide-in cart
  },
  quickBuy: {
    enabled: true,
    showOnProductCard: true,
    showOnPDP: true,
  },
  payment: {
    googlePay: {
      enabled: true,
    },
    applePay: {
      enabled: true,
    },
  },
  product: {
    gridColumns: {
      mobile: 1,
      tablet: 2,
      desktop: 4,
    },
    showReviews: false,
    enableWishlist: true,
    showRelatedProducts: true,
  },
  search: {
    provider: "medusa", // Default to Medusa search
  },
  features: {
    newsletterSignup: true,
    socialSharing: false,
    productComparison: false,
  },
}

/**
 * Get storefront configuration
 * Can be extended to load from environment variables or API
 */
export function getStorefrontConfig(): StorefrontConfig {
  // In the future, this could load from:
  // - Environment variables
  // - API endpoint
  // - Database
  // - Client-specific config file
  return defaultStorefrontConfig
}

/**
 * Validate configuration
 */
export function validateConfig(config: StorefrontConfig): boolean {
  // Basic validation
  if (!config.cart || !config.cart.type) {
    return false
  }

  if (config.cart.type === "both" && !config.cart.defaultView) {
    return false
  }

  if (!config.product || !config.product.gridColumns) {
    return false
  }

  return true
}

