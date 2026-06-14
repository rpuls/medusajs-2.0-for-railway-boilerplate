import Image from "next/image"
import Link from "next/link"

const SizeFinderBanner = () => {
  return (
    <section className="my-12 max-w-kin mx-auto px-kin-desktop">
      <div className="bg-kin-beige w-full flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
          <h2 className="font-hanken text-3xl font-semibold text-kin-primary mb-4 leading-tight">
            Chưa biết chọn size nào?
          </h2>
          <p className="font-vietnam text-base text-kin-on-surface-variant mb-8 max-w-md leading-relaxed">
            Việc chọn đúng kích cỡ binder là vô cùng quan trọng cho sức khỏe và sự thoải mái của bạn. Hãy để chúng tôi giúp.
          </p>
          <Link
            href="/vn/store?category=size-guide"
            className="bg-kin-primary text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest text-center self-start hover:bg-kin-forest transition-colors"
          >
            Tìm size trong 60 giây
          </Link>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-auto relative min-h-[320px]">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuANJz7Etc4xYEC-8u77MAlqX8iwfdzMjrfKt8Vq03ffd3zlE-iSrcfKI4yCxFbP_5mNe7Mlf5Z2yrdX_c5gg8BFPWvXoJ7ZpCBhrArhd4khON027d9awd8E3NoOm187qb9gXElMddxiMAuTpr8RYirQTM60JBNnwT1tqwVEur7g7GlcGXdq5M2YA0YWrrztnzfQXS8LWA6c8e2t6gSbNjpNaY9os7twWYA-naApoI3xmAGfefTPPoi7VLYSD9qtEHFD4Vrii7YsxPcn"
            alt="Hướng dẫn chọn size binder"
            fill
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}

export default SizeFinderBanner
