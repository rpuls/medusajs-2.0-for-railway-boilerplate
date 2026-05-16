"use client"

import React from "react"
import type { DecorationMethod, GarmentSide } from "@modules/customizer/lib/types"

type Props = {
  side: GarmentSide
  value: DecorationMethod
  onChange: (side: GarmentSide, method: DecorationMethod) => void
  /** Disable picker (e.g. while another async op is in flight). */
  disabled?: boolean
  /** Optional list of methods this product supports. Defaults to both. */
  availableMethods?: DecorationMethod[]
}

const METHOD_LABEL: Record<DecorationMethod, string> = {
  print: "Print",
  embroidery: "Embroidery",
}

const METHOD_HINT: Record<DecorationMethod, string> = {
  print: "Digital print (DTF). Larger images, photo-realistic.",
  embroidery: "Stitched thread. Smaller logos, premium finish.",
}

/**
 * Compact two-button toggle for picking the decoration method on a single
 * garment side. Used inside Step 2 of the customizer wizard so each
 * decorated side can independently be print or embroidery.
 */
const DecorationMethodPicker: React.FC<Props> = ({
  side,
  value,
  onChange,
  disabled,
  availableMethods = ["print", "embroidery"],
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ui-fg-subtle">
        Method
      </span>
      <div className="grid grid-cols-2 gap-2">
        {availableMethods.map((method) => {
          const selected = value === method
          return (
            <button
              key={method}
              type="button"
              disabled={disabled}
              onClick={() => onChange(side, method)}
              title={METHOD_HINT[method]}
              aria-pressed={selected}
              className={`flex flex-col items-start gap-0.5 rounded-lg border-2 px-3 py-2.5 text-left transition ${
                selected
                  ? "border-[var(--brand-primary,#002a5c)] bg-[var(--brand-primary,#002a5c)] text-white shadow-sm"
                  : "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:border-ui-border-strong hover:bg-ui-bg-subtle"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                {selected ? <span aria-hidden>✓</span> : null}
                {METHOD_LABEL[method]}
              </span>
              <span
                className={`text-[11px] leading-snug ${
                  selected ? "text-white/80" : "text-ui-fg-subtle"
                }`}
              >
                {METHOD_HINT[method]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DecorationMethodPicker
