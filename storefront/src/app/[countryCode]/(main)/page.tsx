import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import LatestProducts from "@modules/home/components/latest-products"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getStoreName } from "@lib/util/env"

export const metadata: Metadata = {
  title: getStoreName(),
  description: `Shop the latest at ${getStoreName()}.`,
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  // The seed creates categories but no collections, so on a fresh store the
  // featured section would render nothing at all.
  const hasFeaturedProducts = collections.some(
    (collection) => collection.products?.length
  )

  return (
    <>
      {/* ===================================================================
        * EXAMPLE SECTION START
        *
        * <Hero /> is the dashed placeholder block on your homepage. To delete
        * it: remove the <Hero /> line just below, remove its import at the top
        * of this file, then delete the folder
        * src/modules/home/components/hero. Nothing else depends on it.
        * =================================================================== */}
      <Hero />
      {/* ===================================================================
        * EXAMPLE SECTION END
        * =================================================================== */}
      <div className="py-12">
        {hasFeaturedProducts ? (
          <ul className="flex flex-col gap-x-6">
            <FeaturedProducts collections={collections} region={region} />
          </ul>
        ) : (
          <LatestProducts countryCode={countryCode} region={region} />
        )}
      </div>
    </>
  )
}
