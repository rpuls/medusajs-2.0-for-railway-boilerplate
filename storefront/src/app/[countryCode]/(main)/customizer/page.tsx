import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
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
  searchParams: Promise<{ handle?: string | string[] }>
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
  const handleFromQueryRaw = Array.isArray(sp.handle) ? sp.handle[0] : sp.handle
  const handleFromQuery =
    typeof handleFromQueryRaw === "string" && handleFromQueryRaw.trim()
      ? handleFromQueryRaw.trim()
      : null

  const configuredHandle = getConfiguredCustomizerHandle()

  let customizerProduct: HttpTypes.StoreProduct | null = null

  if (handleFromQuery) {
    const {
      response: { products: byQuery },
    } = await getProductsList({
      countryCode,
      // `handle` filter is accepted by Medusa at runtime but isn't declared in
      // the SDK's StoreProductParams preview types — cast to silence drift.
      queryParams: {
        handle: handleFromQuery,
        limit: 1,
      } as HttpTypes.StoreProductParams,
    })
    customizerProduct = byQuery[0] ?? null
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
