import { Tooltip } from "@medusajs/ui"
import { InformationCircle } from "@medusajs/icons"
import type { ReactNode } from "react"

import { PALETTE } from "../../lib/reports/palette"

/**
 * Inline `?` tooltip for any metric / KPI / column header. Removes the
 * "what does this mean?" tax for new staff and external viewers.
 *
 * Pass either a plain string, a ReactNode, or a structured shape:
 *   {
 *     title?: string                 // bold caption at the top
 *     body?: ReactNode               // paragraph(s) — string or JSX
 *     bullets?: string[]             // tight bulleted list
 *   }
 *
 * Examples:
 *   <HelpTooltip text="Days since the customer's last order." />
 *   <HelpTooltip text={{
 *     title: "Refund rate",
 *     body: "Share of orders with any refund (full or partial), trended weekly.",
 *     bullets: [
 *       "Look for spikes that align with a particular decoration method.",
 *       "Watch for sustained creep — that usually means a process drift.",
 *     ],
 *   }} />
 */

export type HelpContent =
  | string
  | ReactNode
  | {
      title?: string
      body?: ReactNode
      bullets?: string[]
    }

const isStructured = (
  value: HelpContent
): value is { title?: string; body?: ReactNode; bullets?: string[] } => {
  if (!value || typeof value !== "object") return false
  if (Array.isArray(value)) return false
  // ReactNodes (JSX elements) have a $$typeof — treat them as nodes, not content shape
  if ((value as { $$typeof?: symbol }).$$typeof) return false
  const candidate = value as Record<string, unknown>
  return (
    "title" in candidate || "body" in candidate || "bullets" in candidate
  )
}

const HelpBody = ({ content }: { content: HelpContent }) => {
  if (typeof content === "string") {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          lineHeight: 1.55,
          color: "rgb(228, 228, 231)",
        }}
      >
        {content}
      </p>
    )
  }

  if (isStructured(content)) {
    const { title, body, bullets } = content
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: 13.5,
          lineHeight: 1.55,
          color: "rgb(228, 228, 231)",
        }}
      >
        {title ? (
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              color: "rgb(212, 212, 216)",
            }}
          >
            {title}
          </div>
        ) : null}
        {body ? (
          typeof body === "string" ? (
            <p style={{ margin: 0 }}>{body}</p>
          ) : (
            <div>{body}</div>
          )
        ) : null}
        {bullets && bullets.length > 0 ? (
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {bullets.map((bullet, i) => (
              <li key={i} style={{ listStyle: "disc" }}>
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  // Bare ReactNode
  return <>{content}</>
}

export const HelpTooltip = ({
  text,
  size = 14,
}: {
  text: HelpContent
  size?: number
}) => (
  <Tooltip
    content={
      <div style={{ maxWidth: 420, padding: "2px 2px" }}>
        <HelpBody content={text} />
      </div>
    }
    side="top"
    maxWidth={440}
    // Reports page has a sticky filter bar at z-30; bump the tooltip above
    // it so help text isn't covered by the Date range / Region selects.
    className="!z-[60]"
  >
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
