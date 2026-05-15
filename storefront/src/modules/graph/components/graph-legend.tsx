"use client"

import { NODE_STYLE } from "../lib/style"

const ITEMS: Array<{ kind: keyof typeof NODE_STYLE; label: string }> = [
  { kind: "brand", label: "Brand" },
  { kind: "category", label: "Category" },
  { kind: "type", label: "Product Type" },
  { kind: "tag", label: "Tag" },
  { kind: "product", label: "Product" },
]

export function GraphLegend() {
  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-base/90 p-3 backdrop-blur">
      <p className="mb-2 text-[0.65rem] uppercase tracking-widest text-ui-fg-subtle">Legend</p>
      <ul className="flex flex-col gap-2">
        {ITEMS.map((item) => {
          const style = NODE_STYLE[item.kind]
          return (
            <li key={item.kind} className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-full border"
                style={{
                  backgroundColor: style.highlightFill,
                  borderColor: style.stroke,
                }}
              />
              <span className="text-small-regular text-ui-fg-base">{item.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
