import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  console.log("product: ",product)
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-medium text-ui-fg-muted hover:text-ui-fg-subtle"
          >
            Categorie - {product.collection.title}
          </LocalizedClientLink>
        )}
      

        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.subtitle}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
