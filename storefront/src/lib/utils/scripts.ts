/**
 * Utility functions for loading third-party scripts with Next.js Script component
 * Optimized for performance with lazy loading
 */

export interface ScriptConfig {
  src: string
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload" | "worker"
  onLoad?: () => void
  onError?: () => void
}

/**
 * Get script loading strategy based on priority
 * - beforeInteractive: Critical scripts that need to load before page becomes interactive
 * - afterInteractive: Scripts that can load after page is interactive (default)
 * - lazyOnload: Non-critical scripts that can load after everything else
 */
export function getScriptStrategy(priority: "high" | "medium" | "low"): ScriptConfig["strategy"] {
  switch (priority) {
    case "high":
      return "afterInteractive"
    case "medium":
      return "afterInteractive"
    case "low":
      return "lazyOnload"
    default:
      return "lazyOnload"
  }
}

/**
 * Analytics scripts should be loaded with lazyOnload strategy
 */
export const ANALYTICS_SCRIPT_STRATEGY: ScriptConfig["strategy"] = "lazyOnload"

/**
 * Payment provider scripts should be loaded with afterInteractive strategy
 */
export const PAYMENT_SCRIPT_STRATEGY: ScriptConfig["strategy"] = "afterInteractive"

