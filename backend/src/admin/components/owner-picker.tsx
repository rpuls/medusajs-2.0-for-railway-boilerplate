import { Select } from "@medusajs/ui"
import { useEffect, useMemo, useState } from "react"

type AdminUser = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
}

type Props = {
  value: string | null
  onChange: (userId: string | null) => void
  disabled?: boolean
  placeholder?: string
  includeUnassigned?: boolean
}

let _cache: AdminUser[] | null = null
let _cacheTs = 0
const TTL_MS = 30_000

const fetchUsers = async (): Promise<AdminUser[]> => {
  if (_cache && Date.now() - _cacheTs < TTL_MS) return _cache
  try {
    const res = await fetch("/admin/users?limit=200", {
      credentials: "include",
    })
    if (!res.ok) return _cache ?? []
    const json = (await res.json()) as { users?: AdminUser[] }
    _cache = json.users ?? []
    _cacheTs = Date.now()
    return _cache
  } catch {
    return _cache ?? []
  }
}

/**
 * Reusable dropdown of Medusa admin users. Fetches `/admin/users`
 * lazily and caches for 30s so multiple instances on the same page
 * don't pile up requests.
 */
export const OwnerPicker = ({
  value,
  onChange,
  disabled,
  placeholder = "Pick a teammate…",
  includeUnassigned = true,
}: Props) => {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchUsers().then((list) => {
      if (cancelled) return
      setUsers(list)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const label = useMemo(
    () => labelFor(users.find((u) => u.id === value)),
    [users, value]
  )

  if (loading) return <span className="text-ui-fg-muted text-sm">Loading…</span>

  return (
    <Select
      value={value ?? "__unassigned__"}
      onValueChange={(v) => onChange(v === "__unassigned__" ? null : v)}
      disabled={disabled}
    >
      <Select.Trigger>
        <Select.Value placeholder={placeholder}>
          {value ? label : placeholder}
        </Select.Value>
      </Select.Trigger>
      <Select.Content>
        {includeUnassigned ? (
          <Select.Item value="__unassigned__">— Unassigned —</Select.Item>
        ) : null}
        {users.map((u) => (
          <Select.Item key={u.id} value={u.id}>
            {labelFor(u)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  )
}

const labelFor = (u: AdminUser | undefined): string => {
  if (!u) return "—"
  const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim()
  return name ? `${name} (${u.email})` : u.email
}
