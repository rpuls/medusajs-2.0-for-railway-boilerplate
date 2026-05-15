"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useTransitionRouter } from "next-view-transitions"

import type { GraphPayload } from "../../../types/graph"
import { ForceGraph } from "./force-graph"
import { filterPayload } from "../lib/merge"

type Props = {
  summary: GraphPayload
}

/**
 * Compact embedded preview for /brands — shows only brand super-nodes + the
 * catalog root. Clicking a brand deep-links into `/explore?focus=brand:<name>`,
 * where the full expansion happens.
 */
export function BrandsGraphPreview({ summary }: Props) {
  const params = useParams()
  const countryCode = Array.isArray(params?.countryCode)
    ? params.countryCode[0]
    : (params?.countryCode as string | undefined) ?? "au"
  const router = useTransitionRouter()

  const brandsOnly = useMemo(
    () =>
      filterPayload(summary, {
        brand: true,
        root: true,
        category: false,
        product: false,
        type: false,
        tag: false,
      }),
    [summary]
  )

  return (
    <div className="relative h-[28rem] w-full overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle/30">
      <ForceGraph
        payload={brandsOnly}
        onNodeClick={(node) => {
          if (node.kind !== "brand") return
          router.push(`/${countryCode}/explore?focus=${encodeURIComponent(node.id)}`)
        }}
        onNodeHover={() => {}}
        cooldownTicks={60}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-xsmall-regular text-ui-fg-subtle">
        <span>Click a brand to explore its catalog.</span>
      </div>
    </div>
  )
}
