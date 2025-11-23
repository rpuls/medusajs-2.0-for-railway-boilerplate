import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getCategoriesList } from "@lib/data/categories"
import { getTranslations } from "@lib/i18n/server"

import CategoryMenuItem from "./category-menu-item"

const CategoryNav = async ({ countryCode }: { countryCode: string }) => {
  const { product_categories } = await getCategoriesList(0, 100)
  const translations = await getTranslations(countryCode)

  const displayCategories =
    product_categories && product_categories.length > 0
      ? product_categories
        .filter((cat) => !cat.parent_category)
        .slice(0, 20)
      : []

  return (
    <div className="w-full bg-background-elevated border-b border-border-base">
      <div className="content-container">
        <nav className="flex items-center gap-6 py-3">
          {/* All Products Menu */}
          <LocalizedClientLink
            href="/store"
            className="flex items-center gap-2 text-text-primary hover:text-primary transition-colors whitespace-nowrap font-medium"
          >
            <svg
              className="w-5 h-5"
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
            <span>{translations.common.allProducts}</span>
          </LocalizedClientLink>

          {/* Category Links */}
          {displayCategories.length > 0 && (
            <div className="flex items-center gap-6">
              {displayCategories.map((category) => (
                <CategoryMenuItem key={category.handle} category={category} />
              ))}
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

export default CategoryNav

