import Link from "next/link"

const CampaignBanner = () => {
  return (
    <section className="w-full bg-kin-forest text-white py-24 my-12">
      <div className="max-w-kin mx-auto px-kin-desktop text-center">
        <h2 className="font-hanken text-5xl font-bold mb-6 tracking-tight leading-tight">
          Đồng hành trong mọi chuyển động
        </h2>
        <p className="font-vietnam text-lg text-green-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          Thiết kế dựa trên sự thấu hiểu cơ thể, mang lại cảm giác thoải mái tuyệt đối mà không cần thỏa hiệp về hiệu quả nén.
        </p>
        <Link
          href="/vn/store"
          className="inline-block bg-transparent text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest border border-white hover:bg-white hover:text-kin-forest transition-colors"
        >
          Tìm hiểu thêm về công nghệ
        </Link>
      </div>
    </section>
  )
}

export default CampaignBanner
