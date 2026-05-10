import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { createOrderShipmentWorkflow } from "@medusajs/medusa/core-flows"
import { createHmac, timingSafeEqual } from "crypto"

import {
  SHIPSTATION_API_KEY,
  SHIPSTATION_WEBHOOK_SECRET,
} from "../../../lib/constants"
import { getPostHog } from "../../../lib/posthog"
import { ShipStationClient } from "../../../modules/shipstation/client"
import type { Label, Shipment } from "../../../modules/shipstation/types"

type Parcel = {
  tracking_number: string
  tracking_url: string
  label_id: string
  label_url: string | null
  carrier_id: string | null
  carrier_code: string | null
  service_code: string | null
  weight_grams: number | null
  shipped_at: string | null
}

type ShipStationWebhookEvent =
  | "shipment_shipped"
  | "shipment_voided"
  | "tracking_updated"
  | "order_shipment_shipped"
  | string

type ShipStationWebhookBody = {
  resource_url?: string
  resource_type?: string
  event?: ShipStationWebhookEvent
  shipment_id?: string
  label_id?: string
  external_order_id?: string
  external_shipment_id?: string
  order_id?: string
  data?: Record<string, unknown>
}

const HMAC_HEADER_NAMES = [
  "x-shipstation-hmac-sha256",
  "x-shipstation-signature",
  "shipstation-hmac-sha256",
] as const

