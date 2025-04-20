import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface MinPricedProduct extends HttpTypes.StoreProduct {
  _minPrice?: number
}

export function sortProducts(
  products: HttpTypes.StoreProduct[],
  sortBy: SortOptions
): HttpTypes.StoreProduct[] {
  let sortedProducts = products as MinPricedProduct[]

  if (["price_asc", "price_desc"].includes(sortBy)) {
    // Фильтруем те, у кого нет цены, иначе сортировка ломается
    sortedProducts = sortedProducts.filter((product) =>
      product.variants?.some(
        (v) => typeof v?.calculated_price?.calculated_amount === "number"
      )
    )

    // Вычисляем минимальную цену
    sortedProducts.forEach((product) => {
      product._minPrice = Math.min(
        ...product.variants.map(
          (v) => v?.calculated_price?.calculated_amount || Infinity
        )
      )
    })

    sortedProducts.sort((a, b) => {
      const diff = a._minPrice! - b._minPrice!
      return sortBy === "price_asc" ? diff : -diff
    })
  }

  if (sortBy === "created_at") {
    sortedProducts.sort((a, b) => {
      return (
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      )
    })
  }

  return sortedProducts
}
