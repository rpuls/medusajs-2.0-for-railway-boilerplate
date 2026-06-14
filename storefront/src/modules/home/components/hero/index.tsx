import Image from "next/image"
import Link from "next/link"

const Hero = () => {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex items-end pb-24">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzMw_Jt-XVH6ErbqUJP0NtGo6PGxOkXPDnkgWRHU7dLEMydXnBZaE35zYhz8R7iYs2ngNKYYguYTXswYRVZU4PBN4yH6DdcyTqb5U0iTQQOHhglCU7iMjrFUASJ43JyPAQZxbCWwuYjpAcldT_E7j47t8vpqCFaU7etAGkyTom4cMrlb1JIwQvbcCEwvX0w2JaBWBJytkAsHdlXTZtnV1Rkx5CDh2s8HdBSrvRAw1dY84p2wA5OTYtRiYot4gFaVYjJnw7NxwsIiHg"
          alt="KIN STORE - Tự tin là chính mình"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative w-full max-w-kin mx-auto px-kin-desktop z-10 flex flex-col md:w-1/2">
        <h1 className="font-hanken text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
          ĐÚNG VỚI BẠN
        </h1>
        <p className="font-vietnam text-lg text-white mb-8 max-w-lg leading-relaxed">
          Thoải mái và tự tin trong cơ thể của chính mình.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/vn/store"
            className="bg-kin-primary text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest text-center hover:bg-kin-forest transition-colors border border-kin-primary"
          >
            Khám phá binder
          </Link>
          <Link
            href="/vn/store?category=size-guide"
            className="bg-transparent text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest text-center border border-white hover:bg-white hover:text-kin-primary transition-colors"
          >
            Tìm size của bạn
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
