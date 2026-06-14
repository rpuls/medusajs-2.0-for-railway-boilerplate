import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative w-full h-[88vh] min-h-[600px] flex items-end pb-16 md:pb-24">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzMw_Jt-XVH6ErbqUJP0NtGo6PGxOkXPDnkgWRHU7dLEMydXnBZaE35zYhz8R7iYs2ngNKYYguYTXswYRVZU4PBN4yH6DdcyTqb5U0iTQQOHhglCU7iMjrFUASJ43JyPAQZxbCWwuYjpAcldT_E7j47t8vpqCFaU7etAGkyTom4cMrlb1JIwQvbcCEwvX0w2JaBWBJytkAsHdlXTZtnV1Rkx5CDh2s8HdBSrvRAw1dY84p2wA5OTYtRiYot4gFaVYjJnw7NxwsIiHg"
          alt="KIN STORE - Tự tin là chính mình"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/10" />
      </div>

      <div className="relative w-full max-w-kin mx-auto px-5 md:px-12 z-10 flex flex-col md:max-w-[55%]">
        <h1 className="font-hanken text-5xl md:text-7xl font-extrabold text-white mb-4 leading-[1.05] tracking-tight">
          ĐÚNG VỚI BẠN
        </h1>
        <p className="font-vietnam text-lg md:text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
          Thoải mái và tự tin trong cơ thể của chính mình.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <LocalizedClientLink
            href="/collections/binder"
            className="bg-kin-primary text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest text-center hover:bg-kin-forest transition-colors border border-kin-primary"
          >
            Khám phá binder
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/store?category=size-guide"
            className="bg-transparent text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest text-center border border-white hover:bg-white hover:text-kin-primary transition-colors"
          >
            Tìm size của bạn
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default Hero
