"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [open, setOpen] = useState(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)
  const pathname = usePathname()

  const openCart = () => setOpen(true)
  const closeCart = () => setOpen(false)
  const toggleCart = () => setOpen((v) => !v)

  // Tự mở khi thêm sản phẩm vào giỏ
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      openCart()
    }
    itemRef.current = totalItems
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems])

  const sortedItems = [...(cartState?.items || [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={closeCart}
        />
      )}

      {/* Trigger — click để mở/đóng panel */}
      <div className="h-full z-50 relative">
        <button
          onClick={toggleCart}
          className="hover:text-ui-fg-base h-full"
          data-testid="nav-cart-link"
          aria-label="Mở giỏ hàng"
        >
          {`Giỏ (${totalItems})`}
        </button>
      </div>

      {/* Slide-in panel từ bên phải */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="nav-cart-dropdown"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-lg text-gray-900">Giỏ hàng</h3>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Đóng giỏ hàng"
          >
            ×
          </button>
        </div>

        {cartState && sortedItems.length > 0 ? (
          <>
            {/* Danh sách sản phẩm */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4"
                  data-testid="cart-item"
                >
                  <LocalizedClientLink
                    href={`/products/${item.variant?.product?.handle}`}
                    className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50"
                    onClick={closeCart}
                  >
                    <Thumbnail
                      thumbnail={item.variant?.product?.thumbnail}
                      images={item.variant?.product?.images}
                      size="square"
                    />
                  </LocalizedClientLink>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <LocalizedClientLink
                        href={`/products/${item.variant?.product?.handle}`}
                        onClick={closeCart}
                        data-testid="product-link"
                      >
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {item.title}
                        </p>
                      </LocalizedClientLink>
                      <div className="mt-1">
                        <LineItemOptions
                          variant={item.variant}
                          data-testid="cart-item-variant"
                          data-value={item.variant}
                        />
                      </div>
                      <p
                        className="text-xs text-gray-400 mt-0.5"
                        data-testid="cart-item-quantity"
                        data-value={item.quantity}
                      >
                        Số lượng: {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <DeleteButton
                        id={item.id}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        data-testid="cart-item-remove-button"
                      >
                        Xóa
                      </DeleteButton>
                      <LineItemPrice item={item} style="tight" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  Tạm tính
                  <span className="font-normal text-gray-400 text-xs ml-1">(chưa gồm thuế)</span>
                </span>
                <span
                  className="font-black text-base text-gray-900"
                  data-testid="cart-subtotal"
                  data-value={subtotal}
                >
                  {convertToLocale({
                    amount: subtotal,
                    currency_code: cartState.currency_code,
                  })}
                </span>
              </div>

              <LocalizedClientLink href="/cart" onClick={closeCart}>
                <button
                  className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                  data-testid="go-to-cart-button"
                >
                  Xem giỏ hàng
                </button>
              </LocalizedClientLink>

              <LocalizedClientLink href="/checkout" onClick={closeCart}>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3.5 rounded-xl transition-colors text-sm mt-2">
                  🛒 Đặt hàng ngay
                </button>
              </LocalizedClientLink>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="text-5xl">🛍️</div>
            <p className="text-gray-500 text-sm">Giỏ hàng của bạn đang trống.</p>
            <LocalizedClientLink href="/store" onClick={closeCart}>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                Khám phá sản phẩm
              </button>
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDropdown
