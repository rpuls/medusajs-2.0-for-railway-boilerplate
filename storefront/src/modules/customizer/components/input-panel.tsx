"use client"

import { ChangeEvent, useState } from "react"
import { createPortal } from "react-dom"

type InputPanelProps = {
  onUploadFile: (file: File) => Promise<void>
  uploads: Array<{ id: string; name: string; previewUrl: string; type: string }>
  onReuseUpload: (uploadId: string) => Promise<void>
  onAddText: (input: { text: string; color: string; fontFamily: string; letterSpacing: number }) => void
  onAddCurvedText: (input: { text: string; color: string; radius: number }) => void
  onRemoveSelectedImage: () => void
  canRemoveImage: boolean
  /** When provided, each upload tile shows a bin icon that removes it from "My uploads" after confirmation. */
  onDeleteUpload?: (uploadId: string) => void
  /**
   * Designs the customer has already attached to other cart line items
   * (typically via the bundle wizard). When supplied, the panel surfaces a
   * "From your cart" section that lets the customer drop an existing
   * artwork onto this view without re-uploading. Resolves the URL → file
   * via `onAddCartDesign` so the rest of the upload pipeline (EXIF
   * normalisation, MinIO archive, canvas add) is reused unchanged.
   */
  cartDesigns?: Array<{ id: string; name: string; url: string }>
  onAddCartDesign?: (design: { id: string; name: string; url: string }) => Promise<void>
  /**
   * When false, the panel hides the uploader, "My uploads", and Remove button
   * behind a placeholder telling the customer which wizard step to finish
   * first. When undefined, the panel is fully enabled (back-compat for the
   * standalone /customizer route).
   */
  enabled?: boolean
  /** Optional copy shown in the placeholder when `enabled` is false. */
  disabledMessage?: { title: string; body: string }
  className?: string
}

