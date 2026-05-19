/**
 * Shared breakpoint constants — keep in sync with tailwind.config.js `screens`.
 *
 * Naming reminder: `small: 1024px` is iPad-landscape / small-desktop, NOT phone.
 * Use `tablet:` (768px) for iPad-portrait work and `phone:` (480px) for phone-landscape.
 */
export const BREAKPOINTS = {
  "2xsmall": 320,
  phone: 480,
  xsmall: 512,
  tablet: 768,
  small: 1024,
  medium: 1280,
  large: 1440,
  xlarge: 1680,
  "2xlarge": 1920,
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS

export function minWidthQuery(key: BreakpointKey): string {
  return `(min-width: ${BREAKPOINTS[key]}px)`
}

export function maxWidthQuery(key: BreakpointKey): string {
  return `(max-width: ${BREAKPOINTS[key] - 1}px)`
}
