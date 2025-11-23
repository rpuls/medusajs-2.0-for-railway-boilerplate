import { Suspense } from "react"

import TopPromoBar from "@modules/layout/components/top-promo-bar"
import MainHeader from "@modules/layout/components/main-header"
import CategoryNav from "@modules/layout/components/category-nav"

export default async function Nav({ countryCode }: { countryCode: string }) {
  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Top Promotional Bar */}
      <TopPromoBar />

      {/* Main Header */}
      <MainHeader countryCode={countryCode} />

      {/* Category Navigation */}
      <CategoryNav countryCode={countryCode} />
    </div>
  )
}
