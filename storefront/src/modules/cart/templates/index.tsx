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
  return (
    <div className="py-10 small:py-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <div className="grid grid-cols-1 gap-8 small:grid-cols-[minmax(0,1fr)_360px] small:gap-x-10">
            <div className="flex flex-col gap-y-6 rounded-2xl border border-ui-border-base bg-ui-bg-base p-5 small:p-6">
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
