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
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My designs</h1>
        <p className="text-base-regular">
          Designs you&apos;ve saved from the customizer. Re-open any one to tweak it
          or send it back to the cart.
        </p>
      </div>
      <DesignsGrid designs={designs} />
    </div>
  )
}
