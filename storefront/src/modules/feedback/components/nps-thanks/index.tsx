"use client"

import { useEffect, useState, useTransition } from "react"

import { recordNpsResponse } from "@lib/data/nps"

type Props = {
  order: string
  score: number
  sig: string
}

const HEADLINE: Record<number, string> = {
  1: "We're sorry — that's not the SC Prints experience we want.",
  2: "Sorry that wasn't great. We'd really like to know what went wrong.",
  3: "Thanks — there's clearly room for us to do better.",
  4: "Cheers — glad it went well. Anything we could have done better?",
  5: "Brilliant — thanks for the high score!",
}

const NpsThanks = ({ order, score, sig }: Props) => {
  const [recorded, setRecorded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [commentSaved, setCommentSaved] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const res = await recordNpsResponse({ order, score, sig })
      if (res.ok) setRecorded(true)
      else setError(res.error)
    })
  }, [order, score, sig])

  const submitComment = () => {
    if (!comment.trim()) return
    startTransition(async () => {
      const res = await recordNpsResponse({ order, score, sig, comment })
      if (res.ok) setCommentSaved(true)
      else setError(res.error)
    })
  }

  return (
    <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
        You scored us {score}/5
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-primary)]">
        {HEADLINE[score] ?? "Thanks for your feedback"}
      </h1>
      {error ? (
        <p className="mt-3 text-sm text-rose-700">{error}</p>
      ) : recorded ? (
        <p className="mt-3 text-sm text-emerald-700">
          Your rating is in.
        </p>
      ) : (
        <p className="mt-3 text-sm text-ui-fg-subtle">Recording your rating…</p>
      )}

      <hr className="my-6 border-[rgba(26,26,46,0.08)]" />

      {commentSaved ? (
        <p className="text-sm text-emerald-700">
          Comment saved — thanks for the extra context.
        </p>
      ) : (
        <>
          <label
            htmlFor="nps-comment"
            className="block text-sm font-semibold text-[var(--brand-primary)]"
          >
            Anything you&apos;d like to add? (optional)
          </label>
          <textarea
            id="nps-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            className="mt-2 block w-full rounded-md border border-ui-border-base bg-white px-3 py-2 text-sm shadow-sm focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-secondary)]"
            placeholder="What stood out — good or bad?"
          />
          <button
            type="button"
            onClick={submitComment}
            disabled={!comment.trim()}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:bg-gray-300"
          >
            Send comment
          </button>
        </>
      )}
    </div>
  )
}

export default NpsThanks
