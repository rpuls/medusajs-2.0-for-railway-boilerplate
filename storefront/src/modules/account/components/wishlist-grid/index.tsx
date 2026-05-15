"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { removeFromWishlist, type WishlistItem } from "@lib/data/wishlist"
import { phCapture } from "@lib/posthog"

type Props = {
  items: WishlistItem[]
}

const formatDate = (iso: string): string => {
  const ts = Date.parse(iso)
  if (!Number.isFinite(ts)) return ""
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

const WishlistGrid = ({ items }: Props) => {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-ui-border-base p-10 text-center">
        <h2 className="text-lg font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-sm text-ui-fg-subtle mb-6">
          Tap the bookmark icon on any product to save it here for later.
        </p>
        <LocalizedClientLink
          href="/categories"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--brand-primary)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90"
        >
          Browse the catalog
        </LocalizedClientLink>
      </div>
    )
  }

  const handleRemove = async (id: string) => {
    setError(null)
    setBusyId(id)
    const res = await removeFromWishlist(id)
    setBusyId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    phCapture("wishlist_item_removed", { wishlist_item_id: id })
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      <ul className="grid grid-cols-1 small:grid-cols-2 large:grid-cols-3 gap-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-ui-border-base bg-white p-4 flex flex-col gap-y-3"
          >
            <div className="flex items-start justify-between gap-x-3">
              <div className="flex flex-col">
                <LocalizedClientLink
                  href={`/products/${item.product_id}`}
                  className="text-sm font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  {item.product_id}
                </LocalizedClientLink>
                <span className="text-xs text-ui-fg-muted mt-0.5">
                  Saved {formatDate(item.created_at)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                disabled={busyId === item.id}
                className="text-xs text-rose-600 hover:underline disabled:text-rose-300"
              >
                Remove
              </button>
            </div>
            {item.note ? (
              <p className="text-xs text-ui-fg-subtle whitespace-pre-wrap">
                {item.note}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WishlistGrid
