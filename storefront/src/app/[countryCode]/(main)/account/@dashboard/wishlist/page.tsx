import { Metadata } from "next"

import WishlistGrid from "@modules/account/components/wishlist-grid"
import { listMyWishlist } from "@lib/data/wishlist"

export const metadata: Metadata = {
  title: "My wishlist",
  description: "Products you've bookmarked to come back to.",
}

export default async function WishlistPage() {
  const { items } = await listMyWishlist()

  return (
    <div className="w-full" data-testid="wishlist-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My wishlist</h1>
        <p className="text-base-regular">
          Products you&apos;ve saved for later. Open any one to customise it or
          add it to your cart.
        </p>
      </div>
      <WishlistGrid items={items} />
    </div>
  )
}
