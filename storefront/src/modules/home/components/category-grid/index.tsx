import LocalizedClientLink from "@modules/common/components/localized-client-link"

const categories = [
  {
    title: "Binder",
    desc: "Định hình ngực an toàn, thoải mái",
    href: "/collections/binder",
    accent: "bg-kin-forest",
  },
  {
    title: "Thời trang",
    desc: "Sơ mi, quần âu, áo form nam",
    href: "/collections/thoi-trang",
    accent: "bg-kin-primary",
  },
  {
    title: "Phụ kiện",
    desc: "Túi, giày và phụ kiện đi kèm",
    href: "/collections/phu-kien",
    accent: "bg-kin-secondary",
  },
]

const CategoryGrid = () => {
  return (
    <section className="max-w-kin mx-auto px-kin-mobile md:px-kin-desktop py-16">
      <h2 className="font-hanken text-2xl md:text-3xl font-semibold text-kin-primary mb-3">
        Mua theo nhu cầu
      </h2>
      <p className="font-vietnam text-base text-kin-on-surface-variant mb-10 max-w-xl">
        Chọn đúng sản phẩm phù hợp với bạn, từ binder định hình đến thời trang
        thường ngày.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <LocalizedClientLink
            key={cat.href}
            href={cat.href}
            className="group block"
          >
            <div
              className={`${cat.accent} aspect-[4/5] flex flex-col justify-end p-8 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <h3 className="font-hanken text-2xl font-bold text-white relative z-10">
                {cat.title}
              </h3>
              <p className="font-vietnam text-sm text-white/80 mt-2 relative z-10">
                {cat.desc}
              </p>
              <span className="font-hanken text-xs font-semibold text-white uppercase tracking-widest mt-4 relative z-10 flex items-center gap-1">
                Khám phá
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
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
