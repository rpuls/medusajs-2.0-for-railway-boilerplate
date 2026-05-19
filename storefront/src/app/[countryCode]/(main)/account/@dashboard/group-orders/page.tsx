import { Metadata } from "next"

import OwnerRoster from "@modules/group-order/components/owner-roster"
import { listMyGroupOrders } from "@lib/data/group-order"

export const metadata: Metadata = {
  title: "Group orders",
  description: "Manage group orders you've organised for clubs, teams, or businesses.",
}

export default async function GroupOrdersPage() {
  const orders = await listMyGroupOrders()

  return (
    <div className="w-full" data-testid="group-orders-wrapper">
      <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Team orders
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          Group orders
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
          Coordinate a team or workplace order &mdash; share a link, collect
          sizes, then send it to checkout in one go.
        </p>
      </header>
      <OwnerRoster orders={orders} />
    </div>
  )
}
