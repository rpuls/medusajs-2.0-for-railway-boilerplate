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

  const compressionLevel = (product.metadata?.compression_level as string) || null

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
      label: "Hướng dẫn mặc an toàn",
      content: (
        <div className="font-vietnam text-base text-kin-on-surface-variant leading-relaxed space-y-4">
          {compressionLevel && (
            <div className={clx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-2",
              {
                "bg-green-50 text-green-700": compressionLevel === "light",
                "bg-yellow-50 text-yellow-700": compressionLevel === "medium",
                "bg-red-50 text-red-700": compressionLevel === "strong",
              }
            )}>
              <span className={clx("w-2 h-2 rounded-full", {
                "bg-green-500": compressionLevel === "light",
                "bg-yellow-500": compressionLevel === "medium",
                "bg-red-500": compressionLevel === "strong",
              })} />
              {compressionLevel === "light" && "Compression nhẹ — mặc cả ngày"}
              {compressionLevel === "medium" && "Compression vừa — khuyến nghị 6–8 tiếng"}
              {compressionLevel === "strong" && "Compression mạnh — tối đa 6 tiếng"}
            </div>
          )}
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-kin-primary font-bold shrink-0">①</span>
              <span><strong>Giới hạn thời gian:</strong> Không mặc quá 8 tiếng liên tục. Tháo ra để cơ thể nghỉ ngơi ít nhất 30 phút trước khi mặc lại.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-kin-primary font-bold shrink-0">②</span>
              <span><strong>Không mặc khi ngủ:</strong> Việc mặc binder khi ngủ có thể ảnh hưởng đến hô hấp và gây tổn thương xương sườn về lâu dài.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-kin-primary font-bold shrink-0">③</span>
              <span><strong>Tháo ra ngay nếu:</strong> Cảm thấy khó thở, đau ngực, tê tay hoặc chóng mặt. Đây là dấu hiệu sản phẩm quá chật hoặc mặc quá lâu.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-kin-primary font-bold shrink-0">④</span>
              <span><strong>Không tập thể thao cường độ cao</strong> khi đang mặc binder loại strong. Với hoạt động vận động, chọn loại compression nhẹ hơn.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-kin-primary font-bold shrink-0">⑤</span>
              <span><strong>Chọn đúng size:</strong> Binder quá chật không hiệu quả hơn — chỉ gây hại. Tham khảo{" "}
                <a href="/vn/chon-size" className="text-kin-primary underline underline-offset-2 hover:opacity-70">
                  hướng dẫn chọn size
                </a>{" "}của chúng tôi.
              </span>
            </li>
          </ul>
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
