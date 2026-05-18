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

const NeckTagsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M16 4l-7 5v6a7 7 0 0014 0V9z" />
    <circle cx="16" cy="13" r="1.25" />
    <path d="M16 14v6" />
  </svg>
)

const FoldBagIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...iconBase} {...props}>
    <path d="M7 11l9-5 9 5v10l-9 5-9-5z" />
    <path d="M7 11l9 5 9-5M16 16v10" />
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
    id: "neck_tags",
    title: "Neck Tags",
    description: "Branded labels & care tags",
    Icon: NeckTagsIcon,
  },
  {
    id: "fold_bag",
    title: "Fold & Bag",
    description: "Retail-ready presentation",
    Icon: FoldBagIcon,
  },
  {
    id: "warehousing_fulfillment",
    title: "Warehousing & Fulfilment",
    description: "Hold, pick, pack, ship",
    Icon: WarehousingIcon,
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
]

export default function HomeCoreServicesLordicons() {
  return (
    <div className="mt-8 grid grid-cols-1 small:grid-cols-2 large:grid-cols-4 border border-ui-border-base rounded-lg overflow-hidden bg-white">
      {SERVICES.map((service, index) => {
        const { Icon } = service
        const colInLarge = index % 4
        const rowInLarge = Math.floor(index / 4)
        const colInSmall = index % 2
        return (
          <article
            key={service.id}
            className={[
              "group relative p-6 transition-colors hover:bg-ui-bg-subtle",
              "border-ui-border-base",
              colInSmall < 1 ? "small:border-r large:border-r-0" : "",
              colInLarge < 3 ? "large:border-r" : "",
              rowInLarge === 0 ? "large:border-b" : "",
              index < SERVICES.length - 1 ? "border-b small:border-b" : "",
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
