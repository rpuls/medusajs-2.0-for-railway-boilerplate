/**
 * Shared pagination for `/test/animation-widgets`.
 * `ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT` must match the number of `<Section>` entries
 * in `animation-widgets-demo.tsx` before the merged add-to-cart / button lab sections.
 */
export const ANIMATION_LAB_SECTIONS_PER_PAGE = 10

export const ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT = 159

/** First 1-based `?page=` that includes at least one add-to-cart lab section. */
export function animationLabFirstButtonPage(): number {
  return Math.ceil(
    (ANIMATION_LAB_PRE_BUTTON_SECTION_COUNT + 1) / ANIMATION_LAB_SECTIONS_PER_PAGE
  )
}
