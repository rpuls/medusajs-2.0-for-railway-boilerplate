import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const categories = [
  {
    title: "Binder",
    desc: "Định hình ngực an toàn, thoải mái",
    href: "/collections/binder",
    image:
      "https://content.pancake.vn/2-25/2025/5/3/a3e98b0f795233ba551a5fdc3aaf837759fd653e.jpg",
  },
  {
    title: "Thời trang",
    desc: "Sơ mi, quần âu, áo form nam",
    href: "/collections/thoi-trang",
    image:
      "https://content.pancake.vn/2-25/2025/6/6/65b9bc2e8b78a60f7c9bb35250def253d9b8c0b5.jpg",
  },
]

const CategoryGrid = () => {
  return (
    <section className="max-w-kin mx-auto px-5 md:px-12 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {categories.map((cat) => (
          <LocalizedClientLink
            key={cat.href}
            href={cat.href}
            className="group block relative aspect-[3/4] md:aspect-[4/3] overflow-hidden"
          >
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8 md:p-10">
              <h3 className="font-hanken text-3xl md:text-4xl font-bold text-white tracking-tight">
                {cat.title}
              </h3>
              <p className="font-vietnam text-sm md:text-base text-white/85 mt-2">
                {cat.desc}
              </p>
              <span className="font-hanken text-sm font-semibold text-white uppercase tracking-widest mt-4 inline-flex items-center gap-1">
                Khám phá
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </span>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}

export default CategoryGrid
