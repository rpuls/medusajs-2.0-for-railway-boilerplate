"use client"

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCartDrawer } from "../../context/cart-context"
import { HttpTypes } from "@medusajs/types"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

type CartActionsProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const CartActions = ({ cart }: CartActionsProps) => {
  const { closeCart } = useCartDrawer()
  const { t } = useTranslation()
  const step = getCheckoutStep(cart)

  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-border-base">
      <LocalizedClientLink
        href="/cart"
        onClick={closeCart}
        className="w-full"
      >
        <Button
          variant="secondary"
          className="w-full bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
        >
          {t("cart.reviewOrder")}
        </Button>
      </LocalizedClientLink>
      <LocalizedClientLink
        href={`/checkout?step=${step}`}
        onClick={closeCart}
        className="w-full"
      >
        <Button className="w-full bg-primary text-white hover:bg-primary-hover">
          {t("cart.checkout")}
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default CartActions

