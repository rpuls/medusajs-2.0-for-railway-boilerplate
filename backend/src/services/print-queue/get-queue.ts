import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { buildPrintQueue, type PrintBucket, type PrintJobInput } from "./build"

const QUEUED_STAGES = new Set([
  "received",
  "art_review",
  "awaiting_approval",
  "approved",
  "blanks_arrived",
  "in_production",
])

/**
 * The metadata we look at to derive a job's decoration_method +
 * colours from line items. Falls back to `metadata.decoration_method`
 * and `metadata.ink_colours` on the order itself if no line item
 * carries useful detail.
 */
type CustomizerLike = {
  prints?: Array<{
    method?: string
    inks?: string[]
    colours?: string[]
    threads?: string[]
  }>
  primaryMethod?: string
}

const extractMethodsAndColours = (
  lineItems: Array<Record<string, any>>,
  orderMeta: Record<string, unknown>
): Array<{ method: string; colours: string[] }> => {
  const found: Array<{ method: string; colours: string[] }> = []

  for (const li of lineItems ?? []) {
    const m = (li?.metadata as Record<string, unknown> | undefined) ?? {}
    const cust =
      ((m.customizerDesign as CustomizerLike | undefined) ??
        (m.decorationDesign as CustomizerLike | undefined)) ?? null
    if (cust?.prints && cust.prints.length > 0) {
      for (const p of cust.prints) {
        if (!p?.method) continue
        found.push({
          method: String(p.method).toLowerCase(),
          colours: [...(p.inks ?? []), ...(p.colours ?? []), ...(p.threads ?? [])]
            .filter((c): c is string => typeof c === "string" && c.length > 0),
        })
      }
    } else if (cust?.primaryMethod) {
      found.push({
        method: String(cust.primaryMethod).toLowerCase(),
        colours: [],
      })
    }
  }

  if (found.length === 0) {
    const orderMethod =
      typeof orderMeta.decoration_method === "string"
        ? orderMeta.decoration_method.toLowerCase()
        : null
    const orderColours = Array.isArray(orderMeta.ink_colours)
      ? (orderMeta.ink_colours as unknown[]).filter(
          (v): v is string => typeof v === "string"
        )
      : []
    if (orderMethod) {
      found.push({ method: orderMethod, colours: orderColours })
    }
  }

  return found
}

/**
 * Pulls all in-flight orders, splits each into `(method, colours)`
 * jobs, and feeds them into the pure `buildPrintQueue` aggregator.
 * Live read — small data volume (orders in flight). Cache at the
 * route layer if it ever matters.
 */
export async function getPrintQueue(
  container: MedusaContainer
): Promise<PrintBucket[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "status",
      "created_at",
      "metadata",
      "items.id",
      "items.quantity",
      "items.metadata",
    ],
    pagination: { take: 5000, skip: 0 },
  })

  const jobs: PrintJobInput[] = []
  for (const order of (orders as any[]) ?? []) {
    if (!order) continue
    if ((order.status ?? "").toLowerCase() === "canceled") continue
    const meta = (order.metadata as Record<string, unknown> | undefined) ?? {}
    const stage = typeof meta.production_stage === "string" ? meta.production_stage : null
    if (!stage || !QUEUED_STAGES.has(stage)) continue

    const items = Array.isArray(order.items) ? order.items : []
    const units = items.reduce(
      (s: number, it: any) => s + Number(it?.quantity ?? 0),
      0
    )
    const splits = extractMethodsAndColours(items, meta)
    if (splits.length === 0) {
      // Order has no recognisable decoration metadata; emit a single
      // "unknown" job so it still shows in the queue (just in its
      // own bucket where staff can spot the missing info).
      splits.push({ method: "unspecified", colours: [] })
    }

    const recipeIds = Array.isArray(meta.print_recipe_ids)
      ? (meta.print_recipe_ids as unknown[]).filter(
          (v): v is string => typeof v === "string"
        )
      : []

    for (const s of splits) {
      jobs.push({
        order_id: order.id as string,
        display_id: typeof order.display_id === "number" ? order.display_id : null,
        email: typeof order.email === "string" ? order.email : null,
        created_at: order.created_at as string,
        deadline_at:
          typeof meta.deadline_at === "string"
            ? (meta.deadline_at as string)
            : null,
        stage,
        is_stale: meta.is_stale === true,
        units,
        decoration_method: s.method,
        colours: s.colours,
        recipe_id: recipeIds[0] ?? null,
      })
    }
  }

  return buildPrintQueue(jobs)
}
