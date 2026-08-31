import { Container, Text } from "@medusajs/ui"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * A search result as it actually comes back from the index.
 *
 * This mirrors the schema in `backend/src/search/products.ts`, which is the
 * plugin's `defineProductSearchIndex()` default. Keep the two in step: a field
 * declared here that is not indexed reads as `undefined` at runtime with no
 * type error to warn you, which is how the previous version of this type came
 * to declare a `collection_handle` that has never existed (the indexed field is
 * `collection.handle`) and typed `variants` as full `StoreProductVariant`
 * objects when only four scalar fields per variant are indexed.
 *
 * `objectID` is not from Medusa. `@meilisearch/instant-meilisearch` synthesizes
 * it from the document's primary key because InstantSearch requires the field.
 */
export type ProductHit = {
  id: string
  objectID?: string
  title: string
  subtitle: string | null
  handle: string
  description: string | null
  thumbnail: string | null
  status: string
  is_giftcard: boolean
  discountable: boolean
  collection_id: string | null
  type_id: string | null
  created_at: string
  updated_at: string
  collection?: { id: string; title: string; handle: string } | null
  type?: { id: string; value: string } | null
  categories?: { id: string; name: string; handle: string }[]
  tags?: { id: string; value: string }[]
  variants?: { id: string; title: string; sku: string | null; barcode: string | null }[]
}

type HitProps = {
  hit: ProductHit
}

const Hit = ({ hit }: HitProps) => {
  return (
    <LocalizedClientLink
      href={`/products/${hit.handle}`}
      data-testid="search-result"
    >
      <Container
        key={hit.id}
        className="flex sm:flex-col gap-2 w-full p-4 shadow-elevation-card-rest hover:shadow-elevation-card-hover items-center sm:justify-center"
      >
        <Thumbnail
          thumbnail={hit.thumbnail}
          size="square"
          className="group h-12 w-12 sm:h-full sm:w-full"
        />
        <div className="flex flex-col justify-between group">
          <div className="flex flex-col">
            <Text
              className="text-ui-fg-subtle"
              data-testid="search-result-title"
            >
              {hit.title}
            </Text>
          </div>
        </div>
      </Container>
    </LocalizedClientLink>
  )
}

export default Hit
