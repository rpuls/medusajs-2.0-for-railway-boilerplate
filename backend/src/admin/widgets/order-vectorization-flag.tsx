import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useMemo } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"

type Line = {
  id: string
  product_title?: string | null
  variant_title?: string | null
  title?: string | null
  metadata?: Record<string, unknown> | null
}

function lineRequestsVectorization(line: Line): boolean {
  const meta = line?.metadata as Record<string, unknown> | null | undefined
  if (!meta) return false
  const cd = meta.customizerDesign as Record<string, unknown> | undefined
  return Boolean(cd?.requiresVectorization)
}

function lineLabel(line: Line): string {
  const product = line.product_title || line.title || "Custom design"
  return line.variant_title ? `${product} · ${line.variant_title}` : product
}

const OrderVectorizationFlagWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const flaggedLines = useMemo<Line[]>(() => {
    const items = (data?.items ?? []) as Line[]
    return items.filter(lineRequestsVectorization)
  }, [data?.items])

  if (!flaggedLines.length) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2" className="flex items-center">
            Vectorization requested
            <HelpTooltip
              text={{
                title: "Vectorization requested",
                body: "The customer's artwork failed the live DPI check in the customizer and they accepted the vectorization add-on service.",
                bullets: [
                  "Check the cart for an 'Artwork Vectorization Service' line — the fee should already be charged.",
                  "Complete the redraw or upscale before moving the order to In Production.",
                  "Once done, this flag is informational only — there is no automated clear.",
                ],
              }}
            />
          </Heading>
          <Text size="small" className="text-ui-fg-subtle mt-1">
            The customer accepted the upscaling/vectorization service when their artwork failed
            the live DPI check. Charge the agreed fee + redraw before sending to the press.
          </Text>
        </div>
        <Badge color="orange">Action needed</Badge>
      </div>
      <div className="px-6 py-4">
        <ul className="list-none p-0 m-0 flex flex-col gap-y-2">
          {flaggedLines.map((line) => (
            <li
              key={line.id}
              className="rounded-md bg-ui-bg-subtle px-3 py-2"
            >
              <Text size="small" weight="plus">
                {lineLabel(line)}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.side.after",
})

export default withWidgetBoundary(OrderVectorizationFlagWidget, "order-vectorization-flag")
