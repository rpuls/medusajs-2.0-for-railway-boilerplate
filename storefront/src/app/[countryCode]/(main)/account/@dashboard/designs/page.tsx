import { Metadata } from "next"

import DesignsGrid from "@modules/account/components/designs-grid"
import { listMyDesigns } from "@lib/data/designs"

export const metadata: Metadata = {
  title: "My designs",
  description: "Saved designs you can re-edit and re-order anytime.",
}

export default async function DesignsPage() {
  const { designs } = await listMyDesigns()

  return (
    <div className="w-full" data-testid="designs-page-wrapper">
      <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Saved work
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          My designs
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
          Designs you&apos;ve saved from the customizer. Re-open any one to
          tweak it or send it back to the cart.
        </p>
      </header>
      <DesignsGrid designs={designs} />
    </div>
  )
}
