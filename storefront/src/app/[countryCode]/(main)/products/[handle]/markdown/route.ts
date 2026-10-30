import { getProductByHandle } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import { renderProductMarkdown } from "@lib/util/product-markdown"

/**
 * The product page as Markdown. Not linked as /markdown: next.config.js
 * rewrites `/{country}/products/{handle}.md`, and the product URL itself when
 * the request asks for `Accept: text/markdown`, to this route.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ countryCode: string; handle: string }> }
) {
  const { countryCode, handle } = await params
  const notFound = () =>
    new Response("Product not found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })

  const region = await getRegion(countryCode)
  if (!region) {
    return notFound()
  }

  const product = await getProductByHandle(handle, region.id).catch(() => null)
  if (!product) {
    return notFound()
  }

  return new Response(
    renderProductMarkdown({
      product,
      region,
      origin: getBaseURL().replace(/\/+$/, ""),
      countryCode,
    }),
    {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    }
  )
}
