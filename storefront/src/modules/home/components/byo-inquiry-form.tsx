"use client"

import { useId, useRef, useState } from "react"

const PRINTING_TYPES = [
  { value: "", label: "Select printing type" },
  { value: "Screen print", label: "Screen print" },
  { value: "DTG (direct to garment)", label: "DTG (direct to garment)" },
  { value: "Embroidery", label: "Embroidery" },
  { value: "Transfers / DTF", label: "Transfers / DTF" },
  { value: "UV printing", label: "UV printing" },
  { value: "Unsure", label: "Unsure" },
  { value: "Other", label: "Other" },
] as const

const GARMENT_TYPES = [
  { id: "t-shirts", label: "T-shirts" },
  { id: "singlets", label: "Singlets" },
  { id: "hoodies", label: "Hoodies" },
  { id: "polos", label: "Polos" },
  { id: "headwear", label: "Headwear" },
  { id: "tote-bags", label: "Tote bags" },
  { id: "other", label: "Other" },
] as const

const BYO_SUBJECT = "BYO (bring your own) inquiry"

type ByoInquiryFormProps = {
  /** For in-page anchor links (e.g. #byo-inquiry) */
  id?: string
  className?: string
}

type MoodBoardImage = {
  id: string
  filename: string
  mime_type: string
  data_base64: string
  preview_url: string
}

const MAX_MOOD_BOARD = 5
const MAX_FILE_BYTES = 8 * 1024 * 1024

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => {
      const v = r.result
      if (typeof v === "string") resolve(v)
      else reject(new Error("FileReader returned non-string result"))
    }
    r.onerror = reject
    r.readAsDataURL(file)
  })

