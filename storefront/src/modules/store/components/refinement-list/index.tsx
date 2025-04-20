"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function RefinementList() {
  return (
    <div className="flex small:flex-col gap-12 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      {/* Сортировка — работает только на /store */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Sort by</span>
        <LocalizedClientLink
          href={`/store?sortBy=created_at`}
          className="text-left text-sm hover:underline font-semibold"
        >
          Latest Arrivals
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/store?sortBy=price_asc`}
          className="text-left text-sm hover:underline text-gray-600"
        >
          Price: Low → High
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/store?sortBy=price_desc`}
          className="text-left text-sm hover:underline text-gray-600"
        >
          Price: High → Low
        </LocalizedClientLink>
      </div>

      {/* Категории — как в футере */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Category</span>
        <LocalizedClientLink
          href={`/categories/shirts`}
          className="text-left text-sm hover:underline"
        >
          T-Shirts
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/categories/sweatshirts`}
          className="text-left text-sm hover:underline"
        >
          Sweatshirts
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/categories/accessories`}
          className="text-left text-sm hover:underline"
        >
          Accessories
        </LocalizedClientLink>
      </div>

      {/* Коллекции — как в футере */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase text-gray-500">Collection</span>
        <LocalizedClientLink
          href={`/collections/spring`}
          className="text-left text-sm hover:underline"
        >
          Spring
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/collections/love`}
          className="text-left text-sm hover:underline"
        >
          Love
        </LocalizedClientLink>
      </div>
    </div>
  )
}
