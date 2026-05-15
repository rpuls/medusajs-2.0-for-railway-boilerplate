"use client"

import { Container, clx } from "@medusajs/ui"
import Image from "next/image"

import { LineItemMockupArtifact } from "@modules/customizer/lib/metadata"
import Thumbnail from "@modules/products/components/thumbnail"

type LineItemMockupPreviewProps = {
  mockups?: LineItemMockupArtifact[]
  mockupUrls: string[]
  productThumbnail?: string | null
  productImages?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  className?: string
}

// Sleeve and tag mockups are rendered server-side against a generic white
// line-drawing placeholder (no variant-colour data is sent to the renderer),
// so the resulting mockup looks like a white garment regardless of the
// customer's chosen colour. When that's the *only* thing the cart preview
// has to show, fall back to the variant-colour-aware product thumbnail so
// the customer sees the actual garment colour they're buying.
const NON_COLOR_AWARE_SIDES = new Set(["left_sleeve", "right_sleeve", "printed_tag"])

/**
 * Cart / order line preview: one composite mockup per decorated side.
 * Multiple URLs show as a vertical strip so placement on each side stays visible.
 */
const LineItemMockupPreview = ({
  mockups = [],
  mockupUrls,
  productThumbnail,
  productImages,
  size = "square",
  className,
}: LineItemMockupPreviewProps) => {
  const normalizedMockups =
    mockups.length > 0
      ? mockups
      : mockupUrls.map((url, index) => ({
          side: `custom_${index}`,
          label: `Design ${index + 1}`,
          mockupUrl: url,
        }))

  const allMockupsAreNonColorAware =
    normalizedMockups.length > 0 &&
    normalizedMockups.every((m) => NON_COLOR_AWARE_SIDES.has(m.side))

  if (normalizedMockups.length <= 1) {
    const primaryMockup = normalizedMockups[0]?.mockupUrl
    const thumbnailSrc =
      allMockupsAreNonColorAware && productThumbnail
        ? productThumbnail
        : primaryMockup ?? productThumbnail
    return (
      <Thumbnail
        thumbnail={thumbnailSrc}
        images={productImages}
        size={size}
        className={className}
      />
    )
  }

  const visibleMockups = normalizedMockups.slice(0, 4)

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-1 bg-ui-bg-subtle shadow-elevation-card-rest rounded-large flex flex-col aspect-[1/1]",
        className
      )}
    >
      <div className="flex flex-col gap-0.5 flex-1 min-h-0 w-full">
        {visibleMockups.map((mockup) => (
          <div
            key={`${mockup.side}-${mockup.mockupUrl}`}
            className="relative flex-1 min-h-0 overflow-hidden rounded-md group"
            title={mockup.label}
          >
            <Image
              src={mockup.mockupUrl}
              alt={`${mockup.label} mockup`}
              className="absolute inset-0 object-cover object-center"
              draggable={false}
              quality={50}
              sizes="96px"
              fill
            />
            <span className="absolute top-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] leading-none text-white">
              {mockup.label}
            </span>
          </div>
        ))}
      </div>
    </Container>
  )
}

export default LineItemMockupPreview
