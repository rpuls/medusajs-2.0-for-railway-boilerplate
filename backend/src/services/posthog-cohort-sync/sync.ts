import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import {
  POSTHOG_COHORT_SYNC_LIST,
  POSTHOG_HOST,
  POSTHOG_PERSONAL_API_KEY,
  POSTHOG_PROJECT_ID,
} from "../../lib/constants"

import { ADMIN_WORKSPACE_MODULE } from "../../modules/admin-workspace"
import { parseCohortConfig, type CohortConfig } from "./parse-config"

const DEFAULT_HOST = "https://us.i.posthog.com"

const hostBase = (): string => {
  const raw = (POSTHOG_HOST ?? "").trim()
  return (raw.length > 0 ? raw : DEFAULT_HOST).replace(/\/$/, "")
}

type CohortMember = {
  email?: string | null
  distinct_id?: string | null
  properties?: Record<string, unknown> | null
}

const isConfigured = (): boolean =>
  Boolean(POSTHOG_PERSONAL_API_KEY && POSTHOG_PROJECT_ID && POSTHOG_COHORT_SYNC_LIST)

async function listCohortPersons(cohortId: number): Promise<CohortMember[]> {
  const members: CohortMember[] = []
  let url:
    | string
    | null = `${hostBase()}/api/projects/${POSTHOG_PROJECT_ID}/cohorts/${cohortId}/persons/?limit=500`

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(
        `PostHog cohort persons fetch failed (${res.status}): ${text.slice(0, 300)}`
      )
    }
    const json = (await res.json()) as {
      next?: string | null
      results?: CohortMember[]
    }
    for (const person of json.results ?? []) {
      members.push({
        email: typeof person?.properties?.email === "string"
          ? (person.properties.email as string)
          : typeof (person as any).email === "string"
            ? (person as any).email
            : null,
        distinct_id: typeof (person as any).distinct_ids?.[0] === "string"
          ? (person as any).distinct_ids[0]
          : typeof person?.distinct_id === "string"
            ? person.distinct_id
            : null,
      })
    }
    url = json.next ?? null
    // Hard cap to avoid runaway pagination on huge cohorts.
    if (members.length >= 5000) break
  }
  return members
}

export type SyncResult = {
  configured: boolean
  cohorts_processed: number
  customers_tagged: number
  customers_untagged: number
  failures: number
}

/**
 * Pulls every configured PostHog cohort's member list and reconciles
 * `customer_tag` rows for the corresponding tag label:
 *   - if a customer matches a cohort member (by email) and is missing
 *     the tag → create the tag
 *   - if a customer holds the tag but no longer matches the cohort →
 *     delete the tag (only if `created_by === "posthog-cohort-sync"`)
 *
 * Tag rows created by humans in the admin are preserved — only the
 * sync's own rows are pruned. This means an admin can manually tag
 * someone as "VIP" and the sync won't fight it.
 */
export async function syncPostHogCohorts(
  container: MedusaContainer
): Promise<SyncResult> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const summary: SyncResult = {
    configured: isConfigured(),
    cohorts_processed: 0,
    customers_tagged: 0,
    customers_untagged: 0,
    failures: 0,
  }
  if (!summary.configured) {
    logger.info(
      "posthog-cohort-sync: missing POSTHOG_PERSONAL_API_KEY / POSTHOG_PROJECT_ID / POSTHOG_COHORT_SYNC_LIST — skipping."
    )
    return summary
  }

  const cohorts = parseCohortConfig(POSTHOG_COHORT_SYNC_LIST)
  if (cohorts.length === 0) {
    logger.info("posthog-cohort-sync: empty config — skipping.")
    return summary
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const adminWorkspace = container.resolve(ADMIN_WORKSPACE_MODULE) as any

  for (const cohort of cohorts) {
    try {
      summary.cohorts_processed += 1
      const members = await listCohortPersons(cohort.cohort_id)
      const emails = Array.from(
        new Set(
          members
            .map((m) => (typeof m.email === "string" ? m.email.toLowerCase() : null))
            .filter((e): e is string => typeof e === "string" && e.length > 0)
        )
      )
      if (emails.length === 0) {
        await reconcileCohort(
          query,
          adminWorkspace,
          cohort,
          new Map<string, string>(),
          summary
        )
        continue
      }

      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "email"],
        filters: { email: emails },
        pagination: { take: emails.length, skip: 0 },
      })
      const customerByEmail = new Map<string, string>()
      for (const c of (customers as any[]) ?? []) {
        if (typeof c?.email === "string" && typeof c?.id === "string") {
          customerByEmail.set(c.email.toLowerCase(), c.id)
        }
      }

      await reconcileCohort(query, adminWorkspace, cohort, customerByEmail, summary)
    } catch (err: any) {
      summary.failures += 1
      logger.warn(
        `posthog-cohort-sync: cohort ${cohort.cohort_id} failed: ${err?.message ?? err}`
      )
    }
  }

  return summary
}

const SYNC_CREATED_BY = "posthog-cohort-sync"

async function reconcileCohort(
  query: any,
  adminWorkspace: any,
  cohort: CohortConfig,
  emailToCustomer: Map<string, string>,
  summary: SyncResult
) {
  const targetCustomerIds = new Set(emailToCustomer.values())

  const { data: existingTags } = await query.graph({
    entity: "customer_tag",
    fields: ["id", "customer_id", "label", "created_by"],
    filters: { label: cohort.tag_label },
    pagination: { take: 5000, skip: 0 },
  })

  const heldByCustomer = new Map<string, { id: string; created_by: string | null }>()
  for (const t of (existingTags as any[]) ?? []) {
    if (typeof t?.customer_id === "string") {
      heldByCustomer.set(t.customer_id, {
        id: t.id as string,
        created_by:
          typeof t.created_by === "string" ? (t.created_by as string) : null,
      })
    }
  }

  for (const customerId of targetCustomerIds) {
    if (heldByCustomer.has(customerId)) continue
    try {
      await adminWorkspace.createCustomerTags({
        customer_id: customerId,
        label: cohort.tag_label,
        color: cohort.color,
        created_by: SYNC_CREATED_BY,
      })
      summary.customers_tagged += 1
    } catch {
      summary.failures += 1
    }
  }

  for (const [customerId, existing] of heldByCustomer) {
    if (targetCustomerIds.has(customerId)) continue
    if (existing.created_by !== SYNC_CREATED_BY) continue
    try {
      await adminWorkspace.deleteCustomerTags([existing.id])
      summary.customers_untagged += 1
    } catch {
      summary.failures += 1
    }
  }
}
