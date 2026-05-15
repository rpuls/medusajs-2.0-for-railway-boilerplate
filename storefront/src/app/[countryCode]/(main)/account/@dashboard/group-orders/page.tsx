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
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Group orders</h1>
        <p className="text-base-regular">
          Coordinate a team or workplace order — share a link, collect sizes,
          then send it to checkout in one go.
        </p>
      </div>
      <OwnerRoster orders={orders} />
    </div>
  )
}
