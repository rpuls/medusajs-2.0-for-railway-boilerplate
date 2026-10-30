import { HttpTypes } from "@medusajs/types"
import { isVariantInStock } from "./inventory"

/**
 * schema.org Product data for a product page, as JSON-LD. Search engines and
 * AI assistants read price, stock and variants from it instead of guessing
 * from the rendered HTML. Taken from upstream's dtc-starter, with two things
 * left out:
 *
 * - `brand`, which upstream fills with the store's name. That is right for a
 *   store selling its own goods and wrong for one reselling other brands, and
 *   a wrong brand is worse than none.
 * - `shippingDetails` and `hasMerchantReturnPolicy`. Upstream reads them from
 *   region metadata that its backend seeds. This template seeds no such
 *   values, and publishing a return window or a shipping rate the store owner
 *   never set would be a promise made in their name.
 */

const SCHEMA_IN_STOCK = "https://schema.org/InStock"
const SCHEMA_OUT_OF_STOCK = "https://schema.org/OutOfStock"

export const getPricedVariants = (product: HttpTypes.StoreProduct) =>
  (product.variants ?? []).filter(
    (variant) => variant.calculated_price?.calculated_amount != null
  )

export const buildProductStructuredData = ({
  product,
  region,
  productUrl,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  productUrl: string
}) => {
  const currency = region.currency_code.toUpperCase()
  const images = (product.images ?? [])
    .map((image) => image.url)
    .filter(Boolean)
  if (!images.length && product.thumbnail) {
    images.push(product.thumbnail)
  }
  const description = product.description || product.title
  const optionTitles = new Map(
    (product.options ?? []).map((option) => [option.id, option.title])
  )

  const buildOffer = (variant: HttpTypes.StoreProductVariant, url: string) => ({
    "@type": "Offer",
    url,
    sku: variant.sku || undefined,
    price: variant.calculated_price!.calculated_amount!.toFixed(2),
    priceCurrency: currency,
    availability: isVariantInStock(variant)
      ? SCHEMA_IN_STOCK
      : SCHEMA_OUT_OF_STOCK,
    itemCondition: "https://schema.org/NewCondition",
  })

  const variants = getPricedVariants(product)

  if (variants.length <= 1) {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description,
      image: images,
      sku: variants[0]?.sku || undefined,
      url: productUrl,
      offers: variants[0] ? buildOffer(variants[0], productUrl) : undefined,
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: product.title,
    description,
    image: images,
    url: productUrl,
    productGroupID: product.id,
    variesBy: (product.options ?? []).map((option) => option.title),
    // Every variant's offer points at the product page. Upstream links
    // `?v_id={variant}`, which its product page reads to preselect the
    // variant; this one has no such parameter, and a URL that promises a
    // variant it does not select is worse than the plain page.
    hasVariant: variants.map((variant) => {
      return {
        "@type": "Product",
        name: `${product.title} - ${variant.title}`,
        sku: variant.sku || undefined,
        image: images[0],
        additionalProperty: (variant.options ?? []).map((value) => ({
          "@type": "PropertyValue",
          name: optionTitles.get(value.option_id ?? ""),
          value: value.value,
        })),
        offers: buildOffer(variant, productUrl),
      }
    }),
  }
}

/** Serializes JSON-LD for a `<script>` tag without allowing `</script>` breakouts. */
export const toJsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c")
