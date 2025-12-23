import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { connection } from "next/server"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { getCustomer } from "@lib/data/customer"

// Metadata generation - account pages are dynamic, so metadata is also dynamic
// Since this page accesses cookies (via getCustomer), metadata must also be dynamic
// Use "use cache" since metadata itself doesn't access runtime data
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>
}): Promise<Metadata> {
  "use cache"
  // Await params in Next.js 16
  const resolvedParams = await params
  const { countryCode } = resolvedParams
  
  // Metadata doesn't access cookies, but the page does
  // Use "use cache" since metadata itself is static
  return {
    title: "Addresses",
    description: "View your addresses",
  }
}

// Addresses page accesses user-specific data (cookies) - must be deferred to request time
async function AddressesContent({
  countryCode,
}: {
  countryCode: string
}) {
  // Customer data accesses cookies - must be fresh per request
  // connection() is already called in the page component
  const customer = await getCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Shipping Addresses</h1>
        <p className="text-base-regular">
          View and update your shipping addresses, you can add as many as you
          like. Saving your addresses will make them available during checkout.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}

export default async function Addresses({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  // Addresses page is always dynamic (user-specific) - defer to request time
  // Call connection() early to prevent prerendering
  await connection()
  
  // Await params in Next.js 16
  const resolvedParams = await params
  const { countryCode } = resolvedParams

  // Addresses page is always dynamic (user-specific) - wrap in Suspense
  return (
    <Suspense fallback={<div>Loading addresses...</div>}>
      <AddressesContent countryCode={countryCode} />
    </Suspense>
  )
}
