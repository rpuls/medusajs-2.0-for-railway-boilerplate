import { z } from "zod"

export const renderPlacementSchema = z.object({
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(1),
  height: z.number().min(1),
})

export const renderRequestSchema = z.object({
  side: z.enum(["front", "back", "left_sleeve", "right_sleeve", "printed_tag"]),
  artworkSvg: z.string().min(20),
  /** Allow null; coerce empty string so storefront never fails Zod on blank mockup URL. */
  garmentImageUrl: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    z.union([z.string().url(), z.null()])
  ),
  placement: renderPlacementSchema,
  /**
   * Fabric canvas dimensions (must match storefront editor). Used to crop garment photographs
   * the same way as CSS `object-cover`, and to extract the print-area after full-canvas render.
   */
  canvas: z
    .object({
      width: z.number().min(120).max(8000),
      height: z.number().min(120).max(8000),
    })
    .optional(),
  /**
   * Optional hex colour (`#RRGGBB`) sampled from the variant photo on the
   * storefront. When provided for a sleeve side, the renderer recolours the
   * generic white sleeve placeholder so the final mockup picks up the
   * garment colour instead of staying white-on-black. Ignored for
   * front/back/printed_tag, which already use real product photography.
   */
  tintColor: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() ? v.trim() : null),
      z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/), z.null()])
    )
    .optional(),
})

export type RenderRequestPayload = z.infer<typeof renderRequestSchema>
