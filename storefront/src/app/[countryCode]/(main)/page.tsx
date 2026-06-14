import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import TrustBar from "@modules/home/components/trust-bar"
import CampaignBanner from "@modules/home/components/campaign-banner"
import SizeFinderBanner from "@modules/home/components/size-finder-banner"
import CommunitySection from "@modules/home/components/community-section"
import CategoryGrid from "@modules/home/components/category-grid"
import BinderCompare from "@modules/home/components/binder-compare"
import { getCollectionsWithProducts } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "KIN STORE | Thời trang định hình cho cộng đồng Transguy & Tomboy",
  description:
    "Thương hiệu thời trang định hình dành riêng cho cộng đồng Transguy & Tomboy tại Việt Nam. Binder chất lượng cao, an toàn, thoải mái.",
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

  return (
    <>
      <Hero />

      {/* Featured Products */}
      <section className="py-24 max-w-kin mx-auto px-kin-desktop">
        <div className="flex justify-between items-end mb-12 border-b border-kin-outline-variant pb-4">
          <h2 className="font-hanken text-3xl font-semibold text-kin-primary">
            Được lựa chọn nhiều nhất
          </h2>
          <a
            href="/vn/store"
            className="font-hanken text-xs font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors flex items-center gap-1 uppercase tracking-widest"
          >
            Xem tất cả →
          </a>
        </div>
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </section>

      <CategoryGrid />

      <CampaignBanner />

      <BinderCompare />

      <SizeFinderBanner />

      <CommunitySection />

      <TrustBar />
    </>
  )
}
