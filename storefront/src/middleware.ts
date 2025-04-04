import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      if (!BACKEND_URL) {
        throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL is not defined")
      }

      if (!PUBLISHABLE_API_KEY) {
        throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not defined")
      }

      console.log('Fetching regions from:', `${BACKEND_URL}/store/regions`)
      console.log('Using publishable key:', PUBLISHABLE_API_KEY)
      
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: ["regions"],
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch regions: ${response.status} ${response.statusText}`)
      }

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      const { regions } = data

      if (!regions?.length) {
        console.error('No regions found in response')
        throw new Error("No regions found in the response")
      }

      // Clear the existing map
      regionMapCache.regionMap.clear()

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          if (c?.iso_2) {
            regionMapCache.regionMap.set(c.iso_2.toLowerCase(), region)
          }
        })
      })

      regionMapCache.regionMapUpdated = Date.now()

      // Log available regions for debugging
      console.log('Available regions:', Array.from(regionMapCache.regionMap.keys()))
    } catch (error) {
      console.error("Error in getRegionMap:", error)
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Middleware.ts: Error getting the region map. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
        )
      }
      // Return empty map instead of throwing to allow the application to continue
      return new Map()
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    // First try the URL country code
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } 
    // Then try the Vercel country code
    else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } 
    // Then try the default region
    else if (DEFAULT_REGION && regionMap.has(DEFAULT_REGION.toLowerCase())) {
      countryCode = DEFAULT_REGION.toLowerCase()
    } 
    // Finally, try to get any available region
    else {
      const firstRegion = regionMap.keys().next().value
      if (firstRegion) {
        console.log(`Default region ${DEFAULT_REGION} not found, using first available region: ${firstRegion}`)
        countryCode = firstRegion
      } else {
        console.error("No regions available in the region map")
        return undefined
      }
    }

    console.log(`Selected country code: ${countryCode}`)
    return countryCode
  } catch (error) {
    console.error("Error in getCountryCode:", error)
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
    return undefined
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const isOnboarding = searchParams.get("onboarding") === "true"
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const onboardingCookie = request.cookies.get("_medusa_onboarding")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")

  const regionMap = await getRegionMap()

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // check if one of the country codes is in the url
  if (
    urlHasCountryCode &&
    (!isOnboarding || onboardingCookie) &&
    (!cartId || cartIdCookie)
  ) {
    return NextResponse.next()
  }

  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname

  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  let redirectUrl = request.nextUrl.href

  let response = NextResponse.redirect(redirectUrl, 307)

  // If no country code is set, we redirect to the relevant region.
  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  }

  // If a cart_id is in the params, we set it as a cookie and redirect to the address step.
  if (cartId && !checkoutStep) {
    redirectUrl = `${redirectUrl}&step=address`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
    response.cookies.set("_medusa_cart_id", cartId, { maxAge: 60 * 60 * 24 })
  }

  // Set a cookie to indicate that we're onboarding. This is used to show the onboarding flow.
  if (isOnboarding) {
    response.cookies.set("_medusa_onboarding", "true", { maxAge: 60 * 60 * 24 })
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)"], // prevents redirecting on static files
}
