"use client"

import { useCallback, useEffect, useState } from "react"

type StreamKind =
  | "cart_reminder"
  | "reorder_reminder"
  | "winback"
  | "nps_request"
  | "monthly_digest"

type Streams = Record<StreamKind, boolean>

const STREAM_META: Array<{
  key: StreamKind
  label: string
  blurb: string
}> = [
  {
    key: "cart_reminder",
    label: "Cart reminders",
    blurb: "We'll ping you if you leave items in your cart so you can pick up where you left off.",
  },
  {
    key: "reorder_reminder",
    label: "Reorder reminders",
    blurb: "A nudge around the time you usually reorder, with one-click resume from your last order.",
  },
  {
    key: "winback",
    label: "We-miss-you emails",
    blurb: "Occasional check-ins if you haven't ordered for a while.",
  },
  {
    key: "nps_request",
    label: "Feedback requests",
    blurb: "A quick 1-5 rating ask after each delivery so we can keep improving.",
  },
  {
    key: "monthly_digest",
    label: "Monthly digest",
    blurb: "Roundup of what's been happening at SC PRINTS, sent ~once a month.",
  },
]

const DEFAULT_STREAMS: Streams = {
  cart_reminder: true,
  reorder_reminder: true,
  winback: true,
  nps_request: true,
  monthly_digest: true,
}

type Props = {
  email: string
  kind: string
  sig: string
  justUnsubscribed: boolean
}

const apiBase = (): string => {
  const explicit = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, "")
  return ""
}

const EmailPreferencesForm = ({
  email,
  kind,
  sig,
  justUnsubscribed,
}: Props) => {
  const [streams, setStreams] = useState<Streams>(DEFAULT_STREAMS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${apiBase()}/email/preferences?email=${encodeURIComponent(email)}&kind=${encodeURIComponent(kind)}&sig=${encodeURIComponent(sig)}`,
        { credentials: "include" }
      )
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Couldn't load your preferences (${res.status}): ${body}`)
      }
      const json = (await res.json()) as { streams?: Partial<Streams> }
      setStreams({ ...DEFAULT_STREAMS, ...(json.streams ?? {}) })
    } catch (e: any) {
      setError(e?.message ?? "Couldn't load your preferences.")
    } finally {
      setLoading(false)
    }
  }, [email, kind, sig])

  useEffect(() => {
    void load()
  }, [load])

  const toggle = (k: StreamKind) => {
    setStreams((s) => ({ ...s, [k]: !s[k] }))
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase()}/email/preferences`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, kind, sig, streams }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Couldn't save your preferences (${res.status}): ${body}`)
      }
      setSavedAt(new Date())
    } catch (e: any) {
      setError(e?.message ?? "Couldn't save your preferences.")
    } finally {
      setSaving(false)
    }
  }

  const allOff = (Object.values(streams) as boolean[]).every((v) => v === false)
  const allOn = (Object.values(streams) as boolean[]).every((v) => v === true)

  return (
    <div className="flex flex-col gap-y-5">
      {justUnsubscribed ? (
        <div className="rounded-lg border border-ui-border-base bg-emerald-50 text-emerald-900 p-4 text-sm">
          <p className="font-medium">You&apos;re unsubscribed from SC PRINTS marketing email.</p>
          <p className="mt-1">
            If that was too much (or you only wanted to opt out of some
            streams), toggle individual streams back on below and click Save.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-900 p-4 text-sm">
          {error}
        </div>
      ) : null}

      <div className="rounded-lg border border-ui-border-base">
        <div className="border-b border-ui-border-base px-4 py-3 bg-ui-bg-subtle text-xs uppercase tracking-wider text-ui-fg-subtle">
          Streams · {email}
        </div>
        <ul className="divide-y divide-ui-border-base">
          {STREAM_META.map((m) => (
            <li key={m.key} className="flex items-start gap-x-3 px-4 py-3">
              <input
                id={`stream-${m.key}`}
                type="checkbox"
                checked={streams[m.key]}
                disabled={loading || saving}
                onChange={() => toggle(m.key)}
                className="mt-1 h-4 w-4"
              />
              <label htmlFor={`stream-${m.key}`} className="flex-1 cursor-pointer">
                <span className="block font-medium">{m.label}</span>
                <span className="block text-xs text-ui-fg-muted mt-0.5">{m.blurb}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-x-2">
          <button
            type="button"
            className="text-xs text-ui-fg-interactive underline"
            onClick={() => setStreams({ ...DEFAULT_STREAMS })}
            disabled={loading || saving || allOn}
          >
            Subscribe to everything
          </button>
          <button
            type="button"
            className="text-xs text-ui-fg-interactive underline"
            onClick={() =>
              setStreams({
                cart_reminder: false,
                reorder_reminder: false,
                winback: false,
                nps_request: false,
                monthly_digest: false,
              })
            }
            disabled={loading || saving || allOff}
          >
            Unsubscribe from everything
          </button>
        </div>
        <div className="flex items-center gap-x-3">
          {savedAt ? (
            <span className="text-xs text-ui-fg-muted">
              Saved {savedAt.toLocaleTimeString()}
            </span>
          ) : null}
          <button
            type="button"
            onClick={save}
            disabled={loading || saving}
            className="rounded-md bg-[var(--brand-primary,#ff2e63)] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </div>

      <p className="text-xs text-ui-fg-muted">
        Transactional emails (order confirmation, shipping updates,
        artwork approval) always go through — those aren&apos;t marketing
        and we can&apos;t turn them off.
      </p>
    </div>
  )
}

export default EmailPreferencesForm