const carrierUrlBuilders: Record<string, (n: string) => string> = {
  auspost: (n) =>
    `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(n)}`,
  australia_post: (n) =>
    `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(n)}`,
  startrack: (n) =>
    `https://startrack.com.au/track/details/${encodeURIComponent(n)}`,
  star_track: (n) =>
    `https://startrack.com.au/track/details/${encodeURIComponent(n)}`,
  ups: (n) =>
    `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  fedex: (n) =>
    `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  dhl_express_australia: (n) =>
    `https://www.dhl.com/au-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
}

const buildTrackingUrl = (
  trackingNumber: string,
  carrierCode: string | null
): string => {
  const code = (carrierCode || "").toLowerCase().replace(/[^a-z0-9_]+/g, "_")
  if (code && carrierUrlBuilders[code]) {
    return carrierUrlBuilders[code](trackingNumber)
  }
  // Generic fallback — ShipStation deep link works regardless of carrier.
  return `https://app.shipstation.com/tracking?tracking_number=${encodeURIComponent(
    trackingNumber
  )}`
}

const verifyHmacSignature = (rawBody: Buffer | undefined, header: string): boolean => {
  if (!SHIPSTATION_WEBHOOK_SECRET || !rawBody?.length) {
    return false
  }
  const expected = createHmac("sha256", SHIPSTATION_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64")
  const provided = header.trim()
  // Tolerate hex-encoded signatures too — some ShipStation tooling emits hex.
  const expectedHex = createHmac("sha256", SHIPSTATION_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex")

  for (const candidate of [expected, expectedHex]) {
    if (candidate.length !== provided.length) continue
    try {
      if (
        timingSafeEqual(Buffer.from(candidate), Buffer.from(provided))
      ) {
        return true
      }
    } catch {
      // fall through
    }
  }
  return false
}

const labelToParcel = (label: Label): Parcel => {
  const trackingNumber = label.tracking_number || ""
  const carrierCode = (label as any).carrier_code || null
  return {
    tracking_number: trackingNumber,
    tracking_url: trackingNumber
      ? buildTrackingUrl(trackingNumber, carrierCode)
      : "",
    label_id: label.label_id,
    label_url: label.label_download?.href || label.label_download?.pdf || null,
    carrier_id: label.carrier_id || null,
    carrier_code: carrierCode,
    service_code: label.service_code || null,
    weight_grams:
      typeof (label as any)?.package_weight?.value === "number"
        ? (label as any).package_weight.unit === "gram"
          ? (label as any).package_weight.value
          : Math.round(((label as any).package_weight.value || 0) * 1000)
        : null,
    shipped_at: label.ship_date ? new Date(label.ship_date).toISOString() : null,
  }
}

/**
 * ShipStation v2 webhook receiver. Validates the HMAC signature, branches on
 * event type, and (for shipped events) fetches the latest labels for the
 * shipment, persists the parcels array on the Medusa fulfillment, and triggers
 * the core `createOrderShipmentWorkflow` so subscribers (dispatch email) see
 * `order.shipment_created` with the full tracking set.
 *
 * Idempotent: parcels are de-duped by `label_id` on every replay.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  if (!SHIPSTATION_WEBHOOK_SECRET) {
    logger.warn(
      "ShipStation webhook hit but SHIPSTATION_WEBHOOK_SECRET is unset — rejecting."
    )
    res.status(503).json({ error: "webhook secret not configured" })
    return
  }

  const rawBody: Buffer | undefined = (req as any).rawBody
  const signatureHeader = HMAC_HEADER_NAMES.map((h) => req.get(h))
    .find((v) => typeof v === "string" && v.length > 0)

  if (!signatureHeader || !verifyHmacSignature(rawBody, signatureHeader)) {
    logger.warn("ShipStation webhook signature verification failed.")
    res.status(401).json({ error: "invalid signature" })
    return
  }

  const body = (req.body || {}) as ShipStationWebhookBody
  const event: ShipStationWebhookEvent =
    body.event || (body.resource_type as string) || "unknown"

  logger.info(
    `ShipStation webhook received: event=${event} shipment_id=${body.shipment_id ?? "?"} resource_url=${body.resource_url ?? "?"}`
  )

  if (!SHIPSTATION_API_KEY) {
    logger.warn(
      "Cannot enrich ShipStation webhook because SHIPSTATION_API_KEY is unset."
    )
    res.status(202).json({ ok: true, enriched: false })
    return
  }

  const client = new ShipStationClient({ api_key: SHIPSTATION_API_KEY })

  // Some ShipStation events bundle the shipment id directly; others only
  // include `resource_url` pointing at /shipments/<id> or /labels/<id>.
  let shipment: Shipment | null = null
  let labels: Label[] = []

  if (body.shipment_id) {
    shipment = await client.getShipment(body.shipment_id).catch((e) => {
      logger.error(`ShipStation getShipment(${body.shipment_id}) failed: ${e}`)
      return null
    })
  } else if (body.resource_url?.includes("/shipments/")) {
    shipment = await client.getByUrl<Shipment>(body.resource_url).catch((e) => {
      logger.error(
        `ShipStation getByUrl(${body.resource_url}) failed: ${(e as Error).message}`
      )
      return null
    })
  }

  if (shipment?.shipment_id) {
    const labelsResp = await client
      .listLabelsForShipment(shipment.shipment_id)
      .catch((e) => {
        logger.error(
          `ShipStation listLabelsForShipment(${shipment!.shipment_id}) failed: ${(e as Error).message}`
        )
        return null
      })
    labels = labelsResp?.labels || []
  } else if (body.label_id) {
    const label = await client.getLabel(body.label_id).catch((e) => {
      logger.error(
        `ShipStation getLabel(${body.label_id}) failed: ${(e as Error).message}`
      )
      return null
    })
    if (label) {
      labels = [label]
      if (!shipment && label.shipment_id) {
        shipment = await client.getShipment(label.shipment_id).catch((e) => {
          logger.error(
            `ShipStation getShipment(${label.shipment_id}) failed: ${(e as Error).message}`
          )
          return null
        })
      }
    }
  } else if (body.resource_url?.includes("/labels/")) {
    const label = await client.getByUrl<Label>(body.resource_url).catch((e) => {
      logger.error(
        `ShipStation getByUrl(${body.resource_url}) failed: ${(e as Error).message}`
      )
      return null
    })
    if (label) {
      labels = [label]
      if (!shipment && label.shipment_id) {
        shipment = await client.getShipment(label.shipment_id).catch((e) => {
          logger.error(
            `ShipStation getShipment(${label.shipment_id}) failed: ${(e as Error).message}`
          )
          return null
        })
      }
    }
  }

  // Resolve Medusa order_id + fulfillment_id from shipment metadata or webhook body.
  const orderId =
    (shipment as any)?.external_order_id ||
    body.external_order_id ||
    body.order_id ||
    null
  const externalShipmentId =
    (shipment as any)?.external_shipment_id || body.external_shipment_id || null

  if (!orderId) {
    logger.warn(
      "ShipStation webhook could not resolve a Medusa order_id — make sure createFulfillment sets external_order_id."
    )
    res.status(202).json({ ok: true, enriched: false, reason: "no_order_id" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModule = req.scope.resolve(Modules.FULFILLMENT)

  // Find the matching Medusa fulfillment for this order. Prefer the one we
  // tagged with the same external_shipment_id; otherwise fall back to the
  // most recent ShipStation-provided fulfillment on the order.
  const { data: orders } = await query.graph({
    entity: "order",
    filters: { id: orderId },
    fields: [
      "id",
      "fulfillments.id",
      "fulfillments.provider_id",
      "fulfillments.metadata",
      "fulfillments.data",
      "fulfillments.created_at",
      "fulfillments.items.id",
      "fulfillments.items.line_item_id",
      "fulfillments.items.quantity",
    ],
  })
  const order = orders?.[0]
  if (!order) {
    logger.warn(`ShipStation webhook: order ${orderId} not found.`)
    res.status(404).json({ error: "order not found" })
    return
  }

  const candidateFulfillments = (order.fulfillments || []).filter(
    (f: any) =>
      typeof f.provider_id === "string" && f.provider_id.startsWith("shipstation_")
  )
  const fulfillment =
    (externalShipmentId &&
      candidateFulfillments.find((f: any) => f.id === externalShipmentId)) ||
    candidateFulfillments
      .slice()
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]

  if (!fulfillment) {
    logger.warn(
      `ShipStation webhook: no ShipStation fulfillment on order ${orderId}.`
    )
    res.status(202).json({ ok: true, enriched: false, reason: "no_fulfillment" })
    return
  }

  const existingMetadata = (fulfillment.metadata as Record<string, unknown>) || {}
  const existingParcels: Parcel[] = Array.isArray(
    (existingMetadata as any).parcels
  )
    ? ((existingMetadata as any).parcels as Parcel[])
    : []

  const newParcels = labels
    .filter((l) => l && (l.tracking_number || l.label_id))
    .map(labelToParcel)

  // De-dupe by label_id; preserve ordering (existing first, then new).
  const seen = new Set(existingParcels.map((p) => p.label_id).filter(Boolean))
  const mergedParcels: Parcel[] = [...existingParcels]
  for (const parcel of newParcels) {
    if (parcel.label_id && seen.has(parcel.label_id)) continue
    seen.add(parcel.label_id)
    mergedParcels.push(parcel)
  }

  const handledShippedEvent =
    event === "shipment_shipped" ||
    event === "order_shipment_shipped" ||
    event === "label_purchased"

  const handledVoidedEvent =
    event === "shipment_voided" || event === "label_voided"

  if (event === "tracking_updated") {
    // Tracking-only updates don't change the parcel list; just persist.
    await fulfillmentModule.updateFulfillment(fulfillment.id, {
      metadata: {
        ...existingMetadata,
        last_tracking_event: {
          event,
          received_at: new Date().toISOString(),
          payload: body.data ?? null,
        },
      },
    })
    res.status(200).json({ ok: true, event, parcels: mergedParcels.length })
    return
  }

  if (handledVoidedEvent) {
    await fulfillmentModule.updateFulfillment(fulfillment.id, {
      metadata: {
        ...existingMetadata,
        voided_at: new Date().toISOString(),
        void_event: body,
      },
    })
    res.status(200).json({ ok: true, event })
    return
  }

  // Persist the merged parcel list + native tracking_links shape on the fulfillment.
  await fulfillmentModule.updateFulfillment(fulfillment.id, {
    metadata: {
      ...existingMetadata,
      parcels: mergedParcels,
      tracking_links: mergedParcels.map((p) => ({
        tracking_number: p.tracking_number,
        url: p.tracking_url,
      })),
      last_shipstation_event: {
        event,
        received_at: new Date().toISOString(),
      },
    },
  })

  if (handledShippedEvent && newParcels.length) {
    // Emit `order.shipment_created` so the dispatch-email subscriber fires.
    // Parcels are already persisted above, so a 5xx response here is safe:
    // ShipStation will retry, idempotency dedupes the parcels, and the workflow re-fires.
    try {
      await createOrderShipmentWorkflow(req.scope).run({
        input: {
          order_id: orderId,
          fulfillment_id: fulfillment.id,
          items: (fulfillment.items || []).map((i: any) => ({
            id: i.line_item_id,
            quantity: i.quantity,
          })),
          labels: newParcels.map((p) => ({
            tracking_number: p.tracking_number,
            tracking_url: p.tracking_url,
            label_url: p.label_url || "",
          })),
        },
      })
    } catch (err) {
      const message = (err as Error).message
      logger.error(
        `createOrderShipmentWorkflow failed for order ${orderId}: ${message}`
      )
      // Stamp the failure on the fulfillment so admins can see it without grepping logs.
      await fulfillmentModule
        .updateFulfillment(fulfillment.id, {
          metadata: {
            ...existingMetadata,
            parcels: mergedParcels,
            tracking_links: mergedParcels.map((p) => ({
              tracking_number: p.tracking_number,
              url: p.tracking_url,
            })),
            last_shipstation_event: {
              event,
              received_at: new Date().toISOString(),
            },
            last_shipment_workflow_error: {
              message,
              failed_at: new Date().toISOString(),
            },
          },
        })
        .catch((e) =>
          logger.error(
            `Failed to stamp workflow error on fulfillment ${fulfillment.id}: ${(e as Error).message}`
          )
        )
      // Return 5xx so ShipStation retries the webhook (parcels are idempotent).
      res.status(500).json({
        ok: false,
        event,
        error: "shipment_workflow_failed",
        message,
      })
      return
    }
  }

  if (handledShippedEvent && newParcels.length) {
    getPostHog()?.capture({
      distinctId: `order_${orderId}`,
      event: "shipstation shipment shipped",
      properties: {
        order_id: orderId,
        fulfillment_id: fulfillment.id,
        parcel_count: newParcels.length,
        carrier_code: newParcels[0]?.carrier_code ?? null,
        service_code: newParcels[0]?.service_code ?? null,
      },
    })
  }

  res.status(200).json({
    ok: true,
    event,
    parcels: mergedParcels.length,
    new_parcels: newParcels.length,
  })
}
