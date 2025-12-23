import { Suspense } from "react"

import TopPromoBar from "@modules/layout/components/top-promo-bar"
import MainHeader from "@modules/layout/components/main-header"
import CategoryNav from "@modules/layout/components/category-nav"

// Nav component - CartButton is already wrapped in Suspense in MainHeader
// TopPromoBar and CategoryNav don't access cookies, so they can prerender
export default async function Nav({ countryCode }: { countryCode: string }) {
  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Top Promotional Bar - can prerender */}
      <TopPromoBar />

      {/* Main Header - CartButton is wrapped in Suspense inside MainHeader */}
      <MainHeader countryCode={countryCode} />

      {/* Category Navigation - can prerender */}
      <CategoryNav countryCode={countryCode} />
    </div>
  )
}
