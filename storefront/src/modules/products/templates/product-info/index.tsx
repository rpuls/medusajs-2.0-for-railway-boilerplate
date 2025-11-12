import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info" className="flex flex-col gap-y-4">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-sm text-text-tertiary hover:text-text-primary transition-colors uppercase tracking-wider font-medium"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}
      <Heading
        level="h1"
        className="text-4xl md:text-5xl lg:text-6xl leading-tight text-text-primary font-bold tracking-tight"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      {product.description && (
        <Text
          className="text-lg text-text-secondary whitespace-pre-line leading-relaxed mt-2"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      )}
    </div>
  )
}

export default ProductInfo
