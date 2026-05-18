import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { buildPolicyMetadata } from "@modules/policies/metadata"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps) {
  return buildPolicyMetadata({
    params,
    pathSegment: "returns-policy",
    title: "Returns Policy",
    description:
      "How SC PRINTS handles returns, faulty items, and custom-print orders. Eligibility, timeframes, and how to get in touch.",
  })
}

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

export default function ReturnsPolicyPage() {
  return (
    <div className="content-container py-14 small:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Policy &middot; Returns
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">
          Returns Policy
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          Custom-printed garments are made to your spec, so they can&apos;t be
          resold. Here&apos;s how we handle returns, faulty items, and the rare
          times something doesn&apos;t go to plan.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-5">
        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 01
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Change of mind
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Because custom-printed and embroidered goods are made specifically
            for you, we don&apos;t accept change-of-mind returns once
            production has started or the order has been delivered.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            If your order has not yet entered production, contact us as soon
            as possible &mdash; we&apos;ll cancel and refund where we can.
          </p>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 02
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Faulty or incorrect items
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            If your order arrives damaged, defective, or different to your
            approved proof, get in touch within{" "}
            <span className="font-medium text-ui-fg-base">7 days of delivery</span>
            {" "}so we can make it right.
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                Send clear photos showing the issue (and packaging, if the
                damage is from transit).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                Include your order number and a short description of the
                problem.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                Depending on the issue we&apos;ll remake, credit, or refund
                the affected items at no cost to you.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 03
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Approved proofs &amp; custom work
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            We send a digital proof for approval before anything goes to
            print. Once a proof is signed off, the artwork, placement, sizing,
            and garment selection are locked in.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Changes after approval &mdash; or refunds requested for issues
            that match the approved proof &mdash; aren&apos;t covered under
            this policy. Please review proofs carefully before signing off.
          </p>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 04
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Sizing
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Garment sizes follow the manufacturer size guide for the brand and
            style you select &mdash; we can&apos;t accept returns for sizing
            once garments have been decorated.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            If you&apos;re unsure, ask us about a pre-production sample
            garment so you can confirm fit before we print.
          </p>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 05
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Your statutory rights
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            Nothing in this policy excludes or limits your rights under the
            Australian Consumer Law. You&apos;re entitled to a refund or
            replacement for items that aren&apos;t of acceptable quality, are
            unfit for their purpose, or don&apos;t match their description.
          </p>
        </section>
      </div>

      <div className="mx-auto mt-12 max-w-3xl">
        <div className="rounded-2xl border border-ui-border-base bg-ui-bg-subtle p-8 text-center small:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Need to report an issue?
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-ui-fg-base small:text-3xl">
            We&apos;ll come back within one business day.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ui-fg-subtle">
            Send through your order number and photos of the issue and
            we&apos;ll get a remake, credit, or refund moving as quickly as we
            can.
          </p>
          <div className="mt-7 flex justify-center">
            <LocalizedClientLink
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Contact support
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
