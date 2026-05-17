import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { withWidgetBoundary } from "../components/widget-error-boundary"
import type { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import {
  Badge,
  Container,
  Heading,
  Table,
  Text,
} from "@medusajs/ui"
import { useCallback, useEffect, useMemo, useState } from "react"

import { HelpTooltip } from "../components/reports/help-tooltip"

import { sdk } from "../lib/sdk"

type Parcel = {
  tracking_number?: string | null
  tracking_url?: string | null
  label_id?: string | null
  shipment_id?: string | null
  carrier_id?: string | null
  carrier_code?: string | null
  service_code?: string | null
  label_url?: string | null
  weight_grams?: number | null
  voided_at?: string | null
  shipped_at?: string | null
}

type FulfillmentLike = {
  id: string
  shipped_at?: string | null
  metadata?: Record<string, unknown> | null
  labels?: Array<{
    tracking_number?: string | null
    tracking_url?: string | null
  }> | null
  provider_id?: string | null
}

const formatCarrier = (parcel: Parcel): string => {
  if (parcel.carrier_code) {
    return parcel.carrier_code
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }
  if (parcel.carrier_id) {
    return parcel.carrier_id
  }
  return "Carrier"
}

const formatService = (parcel: Parcel): string => {
  if (!parcel.service_code) return ""
  return parcel.service_code
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const formatKg = (grams: number | null | undefined): string => {
  if (typeof grams !== "number" || !Number.isFinite(grams)) return "—"
  if (grams < 1000) return `${Math.round(grams)} g`
  return `${(grams / 1000).toFixed(2).replace(/\.00$/, "")} kg`
}

const formatTimestamp = (iso: string | null | undefined): string | null => {
  if (!iso) return null
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return null
  return new Date(ts).toLocaleString()
}

const parcelsForFulfillment = (f: FulfillmentLike): Parcel[] => {
  const md = (f.metadata || {}) as Record<string, unknown>
  const fromMd = Array.isArray((md as any).parcels)
    ? ((md as any).parcels as Parcel[])
    : []

  if (fromMd.length) {
    return fromMd
  }

  const labels = Array.isArray(f.labels) ? f.labels : []
  return labels
    .filter((l) => !!l?.tracking_number)
    .map(
      (l): Parcel => ({
        tracking_number: l.tracking_number ?? null,
        tracking_url: l.tracking_url ?? null,
      })
    )
}

const OrderShipStationParcelsWidget = ({
  data,
}: DetailWidgetProps<AdminOrder>) => {
  const orderId = data?.id
  const [fulfillments, setFulfillments] = useState<FulfillmentLike[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!orderId) return
    setLoading(true)
    setError(null)
    try {
      const response = await sdk.admin.order.retrieve(orderId, {
        fields:
          "id,fulfillments.id,fulfillments.shipped_at,fulfillments.provider_id,+fulfillments.metadata,+fulfillments.labels.tracking_number,+fulfillments.labels.tracking_url",
      })
      const fs = (response?.order as any)?.fulfillments ?? []
      setFulfillments(Array.isArray(fs) ? (fs as FulfillmentLike[]) : [])
    } catch (err) {
      setError((err as Error).message || "Failed to load fulfillments")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const totalParcels = useMemo(
    () => fulfillments.reduce((sum, f) => sum + parcelsForFulfillment(f).length, 0),
    [fulfillments]
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2" className="flex items-center">
          ShipStation parcels
          <HelpTooltip
            text={{
              title: "ShipStation parcels",
              body: "Parcel records synced from ShipStation for this order's fulfilments — tracking numbers, carrier, weight, and dimensions.",
              bullets: [
                "Parcels appear here after ShipStation processes the shipment.",
                "Use tracking numbers to follow up with the carrier if a customer reports a missing delivery.",
              ],
            }}
          />
        </Heading>
        {totalParcels > 0 ? (
          <Badge color="grey" size="2xsmall">
            {totalParcels} {totalParcels === 1 ? "parcel" : "parcels"}
          </Badge>
        ) : null}
      </div>

      {error ? (
        <div className="px-6 py-3">
          <Text size="small" className="text-ui-fg-error">
            {error}
          </Text>
        </div>
      ) : null}

      <div className="px-6 py-4 flex flex-col gap-y-6">
        {loading && fulfillments.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            Loading fulfillments…
          </Text>
        ) : fulfillments.length === 0 ? (
          <Text size="small" className="text-ui-fg-subtle">
            No fulfillments yet.
          </Text>
        ) : (
          fulfillments.map((f) => {
            const parcels = parcelsForFulfillment(f)
            const shippedAt = formatTimestamp(f.shipped_at)
            const isShipStation =
              typeof f.provider_id === "string" &&
              f.provider_id.startsWith("shipstation_")
            return (
              <div key={f.id} className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Text size="small" weight="plus">
                      Fulfillment {f.id}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {shippedAt
                        ? `Shipped ${shippedAt}`
                        : "Not yet shipped"}
                      {isShipStation ? " · ShipStation" : ""}
                    </Text>
                  </div>
                </div>

                {parcels.length === 0 ? (
                  <Text size="small" className="text-ui-fg-subtle">
                    No parcels yet — the dispatch webhook will populate this
                    once labels are bought.
                  </Text>
                ) : (
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>#</Table.HeaderCell>
                        <Table.HeaderCell>Carrier · service</Table.HeaderCell>
                        <Table.HeaderCell>Tracking</Table.HeaderCell>
                        <Table.HeaderCell>Weight</Table.HeaderCell>
                        <Table.HeaderCell>Label</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {parcels.map((parcel, idx) => {
                        const carrier = formatCarrier(parcel)
                        const service = formatService(parcel)
                        return (
                          <Table.Row
                            key={parcel.label_id || parcel.tracking_number || idx}
                          >
                            <Table.Cell>{idx + 1}</Table.Cell>
                            <Table.Cell>
                              <div className="flex flex-col">
                                <Text size="small">{carrier}</Text>
                                {service ? (
                                  <Text
                                    size="xsmall"
                                    className="text-ui-fg-subtle"
                                  >
                                    {service}
                                  </Text>
                                ) : null}
                              </div>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex flex-col">
                                <Text size="small" className="font-mono">
                                  {parcel.tracking_number || "—"}
                                </Text>
                                {parcel.tracking_url ? (
                                  <a
                                    href={parcel.tracking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-ui-fg-interactive text-xs hover:underline"
                                  >
                                    Track
                                  </a>
                                ) : null}
                              </div>
                            </Table.Cell>
                            <Table.Cell>
                              <Text size="small">
                                {formatKg(parcel.weight_grams ?? null)}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              {parcel.label_url ? (
                                <a
                                  href={parcel.label_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-ui-fg-interactive text-xs hover:underline"
                                >
                                  Open PDF
                                </a>
                              ) : (
                                <Text
                                  size="xsmall"
                                  className="text-ui-fg-subtle"
                                >
                                  —
                                </Text>
                              )}
                            </Table.Cell>
                            <Table.Cell>
                              {parcel.voided_at ? (
                                <Badge color="red" size="2xsmall">
                                  Voided
                                </Badge>
                              ) : parcel.shipped_at ? (
                                <Badge color="green" size="2xsmall">
                                  Shipped
                                </Badge>
                              ) : (
                                <Badge color="grey" size="2xsmall">
                                  Pending
                                </Badge>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table>
                )}
              </div>
            )
          })
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default withWidgetBoundary(OrderShipStationParcelsWidget, "order-shipstation-parcels")