export default function InputPanel({
  onUploadFile,
  uploads,
  onReuseUpload,
  onAddText,
  onAddCurvedText,
  onRemoveSelectedImage,
  canRemoveImage,
  onDeleteUpload,
  cartDesigns,
  onAddCartDesign,
  enabled = true,
  disabledMessage,
  className,
}: InputPanelProps) {
  const [text, setText] = useState("Your Brand")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [color, setColor] = useState("#111827")
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [arcRadius, setArcRadius] = useState(120)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [addingCartDesignId, setAddingCartDesignId] = useState<string | null>(null)

  const handleCartDesignClick = async (design: { id: string; name: string; url: string }) => {
    if (!onAddCartDesign) return
    setAddingCartDesignId(design.id)
    try {
      await onAddCartDesign(design)
    } finally {
      setAddingCartDesignId(null)
    }
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await onUploadFile(file)
    event.target.value = ""
  }

  return (
    <div
      className={`space-y-4 rounded-xl border border-ui-border-base bg-ui-bg-base p-4 ${className ?? ""}`}
    >
      <div>
        <h3 className="text-sm font-semibold text-ui-fg-base">Add to design</h3>
        <p className="mt-1 text-xs text-ui-fg-subtle">Upload art and text.</p>
      </div>

      {!enabled ? (
        <div className="rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle/60 p-3">
          <p className="text-xs font-semibold text-ui-fg-base">
            {disabledMessage?.title ?? "Customize first"}
          </p>
          <p className="mt-1 text-xs text-ui-fg-subtle">
            {disabledMessage?.body ??
              "Pick your colour and print location above to get started."}
          </p>
        </div>
      ) : null}

      {enabled && cartDesigns !== undefined && cartDesigns.length === 0 ? (
        <p className="text-[11px] text-ui-fg-muted">
          No cart designs yet — add a customized item to your cart first to reuse its artwork here.
        </p>
      ) : null}

      {enabled && cartDesigns && cartDesigns.length > 0 && onAddCartDesign ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-ui-fg-subtle">From your cart</label>
            <span className="text-[11px] text-ui-fg-subtle">Reuse without uploading</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {cartDesigns.map((design) => {
              const busy = addingCartDesignId === design.id
              return (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => handleCartDesignClick(design)}
                  disabled={Boolean(addingCartDesignId)}
                  className="group relative block overflow-hidden rounded-md border border-ui-border-base bg-ui-bg-subtle text-left hover:border-ui-fg-subtle disabled:opacity-50"
                  title={`Add ${design.name} to this view`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-white">
                    <img src={design.url} alt={design.name} className="h-full w-full object-contain" />
                  </div>
                  <p className="truncate px-1.5 py-1 text-[11px] text-ui-fg-subtle group-hover:text-ui-fg-base">
                    {busy ? "Adding…" : design.name}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {enabled ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-ui-fg-subtle">
            Image uploader (PNG/JPG/SVG)
          </p>
          {/*
            Wrap the native file input in a styled label so the browser's
            "No file chosen" hover tooltip (which used to bleed across the
            wizard sidebar) is replaced with a meaningful title, and the
            raw input chrome is hidden behind a button + filename pair.
          */}
          <label
            className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm transition hover:border-[var(--brand-secondary)]/50 hover:bg-ui-bg-subtle"
            title="Upload a PNG, JPG, or SVG to add to your design"
          >
            <span className="rounded-md border border-ui-border-base bg-ui-bg-subtle px-2.5 py-1 text-xs font-semibold text-ui-fg-base">
              Choose file
            </span>
            <span className="truncate text-xs text-ui-fg-subtle">
              PNG, JPG, or SVG
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={onFileChange}
              className="sr-only"
              aria-label="Upload a PNG, JPG, or SVG to add to your design"
            />
          </label>
        </div>
      ) : null}

      {enabled && uploads.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-ui-fg-subtle">My uploads</label>
            <span className="text-[11px] text-ui-fg-subtle">Reusable across views</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {uploads.map((upload) => {
              return (
                <div
                  key={upload.id}
                  className="group relative rounded-md border border-ui-border-base bg-ui-bg-subtle hover:border-ui-fg-subtle"
                >
                  <button
                    type="button"
                    onClick={() => onReuseUpload(upload.id)}
                    className="block w-full overflow-hidden rounded-md text-left"
                    title={`Add ${upload.name} to this view`}
                  >
                    <div className="aspect-square w-full overflow-hidden bg-ui-bg-base/40">
                      <img src={upload.previewUrl} alt={upload.name} className="h-full w-full object-cover" />
                    </div>
                    <p className="truncate px-1.5 py-1 text-[11px] text-ui-fg-subtle group-hover:text-ui-fg-base">
                      {upload.name}
                    </p>
                  </button>

                  {onDeleteUpload ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPendingDeleteId(upload.id)
                      }}
                      aria-label={`Delete ${upload.name} from My uploads`}
                      title="Delete from My uploads"
                      className="absolute -right-1.5 -top-1.5 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md ring-2 ring-white transition-colors hover:bg-rose-700"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  ) : null}

                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      {enabled && pendingDeleteId && onDeleteUpload && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
              role="dialog"
              aria-modal
              aria-label="Confirm delete upload"
              onClick={(e) => {
                if (e.target === e.currentTarget) setPendingDeleteId(null)
              }}
            >
              <div className="w-[min(22rem,90vw)] space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4 text-center shadow-2xl">
                <p className="text-sm font-semibold text-ui-fg-base">Delete this upload?</p>
                <p className="text-xs text-ui-fg-subtle">
                  It will be removed from your <span className="font-medium">My uploads</span> list.
                  Designs already placed on the canvas stay put.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingDeleteId(null)}
                    className="flex-1 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base hover:bg-ui-bg-subtle"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteUpload(pendingDeleteId)
                      setPendingDeleteId(null)
                    }}
                    className="flex-1 rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {enabled ? (
        <button
          type="button"
          className="w-full rounded-md border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-900 hover:bg-rose-100 disabled:opacity-50"
          onClick={onRemoveSelectedImage}
          disabled={!canRemoveImage}
          title={
            canRemoveImage
              ? "Remove the currently selected layer from the canvas"
              : "Select a layer (click on it in the preview) first"
          }
        >
          Remove selected
        </button>
      ) : null}

      {/*
       * Text / curved text input was removed pending a redesign — the freeform
       * font family input + curve radius slider produced inconsistent output
       * across browsers. Customers can ask for typeset wording in the
       * production notes for now. Re-enable by restoring this block alongside
       * `text`/`fontFamily`/`color`/`letterSpacing`/`arcRadius` state.
       */}
    </div>
  )
}
