import Image from "next/image"
import Link from "next/link"

const SizeFinderBanner = () => {
  return (
    <section className="py-8 md:py-12 max-w-kin mx-auto px-5 md:px-12">
      <div className="bg-kin-beige w-full flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
          <h2 className="font-hanken text-3xl md:text-4xl font-bold text-kin-primary mb-4 leading-tight tracking-tight">
            Chưa biết chọn size nào?
          </h2>
          <p className="font-vietnam text-base md:text-lg text-kin-on-surface-variant mb-8 max-w-md leading-relaxed">
            Chọn đúng size binder giúp bạn thoải mái và an toàn hơn. Trả lời vài
            câu hỏi để tìm size phù hợp.
          </p>
          <Link
            href="/chon-size"
            className="bg-kin-primary text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest text-center self-start hover:bg-kin-forest transition-colors"
          >
            Tìm size trong 60 giây
          </Link>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-auto relative min-h-[320px]">
          <Image
            src="https://content.pancake.vn/2-25/2025/5/3/a3e98b0f795233ba551a5fdc3aaf837759fd653e.jpg"
            alt="Chọn size binder phù hợp"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}

export default SizeFinderBanner
