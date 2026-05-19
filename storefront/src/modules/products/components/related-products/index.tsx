import ProductPreview from "@modules/products/components/product-preview"
import { getRegion } from "@lib/data/regions"
import { getProductsList } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

type StoreProductWithTags = HttpTypes.StoreProduct & {
  tags?: { id: string; value?: string }[]
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // Medusa Store API uses `tag_id` (array of tag IDs), NOT `tags`; sending
  // `tags` causes "Invalid request: Unrecognized fields: 'tags'" (400) for
  // any product that actually has tags in the catalog.
  // Cast widens the SDK preview types — `collection_id`, `tag_id`,
  // `is_giftcard` are accepted at runtime but not declared in StoreProductParams.
  const queryParams = {} as HttpTypes.StoreProductParams & {
    collection_id?: string[]
    tag_id?: string[]
    is_giftcard?: boolean
  }
  queryParams.region_id = region.id
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  const productWithTags = product as StoreProductWithTags
  const tagIds = productWithTags.tags
    ?.map((tag) => tag?.id)
    .filter((id): id is string => typeof id === "string" && id.length > 0)
  if (tagIds?.length) {
    queryParams.tag_id = tagIds
  }
  queryParams.is_giftcard = false

  const products = await getProductsList({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint">
      <header className="mx-auto mb-12 max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Related products
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          You might also want these.
        </h2>
      </header>

      <ul className="grid w-full grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-x-6 gap-y-10 medium:gap-x-8">
        {products.map((product) => (
          <li key={product.id} className="h-full">
            {region && (
              <ProductPreview
                product={product}
                region={region}
                layout="boxed"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
