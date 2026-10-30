import { HttpTypes } from "@medusajs/types"
import { isVariantInStock } from "./inventory"
import { convertToLocale } from "./money"
import { getPricedVariants } from "./product-structured-data"

/**
 * A product page as Markdown, served at `<product-url>.md` and to any request
 * that sends `Accept: text/markdown` (next.config.js). An agent gets the
 * variants with their IDs, prices and stock in a few hundred bytes instead of
 * a rendered page. Taken from upstream's dtc-starter, without its no-JS
 * add-to-cart form (not ported) and without shipping and return terms (see
 * product-structured-data.ts for why).
 */
export const renderProductMarkdown = ({
  product,
  region,
  origin,
  countryCode,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  origin: string
  countryCode: string
}) => {
  const base = `${origin}/${countryCode}`
  const productUrl = `${base}/products/${product.handle}`
  const currency = region.currency_code
  const optionTitles = new Map(
    (product.options ?? []).map((option) => [option.id, option.title])
  )

  const variants = getPricedVariants(product)
  const variantRows = variants.map((variant) => {
    const options = (variant.options ?? [])
      .map((value) => `${optionTitles.get(value.option_id ?? "") ?? "Option"}: ${value.value}`)
      .join(", ")
    const price = convertToLocale({
      amount: variant.calculated_price!.calculated_amount!,
      currency_code: currency,
    })
    const stock = isVariantInStock(variant) ? "In stock" : "Out of stock"
    return `| ${options || variant.title} | ${variant.sku ?? ""} | ${price} | ${stock} | \`${variant.id}\` |`
  })

  return `# ${product.title}

${product.description ?? ""}

- URL: ${productUrl}
- Availability: ${variants.some(isVariantInStock) ? "In stock" : "Out of stock"}
- Prices are for ${countryCode.toUpperCase()} in ${currency.toUpperCase()} and do not include shipping.

## Variants

| Options | SKU | Price | Availability | Variant ID |
| --- | --- | --- | --- | --- |
${variantRows.join("\n")}

## Buy

- Checkout link: ${origin}/buy/{variant_id}:{quantity}?context/address_country=${countryCode.toUpperCase()}
- AI agents: the UCP profile at ${origin}/.well-known/ucp lists an MCP server for search, carts and checkout.

## Policies

- [Shipping](${base}/shipping)
- [Returns](${base}/returns)
- [Terms of service](${base}/terms)
- [Privacy policy](${base}/privacy)
`
}
