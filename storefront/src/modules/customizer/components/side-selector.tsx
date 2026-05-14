"use client"

import { GarmentSide } from "@modules/customizer/lib/types"

const SIDE_OPTIONS: { value: GarmentSide; label: string; short: string }[] = [
  { value: "front", label: "Front", short: "Front" },
  { value: "back", label: "Back", short: "Back" },
  { value: "left_sleeve", label: "Left Sleeve", short: "Left" },
  { value: "right_sleeve", label: "Right Sleeve", short: "Right" },
  { value: "printed_tag", label: "Printed Tag", short: "Tag" },
]

type SideSelectorProps = {
  currentSide: GarmentSide
  onSelectSide: (side: GarmentSide) => void
  /** Optional whitelist; when provided, only these sides render. */
  allowedSides?: GarmentSide[]
  /** Sides that already have artwork — show a ✓ indicator on their tab. */
  decoratedSides?: GarmentSide[]
}

export default function SideSelector({ currentSide, onSelectSide, allowedSides, decoratedSides }: SideSelectorProps) {
  const visibleOptions = allowedSides
    ? SIDE_OPTIONS.filter((o) => allowedSides.includes(o.value))
    : SIDE_OPTIONS
  return (
    <div
      className="flex flex-wrap gap-1 rounded-xl border border-ui-border-base bg-ui-bg-subtle/80 p-1"
      role="tablist"
      aria-label="Print location"
    >
      {visibleOptions.map((option) => {
        const selected = currentSide === option.value
        const decorated = decoratedSides?.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`min-w-[4.5rem] flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors small:min-w-0 small:px-3 small:text-sm ${
              selected
                ? "bg-ui-bg-base text-ui-fg-base shadow-sm ring-1 ring-ui-border-base"
                : "text-ui-fg-subtle hover:bg-ui-bg-base/60 hover:text-ui-fg-base"
            }`}
            onClick={() => onSelectSide(option.value)}
          >
            {decorated && (
              <span className="mr-0.5 text-[10px] text-emerald-600" aria-hidden>✓</span>
            )}
            <span className="small:hidden">{option.short}</span>
            <span className="hidden small:inline">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
