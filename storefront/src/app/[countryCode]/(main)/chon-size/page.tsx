import { Metadata } from "next"
import SizeFinder from "@modules/common/components/size-finder"

export const metadata: Metadata = {
  title: "Hướng dẫn chọn size | KIN STORE",
  description:
    "Tìm size binder, quần và áo sơ mi phù hợp với bạn. Nhập cân nặng và chiều cao để nhận gợi ý size từ KIN STORE.",
}

export default function ChonSizePage() {
  return (
    <div className="max-w-kin mx-auto px-5 md:px-12 py-12 md:py-20">
      <div className="max-w-3xl">
        <h1 className="font-hanken text-4xl md:text-5xl font-bold text-kin-primary tracking-tight mb-4">
          Hướng dẫn chọn size
        </h1>
        <p className="font-vietnam text-base md:text-lg text-kin-on-surface-variant mb-10 leading-relaxed">
          Chọn đúng size giúp bạn thoải mái và an toàn hơn. Chọn loại sản phẩm,
          nhập số đo, và chúng tôi sẽ gợi ý size phù hợp nhất cho bạn.
        </p>
      </div>
      <div className="max-w-3xl">
        <SizeFinder defaultType="binder" />
      </div>
    </div>
  )
}
