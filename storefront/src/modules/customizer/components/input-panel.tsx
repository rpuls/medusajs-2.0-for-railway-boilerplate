"use client"

import { ChangeEvent, useState } from "react"

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
  className,
}: InputPanelProps) {
  const [text, setText] = useState("Your Brand")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [color, setColor] = useState("#111827")
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [arcRadius, setArcRadius] = useState(120)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

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

      <div className="space-y-2">
        <label className="text-xs font-medium text-ui-fg-subtle">Image uploader (PNG/JPG/SVG)</label>
        <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={onFileChange} className="w-full text-sm" />
      </div>

      {uploads.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-ui-fg-subtle">My uploads</label>
            <span className="text-[11px] text-ui-fg-subtle">Reusable across views</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {uploads.map((upload) => {
              const isPendingDelete = pendingDeleteId === upload.id
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

                  {isPendingDelete && onDeleteUpload ? (
                    <div
                      className="absolute left-1/2 top-full z-30 mt-2 w-[11rem] -translate-x-1/2 space-y-2 rounded-lg border border-ui-border-base bg-ui-bg-base p-2.5 text-center shadow-xl"
                      role="dialog"
                      aria-label="Confirm delete"
                    >
                      <p className="text-xs font-medium text-ui-fg-base">Delete this upload?</p>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteUpload(upload.id)
                            setPendingDeleteId(null)
                          }}
                          className="flex-1 rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="flex-1 rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-xs text-ui-fg-base hover:bg-ui-bg-subtle"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="w-full rounded-md border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-900 hover:bg-rose-100 disabled:opacity-50"
        onClick={onRemoveSelectedImage}
        disabled={!canRemoveImage}
        title={canRemoveImage ? "Remove selected image from the canvas" : "Select an image layer first"}
      >
        Remove image
      </button>

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
