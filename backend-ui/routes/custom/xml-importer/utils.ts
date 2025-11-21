// Declare global constant from Vite
declare const __BACKEND_URL__: string | undefined

// Helper to construct API URLs with backend URL
export const getApiUrl = (path: string): string => {
  const backendUrl = (typeof __BACKEND_URL__ !== 'undefined' ? __BACKEND_URL__ : "") || ""
  // Remove trailing slash from backendUrl and leading slash from path
  const cleanBackendUrl = backendUrl.replace(/\/$/, "")
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  return `${cleanBackendUrl}${cleanPath}`
}

// Helper to create authenticated fetch options
export const getFetchOptions = (options: RequestInit = {}): RequestInit => {
  return {
    ...options,
    credentials: 'include', // Include cookies/session for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }
}

// Helper to make authenticated fetch requests
const authenticatedFetch = (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies/session for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

export { authenticatedFetch }

