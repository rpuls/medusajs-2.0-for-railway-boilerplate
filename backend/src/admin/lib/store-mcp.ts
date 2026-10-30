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
}

export const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'
