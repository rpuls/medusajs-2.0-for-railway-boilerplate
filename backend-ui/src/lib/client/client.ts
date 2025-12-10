import Medusa from "@medusajs/js-sdk"

// Normalize backendUrl to remove trailing slashes to prevent double slashes in URLs
const rawBackendUrl = __BACKEND_URL__ ?? "/"
export const backendUrl = rawBackendUrl.length > 1 && rawBackendUrl.endsWith("/")
  ? rawBackendUrl.slice(0, -1)
  : rawBackendUrl

export const sdk = new Medusa({
  baseUrl: backendUrl,
  auth: {
    type: "session",
  },
})

// useful when you want to call the BE from the console and try things out quickly
if (typeof window !== "undefined") {
  ;(window as any).__sdk = sdk
}
