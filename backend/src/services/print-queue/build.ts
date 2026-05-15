/**
 * Pure print-queue optimizer. Groups today's queued orders into
 * production batches that minimise setup changes (screen swaps, thread
 * changes, ink swaps). The goal: when the operator opens the queue
 * page in the morning, the suggested run order is what their senior
 * shop foreman would suggest — but without the staff cost of having
 * to ask one.
 *
 * Algorithm:
 *   1. Each (order, decoration_method) pair becomes a virtual "job".
 *      An order using screen print + embroidery becomes two jobs.
 *   2. Jobs are bucketed by `decoration_method` then by a derived
 *      `colour_signature` (sorted ink colours joined as a string).
 *   3. Within each bucket, jobs are sorted by:
 *        - stale flag (true first — they're already late)
 *        - deadline ascending (sooner first)
 *        - created_at ascending (FIFO tiebreaker)
 *   4. Buckets are emitted in a deterministic order: most-orders-first
 *      so the operator does the biggest setup once and runs it for
 *      everything in the bucket.
 *
 * The function is pure — no DB, no container. The container-aware
 * wrapper (`get-queue.ts`) builds the inputs.
 */

export type PrintJobInput = {
  /** Order id this job belongs to. */
  order_id: string
  display_id: number | null
  email: string | null
  created_at: string
  /** Optional explicit deadline from order.metadata.deadline_at. */
  deadline_at: string | null
  /** Current production_stage. */
  stage: string | null
  /** Is the order flagged stale by the daily scan? */
  is_stale: boolean
  /** Total units in this job (single garment count). */
  units: number
  /** Decoration technique — `screen_print`, `dtf`, `embroidery`, etc.
   *  An order with multiple techniques contributes one job per
   *  technique. */
  decoration_method: string
  /** Sorted, deduplicated colour identifiers used. For screen print
   *  these are ink Pantone refs; for embroidery, thread colours; for
   *  DTF, CMYK is usually `["cmyk"]`. Empty array means "unknown". */
  colours: string[]
  /** Optional recipe id this job is keyed to. Surfaced in the UI so
   *  operators know which recipe to follow. */
  recipe_id: string | null
}

export type PrintBucket = {
  /** Stable composite key — `<method>:<sorted colours>` */
  key: string
  decoration_method: string
  colours: string[]
  jobs: PrintJobInput[]
  total_units: number
  /** True if any job in the bucket is stale — surface to top of page. */
  has_stale: boolean
}

const STALE_BOOST = 0
const ON_TIME_BOOST = 1

/**
 * Stable string for the colour-set so equal colour-sets share a
 * bucket regardless of input ordering / case.
 */
const colourSignature = (colours: string[]): string => {
  if (!colours || colours.length === 0) return "unspecified"
  return Array.from(
    new Set(colours.map((c) => String(c).trim().toLowerCase()).filter(Boolean))
  )
    .sort()
    .join("+")
}

const cmpDate = (a: string | null, b: string | null): number => {
  // Treat null as "no deadline" → sort to the end.
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  const aMs = Date.parse(a)
  const bMs = Date.parse(b)
  if (!Number.isFinite(aMs)) return 1
  if (!Number.isFinite(bMs)) return -1
  return aMs - bMs
}

const cmpStale = (a: PrintJobInput, b: PrintJobInput): number => {
  // Stale jobs sort first within their bucket.
  const aStale = a.is_stale ? STALE_BOOST : ON_TIME_BOOST
  const bStale = b.is_stale ? STALE_BOOST : ON_TIME_BOOST
  return aStale - bStale
}

const cmpJobs = (a: PrintJobInput, b: PrintJobInput): number => {
  const staleDelta = cmpStale(a, b)
  if (staleDelta !== 0) return staleDelta
  const deadlineDelta = cmpDate(a.deadline_at, b.deadline_at)
  if (deadlineDelta !== 0) return deadlineDelta
  const createdDelta = cmpDate(a.created_at, b.created_at)
  if (createdDelta !== 0) return createdDelta
  // Final tiebreaker: stable by order_id ascending.
  return a.order_id < b.order_id ? -1 : a.order_id > b.order_id ? 1 : 0
}

const cmpBuckets = (a: PrintBucket, b: PrintBucket): number => {
  // Buckets with any stale job float to the top.
  if (a.has_stale !== b.has_stale) return a.has_stale ? -1 : 1
  // Then most-units-first — bigger batches earn their setup.
  if (b.total_units !== a.total_units) return b.total_units - a.total_units
  // Stable: decoration_method then colour_signature alphabetically.
  if (a.decoration_method !== b.decoration_method) {
    return a.decoration_method < b.decoration_method ? -1 : 1
  }
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0
}

export function buildPrintQueue(
  jobs: PrintJobInput[] | null | undefined
): PrintBucket[] {
  if (!jobs || jobs.length === 0) return []

  // Defensive: drop jobs with no decoration_method.
  const valid = jobs.filter(
    (j) =>
      j &&
      typeof j.order_id === "string" &&
      typeof j.decoration_method === "string" &&
      j.decoration_method.length > 0
  )
  if (valid.length === 0) return []

  const bucketByKey = new Map<string, PrintBucket>()
  for (const job of valid) {
    const sig = colourSignature(job.colours)
    const key = `${job.decoration_method}:${sig}`
    let bucket = bucketByKey.get(key)
    if (!bucket) {
      bucket = {
        key,
        decoration_method: job.decoration_method,
        colours: sig === "unspecified" ? [] : sig.split("+"),
        jobs: [],
        total_units: 0,
        has_stale: false,
      }
      bucketByKey.set(key, bucket)
    }
    bucket.jobs.push(job)
    bucket.total_units += Math.max(0, Math.floor(Number(job.units) || 0))
    if (job.is_stale) bucket.has_stale = true
  }

  for (const b of bucketByKey.values()) {
    b.jobs.sort(cmpJobs)
  }
  return Array.from(bucketByKey.values()).sort(cmpBuckets)
}
