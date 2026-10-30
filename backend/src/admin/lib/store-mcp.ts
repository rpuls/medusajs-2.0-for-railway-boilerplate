/**
 * Calls to the backend's /admin/store-mcp routes from the dashboard. Plain fetch with the
 * dashboard's session cookie: the admin is served by this same backend, so the requests are
 * same-origin and need no SDK.
 */

export type ConnectedApp = {
  id: string
  app_name: string
  app_host: string | null
  admin_email: string | null
  connected_at: string
  last_used_at: string | null
}

export type StoreMcpOverview = {
  enabled: boolean
  mcp_url: string
  docs_url: string
  can: string[]
  cannot: string[]
  pending_suggestions: number
  pending_setup_proposals: number
  connected_apps: ConnectedApp[]
}

export type SuggestionChanges = {
  title?: string
  subtitle?: string
  description?: string
  category_ids?: string[]
}

export type Suggestion = {
  id: string
  product_id: string
  product_title: string | null
  product_status: string | null
  app_name: string
  changes: SuggestionChanges
  note: string | null
  status: 'pending' | 'applied' | 'discarded'
  created_at: string
}

export type SetupProposal = {
  id: string
  app_name: string
  summary: string
  status: 'pending' | 'applying' | 'applied' | 'discarded' | 'failed'
  result: { ok: boolean; done: string[]; failed?: string; error?: string } | null
  created_at: string
  /** What Apply would do, planned against the store as it is now. Empty unless pending. */
  steps: string[]
  warnings: string[]
  /** Why it can no longer be applied, if the store has moved on since it was proposed */
  errors: string[]
}

const call = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`/admin/store-mcp${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Request failed with ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const storeMcp = {
  overview: () => call<StoreMcpOverview>(''),
  revoke: (grantId: string) => call<{ revoked: boolean }>(`/grants/${grantId}`, { method: 'DELETE' }),
  suggestions: (productId?: string) =>
    call<{ suggestions: Suggestion[] }>(`/suggestions${productId ? `?product_id=${encodeURIComponent(productId)}` : ''}`),
  resolve: (id: string, action: 'apply' | 'discard') =>
    call<{ suggestion: Suggestion }>(`/suggestions/${id}`, { method: 'POST', body: JSON.stringify({ action }) }),
  setupProposals: () => call<{ proposals: SetupProposal[] }>('/setup-proposals'),
  resolveSetup: (id: string, action: 'apply' | 'discard') =>
    call<{ proposal: SetupProposal }>(`/setup-proposals/${id}`, { method: 'POST', body: JSON.stringify({ action }) }),
}

/** Category names for ids, so a suggested category change is reviewed by name and not by count */
export const categoryNames = async (ids: string[]): Promise<Map<string, string>> => {
  if (!ids.length) return new Map()
  const query = new URLSearchParams({ fields: 'id,name', limit: String(ids.length) })
  ids.forEach((id) => query.append('id[]', id))
  const res = await fetch(`/admin/product-categories?${query}`, { credentials: 'include' })
  if (!res.ok) return new Map()
  const { product_categories } = (await res.json()) as { product_categories: Array<{ id: string; name: string }> }
  return new Map(product_categories.map((category) => [category.id, category.name]))
}

export const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'
