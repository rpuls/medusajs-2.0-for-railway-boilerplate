import { Text } from "@medusajs/ui"
import type { ReactNode } from "react"

import { PALETTE } from "../../lib/reports/palette"

/**
 * Friendly empty-state for any report card. Instead of "No data", give
 * the operator context: why is it empty, when will it populate, what
 * to read next.
 */
export const EmptyState = ({
  title,
  body,
  cta,
  icon,
}: {
  title: string
  body?: string | ReactNode
  cta?: ReactNode
  icon?: ReactNode
}) => (
  <div
    className="flex flex-col items-center justify-center text-center gap-y-2 py-8 px-4 rounded-md"
    style={{ background: PALETTE.stone50 }}
  >
    {icon ? (
      <div
        className="opacity-60"
        style={{ color: PALETTE.stone400 }}
        aria-hidden="true"
      >
        {icon}
      </div>
    ) : null}
    <Text size="small" className="font-medium">
      {title}
    </Text>
    {body ? (
      <Text
        size="xsmall"
        className="text-ui-fg-subtle max-w-md"
      >
        {body}
      </Text>
    ) : null}
    {cta ? <div className="mt-1">{cta}</div> : null}
  </div>
)
