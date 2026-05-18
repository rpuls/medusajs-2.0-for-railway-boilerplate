import { buildPolicyMetadata } from "@modules/policies/metadata"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps) {
  return buildPolicyMetadata({
    params,
    pathSegment: "privacy-policy",
    title: "Privacy Policy",
    description:
      "How SC PRINTS collects, uses, and manages personal information in line with the Australian Privacy Principles.",
  })
}

export default function PrivacyPolicyPage() {
  return (
    <div className="content-container py-14 small:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Policy &middot; Privacy
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">Privacy Policy</h1>
        <p className="mx-auto mt-4 text-xs font-medium uppercase tracking-[0.12em] text-ui-fg-muted">
          Last updated &middot; April 20, 2026
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          We respect your privacy and are committed to protecting your personal
          information. This policy explains how we collect, use, and manage
          your data in accordance with the Australian Privacy Principles.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-5">
        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 01
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Who we are
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            SC PRINTS operates in NSW, Australia.
          </p>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 02
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Information we collect
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            We collect personal information that is reasonably necessary for
            our business functions. This includes:
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Identity &amp; contact:</span>{" "}
                Name, shipping address, billing address, and email address.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Transaction data:</span>{" "}
                Details about payments and products you have purchased. We do
                not store full credit card numbers; these are handled by our
                secure payment processors.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">User content:</span>{" "}
                Artwork files, designs, or images you upload for printing.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 03
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            How we use your information
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            We use your information to provide our services effectively,
            including:
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Order fulfilment:</span>{" "}
                Processing payments, printing your designs, and delivering your
                products.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Support:</span>{" "}
                Responding to your inquiries or resolving order issues.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Marketing:</span>{" "}
                Sending updates or promotions, provided you have opted in. You
                can unsubscribe at any time.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Security:</span>{" "}
                Preventing fraudulent transactions and protecting our website.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 04
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Disclosure of information
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            We do not sell your personal information. However, we may share
            data with trusted third parties to run our business:
          </p>
          <ul className="mt-4 list-none space-y-3 p-0 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Service providers:</span>{" "}
                Delivery couriers, payment gateways (e.g. Stripe, PayPal), and
                email marketing platforms.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Professional advisers:</span>{" "}
                Lawyers, auditors, or insurers if required.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-secondary)]" />
              <span>
                <span className="font-medium text-ui-fg-base">Overseas disclosure:</span>{" "}
                Some digital service providers (web hosting, analytics) may
                store data on servers outside Australia (e.g. USA, Singapore).
                By using our site, you consent to this transfer.
              </span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Section 05
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
            Data security &amp; retention
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
            <p>
              We implement industry-standard security measures, including SSL
              encryption, to protect your data from unauthorised access or
              loss.
            </p>
            <p>
              We retain your personal information only for as long as necessary
              to fulfil the purposes we collected it for, including any legal,
              accounting, or reporting requirements.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