export default function ByoInquiryForm({ id, className = "" }: ByoInquiryFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [printingType, setPrintingType] = useState("")
  const [printingOther, setPrintingOther] = useState("")
  const [garmentOther, setGarmentOther] = useState("")
  const [selectedGarments, setSelectedGarments] = useState<Set<string>>(() => new Set())
  const [moodBoard, setMoodBoard] = useState<MoodBoardImage[]>([])
  const moodInputRef = useRef<HTMLInputElement | null>(null)
  const formTitleId = useId()

  const addImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const next: MoodBoardImage[] = []
    for (const file of Array.from(files)) {
      if (moodBoard.length + next.length >= MAX_MOOD_BOARD) break
      if (!file.type.startsWith("image/")) continue
      if (file.size > MAX_FILE_BYTES) {
        alert(`${file.name} is larger than 8 MB — skipping.`)
        continue
      }
      try {
        const dataUrl = await fileToDataUrl(file)
        next.push({
          id: `${Date.now()}-${file.name}`,
          filename: file.name,
          mime_type: file.type,
          data_base64: dataUrl,
          preview_url: dataUrl,
        })
      } catch {
        // skip
      }
    }
    if (next.length > 0) setMoodBoard((prev) => [...prev, ...next])
    if (moodInputRef.current) moodInputRef.current.value = ""
  }

  const removeImage = (id: string) =>
    setMoodBoard((prev) => prev.filter((m) => m.id !== id))

  const inputClass =
    "w-full rounded-lg border border-[var(--brand-primary)]/35 bg-white px-3 py-2.5 text-sm text-ui-fg-base placeholder:text-ui-fg-muted/80 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30"

  const labelClass = "mb-1.5 block text-xs font-semibold text-ui-fg-base"

  const toggleGarment = (id: string) => {
    setSelectedGarments((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const buildMessage = (userMessage: string) => {
    const printingLine =
      printingType === "Other" && printingOther.trim()
        ? `Other: ${printingOther.trim()}`
        : printingType || "Not specified"

    const garmentLabels = GARMENT_TYPES.filter((g) => selectedGarments.has(g.id)).map(
      (g) => (g.id === "other" && garmentOther.trim() ? `Other (${garmentOther.trim()})` : g.label)
    )
    const garmentLine =
      garmentLabels.length > 0 ? garmentLabels.join(", ") : "Not specified"

    return [
      `Printing: ${printingLine}`,
      `Garment types: ${garmentLine}`,
      "",
      userMessage,
    ].join("\n")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = new FormData(form)
    const first = typeof data.get("first-name") === "string" ? (data.get("first-name") as string).trim() : ""
    const last = typeof data.get("last-name") === "string" ? (data.get("last-name") as string).trim() : ""
    const email = typeof data.get("email") === "string" ? (data.get("email") as string).trim() : ""
    const userMessage = typeof data.get("message") === "string" ? (data.get("message") as string).trim() : ""

    if (!printingType) {
      setLoading(false)
      return
    }
    if (printingType === "Other" && !printingOther.trim()) {
      alert("Please describe the printing type, or change your selection.")
      setLoading(false)
      return
    }
    if (selectedGarments.has("other") && !garmentOther.trim()) {
      alert("Please describe other garment types, or uncheck Other.")
      setLoading(false)
      return
    }
    if (!userMessage) {
      alert("Please add a message with your question.")
      setLoading(false)
      return
    }

    const contactName = `${first} ${last}`.trim() || null
    const payload = {
      email,
      contact_name: contactName,
      subject: BYO_SUBJECT,
      message: buildMessage(userMessage),
      source: "byo" as const,
      mood_board: moodBoard.map((m) => ({
        filename: m.filename,
        mime_type: m.mime_type,
        data_base64: m.data_base64,
      })),
    }

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setSuccess(true)
        form.reset()
        setPrintingType("")
        setPrintingOther("")
        setGarmentOther("")
        setSelectedGarments(new Set())
        setMoodBoard([])
      } else {
        const body = await response.json().catch(() => null)
        alert(
          body?.message ?? "Message could not be sent right now. Please try again shortly."
        )
      }
    } catch (err) {
      console.error(err)
      alert("Failed to send message. Please try again shortly.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        id={id}
        className={`rounded-2xl border border-[var(--brand-primary)]/25 bg-white p-6 text-center${id ? " scroll-mt-28" : ""} ${className}`.trim()}
        aria-labelledby={formTitleId}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)]/8 text-[var(--brand-primary)]">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 id={formTitleId} className="text-lg font-semibold text-ui-fg-base">
          Message received
        </h3>
        <p className="mt-2 text-sm text-ui-fg-subtle">
          We will get back to you about your BYO enquiry shortly.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-5 text-sm font-semibold text-[var(--brand-secondary)] underline hover:text-[var(--brand-accent)]"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={`space-y-4${id ? " scroll-mt-28" : ""} ${className}`.trim()}
      aria-label="BYO inquiry form"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="byo-first-name" className={labelClass}>
            First name
          </label>
          <input
            id="byo-first-name"
            name="first-name"
            type="text"
            autoComplete="given-name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="byo-last-name" className={labelClass}>
            Last name
          </label>
          <input
            id="byo-last-name"
            name="last-name"
            type="text"
            autoComplete="family-name"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="byo-email" className={labelClass}>
          Email
        </label>
        <input
          id="byo-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="byo-printing" className={labelClass}>
          Printing type
        </label>
        <select
          id="byo-printing"
          name="printing"
          value={printingType}
          onChange={(e) => {
            setPrintingType(e.target.value)
            if (e.target.value !== "Other") {
              setPrintingOther("")
            }
          }}
          required
          className={inputClass}
        >
          {PRINTING_TYPES.map((opt) => (
            <option
              key={String(opt.value)}
              value={opt.value}
              disabled={opt.value === ""}
            >
              {opt.label}
            </option>
          ))}
        </select>
        {printingType === "Other" && (
          <div className="mt-2">
            <label htmlFor="byo-printing-other" className="sr-only">
              Describe printing type
            </label>
            <input
              id="byo-printing-other"
              name="printing-other"
              type="text"
              value={printingOther}
              onChange={(e) => setPrintingOther(e.target.value)}
              placeholder="Describe the printing type"
              className={inputClass}
            />
          </div>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className={`${labelClass} mb-2`}>Garment types</legend>
        <p className="mb-2 text-xs text-ui-fg-subtle">Select all that apply</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GARMENT_TYPES.map((g) => (
            <label
              key={g.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-ui-fg-base"
            >
              <input
                type="checkbox"
                checked={selectedGarments.has(g.id)}
                onChange={() => toggleGarment(g.id)}
                className="h-4 w-4 rounded border-[var(--brand-primary)]/40 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              />
              {g.label}
            </label>
          ))}
        </div>
        {selectedGarments.has("other") && (
          <div className="mt-2">
            <label htmlFor="byo-garment-other" className="sr-only">
              Other garment types
            </label>
            <input
              id="byo-garment-other"
              name="garment-other"
              type="text"
              value={garmentOther}
              onChange={(e) => setGarmentOther(e.target.value)}
              placeholder="Describe other garment types"
              className={inputClass}
            />
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="byo-message" className={labelClass}>
          Your question
        </label>
        <textarea
          id="byo-message"
          name="message"
          rows={4}
          required
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className={labelClass}>
          Mood board (optional, up to {MAX_MOOD_BOARD} images)
        </label>
        <p className="mb-2 text-xs text-ui-fg-subtle">
          Drop in Pinterest screenshots, brand references, or photos of what
          you&apos;re going for. Faster quotes, fewer rounds of back-and-forth.
        </p>
        <div className="flex flex-wrap items-start gap-2">
          {moodBoard.map((m) => (
            <div
              key={m.id}
              className="relative h-20 w-20 overflow-hidden rounded-md border border-[var(--brand-primary)]/20 bg-ui-bg-subtle"
            >
              <img
                src={m.preview_url}
                alt={m.filename}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(m.id)}
                className="absolute right-0 top-0 m-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
                aria-label={`Remove ${m.filename}`}
              >
                ×
              </button>
            </div>
          ))}
          {moodBoard.length < MAX_MOOD_BOARD ? (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-[var(--brand-primary)]/40 text-xs text-ui-fg-subtle hover:bg-ui-bg-subtle">
              + Add
              <input
                ref={moodInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addImages(e.target.files)}
                className="hidden"
              />
            </label>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send BYO question"}
      </button>
    </form>
  )
}
