import { Tooltip } from "@medusajs/ui"
import { InformationCircle } from "@medusajs/icons"
import type { ReactNode } from "react"

import { PALETTE } from "../../lib/reports/palette"

/**
 * Inline `?` tooltip for any metric / KPI / column header. Removes the
 * "what does this mean?" tax for new staff and external viewers.
 *
 * Usage:
 *   <Text>Recency <HelpTooltip text="Days since the customer's last order. Lower = more recent." /></Text>
 */
export const HelpTooltip = ({
  text,
  size = 12,
}: {
  text: string | ReactNode
  size?: number
}) => (
  <Tooltip content={text} side="top" maxWidth={260}>
    <span
      style={{
        display: "inline-flex",
        verticalAlign: "middle",
        marginLeft: 4,
        color: PALETTE.stone400,
        cursor: "help",
        width: size,
        height: size,
      }}
      aria-label="More info"
    >
      <InformationCircle width={size} height={size} />
    </span>
  </Tooltip>
)
