import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { cmykDtfChart } from "../cmyk-dtf-chart-schema"

import CmykDtfCategorySection from "./cmyk-dtf-category-section"

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

export default function CmykDtfGuide() {
  const chart = cmykDtfChart.cmyk_color_chart

  let cardOffset = 0
  const sectionsWithOffsets = chart.map((section) => {
    const start = cardOffset
    cardOffset += section.colors.length
    return { section, cardOffset: start }
  })

  return (
    <>
      <div className="border-b border-ui-border-base bg-ui-bg-subtle">
        <div className="content-container py-14 small:py-20">
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
              Print preparation
            </p>
            <h1 className="page-title-marketing mt-3 tracking-tight">
              CMYK for DTF printing
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
              CMYK describes how cyan, magenta, yellow, and black combine on
              film and garments. Screens use RGB and hex for approximation
              &mdash; the chart below helps artwork setup but doesn&apos;t
              guarantee final colour. DTF results depend on your RIP, ICC
              profiles, printer limits, white underbase, and fabric; request a
              physical proof for critical brand colours.
            </p>
          </header>
        </div>
      </div>

      <div className="content-container py-12 small:py-16">
        <div className="mx-auto max-w-6xl space-y-12 small:space-y-16">
          <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Pre-flight checklist
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
              Before you export
            </h2>
            <ul className="mt-5 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
              <li className="flex gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
                <span>
                  Work in your design app&apos;s CMYK workspace when possible;
                  avoid converting RGB artwork at the last step unless you
                  understand the colour shift.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
                <span>
                  Coordinate white ink and choke/spread settings with whoever
                  runs your films &mdash; those choices affect how sharp
                  colours read on dark garments.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
                <span>
                  Heavy ink stacks may hit printer limits; very saturated
                  fills might need adjustment on press.
                </span>
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-sm text-ui-fg-subtle">
                Questions about files or proofs?
              </p>
              <LocalizedClientLink
                href="/contact"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ui-fg-base underline underline-offset-4 transition hover:text-[var(--brand-secondary)]"
              >
                Contact us
                <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </LocalizedClientLink>
            </div>
          </section>

          {sectionsWithOffsets.map(({ section, cardOffset: offset }) => (
            <CmykDtfCategorySection key={section.category} section={section} cardOffset={offset} />
          ))}
        </div>
      </div>
    </>
  )
}
