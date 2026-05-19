"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { joinGroupOrder } from "@lib/data/group-order"

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]

const JoinForm = ({
  token,
  sizeOptions,
}: {
  token: string
  sizeOptions?: string[]
}) => {
  const router = useRouter()
  // When the group order has a real base product, drive the size
  // picker from its actual variants so participants can only pick
  // sizes that exist on the garment.
  const sizes =
    sizeOptions && sizeOptions.length > 0 ? sizeOptions : COMMON_SIZES
  const [name, setName] = useState("")
  const [size, setSize] = useState(() => sizes.includes("M") ? "M" : sizes[0])
  const [quantity, setQuantity] = useState("1")
  const [playerNumber, setPlayerNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [, startTransition] = useTransition()

  const submit = () => {
    if (!name.trim() || !size.trim()) {
      setError("Name and size are required.")
      return
    }
    setError(null)
    startTransition(async () => {
      const qty = Math.max(1, Number.parseInt(quantity, 10) || 1)
      const res = await joinGroupOrder(token, {
        name: name.trim(),
        size_label: size,
        quantity: qty,
        player_number: playerNumber.trim() || undefined,
        custom_notes: notes.trim() || undefined,
        submitter_email: email.trim() || undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setSuccess(true)
      setName("")
      setPlayerNumber("")
      setNotes("")
      router.refresh()
    })
  }

  if (success) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">
          You&apos;re in. Add another person if you need to — refresh the page
          to see them in the roster below.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-3 inline-flex items-center justify-center rounded-md border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
        >
          Add another
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div>
        <label htmlFor="name" className="text-sm font-semibold text-[var(--brand-primary)]">
          Name *
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full min-h-11 rounded-md border border-ui-border-base bg-white px-3 py-2.5 text-base shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)] tablet:text-sm"
          placeholder="Player or recipient name"
        />
      </div>
      <div className="grid grid-cols-1 small:grid-cols-3 gap-3">
        <div>
          <label htmlFor="size" className="text-sm font-semibold text-[var(--brand-primary)]">
            Size *
          </label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="mt-1 block w-full min-h-11 rounded-md border border-ui-border-base bg-white px-3 py-2.5 text-base shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)] tablet:text-sm"
          >
            {sizes.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="text-sm font-semibold text-[var(--brand-primary)]">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full min-h-11 rounded-md border border-ui-border-base bg-white px-3 py-2.5 text-base shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)] tablet:text-sm"
          />
        </div>
        <div>
          <label htmlFor="player_number" className="text-sm font-semibold text-[var(--brand-primary)]">
            Number (optional)
          </label>
          <input
            id="player_number"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            className="mt-1 block w-full min-h-11 rounded-md border border-ui-border-base bg-white px-3 py-2.5 text-base shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)] tablet:text-sm"
            placeholder="Player or jersey #"
          />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className="text-sm font-semibold text-[var(--brand-primary)]">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full min-h-11 rounded-md border border-ui-border-base bg-white px-3 py-2.5 text-base shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)] tablet:text-sm"
          placeholder="e.g. Tall fit preferred"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-[var(--brand-primary)]">
          Email (optional)
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full min-h-11 rounded-md border border-ui-border-base bg-white px-3 py-2.5 text-base shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)] tablet:text-sm"
          placeholder="So the coach can chase if needed"
        />
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-stretch tablet:justify-end">
        <button
          type="button"
          onClick={submit}
          className="inline-flex w-full min-h-12 items-center justify-center rounded-md bg-[var(--brand-primary)] px-5 py-3 text-base font-semibold text-white shadow-sm hover:opacity-95 tablet:w-auto tablet:py-2 tablet:text-sm"
        >
          Submit my size
        </button>
      </div>
    </div>
  )
}

export default JoinForm
