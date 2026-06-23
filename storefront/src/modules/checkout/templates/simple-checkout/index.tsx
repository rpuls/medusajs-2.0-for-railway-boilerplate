"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { useRouter, useParams } from "next/navigation"
import {
  updateCart,
  placeOrder,
  setShippingMethod,
  initiatePaymentSession,
} from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import Thumbnail from "@modules/products/components/thumbnail"

function logCheckoutError(
  stage: string,
  error: unknown,
  extra?: Record<string, unknown>
) {
  const payload =
    error instanceof Error
      ? { message: error.message, stack: error.stack, name: error.name }
      : { error }

  console.error(`[SimpleCheckout] ${stage}`, { ...payload, ...extra })
}

export default function SimpleCheckout({
  cart,
  shippingOptions,
}: {
  cart: HttpTypes.StoreCart
  shippingOptions: HttpTypes.StoreCartShippingOption[] | null
}) {
  const router = useRouter()
  const params = useParams()
  const countryCode = params.countryCode as string

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  })
  const [discreetPackaging, setDiscreetPackaging] = useState(
    cart?.metadata?.discreet_packaging === true
  )
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Khôi phục dữ liệu form đã lưu
  useEffect(() => {
    const saved = localStorage.getItem("kin_checkout_form")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setForm(
          parsed.form || { name: "", phone: "", address: "", note: "" }
        )
        if (typeof parsed.discreetPackaging === "boolean") {
          setDiscreetPackaging(parsed.discreetPackaging)
        }
      } catch {
        // ignore
      }
    }
  }, [])

  // Lưu dữ liệu form khi thay đổi
  useEffect(() => {
    localStorage.setItem(
      "kin_checkout_form",
      JSON.stringify({ form, discreetPackaging })
    )
  }, [form, discreetPackaging])

  const sortedItems = [...(cart.items || [])].sort((a, b) =>
    (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
  )

  const subtotal = cart.subtotal ?? 0

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên"
    if (!/^(0|\+84)[0-9]{8,9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Số điện thoại không hợp lệ"
    if (!form.address.trim()) e.address = "Vui lòng nhập địa chỉ"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)

    try {
      const updatedCart = await updateCart({
        email: cart.email || `guest${Date.now()}@example.com`,
        shipping_address: {
          first_name: form.name,
          last_name: "",
          address_1: form.address,
          city: "Việt Nam",
          country_code: countryCode || "vn",
          phone: form.phone,
        },
        billing_address: {
          first_name: form.name,
          last_name: "",
          address_1: form.address,
          city: "Việt Nam",
          country_code: countryCode || "vn",
          phone: form.phone,
        },
        metadata: {
          note: form.note,
          discreet_packaging: discreetPackaging,
        },
      })

      if (shippingOptions && shippingOptions.length > 0) {
        await setShippingMethod({
          cartId: updatedCart.id,
          shippingMethodId: shippingOptions[0].id,
        })
      }

      await initiatePaymentSession(updatedCart, {
        provider_id: "pp_system_default",
      })

      await placeOrder()
    } catch (err: any) {
      // NEXT_REDIRECT là navigation bình thường, không phải lỗi thật
      if (err?.digest?.startsWith("NEXT_REDIRECT")) return
      logCheckoutError("handleSubmit failed", err, {
        cartId: cart.id,
        countryCode,
      })
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a
            href={`/${countryCode}`}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </a>
          <span className="font-black text-lg text-gray-900">KIN STORE</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 text-sm">Đặt hàng</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* TRÁI — Tóm tắt đơn hàng */}
        <div className="order-2 lg:order-1">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-black text-base text-gray-900 mb-4">
              📦 Đơn hàng của bạn
            </h2>

            <div className="space-y-4">
              {sortedItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Thumbnail
                      thumbnail={item.variant?.product?.thumbnail}
                      images={item.variant?.product?.images}
                      size="square"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      x{item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-orange-500 text-sm flex-shrink-0">
                    {convertToLocale({
                      amount: item.unit_price * item.quantity,
                      currency_code: cart.currency_code,
                    })}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-5 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tạm tính</span>
                <span>
                  {convertToLocale({
                    amount: subtotal,
                    currency_code: cart.currency_code,
                  })}
                </span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-100">
                <span>Tổng cộng</span>
                <span className="text-orange-500">
                  {convertToLocale({
                    amount: subtotal,
                    currency_code: cart.currency_code,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PHẢI — Form */}
        <div className="order-1 lg:order-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-black text-base text-gray-900 mb-4">
              🚚 Thông tin giao hàng
            </h2>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors ${
                    errors.name ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Số điện thoại *"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors ${
                    errors.phone ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Địa chỉ giao hàng *"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors ${
                    errors.address ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address}
                  </p>
                )}
              </div>
              <textarea
                placeholder="Ghi chú (màu sắc, số lượng khác...)"
                value={form.note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, note: e.target.value }))
                }
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 transition-colors resize-none"
              />

              <div
                className="flex items-start gap-x-3 cursor-pointer group pt-2"
                onClick={() => setDiscreetPackaging(!discreetPackaging)}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={discreetPackaging}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDiscreetPackaging(!discreetPackaging)
                  }}
                  className={`w-5 h-5 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                    discreetPackaging
                      ? "bg-orange-500 border-orange-500"
                      : "bg-white border-gray-300 group-hover:border-orange-400"
                  }`}
                >
                  {discreetPackaging && (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Đóng gói kín đáo
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Không in tên thương hiệu hoặc nội dung đơn hàng lên bao bì
                    giao hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="font-black text-base text-gray-900 mb-4">
              💳 Phương thức thanh toán
            </h2>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-orange-500 bg-orange-50">
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">
                  Thu tiền khi nhận hàng (COD)
                </p>
                <p className="text-xs text-gray-500">
                  Kiểm tra hàng trước, thanh toán sau
                </p>
              </div>
              <span className="text-2xl">💵</span>
            </div>
          </div>

          <div className="flex justify-around text-xs text-gray-400 px-2">
            <span>✅ Kiểm tra hàng trước khi thanh toán</span>
            <span>🛡️ Bảo hành 12 tháng</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg py-4 rounded-xl transition-all active:scale-95 disabled:opacity-70 shadow-lg"
          >
            {submitting ? "Đang xử lý..." : "🛒 ĐẶT HÀNG NGAY"}
          </button>
        </div>
      </div>
    </div>
  )
}
