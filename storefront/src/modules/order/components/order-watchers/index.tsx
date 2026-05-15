"use client"

import { useEffect, useState, useTransition } from "react"

import {
  addOrderWatcher,
  listOrderWatchers,
  removeOrderWatcher,
} from "@lib/data/order-watchers"

const OrderWatchers = ({ orderId }: { orderId: string }) => {
  const [watchers, setWatchers] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false
    listOrderWatchers(orderId).then((list) => {
      if (!cancelled) setWatchers(list)
    })
    return () => {
      cancelled = true
    }
  }, [orderId])

  const add = () => {
    const email = draft.trim()
    if (!email) return
    setError(null)
    startTransition(async () => {
      const res = await addOrderWatcher(orderId, email)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setWatchers(res.watchers)
      setDraft("")
    })
  }

  const remove = (email: string) => {
    startTransition(async () => {
      const res = await removeOrderWatcher(orderId, email)
      if (!res.ok) {
        setError(res.error)
        return
      }
      setWatchers(res.watchers)
    })
  }

  return (
    <div className="bg-white" data-testid="order-watchers">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base-semi">Email updates to others</h3>
        <span className="text-xs text-ui-fg-muted">{watchers.length} / 5</span>
      </div>
      <p className="text-sm text-ui-fg-subtle mb-3">
        Want a coach, parent, or colleague kept in the loop? Add up to 5 emails
        and they&apos;ll receive the same production updates you do.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="email@example.com"
          className="flex-1 rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
          disabled={pending || watchers.length >= 5}
          onKeyDown={(e) => {
            if (e.key === "Enter") add()
          }}
        />
        <button
          type="button"
          onClick={add}
          disabled={pending || !draft.trim() || watchers.length >= 5}
          className="inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          Add
        </button>
      </div>
      {error ? <p className="mt-2 text-xs text-rose-700">{error}</p> : null}
      {watchers.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {watchers.map((email) => (
            <li
              key={email}
              className="inline-flex items-center gap-2 rounded-full bg-ui-bg-subtle px-3 py-1 text-xs text-[var(--brand-primary)]"
            >
              {email}
              <button
                type="button"
                onClick={() => remove(email)}
                className="text-ui-fg-muted hover:text-rose-700"
                aria-label="Remove watcher"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default OrderWatchers
