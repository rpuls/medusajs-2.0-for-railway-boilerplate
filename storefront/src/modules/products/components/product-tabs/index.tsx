"use client"

import { useState } from "react"
import { clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

type TabItem = {
  label: string
  content: React.ReactNode
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const tabs: TabItem[] = [
    {
      label: "Mô tả sản phẩm",
      content: (
        <p className="font-vietnam text-base text-kin-on-surface-variant leading-relaxed whitespace-pre-line">
          {product.description ||
            "Sản phẩm được thiết kế cho cộng đồng Transmasculine với chất liệu thoải mái, an toàn và hiệu quả làm phẳng tối ưu."}
        </p>
      ),
    },
    {
      label: "Chất liệu & Hướng dẫn giặt",
      content: (
        <div className="font-vietnam text-base text-kin-on-surface-variant leading-relaxed space-y-2">
          <p>Chất liệu: {product.material || "Vải co giãn 4 chiều, thoáng khí"}</p>
          <p>
            Giặt tay hoặc giặt máy ở chế độ nhẹ với nước lạnh. Không sử dụng chất
            tẩy. Phơi khô tự nhiên, tránh ánh nắng trực tiếp.
          </p>
        </div>
      ),
    },
    {
      label: "Chính sách đổi trả",
      content: (
        <p className="font-vietnam text-base text-kin-on-surface-variant leading-relaxed">
          Đổi size miễn phí lần đầu trong vòng 7 ngày. Sản phẩm cần còn nguyên
          tem mác và chưa qua sử dụng. Đóng gói kín đáo, bảo mật thông tin khách
          hàng.
        </p>
      ),
    },
  ]

  return (
    <div className="border-t border-kin-warm-grey">
      {tabs.map((tab, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className="border-b border-kin-warm-grey">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full py-4 flex justify-between items-center text-left focus:outline-none group"
            >
              <span className="font-hanken text-sm font-semibold text-kin-primary uppercase tracking-wider">
                {tab.label}
              </span>
              <span className="material-symbols-outlined text-kin-warm-grey group-hover:text-kin-primary transition-colors">
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </button>
            <div
              className={clx("overflow-hidden transition-all", {
                "max-h-0": !isOpen,
                "max-h-96 pb-4": isOpen,
              })}
            >
              {tab.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ProductTabs
