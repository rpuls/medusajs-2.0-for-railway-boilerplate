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
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-ui-fg-subtle">
        Method
      </span>
      <div className="inline-flex rounded-md border border-ui-border-base bg-ui-bg-base p-0.5">
        {availableMethods.map((method) => {
          const selected = value === method
          return (
            <button
              key={method}
              type="button"
              disabled={disabled}
              onClick={() => onChange(side, method)}
              title={METHOD_HINT[method]}
              className={`min-w-[88px] rounded px-3 py-1.5 text-xs font-medium transition ${
                selected
                  ? "bg-ui-bg-base-pressed text-ui-fg-base shadow-sm"
                  : "text-ui-fg-subtle hover:text-ui-fg-base"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {METHOD_LABEL[method]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DecorationMethodPicker
