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
      <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Saved for later
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          My wishlist
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
          Products you&apos;ve saved for later. Open any one to customise it
          or add it to your cart.
        </p>
      </header>
      <WishlistGrid items={items} />
    </div>
  )
}
