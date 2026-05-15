"use client"

import { Switch } from "@headlessui/react"

export type GraphVisibility = {
  root: boolean
  brand: boolean
  category: boolean
  type: boolean
  tag: boolean
  product: boolean
}

type Props = {
  value: GraphVisibility
  onChange: (next: GraphVisibility) => void
}

/**
 * Toggle switches that hide/show each node kind. Pure presentational —
 * the parent applies the visibility map via `filterPayload` and re-renders.
 */
export function GraphFilters({ value, onChange }: Props) {
  const toggle = (key: keyof GraphVisibility) => {
    onChange({ ...value, [key]: !value[key] })
  }

  const items: Array<{ key: keyof GraphVisibility; label: string }> = [
    { key: "brand", label: "Brands" },
    { key: "category", label: "Categories" },
    { key: "type", label: "Types" },
    { key: "tag", label: "Tags" },
    { key: "product", label: "Products" },
  ]

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-ui-border-base bg-ui-bg-base/90 p-3 backdrop-blur">
      <p className="text-[0.65rem] uppercase tracking-widest text-ui-fg-subtle">Show</p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center justify-between gap-4">
            <span className="text-small-regular text-ui-fg-base">{item.label}</span>
            <Switch
              checked={value[item.key]}
              onChange={() => toggle(item.key)}
              className={`${
                value[item.key] ? "bg-slate-700" : "bg-ui-bg-component"
              } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-ui-border-base transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`}
              aria-label={`Toggle ${item.label}`}
            >
              <span
                aria-hidden="true"
                className={`${
                  value[item.key] ? "translate-x-4" : "translate-x-0.5"
                } pointer-events-none inline-block h-4 w-4 translate-y-0.5 transform rounded-full bg-white shadow ring-0 transition duration-150 ease-in-out`}
              />
            </Switch>
          </li>
        ))}
      </ul>
    </div>
  )
}
