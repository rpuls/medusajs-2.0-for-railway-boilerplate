"use client"

import { useHits, useSearchBox } from "react-instantsearch-hooks-web"
import { ProductHit } from "@modules/search/components/hit"
import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useTranslation } from "@lib/i18n/hooks/use-translation"
import { useRouter } from "next/navigation"

const SearchResults = ({
  onClose,
}: {
  onClose?: () => void
}) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { query } = useSearchBox()
  const { hits } = useHits()

  // Show only first 3 results
  const displayHits = hits.slice(0, 3) as unknown as ProductHit[]

  if (!query || displayHits.length === 0) {
    return null
  }

  const handleViewAll = () => {
    if (query) {
      // Close the search overlay before navigating
      if (onClose) {
        onClose()
      }
      router.push(`/results/${query}`)
    }
  }

  return (
    <div className="w-full">
      {/* Products Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-xs md:text-sm font-semibold text-text-primary uppercase tracking-wide">
          {t("common.products") || "ПРОДУКТИ"}
        </h3>
      </div>

      {/* Products List - Single Column */}
      <div className="flex flex-col">
        {displayHits.map((hit, index) => (
          <LocalizedClientLink
            key={hit.id}
            href={`/products/${hit.handle}`}
            className="flex items-start gap-3 px-4 py-3 hover:bg-background-elevated transition-colors border-b border-border-base last:border-b-0"
            data-testid="search-result"
          >
            {/* Product Image */}
            <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded overflow-hidden bg-background-elevated">
              <Thumbnail
                thumbnail={hit.thumbnail}
                size="square"
                className="w-full h-full object-cover"
                productName={hit.title}
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0 py-1">
              <h4 className="text-sm md:text-base font-medium text-text-primary mb-1.5 line-clamp-2 leading-tight">
                {hit.title}
              </h4>
              {hit.description && (
                <p className="text-xs md:text-sm text-text-secondary line-clamp-2 leading-relaxed">
                  {hit.description}
                </p>
              )}
            </div>
          </LocalizedClientLink>
        ))}
      </div>

      {/* View All Link */}
      {hits.length > 3 && (
        <div className="px-4 py-3 border-t border-border-base">
          <button
            onClick={handleViewAll}
            className="text-sm font-medium text-primary hover:text-primary-hover transition-colors w-full text-left"
          >
            {t("homepage.viewAll") || "View all"}
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchResults

