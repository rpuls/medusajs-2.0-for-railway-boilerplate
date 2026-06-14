import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import BestSeller from "@modules/home/components/best-seller"
import TrustBar from "@modules/home/components/trust-bar"
import CampaignBanner from "@modules/home/components/campaign-banner"
import SizeFinderBanner from "@modules/home/components/size-finder-banner"
import CommunitySection from "@modules/home/components/community-section"
import CategoryGrid from "@modules/home/components/category-grid"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "KIN STORE | Thời trang định hình cho cộng đồng Transmasculine",
  description:
    "Thương hiệu thời trang định hình dành cho cộng đồng Transmasculine tại Việt Nam. Binder chất lượng cao, an toàn, thoải mái.",
}

export default async function Home({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  return (
    <>
      <Hero />

      <BestSeller region={region} countryCode={countryCode} />

      <CampaignBanner />

      <CategoryGrid />

      <SizeFinderBanner />

      <CommunitySection />

      <TrustBar />
    </>
  )
}
