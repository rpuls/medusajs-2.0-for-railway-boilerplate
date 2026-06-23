import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const { cheapestPrice } = getProductPrice({ product })

  return (
    <div id="product-info">
      <h1
        className="font-hanken text-3xl font-semibold text-kin-primary mb-2 leading-tight"
        data-testid="product-title"
      >
        {product.title}
      </h1>
      {cheapestPrice && (
        <div className="font-hanken text-2xl font-semibold text-kin-on-surface-variant">
          <span
            data-testid="product-price"
            data-value={cheapestPrice.calculated_price_number}
          >
            {cheapestPrice.calculated_price}
          </span>
        </div>
      )}
    </div>
  )
}

export default ProductInfo
