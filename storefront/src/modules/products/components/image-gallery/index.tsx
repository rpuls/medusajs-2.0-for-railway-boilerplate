"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useMemo } from "react"
import { remapStaleExternalGarmentUrl } from "@lib/util/remap-stale-supplier-images"
import { useProductOptions } from "@modules/products/context/product-options-context"
import {
  buildColorNeedlesForRelaxedMatch,
  filterGarmentImageUrlsForVariantColor,
  findProductImageByUrl,
  findProductImageByVariantSku,
  getGarmentImageUrlsFromMetadata,
  isColorOptionTitle,
  normalizeImageUrl,
  resolveVariantFromOptions,
  urlMatchesColorLabelStrict,
  urlMatchesColorNeedles,
} from "@modules/products/lib/variant-options"
import { PRODUCT_VIEW_IMAGE_META_KEYS_ORDERED } from "@lib/util/product-view-image-metadata"

type ImageGalleryProps = {
  product: HttpTypes.StoreProduct
  images: HttpTypes.StoreProductImage[]
  thumbnail?: string | null
}

const ImageGallery = ({ product, images, thumbnail }: ImageGalleryProps) => {
  const { options, colorHoverPreview } = useProductOptions()

  const effectiveOptions = useMemo(() => {
    const colorOption = product.options?.find((o) => isColorOptionTitle(o.title))
    const t = colorOption?.title
    if (typeof t !== "string" || colorHoverPreview == null || colorHoverPreview === "") {
      return options
    }
    return { ...options, [t]: colorHoverPreview }
  }, [options, colorHoverPreview, product.options])

  const galleryImages = useMemo(() => {
    const validImages = images
      .filter((image) => Boolean(image.url))
      .map((image) => ({
        id: image.id,
        url: image.url as string,
      }))

    const selectedColor = Object.entries(effectiveOptions).find(([title]) =>
      isColorOptionTitle(title)
    )?.[1]

    const selectedVariant = resolveVariantFromOptions(product, effectiveOptions)

    const rawFromMetadata = getGarmentImageUrlsFromMetadata(
      (selectedVariant as any)?.metadata as Record<string, unknown> | undefined
    )
    const mappedVariantImages = filterGarmentImageUrlsForVariantColor(
      rawFromMetadata,
      selectedColor
    )

    if (mappedVariantImages.length) {
      return mappedVariantImages.map((mappedUrl, index) => {
        const fromProduct = findProductImageByUrl(mappedUrl, validImages)
        if (fromProduct) {
          return fromProduct
        }
        return {
          id: `variant-metadata-${index}`,
          url: mappedUrl,
        }
      })
    }

    if (validImages.length <= 1) {
      return validImages
    }

    if (selectedColor) {
      const strict = validImages.filter((image) =>
        urlMatchesColorLabelStrict(image.url, selectedColor)
      )
      if (strict.length) {
        return strict
      }
    }

    if (selectedVariant) {
      const bySku = findProductImageByVariantSku(validImages, selectedVariant)
      if (bySku) {
        return [bySku]
      }
    }

    if (selectedColor) {
      const relaxedNeedles = buildColorNeedlesForRelaxedMatch(selectedColor)
      const relaxed = validImages.filter((image) =>
        urlMatchesColorNeedles(image.url, relaxedNeedles)
      )
      if (relaxed.length) {
        return relaxed
      }
    }

    return validImages
  }, [images, effectiveOptions, product, product.variants])

  const fallbackImages = useMemo(() => {
    if (galleryImages.length > 0) {
      return galleryImages
    }

    if (thumbnail) {
      return [{ id: "thumbnail-fallback", url: thumbnail }]
    }

    return []
  }, [galleryImages, thumbnail])

  /** AS Colour / importer: extras on product.metadata, appended after hero gallery (deduped). */
  const fallbackWithCatalogAngles = useMemo(() => {
    const meta = (product.metadata ?? {}) as Record<string, unknown>
    const extras: { id: string; url: string }[] = []
    for (const key of PRODUCT_VIEW_IMAGE_META_KEYS_ORDERED) {
      const raw = meta[key]
      if (typeof raw !== "string") {
        continue
      }
      const url = raw.trim()
      if (!url) {
        continue
      }
      extras.push({ id: `catalog-view-${key}`, url })
    }
    const seen = new Set(fallbackImages.map((i) => normalizeImageUrl(i.url)))
    const out = [...fallbackImages]
    for (const e of extras) {
      const n = normalizeImageUrl(e.url)
      if (!n || seen.has(n)) {
        continue
      }
      seen.add(n)
      out.push(e)
    }
    return out
  }, [fallbackImages, product.metadata])

  /** Remap known 404 garment URLs + drop duplicates when remap collapses variants (e.g. colour chart → hero). */
  const displayImages = useMemo(() => {
    const merged = fallbackWithCatalogAngles.map((img) => {
      const u = remapStaleExternalGarmentUrl(img.url) ?? img.url
      return { ...img, url: u }
    })
    const out: typeof merged = []
    for (const row of merged) {
      const key = normalizeImageUrl(row.url)
      if (
        out.length > 0 &&
        normalizeImageUrl(out[out.length - 1].url) === key
      ) {
        continue
      }
      out.push(row)
    }
    return out
  }, [fallbackWithCatalogAngles])

  const hasProductImages = displayImages.length > 0

  return (
    <div className="flex items-start relative">
      <div className="grid grid-cols-2 gap-3 small:gap-4 flex-1">
        {!hasProductImages && (
          <Container className="col-span-2 relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle p-6 flex items-center justify-center">
            <p className="text-sm text-ui-fg-subtle text-center">
              No garment image is available for this product yet.
            </p>
          </Container>
        )}

        {displayImages.map((image, index) => (
          <div
            key={`${image.id}-${index}-${normalizeImageUrl(image.url).slice(-48)}`}
            className={`w-full scroll-mt-28 ${displayImages.length === 1 && !colorHoverPreview ? "col-span-2" : ""}`}
          >
          <Container
            className="relative aspect-square w-full overflow-hidden bg-ui-bg-subtle"
            id={image.id}
          >
            <Image
              src={image.url}
              priority={index <= 2 ? true : false}
              className="absolute inset-0 rounded-rounded"
              alt={`Product image ${index + 1}`}
              fill
              sizes="(max-width: 576px) 50vw, (max-width: 992px) 25vw, 400px"
              style={{
                objectFit: "cover",
              }}
            />
          </Container>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
