import { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
// Must be a country the backend actually has a region for. The seed script
// creates a single "Europe" region covering gb, de, dk, se, fr, es and it, so
// "gb" is the default that matches a freshly seeded store. Change this together
// with the regions in backend/src/scripts/seed.ts.
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "gb"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

// httpOnly because nothing on the client ever reads this. lib/data/cookies.ts
// is "server-only", so the id is consumed exclusively during server rendering.
// sameSite is left at the default rather than "strict" on purpose: a visitor
// arriving from an external link would otherwise not send it, be issued a new
// one, and lose their warm cache on every inbound visit.
const CACHE_ID_COOKIE_OPTIONS = {
  maxAge: 60 * 60 * 24,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
} as const

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Medusa. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: ["regions"],
      },
    }).then((res) => res.json())

    if (!regions?.length) {
      notFound()
    }

    // Create a map of country codes to regions.
    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
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

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
      // Falling back here means NEXT_PUBLIC_DEFAULT_REGION names a country no
      // region covers, so shoppers land somewhere arbitrary with that region's
      // currency. Say so rather than failing over silently.
      console.warn(
        `Middleware.ts: no region covers NEXT_PUBLIC_DEFAULT_REGION "${DEFAULT_REGION}". Falling back to "${countryCode}". Add that country to a region in Medusa Admin, or set NEXT_PUBLIC_DEFAULT_REGION to one you already serve.`
      )
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a NEXT_PUBLIC_MEDUSA_BACKEND_URL environment variable?"
      )
    }
  }
}

/**
 * Middleware to handle region selection.
 */
export async function middleware(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const cartId = searchParams.get("cart_id")
  const checkoutStep = searchParams.get("step")
  const cartIdCookie = request.cookies.get("_medusa_cart_id")
  const cacheIdCookie = request.cookies.get("_medusa_cache_id")

  // Every visitor gets an id that scopes their Next cache tags. Without it a
  // single shopper's revalidateTag("carts") would purge every shopper's
  // cached cart. See getCacheTag in lib/data/cookies.ts.
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap()

  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && request.nextUrl.pathname.split("/")[1].includes(countryCode)

  // Put the id on the request as well as the response, so the render that is
  // about to happen can already read it.
  //
  // Upstream's starter instead issues an extra 307 to the same URL on a
  // visitor's first request purely to plant this cookie. That costs a redirect
  // on every cold visit and loops forever for a client that refuses cookies.
  // Forwarding it on the request avoids both. If the forward ever stopped
  // working the only consequence would be that the first render goes uncached,
  // which is what happens today anyway.
  request.cookies.set("_medusa_cache_id", cacheId)

  // check if one of the country codes is in the url
  if (urlHasCountryCode && (!cartId || cartIdCookie)) {
    const response = NextResponse.next({
      request: { headers: request.headers },
    })

    if (!cacheIdCookie) {
      response.cookies.set(
        "_medusa_cache_id",
        cacheId,
        CACHE_ID_COOKIE_OPTIONS
      )
    }

    return response
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

  // Set last, because the branches above replace `response` wholesale and a
  // cookie set on a discarded response is silently lost.
  if (!cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, CACHE_ID_COOKIE_OPTIONS)
  }

  return response
}

export const config = {
  // Prevents redirecting on static files.
  //
  // sitemap.xml, robots.txt and opengraph-image are excluded because they are
  // NOT region-prefixed: they are metadata routes at the app root, and without
  // this the middleware 307s a crawler from /sitemap.xml to /gb/sitemap.xml,
  // which does not exist. Generated by src/app/sitemap.ts, src/app/robots.ts
  // and src/app/opengraph-image.tsx.
  //
  // opengraph-image carries no file extension, so the image rules further down
  // this pattern do not cover it, and Next appends a cache-busting query string
  // to the URL it puts in the og:image tag. Matching the path prefix handles
  // both. Verified by fetching it: without this entry the route answers 307 to
  // /gb/opengraph-image and every shared link loses its preview card.
  matcher: [
    "/((?!api|_next/static|favicon.ico|sitemap.xml|robots.txt|opengraph-image|.*\\.png|.*\\.jpg|.*\\.gif|.*\\.svg).*)",
  ],
}
