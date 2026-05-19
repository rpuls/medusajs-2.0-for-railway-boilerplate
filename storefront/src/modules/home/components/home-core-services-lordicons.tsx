"use client"

import type { SVGProps } from "react"

import { iconBase } from "@modules/common/icons/icon-base"

type Service = {
  id: string
  title: string
  description: string
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element
}

const ScreenPrintIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="6" y="5" width="20" height="14" rx="1.5" />
    <path d="M9 19v5h14v-5" />
    <path d="M11 9h10M11 13h7" />
  </svg>
)

const DigitalTransferIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <rect x="4" y="6" width="13" height="16" rx="1.5" />
    <path d="M20 10h8v16h-8" />
    <path d="M14 14l4 2-4 2" />
  </svg>
)

const EmbroideryIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <circle cx="16" cy="16" r="10" />
    <path d="M22 10l-12 12" />
    <circle cx="22" cy="10" r="1.5" />
    <path d="M10 22l3-3" strokeDasharray="1.2 2" />
  </svg>
)

const WarehousingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M4 12l12-6 12 6v14H4z" />
    <rect x="10" y="16" width="5" height="10" />
    <rect x="17" y="16" width="5" height="6" />
  </svg>
)

const UvPrintingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <circle cx="16" cy="16" r="5" />
    <path d="M16 4v3M16 25v3M4 16h3M25 16h3M7.5 7.5l2 2M22.5 22.5l2 2M7.5 24.5l2-2M22.5 9.5l2-2" />
  </svg>
)

const DesignIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M5 27l4-1 14-14-3-3L6 23z" />
    <path d="M19 9l3 3" />
    <path d="M22 6l4 4-2 2-4-4z" />
  </svg>
)

const SERVICES: Service[] = [
  {
    id: "screen_print",
    title: "Screen Print",
    description: "High-volume, vibrant, durable",
    Icon: ScreenPrintIcon,
  },
  {
    id: "digital_transfer",
    title: "Digital Transfer",
    description: "Photo-quality, low minimums",
    Icon: DigitalTransferIcon,
  },
  {
    id: "embroidery",
    title: "Embroidery",
    description: "Premium, textured finish",
    Icon: EmbroideryIcon,
  },
  {
    id: "uv_printing",
    title: "UV Printing",
    description: "Hard goods & promo items",
    Icon: UvPrintingIcon,
  },
  {
    id: "design",
    title: "Design",
    description: "In-house artwork & proofs",
    Icon: DesignIcon,
  },
  {
    id: "warehousing_fulfillment",
    title: "Warehousing & Fulfilment",
    description: "Hold, pick, pack, ship",
    Icon: WarehousingIcon,
  },
]

const COLS_LARGE = 3
const COLS_TABLET = 3
const COLS_PHONE = 2

export default function HomeCoreServicesLordicons() {
  return (
    <div className="mt-8 grid grid-cols-1 phone:grid-cols-2 tablet:grid-cols-3 large:grid-cols-3 border border-ui-border-base rounded-lg overflow-hidden bg-white">
      {SERVICES.map((service, index) => {
        const { Icon } = service
        const isLastRowLarge =
          index >= SERVICES.length - (SERVICES.length % COLS_LARGE || COLS_LARGE)
        const isLastColLarge = (index + 1) % COLS_LARGE === 0
        const isLastRowTablet =
          index >= SERVICES.length - (SERVICES.length % COLS_TABLET || COLS_TABLET)
        const isLastColTablet = (index + 1) % COLS_TABLET === 0
        const isLastRowPhone =
          index >= SERVICES.length - (SERVICES.length % COLS_PHONE || COLS_PHONE)
        const isLastColPhone = (index + 1) % COLS_PHONE === 0

        return (
          <article
            key={service.id}
            className={[
              "group relative p-5 phone:p-6 transition-colors hover:bg-ui-bg-subtle",
              "border-ui-border-base",
              index < SERVICES.length - 1 ? "border-b phone:border-b-0" : "",
              !isLastColPhone ? "phone:border-r tablet:border-r-0" : "",
              !isLastRowPhone ? "phone:border-b tablet:border-b-0" : "",
              !isLastColTablet ? "tablet:border-r large:border-r-0" : "",
              !isLastRowTablet ? "tablet:border-b large:border-b-0" : "",
              !isLastColLarge ? "large:border-r" : "",
              !isLastRowLarge ? "large:border-b" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <Icon className="text-ui-fg-base transition-colors group-hover:text-[var(--brand-secondary)]" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ui-fg-base">
              {service.title}
            </p>
            <p className="mt-1 text-xs text-ui-fg-subtle">
              {service.description}
            </p>
          </article>
        )
      })}
    </div>
  )
}
