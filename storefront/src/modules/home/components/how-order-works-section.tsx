import type { SVGProps } from "react"

import SectionHeader from "@modules/common/components/section-header"
import { iconBase } from "@modules/common/icons/icon-base"

const SelectGarmentIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M11 5l-5 3v6h4v12h12V14h4V8l-5-3-3 2.5a4 4 0 01-4 0z" />
  </svg>
)

const UploadArtworkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M8 22a6 6 0 010-12 7 7 0 0113.5-1.5A5 5 0 0124 22" />
    <path d="M16 14v10" />
    <path d="M12 18l4-4 4 4" />
  </svg>
)

const PrintIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M8 12V5h16v7" />
    <rect x="5" y="12" width="22" height="10" rx="1.5" />
    <rect x="9" y="20" width="14" height="7" />
    <circle cx="23" cy="16" r="1" />
  </svg>
)

const DeliveredIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="3" y="9" width="14" height="12" rx="1" />
    <path d="M17 13h5l3 4v4h-8" />
    <circle cx="9" cy="23" r="2" />
    <circle cx="21" cy="23" r="2" />
  </svg>
)

type Step = {
  id: string
  number: string
  title: string
  description: string
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
}

const STEPS: Step[] = [
  {
    id: "select_product",
    number: "01",
    title: "Select your garment",
    description:
      "Pick from our full range of apparel — tees, hoodies, polos, workwear and more.",
    Icon: SelectGarmentIcon,
  },
  {
    id: "upload_design",
    number: "02",
    title: "Upload your artwork",
    description:
      "Send us your design. We'll prepare digital proofs for your approval.",
    Icon: UploadArtworkIcon,
  },
  {
    id: "we_print",
    number: "03",
    title: "We print in-house",
    description:
      "Production happens at our Victoria studio — screen print, embroidery, transfer or UV.",
    Icon: PrintIcon,
  },
  {
    id: "order_delivered",
    number: "04",
    title: "Delivery or pickup",
    description:
      "Australia-wide shipping or in-store pickup from our Victoria studio.",
    Icon: DeliveredIcon,
  },
]

const COLS_LARGE = 4
const COLS_SMALL = 2

export default function HowOrderWorksSection() {
  return (
    <section
      className="border-t border-ui-border-base bg-ui-bg-subtle py-12 small:py-16"
      aria-labelledby="how-order-works-heading"
    >
      <div className="content-container">
        <SectionHeader
          eyebrow="Ordering process"
          title="How to order custom apparel"
          id="how-order-works-heading"
        />

        <ol className="mt-8 grid list-none grid-cols-1 overflow-hidden rounded-lg border border-ui-border-base bg-white p-0 small:grid-cols-2 large:grid-cols-4">
          {STEPS.map((step, index) => {
            const { Icon } = step
            const isLastColLarge = (index + 1) % COLS_LARGE === 0
            const isLastRowLarge =
              index >= STEPS.length - (STEPS.length % COLS_LARGE || COLS_LARGE)
            const isLastColSmall = (index + 1) % COLS_SMALL === 0
            const isLastRowSmall =
              index >= STEPS.length - (STEPS.length % COLS_SMALL || COLS_SMALL)
            return (
              <li
                key={step.id}
                className={[
                  "group relative overflow-hidden p-6 transition-colors hover:bg-ui-bg-subtle/50",
                  "border-ui-border-base",
                  index < STEPS.length - 1 ? "border-b small:border-b-0" : "",
                  !isLastColSmall ? "small:border-r large:border-r-0" : "",
                  !isLastRowSmall ? "small:border-b large:border-b-0" : "",
                  !isLastColLarge ? "large:border-r" : "",
                  !isLastRowLarge ? "large:border-b" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-3 select-none text-[5rem] font-semibold leading-none tracking-tighter text-[var(--brand-secondary)]/10 transition-colors group-hover:text-[var(--brand-secondary)]/25"
                >
                  {step.number}
                </span>
                <Icon className="relative text-ui-fg-base transition-colors group-hover:text-[var(--brand-secondary)]" />
                <p className="relative mt-4 text-sm font-semibold uppercase tracking-wide text-ui-fg-base">
                  {step.title}
                </p>
                <p className="relative mt-2 text-xs text-ui-fg-subtle">
                  {step.description}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
