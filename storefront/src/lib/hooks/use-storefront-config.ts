"use client"

import { useMemo } from "react"
import { getStorefrontConfig, type StorefrontConfig } from "../config/storefront-config"

/**
 * React hook to access storefront configuration
 * Returns the current storefront configuration
 */
export function useStorefrontConfig(): StorefrontConfig {
  return useMemo(() => getStorefrontConfig(), [])
}

