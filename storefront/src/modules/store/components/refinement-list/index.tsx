import { usePathname } from "next/navigation"
import { useCountryCode } from "@lib/context/country-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import clsx from "clsx"
import { useSearchParams } from "next/navigation"
import { getCategoriesList } from "@lib/data/categories"
import { getCollectionsList } from "@lib/data/collections"
import { useEffect, useState } from "react"

const sortOptions = [
  { label: "Latest Arrivals", value: "created_at" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
]

export default function RefinementList() {
  const countryCode = useCountryCode()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sortBy = searchParams.get("sortBy") || "created_at"
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])

  useEffect(() => {
    getCategoriesList().then(setCategories)
    getCollectionsList().then(setCollections)
  }, [])

  const activeStyle = "font-semibold underline"

  const isActive = (value) => value === sortBy

  const generateSortHref = (value) => {
    if (pathname.includes("/store")) {
      return `/${countryCode}/store?sortBy=${value}`
    }
    return `${pathname.split("?")[0]}?sortBy=${value}`
  }

  return (
    <div className="flex flex-col gap-y-8 text-sm tracking-wide uppercase">
      <div>
        <p className="mb-1">Sort by</p>
        <ul className="flex flex-col gap-y-1">
          {sortOptions.map((opt) => (
            <li key={opt.value}>
              <LocalizedClientLink
                href={generateSortHref(opt.value)}
                className={clsx(isActive(opt.value) && activeStyle)}
              >
                {opt.label}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1">Category</p>
        <ul className="flex flex-col gap-y-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <LocalizedClientLink
                href={`/${countryCode}/categories/${cat.handle}`}
                className={clsx(pathname.includes(`/categories/${cat.handle}`) && activeStyle)}
              >
                {cat.name}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1">Collection</p>
        <ul className="flex flex-col gap-y-1">
          {collections.map((col) => (
            <li key={col.id}>
              <LocalizedClientLink
                href={`/${countryCode}/collections/${col.handle}`}
                className={clsx(pathname.includes(`/collections/${col.handle}`) && activeStyle)}
              >
                {col.title}
              </LocalizedClientLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

