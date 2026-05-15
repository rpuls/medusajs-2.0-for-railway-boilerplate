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
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
          Group order
        </p>
        <h1 className="text-2xl-semi">
          Set up a group order from &quot;{design.name}&quot;
        </h1>
        <p className="mt-2 text-base-regular">
          We&apos;ll save this design as the base, then generate a public share
          link your team can use to submit their sizes. When everyone&apos;s
          in, you click <strong>Convert to cart</strong> and check out as a
          single order.
        </p>
      </div>
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
