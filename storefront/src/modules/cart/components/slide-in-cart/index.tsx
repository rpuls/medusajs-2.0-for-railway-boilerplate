"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMark } from "@medusajs/icons"
import { useCartDrawer } from "../../context/cart-context"
import { HttpTypes } from "@medusajs/types"
import CartItem from "./cart-item"
import CartActions from "./cart-actions"
import EmptyCartMessage from "../../components/empty-cart-message"
import CartTotals from "@modules/common/components/cart-totals"
import { convertToLocale } from "@lib/util/money"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

type SlideInCartProps = {
  cart: HttpTypes.StoreCart | null
}

const SlideInCart = ({ cart }: SlideInCartProps) => {
  const { isOpen, closeCart } = useCartDrawer()
  const { t } = useTranslation()

  const totalItems =
    cart?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={closeCart} className="relative z-modal">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background-overlay" aria-hidden="true" />
        </Transition.Child>

        {/* Slide-in panel */}
        <div className="fixed inset-0 flex justify-end pointer-events-none">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-300"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="w-full max-w-md bg-white shadow-xl flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border-base">
                <Dialog.Title className="text-xl font-semibold text-text-primary">
                  {t("cart.title")}
                </Dialog.Title>
                <button
                  onClick={closeCart}
                  className="p-2 hover:bg-background-elevated rounded-md transition-colors"
                  aria-label="Close cart"
                >
                  <XMark className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {cart?.items?.length ? (
                  <>
                    <div className="space-y-4">
                      {cart.items
                        .sort((a, b) => {
                          return (a.created_at ?? "") > (b.created_at ?? "")
                            ? -1
                            : 1
                        })
                        .map((item) => (
                          <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* Cart Totals */}
                    <div className="mt-6 pt-6 border-t border-border-base">
                      <CartTotals totals={cart} />
                    </div>
                  </>
                ) : (
                  <EmptyCartMessage />
                )}
              </div>

              {/* Footer Actions */}
              {cart?.items?.length ? (
                <div className="px-6 py-4 border-t border-border-base bg-background-elevated">
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span className="text-text-primary">{t("cart.total")}:</span>
                      <span className="text-text-primary">
                        {convertToLocale({
                          amount: cart.total ?? 0,
                          currency_code: cart.currency_code ?? "",
                        })}
                      </span>
                    </div>
                  </div>
                  <CartActions cart={cart} />
                </div>
              ) : null}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SlideInCart

