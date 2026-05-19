import ItemsTemplate from "./items"
import Summary from "./summary"
import AggregatedTierBanner from "../components/aggregated-tier-banner"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const itemCount = cart?.items?.reduce((acc, i) => acc + (i.quantity ?? 0), 0) ?? 0
  return (
    <div className="py-10 small:py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                Your cart
              </p>
              <h1 className="page-title-catalog mt-2" data-testid="cart-page-title">
                Review &amp; checkout
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
                {itemCount === 1
                  ? "1 item in your cart — review the details and head to checkout when you're ready."
                  : `${itemCount} items in your cart — review the details and head to checkout when you're ready.`}
              </p>
            </header>
            <div className="grid grid-cols-1 gap-8 small:grid-cols-[minmax(0,1fr)_360px] small:gap-x-10">
              <div className="flex flex-col gap-y-6 rounded-2xl border border-ui-border-base bg-white p-5 small:p-6">
                {!customer && (
                  <>
                    <SignInPrompt />
                    <Divider />
                  </>
                )}
                {cart?.id ? (
                  <AggregatedTierBanner cartId={cart.id} variant="full" />
                ) : null}
                <ItemsTemplate items={cart?.items} />
              </div>
              <div className="relative">
                <div className="sticky top-24 flex flex-col gap-y-6">
                  {cart && cart.region && (
                    <Summary cart={cart as any} />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
