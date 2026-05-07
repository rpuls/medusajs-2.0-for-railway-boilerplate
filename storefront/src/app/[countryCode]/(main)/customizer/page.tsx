import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { getMyDesign } from "@lib/data/designs"
import { retrieveOrder } from "@lib/data/orders"
import { getProductsList } from "@lib/data/products"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import { extractDefaultGarmentFromProduct } from "@modules/customizer/lib/default-garment"
import CustomizerTemplate from "@modules/customizer/templates"
import { ProductOptionsProvider } from "@modules/products/context/product-options-context"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

type CustomizerPageProps = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{
    handle?: string | string[]
    /** "<orderId>:<lineItemId>" — re-order from order history. */
    reorder?: string | string[]
    /** Saved-design id for the "Edit / re-order" link from /account/designs. */
    design?: string | string[]
  }>
}

const SHIRT_KEYWORDS = ["t-shirt", "t shirt", "tee", "shirt", "singlet", "polo"]

/** Picks a sensible default garment product when no env handle or query is set. */
const findDefaultProduct = (
  products: HttpTypes.StoreProduct[]
): HttpTypes.StoreProduct | null => {
  const shirtProduct = products.find((product) => {
    const title = (product.title ?? "").toLowerCase()
    const handle = (product.handle ?? "").toLowerCase()
    return SHIRT_KEYWORDS.some((keyword) => title.includes(keyword) || handle.includes(keyword))
  })

  if (shirtProduct) {
    return shirtProduct
  }

  return products[0] ?? null
}

const getConfiguredCustomizerHandle = () => {
  const envHandle =
    process.env.CUSTOMIZER_DEFAULT_PRODUCT_HANDLE ??
    process.env.NEXT_PUBLIC_CUSTOMIZER_DEFAULT_PRODUCT_HANDLE

  return typeof envHandle === "string" && envHandle.trim() ? envHandle.trim() : null
}

const firstString = (value: string | string[] | undefined): string | null => {
  const raw = Array.isArray(value) ? value[0] : value
  return typeof raw === "string" && raw.trim() ? raw.trim() : null
}

/**
 * Resolves the product handle to load when the customer arrives via
 * `?reorder=<orderId>:<lineItemId>`. Without this, the customizer page would
 * fall back to the configured default product (or the first shirt-like one)
 * and the customer would see — for example — a duffel bag when they were
 * trying to re-order a Staple Tee. The actual canvas state still hydrates
 * client-side via the rehydration effect, but it has to land on the right
 * product first.
 */
async function resolveReorderHandle(reorderRef: string): Promise<string | null> {
  const [orderId, lineItemId] = reorderRef.split(":")
  if (!orderId || !lineItemId) return null
  try {
    const order = await retrieveOrder(orderId)
    const items = (order as { items?: Array<{ id: string; product_handle?: string | null }> })
      ?.items
    const line = items?.find((i) => i.id === lineItemId)
    return line?.product_handle ?? null
  } catch {
    return null
  }
}

/**
 * Same as the reorder resolver but for `?design=<id>` (re-edit a design saved
 * from "My Designs"). Looks up the design's `base_product_id` and converts to
 * a handle via the products API.
 */
async function resolveDesignProduct(
  designId: string,
  countryCode: string
): Promise<HttpTypes.StoreProduct | null> {
  try {
    const design = await getMyDesign(designId)
    if (!design?.base_product_id) return null
    const {
      response: { products },
    } = await getProductsList({
      countryCode,
      queryParams: {
        id: design.base_product_id,
        limit: 1,
      } as HttpTypes.StoreProductParams,
    })
    return products[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/customizer`
  const description =
    "Upload your logo and position it on a garment mockup with a live drag-and-resize customizer."

  return {
    title: "Logo Customizer",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Logo Customizer | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Logo Customizer | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default async function CustomizerPage({ params, searchParams }: CustomizerPageProps) {
  const { countryCode } = await params
  const sp = await searchParams
  const handleFromQuery = firstString(sp.handle)
  const reorderRef = firstString(sp.reorder)
  const designId = firstString(sp.design)

  const configuredHandle = getConfiguredCustomizerHandle()

  let customizerProduct: HttpTypes.StoreProduct | null = null

  // Resolution order:
  //   1. Explicit ?handle= (deep link / "Change product" picker)
  //   2. ?reorder=<orderId>:<lineItemId> → original line's product (BUG FIX)
  //   3. ?design=<savedId> → saved design's base product   (BUG FIX)
  //   4. Configured env default
  //   5. First shirt-like product in catalog
  // Without #2 and #3, customers re-ordering a tee or re-editing a saved
  // hoodie design would land on the configured default (a duffel bag in
  // this catalog) and have to manually swap.
  let effectiveHandleFromUrl: string | null = handleFromQuery
  if (!effectiveHandleFromUrl && reorderRef) {
    effectiveHandleFromUrl = await resolveReorderHandle(reorderRef)
  }

  if (effectiveHandleFromUrl) {
    const {
      response: { products: byQuery },
    } = await getProductsList({
      countryCode,
      // `handle` filter is accepted by Medusa at runtime but isn't declared in
      // the SDK's StoreProductParams preview types — cast to silence drift.
      queryParams: {
        handle: effectiveHandleFromUrl,
        limit: 1,
      } as HttpTypes.StoreProductParams,
    })
    customizerProduct = byQuery[0] ?? null
  }

  if (!customizerProduct && designId) {
    customizerProduct = await resolveDesignProduct(designId, countryCode)
  }

  if (!customizerProduct && configuredHandle) {
    const {
      response: { products: byEnv },
    } = await getProductsList({
      countryCode,
      queryParams: {
        handle: configuredHandle,
        limit: 1,
      } as HttpTypes.StoreProductParams,
    })
    customizerProduct = byEnv[0] ?? null
  }

  if (!customizerProduct) {
    const {
      response: { products: catalog },
    } = await getProductsList({
      countryCode,
      queryParams: {
        limit: 48,
      },
    })
    customizerProduct = findDefaultProduct(catalog)
  }

  if (!customizerProduct) {
    notFound()
  }

  // Catalog list for the in-customizer "Change product" picker. Customers
  // landing on /customizer (e.g. via the account dashboard or a saved-design
  // re-edit) need a way to swap to a different garment without back-buttoning
  // to the catalog. Trimmed to thumbnail + handle + title to keep the payload
  // small — full product data is fetched on actual switch.
  const {
    response: { products: catalogForPicker },
  } = await getProductsList({
    countryCode,
    queryParams: {
      limit: 60,
      fields: "id,handle,title,thumbnail",
    } as HttpTypes.StoreProductParams,
  }).catch(() => ({ response: { products: [] as HttpTypes.StoreProduct[] } }))

  const pickerProducts = catalogForPicker
    .map((p) => ({
      id: p.id,
      handle: p.handle ?? "",
      title: p.title ?? "Untitled",
      thumbnail: p.thumbnail ?? null,
    }))
    .filter((p) => p.handle.length > 0)

  const defaultGarment = extractDefaultGarmentFromProduct(customizerProduct)

  return (
    <ProductOptionsProvider product={customizerProduct}>
      <CustomizerTemplate
        defaultGarmentImage={defaultGarment?.url ?? null}
        defaultGarmentTitle={defaultGarment?.title ?? null}
        product={customizerProduct}
        pickerProducts={pickerProducts}
      />
    </ProductOptionsProvider>
  )
}
