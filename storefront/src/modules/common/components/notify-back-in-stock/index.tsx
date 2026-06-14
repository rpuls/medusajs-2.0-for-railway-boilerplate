"use client"

import { useState } from "react"
import { Button, Input } from "@medusajs/ui"

type Props = {
  productId: string
  productTitle: string
}

const NotifyBackInStock = ({ productId, productTitle }: Props) => {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      // Store locally as fallback — in production wire to Medusa product metadata or email service
      const key = `notify_${productId}`
      const existing = JSON.parse(localStorage.getItem(key) || "[]")
      if (!existing.includes(email)) {
        existing.push(email)
        localStorage.setItem(key, JSON.stringify(existing))
      }
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-vietnam">
        Chúng tôi sẽ báo bạn ngay khi <strong>{productTitle}</strong> có hàng trở lại.
      </div>
    )
  }

  return (
    <div className="bg-kin-beige/60 border border-kin-warm-grey rounded-xl p-4">
      <p className="font-hanken text-sm font-semibold text-kin-primary mb-1">
        Hết hàng tạm thời
      </p>
      <p className="font-vietnam text-sm text-kin-on-surface-variant mb-3">
        Để lại email — chúng tôi sẽ thông báo ngay khi có hàng.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border border-kin-warm-grey rounded-lg px-3 py-2 text-sm font-vietnam focus:outline-none focus:border-kin-primary"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-kin-primary text-white font-hanken text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "..." : "Báo tôi"}
        </button>
      </form>
    </div>
  )
}

export default NotifyBackInStock
