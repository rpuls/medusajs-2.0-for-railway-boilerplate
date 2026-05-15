import { requestContextStore, type RequestContext } from "./request-context"
import type { MedusaContainer } from "@medusajs/framework/types"

/**
 * Wrap a job handler with request context initialization.
 * Ensures the job runs with a unique requestId and can access context.
 */
export function withJobContext<T extends any[], R>(
  handler: (container: MedusaContainer, ...args: T) => Promise<R>
): (container: MedusaContainer, ...args: T) => Promise<R> {
  return async (container: MedusaContainer, ...args: T) => {
    return requestContextStore.run(() => handler(container, ...args))
  }
}

/**
 * Get the logger with context injection.
 * Wraps the Medusa logger to include requestId in messages.
 */
export function getContextLogger(container: MedusaContainer) {
  const { LOGGER } = require("@medusajs/framework/utils").ContainerRegistrationKeys
  const baseLogger = container.resolve(LOGGER)
  const context = requestContextStore.get()

  return {
    info: (message: string, data?: any) => {
      const msg = `[${context?.requestId}] ${message}`
      baseLogger.info(msg, data)
      requestContextStore.log("info", message, data)
    },
    warn: (message: string, data?: any) => {
      const msg = `[${context?.requestId}] ${message}`
      baseLogger.warn(msg, data)
      requestContextStore.log("warn", message, data)
    },
    error: (message: string, data?: any) => {
      const msg = `[${context?.requestId}] ${message}`
      baseLogger.error(msg, data)
      requestContextStore.log("error", message, data)
    },
    debug: (message: string, data?: any) => {
      const msg = `[${context?.requestId}] ${message}`
      baseLogger.debug(msg, data)
    },
  }
}
