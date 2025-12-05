import { Metadata } from "next"
import { getProductsList } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import MuiTestPage from "./mui-test-page"

export const metadata: Metadata = {
  title: "Material UI Components Test",
  description: "Test page for Material UI components",
}

export default async function TestMuiPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  // Await params in Next.js 16
  const resolvedParams = await params
  
  // Validate and normalize country code
  if (!resolvedParams?.countryCode || typeof resolvedParams.countryCode !== 'string') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Invalid Country Code</h1>
        <p className="text-gray-600">
          Country code is missing or invalid.
        </p>
      </div>
    )
  }

  // Normalize country code to lowercase
  const countryCode = resolvedParams.countryCode.toLowerCase()
  const region = await getRegion(countryCode)
  
  if (!region) {
    // Try to get any available region as fallback
    const { listRegions } = await import("@lib/data/regions")
    const regions = await listRegions()
    const fallbackRegion = regions?.[0]
    
    if (!fallbackRegion) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Region not found</h1>
          <p className="text-gray-600">
            No region found for country code: {countryCode}
          </p>
          <p className="text-gray-600 mt-2">
            Please ensure your Medusa store has regions configured.
          </p>
        </div>
      )
    }

    // Use fallback region
    const { response } = await getProductsList({
      pageParam: 1,
      queryParams: { limit: 6 },
      countryCode: fallbackRegion.countries?.[0]?.iso_2?.toLowerCase() || 'us',
    })

    return (
      <MuiTestPage 
        products={response.products} 
        region={fallbackRegion} 
        countryCode={fallbackRegion.countries?.[0]?.iso_2?.toLowerCase() || 'us'} 
      />
    )
  }

  // Fetch first 6 products for display
  const { response } = await getProductsList({
    pageParam: 1,
    queryParams: { limit: 6 },
    countryCode,
  })

  return <MuiTestPage products={response.products} region={region} countryCode={countryCode} />
}

