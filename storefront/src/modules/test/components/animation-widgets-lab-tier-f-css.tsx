"use client"

import { useEffect, useId, useRef, useState } from "react"

/* -------------------------------------------------------------------------- */
/* Shared support-detect helpers                                              */
/* -------------------------------------------------------------------------- */

function useSupports(condition: string) {
  const [supported, setSupported] = useState<boolean | null>(null)
  useEffect(() => {
    if (typeof window === "undefined" || !window.CSS?.supports) {
      setSupported(false)
      return
    }
    try {
      setSupported(CSS.supports(condition))
    } catch {
      setSupported(false)
    }
  }, [condition])
  return supported
}

function SupportPill({ supported }: { supported: boolean | null }) {
  if (supported === null) {
    return (
      <span className="rounded-full border border-ui-border-base bg-ui-bg-base px-2 py-0.5 text-[10px] uppercase tracking-wide text-ui-fg-muted">
        detecting…
      </span>
    )
  }
  return supported ? (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
      supported
    </span>
  ) : (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
      fallback shown
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* 1. CSS Anchor Positioning — tooltip auto-flip                              */
/* -------------------------------------------------------------------------- */

export function LabTierFAnchorTooltip() {
  const supported = useSupports("anchor-name: --x")
  const id = useId().replace(/[:]/g, "")
  const anchorName = `--lab-anchor-${id}`

  const css = `
.lab-anchor-${id} {
  anchor-name: ${anchorName};
}
.lab-tooltip-${id} {
  position: absolute;
  position-anchor: ${anchorName};
  top: anchor(bottom);
  justify-self: anchor-center;
  margin-top: 8px;
  position-try-options: flip-block, flip-inline;
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          CSS Anchor Positioning API
        </p>
        <SupportPill supported={supported} />
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6">
        {["Top-left", "Top-right", "Bottom-edge"].map((label, i) => (
          <div key={label} className="relative flex justify-center">
            <button
              type="button"
              className={`lab-anchor-${id} rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-xs text-ui-fg-base hover:bg-[#FF2E63] hover:text-white`}
            >
              {label}
            </button>
            {supported ? (
              <span
                className={`lab-tooltip-${id} pointer-events-none rounded-md bg-ui-fg-base px-2 py-1 text-[11px] text-ui-bg-base shadow-lg`}
                style={{ left: `${i * 0}px` }}
              >
                Tethered tip
              </span>
            ) : (
              <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-md bg-ui-fg-base px-2 py-1 text-[11px] text-ui-bg-base shadow-lg">
                Tethered tip
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-ui-fg-muted">
        Native <code className="text-ui-fg-base">anchor()</code> +{" "}
        <code className="text-ui-fg-base">position-try-options</code> auto-flip
        the tooltip near viewport edges. Replaces JS bounding-box math.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. Native <dialog> + ::backdrop transitions                                */
/* -------------------------------------------------------------------------- */

export function LabTierFDialogTransitions() {
  const supported = useSupports("transition-behavior: allow-discrete")
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId().replace(/[:]/g, "")

  const css = `
.lab-dialog-${id} {
  border: 1px solid #00000020;
  border-radius: 16px;
  padding: 24px;
  max-width: 360px;
  inset: 0;
  margin: auto;
  opacity: 0;
  transform: translateY(8px) scale(0.96);
  transition: opacity 220ms, transform 220ms, overlay 220ms allow-discrete, display 220ms allow-discrete;
}
.lab-dialog-${id}[open] {
  opacity: 1;
  transform: translateY(0) scale(1);
}
@starting-style {
  .lab-dialog-${id}[open] {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
}
.lab-dialog-${id}::backdrop {
  background: rgba(8, 9, 12, 0);
  transition: background 220ms, overlay 220ms allow-discrete, display 220ms allow-discrete;
}
.lab-dialog-${id}[open]::backdrop {
  background: rgba(8, 9, 12, 0.55);
}
@starting-style {
  .lab-dialog-${id}[open]::backdrop {
    background: rgba(8, 9, 12, 0);
  }
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          {`<dialog> + ::backdrop transitions (allow-discrete + @starting-style)`}
        </p>
        <SupportPill supported={supported} />
      </div>
      <button
        type="button"
        className="rounded-full bg-[#FF2E63] px-4 py-2 text-sm font-medium text-white"
        onClick={() => ref.current?.showModal()}
      >
        Open native dialog
      </button>
      <dialog ref={ref} className={`lab-dialog-${id}`}>
        <h3 className="text-base font-semibold text-ui-fg-base">
          Native dialog
        </h3>
        <p className="mt-2 text-sm text-ui-fg-muted">
          The element + backdrop both fade and translate in via CSS transitions
          on{" "}
          <code className="text-ui-fg-base">overlay</code> and{" "}
          <code className="text-ui-fg-base">display</code>, with{" "}
          <code className="text-ui-fg-base">@starting-style</code> for the entry
          frame.
        </p>
        <form method="dialog" className="mt-4 flex justify-end">
          <button
            type="submit"
            className="rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-2 text-sm text-ui-fg-base"
          >
            Close
          </button>
        </form>
      </dialog>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. Popover API anchored menu                                               */
/* -------------------------------------------------------------------------- */

export function LabTierFPopoverMenu() {
  const supported = useSupports("anchor-name: --x")
  const id = useId().replace(/[:]/g, "")

  const css = `
.lab-popover-trigger-${id} {
  anchor-name: --pop-${id};
}
.lab-popover-${id} {
  position-anchor: --pop-${id};
  top: anchor(bottom);
  left: anchor(left);
  margin-top: 6px;
  border: 1px solid #00000020;
  border-radius: 12px;
  padding: 8px;
  background: white;
  box-shadow: 0 16px 48px -12px rgba(0,0,0,0.25);
  position-try-options: flip-block;
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          Popover API + anchor positioning
        </p>
        <SupportPill supported={supported} />
      </div>
      <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-6">
        <button
          type="button"
          className={`lab-popover-trigger-${id} rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-sm text-ui-fg-base`}
          // @ts-expect-error popovertarget is a valid HTML attribute not yet in DOM lib types
          popovertarget={`lab-pop-${id}`}
        >
          Open popover ▾
        </button>
        <div
          id={`lab-pop-${id}`}
          popover="auto"
          className={`lab-popover-${id}`}
        >
          <ul className="min-w-[180px] text-sm">
            <li className="cursor-pointer rounded-md px-3 py-1.5 text-ui-fg-base hover:bg-ui-bg-subtle">
              Edit design
            </li>
            <li className="cursor-pointer rounded-md px-3 py-1.5 text-ui-fg-base hover:bg-ui-bg-subtle">
              Duplicate
            </li>
            <li className="cursor-pointer rounded-md px-3 py-1.5 text-ui-fg-base hover:bg-ui-bg-subtle">
              Send to cart
            </li>
            <li className="mt-1 cursor-pointer rounded-md border-t border-ui-border-base px-3 py-1.5 text-rose-600 hover:bg-rose-50">
              Delete
            </li>
          </ul>
        </div>
      </div>
      <p className="text-xs text-ui-fg-muted">
        Light-dismiss + ESC dismiss come for free with{" "}
        <code className="text-ui-fg-base">popover=&quot;auto&quot;</code>; no
        outside-click handler in JS.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. @property smooth gradient interpolation                                 */
/* -------------------------------------------------------------------------- */

export function LabTierFPropertyGradient() {
  const supported = useSupports("background: linear-gradient(in oklch, red, blue)")
  const id = useId().replace(/[:]/g, "")

  const css = `
@property --lab-angle-${id} {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
.lab-prop-card-${id} {
  --lab-angle-${id}: 45deg;
  background: linear-gradient(var(--lab-angle-${id}), #FF2E63 0%, #6366f1 50%, #06b6d4 100%);
  transition: --lab-angle-${id} 1.4s cubic-bezier(.2,.7,.2,1);
}
.lab-prop-card-${id}:hover {
  --lab-angle-${id}: 285deg;
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          @property registered{" "}
          <code className="text-ui-fg-base">&lt;angle&gt;</code>
        </p>
        <SupportPill supported={supported} />
      </div>
      <div
        className={`lab-prop-card-${id} flex h-40 items-end rounded-xl p-5 text-white shadow-lg`}
      >
        <p className="text-lg font-semibold">
          Hover — gradient angle interpolates smoothly
        </p>
      </div>
      <p className="text-xs text-ui-fg-muted">
        Without <code className="text-ui-fg-base">@property</code>, the gradient
        would hop because{" "}
        <code className="text-ui-fg-base">linear-gradient()</code> is treated as
        a token. Registering the angle as a typed property makes it animatable.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 5. color-mix() theme transition                                            */
/* -------------------------------------------------------------------------- */

export function LabTierFColorMixTheme() {
  const supported = useSupports("color: color-mix(in oklch, red, blue)")
  const [t, setT] = useState(0.35)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          <code className="text-ui-fg-base">color-mix(in oklch, …)</code>
        </p>
        <SupportPill supported={supported} />
      </div>
      <div
        className="grid grid-cols-3 gap-3 rounded-xl border border-ui-border-base p-4"
        style={{
          background: supported
            ? `color-mix(in oklch, #ffffff ${100 - t * 12}%, #FF2E63)`
            : "#fdf2f7",
        }}
      >
        {["Primary", "Card", "Muted"].map((label, i) => (
          <div
            key={label}
            className="rounded-lg p-4 text-center text-sm font-medium"
            style={{
              background: supported
                ? `color-mix(in oklch, #FF2E63 ${(t * 100 - i * 18).toFixed(0)}%, #ffffff)`
                : "#FF2E63",
              color: supported
                ? `color-mix(in oklch, #08090c ${(80 - i * 22).toFixed(0)}%, #ffffff)`
                : "#fff",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <label className="flex items-center gap-3 text-xs text-ui-fg-muted">
        Mix
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={t}
          onChange={(e) => setT(parseFloat(e.target.value))}
          className="h-1 w-48 accent-[#FF2E63]"
        />
        <span className="tabular-nums text-ui-fg-base">{t.toFixed(2)}</span>
      </label>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 6. view() timeline (vs scroll())                                           */
/* -------------------------------------------------------------------------- */

export function LabTierFViewTimeline() {
  const supported = useSupports("animation-timeline: view()")
  const id = useId().replace(/[:]/g, "")

  const css = `
@keyframes lab-view-${id} {
  from { opacity: 0; transform: translateY(28px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.lab-view-card-${id} {
  animation: lab-view-${id} both linear;
  animation-timeline: view();
  animation-range: entry 5% cover 35%;
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          animation-timeline: view()
        </p>
        <SupportPill supported={supported} />
      </div>
      <div className="h-[260px] overflow-y-auto rounded-xl border border-ui-border-base bg-ui-bg-subtle">
        <div className="space-y-3 p-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={`lab-view-card-${id} rounded-xl bg-ui-bg-base p-4 text-sm text-ui-fg-base shadow`}
            >
              <p className="font-semibold">Card {i + 1}</p>
              <p className="text-xs text-ui-fg-muted">
                Each card animates from opacity 0 / translateY+scale to settled,
                progress-driven by its own <em>view-timeline</em>.
              </p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-ui-fg-muted">
        Per-element progress timeline — distinct from the existing{" "}
        <code className="text-ui-fg-base">scroll()</code>-based progress bar
        widget.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 7. field-sizing: content auto-grow                                         */
/* -------------------------------------------------------------------------- */

export function LabTierFFieldSizing() {
  const supported = useSupports("field-sizing: content")
  const id = useId().replace(/[:]/g, "")

  const css = `
.lab-fs-${id} {
  field-sizing: content;
  min-inline-size: 180px;
  max-inline-size: 100%;
  min-height: 2.5rem;
  max-height: 16rem;
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          <code className="text-ui-fg-base">field-sizing: content</code>
        </p>
        <SupportPill supported={supported} />
      </div>
      <textarea
        className={`lab-fs-${id} w-full rounded-xl border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm text-ui-fg-base focus:border-[#FF2E63] focus:outline-none`}
        placeholder="Type a few lines — the textarea grows with content (no JS, no rows attribute hack)."
      />
      <p className="text-xs text-ui-fg-muted">
        Replaces the standard{" "}
        <code className="text-ui-fg-base">scrollHeight</code>/textarea-resize
        ResizeObserver pattern with a single CSS declaration.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 8. Subgrid alignment                                                       */
/* -------------------------------------------------------------------------- */

export function LabTierFSubgrid() {
  const supported = useSupports("grid-template-rows: subgrid")
  const id = useId().replace(/[:]/g, "")

  const css = `
.lab-subgrid-wrap-${id} {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: auto auto auto;
  gap: 12px;
}
.lab-subgrid-card-${id} {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
  border: 1px solid #00000020;
  border-radius: 12px;
  padding: 14px;
  background: white;
}
.lab-subgrid-card-${id} > * { min-width: 0; }
`

  const items = [
    { title: "Hoodie — Heavy", body: "400gsm fleece, double-stitched cuffs.", cta: "Quote" },
    { title: "Tee — Premium", body: "180gsm ringspun.", cta: "Quote" },
    { title: "Cap — 5-panel low profile.", body: "Brushed cotton, available in 8 colors with curved or flat brim options.", cta: "Quote" },
  ]

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          grid-template-rows: subgrid
        </p>
        <SupportPill supported={supported} />
      </div>
      <div className={`lab-subgrid-wrap-${id}`}>
        {items.map((it) => (
          <div key={it.title} className={`lab-subgrid-card-${id}`}>
            <h3 className="text-sm font-semibold text-ui-fg-base">
              {it.title}
            </h3>
            <p className="text-xs text-ui-fg-muted">{it.body}</p>
            <button
              type="button"
              className="self-end rounded-full border border-ui-border-base bg-ui-bg-base px-3 py-1 text-xs text-ui-fg-base"
            >
              {it.cta}
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-ui-fg-muted">
        Without subgrid the CTA buttons would each align to their own card's
        baseline. With subgrid, they all sit on the same outer-grid track.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 9. @scope style isolation                                                  */
/* -------------------------------------------------------------------------- */

export function LabTierFScopeIsolation() {
  const supported = useSupports("selector(@scope)")
  const id = useId().replace(/[:]/g, "")

  const css = `
@scope (.lab-scope-${id}) {
  :scope {
    background: #08090c;
    color: #FF2E63;
    border-radius: 16px;
    padding: 18px;
  }
  h4 {
    color: #FF8FB3;
    letter-spacing: 0.04em;
    font-weight: 700;
  }
  a {
    color: #06b6d4;
    text-decoration: underline dotted;
  }
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          <code className="text-ui-fg-base">@scope</code> rule
        </p>
        <SupportPill supported={supported} />
      </div>
      <div className={`lab-scope-${id}`}>
        <h4>Inside the scope</h4>
        <p className="text-sm">
          Scoped <a href="#scope-anchor">link styling</a> bleeds nowhere; the
          theme lives only inside this card.
        </p>
      </div>
      <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4 text-sm text-ui-fg-base">
        <h4 className="font-semibold">Outside the scope</h4>
        <p className="text-xs text-ui-fg-muted">
          Same selectors, untouched — proves the scope didn't leak.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 10. offset-path motion-path icon                                           */
/* -------------------------------------------------------------------------- */

export function LabTierFOffsetPath({
  reducedMotion,
}: {
  reducedMotion: boolean
}) {
  const supported = useSupports("offset-path: path('M0 0 L 1 1')")
  const id = useId().replace(/[:]/g, "")
  const [run, setRun] = useState(0)

  const css = `
@keyframes lab-offset-${id} {
  from { offset-distance: 0%; opacity: 0; }
  10%  { opacity: 1; }
  to   { offset-distance: 100%; opacity: 0; }
}
.lab-offset-icon-${id} {
  width: 24px;
  height: 24px;
  border-radius: 9999px;
  background: #FF2E63;
  offset-path: path('M 8 70 C 80 70, 80 12, 160 12 C 240 12, 240 80, 320 80');
  offset-rotate: auto;
  animation: lab-offset-${id} 1600ms cubic-bezier(.2,.7,.2,1) forwards;
}
`

  return (
    <div className="space-y-3">
      <style>{css}</style>
      <div className="flex items-center gap-2">
        <p className="text-xs text-ui-fg-muted">
          <code className="text-ui-fg-base">offset-path</code> +{" "}
          <code className="text-ui-fg-base">offset-distance</code>
        </p>
        <SupportPill supported={supported} />
      </div>
      <div className="relative h-[120px] overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
        <svg viewBox="0 0 320 100" className="absolute inset-0 h-full w-full">
          <path
            d="M 8 70 C 80 70, 80 12, 160 12 C 240 12, 240 80, 320 80"
            stroke="#cbd5e1"
            strokeWidth={2}
            strokeDasharray="4 6"
            fill="none"
          />
        </svg>
        {!reducedMotion && supported ? (
          <div key={run} className={`lab-offset-icon-${id} relative top-0`} />
        ) : null}
        <div className="absolute right-3 top-3">
          <button
            type="button"
            className="rounded-full bg-[#FF2E63] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
            onClick={() => setRun((r) => r + 1)}
            disabled={reducedMotion}
          >
            Replay
          </button>
        </div>
      </div>
      <p className="text-xs text-ui-fg-muted">
        Reusable foundation for fly-to-cart or success-checkmark trails — the
        path can be any SVG curve.
      </p>
    </div>
  )
}
