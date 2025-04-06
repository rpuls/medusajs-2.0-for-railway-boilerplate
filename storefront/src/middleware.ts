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
  // Create a hardcoded map with multiple regions
  const hardcodedMap = new Map<string, HttpTypes.StoreRegion>();

  // Add the default region (us) to the map
  hardcodedMap.set('us', {
    id: 'reg_default_us',
    name: 'United States',
    currency_code: 'usd',
    countries: [
      {
        iso_2: 'us',
        display_name: 'United States'
      }
    ]
  } as HttpTypes.StoreRegion);

  // Add European countries
  const euRegion = {
    id: 'reg_default_eu',
    name: 'Europe',
    currency_code: 'eur',
    countries: [
      { iso_2: 'gb', display_name: 'United Kingdom' },
      { iso_2: 'de', display_name: 'Germany' },
      { iso_2: 'fr', display_name: 'France' },
      { iso_2: 'it', display_name: 'Italy' },
      { iso_2: 'es', display_name: 'Spain' },
    ]
  } as HttpTypes.StoreRegion;

  // Add each European country to the map
  euRegion.countries.forEach(country => {
    hardcodedMap.set(country.iso_2, euRegion);
  });

  console.log('Using hardcoded region map to bypass backend region checks');
  console.log('Available regions:', Array.from(hardcodedMap.keys()));

  // Try to fetch from backend but fall back to hardcoded map if it fails
  try {
    if (BACKEND_URL && PUBLISHABLE_API_KEY) {
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY,
        },
        next: {
          revalidate: 3600,
          tags: ["regions"],
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { regions } = data;

        if (regions?.length) {
          const backendMap = new Map<string, HttpTypes.StoreRegion>();

          regions.forEach((region: HttpTypes.StoreRegion) => {
            region.countries?.forEach((c) => {
              if (c?.iso_2) {
                backendMap.set(c.iso_2.toLowerCase(), region);
              }
            });
          });

          if (backendMap.size > 0) {
            console.log('Successfully fetched regions from backend');
            console.log('Backend regions:', Array.from(backendMap.keys()));
            return backendMap;
          }
        }
      }
    }
  } catch (error) {
    console.log('Error fetching regions from backend, using hardcoded map');
  }

  return hardcodedMap;
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
  // Skip middleware for faster development
  return NextResponse.next();
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
