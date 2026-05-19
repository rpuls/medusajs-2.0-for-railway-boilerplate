import { Button, Heading, Input, Text, toast } from "@medusajs/ui"
import { useEffect, useState } from "react"

import type { POSCustomer } from "../types"

type Props = {
  customer: POSCustomer | null
  onSelect: (customer: POSCustomer | null) => void
}

export const CustomerLookup = ({ customer, onSelect }: Props) => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<POSCustomer[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (customer) return
    const t = setTimeout(() => {
      void search(query)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, customer])

  const search = async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    try {
      const params = new URLSearchParams({
        q: q.trim(),
        limit: "8",
        fields: "id,email,first_name,last_name,phone",
      })
      const res = await fetch(`/admin/customers?${params}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`Search failed (${res.status})`)
      const json = (await res.json()) as { customers: POSCustomer[] }
      setResults(json.customers ?? [])
    } catch (err: any) {
      toast.error(err?.message ?? "Customer search failed")
    }
  }

  const createGuest = async () => {
    if (!newEmail.trim()) {
      toast.error("Email is required")
      return
    }
    setBusy(true)
    try {
      const res = await fetch("/admin/customers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          first_name: newFirstName.trim() || null,
          last_name: newLastName.trim() || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message ?? `Create failed (${res.status})`)
      }
      const json = (await res.json()) as { customer: POSCustomer }
      onSelect(json.customer)
      setShowCreate(false)
      setNewEmail("")
      setNewFirstName("")
      setNewLastName("")
      setQuery("")
    } catch (err: any) {
      toast.error(err?.message ?? "Create failed")
    } finally {
      setBusy(false)
    }
  }

  if (customer) {
    return (
      <div className="border border-ui-border-base rounded-lg p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Text size="small" className="font-medium truncate">
              {customer.first_name || customer.last_name
                ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
                : "Customer"}
            </Text>
            <Text size="xsmall" className="text-ui-fg-muted truncate">
              {customer.email ?? "(no email)"}
            </Text>
          </div>
          <Button
            variant="transparent"
            size="small"
            onClick={() => onSelect(null)}
          >
            Change
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Input
        placeholder="Search customer by email or name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.length > 0 && (
        <ul className="mt-2 border border-ui-border-base rounded-md max-h-48 overflow-y-auto divide-y divide-ui-border-base">
          {results.map((c) => (
            <li key={c.id}>
              <button
                className="w-full text-left px-3 py-2 hover:bg-ui-bg-subtle"
                onClick={() => onSelect(c)}
              >
                <Text size="small" className="font-medium">
                  {c.first_name || c.last_name
                    ? `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim()
                    : c.email}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {c.email}
                </Text>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!showCreate && (
        <Button
          variant="secondary"
          size="small"
          className="mt-2"
          onClick={() => setShowCreate(true)}
        >
          + New customer
        </Button>
      )}

      {showCreate && (
        <div className="mt-3 space-y-2 p-3 border border-ui-border-base rounded-md">
          <Heading level="h3" className="text-sm">
            New customer
          </Heading>
          <Input
            placeholder="email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              placeholder="First name"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
            />
            <Input
              placeholder="Last name"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={createGuest}
              isLoading={busy}
              disabled={busy}
            >
              Create
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
