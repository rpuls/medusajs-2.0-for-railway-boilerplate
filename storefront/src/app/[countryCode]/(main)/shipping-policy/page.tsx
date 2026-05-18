import { buildPolicyMetadata } from "@modules/policies/metadata"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps) {
  return buildPolicyMetadata({
    params,
    pathSegment: "shipping-policy",
    title: "Shipping Policy",
    description:
      "How SC PRINTS delivers custom orders across Australia: production time, carriers, tracking, rates, and support for damaged or lost shipments.",
  })
}

export default function ShippingPolicyPage() {
  return (
    <div className="content-container py-14 small:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Policy &middot; Shipping
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">Shipping Policy</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          We take great care producing and packaging custom orders. Here&apos;s how
          we get product from our studio to your door.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-5">
        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 01
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Delivery areas
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            We ship nationwide across Australia, including all states and
            territories.
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Domestic:</span>{" "}
                Residential, business, and PO Boxes (via Australia Post).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">International:</span>{" "}
                Currently we only ship within Australia.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 02
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Processing &amp; production time
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Because items are custom-made, your order goes through a production
            phase before shipping:
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Standard production:</span>{" "}
                Typically 3&ndash;7 business days following artwork approval.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Express production:</span>{" "}
                Available for select items for an additional fee, reducing lead
                time to 1&ndash;2 business days.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Split shipments:</span>{" "}
                Orders with multiple products may occasionally ship in separate
                parcels. You&apos;ll receive unique tracking for each.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 03
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Shipping rates &amp; timeframes
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Shipping costs are calculated at checkout based on weight,
            dimensions, and destination.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-ui-border-base">
            <table className="w-full min-w-[280px] text-left text-sm text-ui-fg-subtle">
              <thead>
                <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
                  <th className="px-4 py-3 font-semibold text-ui-fg-base">Service</th>
                  <th className="px-4 py-3 font-semibold text-ui-fg-base">
                    Estimated delivery (after production)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ui-border-base">
                  <td className="px-4 py-3 font-medium text-ui-fg-base">Standard</td>
                  <td className="px-4 py-3">3&ndash;6 business days (metro) / 7&ndash;12 days (regional)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-ui-fg-base">Express</td>
                  <td className="px-4 py-3">1&ndash;3 business days (metro)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ui-fg-muted small:text-sm">
            <span className="font-medium text-ui-fg-base">Note:</span> Delivery
            timeframes are estimates provided by our carriers and are in
            addition to our production lead times.
          </p>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 04
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Carriers &amp; tracking
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <p>
              We partner with Australia Post and reputable local couriers (such
              as StarTrack or Aramex) to ensure reliable delivery.
            </p>
            <p>
              Once your order is dispatched, you&apos;ll receive a shipping
              confirmation email containing your tracking number.
            </p>
            <p>Please allow up to 24 hours for the tracking link to become active.</p>
          </div>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 05
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Damaged or lost shipments
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            We want your prints to arrive in gallery-quality condition.
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Damaged items:</span>{" "}
                Take clear photos of the packaging and product and contact us
                within 48 hours of delivery. We&apos;ll prioritise a replacement.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Lost parcels:</span>{" "}
                If tracking shows &quot;delivered&quot; but you haven&apos;t
                received it, or hasn&apos;t updated for more than 5 business
                days, reach out so we can open an investigation with the
                carrier.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 06
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Incorrect address &amp; redelivery
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Please double-check your shipping address at checkout. If a parcel
            is returned to us due to an incorrect address provided by the
            customer, a redelivery fee may apply.
          </p>
        </section>
      </div>
    </div>
  )
}
