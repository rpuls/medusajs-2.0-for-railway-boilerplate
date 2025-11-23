"use client"

import { useCartDrawer } from "@modules/cart/context/cart-context"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

type CartButtonClientProps = {
  cart: HttpTypes.StoreCart | null
}

const CartButtonClient = ({ cart }: CartButtonClientProps) => {
  const { t } = useTranslation()
  const { openCart } = useCartDrawer()

  const totalItems =
    cart?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const total = cart?.total ?? 0

  const formattedTotal = convertToLocale({
    amount: total,
    currency_code: cart?.currency_code ?? "",
  })

  return (
    <button
      onClick={openCart}
      className="hover:text-text-primary text-text-secondary transition-colors flex items-center gap-2"
      data-testid="nav-cart-link"
      aria-label={`${t("cart.title")} (${totalItems} ${t("cartButton.items")})`}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {total > 0 ? (
        <span className="text-sm font-medium">
          {formattedTotal} <span className="text-xs opacity-75">({t("cartButton.currency")})</span>
        </span>
      ) : (
        <span className="text-sm font-medium">0.00 {t("cartButton.currency")}</span>
      )}
    </button>
  )
}

export default CartButtonClient

