import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import FeaturedProducts from "@modules/home/components/featured-products"

export default async function Home({
  params: { countryCode },
}: {
  params: { countryCode: string }
}) {
  const collections = await getCollectionsWithProducts(countryCode)
  const region = await getRegion(countryCode)

  if (!collections || !region) {
    return null
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/flower_power_AI.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 flex items-center justify-start pl-20 z-10">
        <div>
          <h1 className="text-5xl font-bold">gmorkl spring collection</h1>
          <h2 className="text-xl mt-2">wearable art from Cologne</h2>
        </div>
      </div>

      <div className="absolute bottom-0 w-full py-12 bg-black bg-opacity-70 z-10">
        <ul className="text-white px-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </div>
  )
}
