import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCategoriesList } from "@lib/data/categories"
import { getTranslations, getTranslation } from "@lib/i18n/server"

interface CategoryIcon {
  id: string
  name: string
  handle: string
  icon?: string
}

interface CategoryIconsCarouselProps {
  categories?: CategoryIcon[]
  countryCode?: string
}

const CategoryIconsCarousel = async ({
  categories,
  countryCode = "us",
}: CategoryIconsCarouselProps) => {
  let displayCategories: CategoryIcon[] = []

  if (categories) {
    displayCategories = categories
  } else {
    // Fetch categories if not provided
    const { product_categories } = await getCategoriesList(0, 20)
    displayCategories =
      product_categories
        ?.filter((cat) => !cat.parent_category)
        .slice(0, 12)
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          handle: cat.handle,
        })) || []
  }

  if (displayCategories.length === 0) {
    return null
  }

  // Get translations for server component
  const translations = await getTranslations(countryCode)
  const title = getTranslation(translations, "homepage.categoryIcons.title")

  return (
    <div className="content-container py-8 md:py-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-6 md:mb-8">
        {title}
      </h2>
      <div className="relative">
        {/* Scrollable Container */}
        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
          <div className="flex gap-4 md:gap-6 min-w-max">
            {displayCategories.map((category) => (
              <LocalizedClientLink
                key={category.id}
                href={`/categories/${category.handle}`}
                className="flex flex-col items-center gap-3 p-4 md:p-6 bg-background-elevated border border-border-base rounded-3xl hover:shadow-md transition-all min-w-[120px] md:min-w-[140px] group"
              >
                {/* Icon Placeholder - Replace with actual icons */}
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium text-text-primary text-center">
                  {category.name.toUpperCase()}
                </span>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryIconsCarousel

