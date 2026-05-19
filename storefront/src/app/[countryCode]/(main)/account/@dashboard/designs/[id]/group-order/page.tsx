import { Metadata } from "next"
import { notFound } from "next/navigation"

import CreateFromDesignForm from "@modules/group-order/components/create-from-design-form"
import { getCustomer } from "@lib/data/customer"
import { getMyDesign } from "@lib/data/designs"

export const metadata: Metadata = {
  title: "Start a group order",
  description:
    "Turn this saved design into a group order — share one link, collect everyone's sizes, send it to checkout in one go.",
}

type Props = {
  params: Promise<{ id: string; countryCode: string }>
}

export default async function StartGroupOrderPage({ params }: Props) {
  const { id, countryCode } = await params

  const [design, customer] = await Promise.all([
    getMyDesign(id),
    getCustomer(),
  ])

  if (!design) {
    notFound()
  }

  return (
    <div className="w-full">
      <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Group order
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          Set up a group order from &quot;{design.name}&quot;
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
          We&apos;ll save this design as the base, then generate a public
          share link your team can use to submit their sizes. When
          everyone&apos;s in, click <strong className="font-semibold text-ui-fg-base">Convert to cart</strong>
          {" "}and check out as a single order.
        </p>
      </header>
      <CreateFromDesignForm
        countryCode={countryCode}
        design={{
          id: design.id,
          name: design.name,
          thumbnail_url: design.thumbnail_url,
          base_product_id: design.base_product_id,
          base_variant_id: design.base_variant_id,
          customizer_metadata: design.customizer_metadata as Record<string, unknown>,
        }}
        defaultEmail={customer?.email ?? ""}
        defaultName={
          customer
            ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
            : ""
        }
      />
    </div>
  )
}
