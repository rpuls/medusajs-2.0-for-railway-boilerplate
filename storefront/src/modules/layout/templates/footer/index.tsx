import LocalizedClientLink from "@modules/common/components/localized-client-link"

const footerLinks = {
  shop: {
    title: "Mua sắm",
    links: [
      { label: "Binder", href: "/collections/binder" },
      { label: "Thời trang", href: "/collections/thoi-trang" },
      { label: "Tất cả sản phẩm", href: "/store" },
    ],
  },
  support: {
    title: "Hỗ trợ",
    links: [
      { label: "Hướng dẫn chọn size", href: "/store?category=size-guide" },
      { label: "Chính sách đổi size", href: "/doi-tra" },
      { label: "Câu hỏi thường gặp", href: "/faq" },
    ],
  },
}

export default async function Footer() {
  return (
    <footer className="w-full bg-kin-surface-container border-t border-kin-outline-variant">
      <div className="max-w-kin mx-auto px-5 md:px-12 py-14">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Brand + contact */}
          <div className="flex flex-col gap-4 max-w-sm">
            <LocalizedClientLink
              href="/"
              className="font-hanken text-2xl font-bold tracking-tighter text-kin-primary"
            >
              KIN STORE
            </LocalizedClientLink>
            <p className="font-vietnam text-sm text-kin-on-surface-variant leading-relaxed">
              Thời trang định hình dành cho cộng đồng Transmasculine tại Việt
              Nam. Đồng hành cùng bạn trong mọi chuyển động.
            </p>
            <div className="flex flex-col gap-1 mt-2 font-vietnam text-sm text-kin-on-surface-variant">
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noreferrer"
                className="hover:text-kin-primary transition-colors"
              >
                Tư vấn kín đáo qua Zalo
              </a>
              <a
                href="https://m.me"
                target="_blank"
                rel="noreferrer"
                className="hover:text-kin-primary transition-colors"
              >
                Nhắn tin Messenger
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            {Object.values(footerLinks).map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <span className="font-hanken text-xs font-semibold text-kin-primary uppercase tracking-widest">
                  {col.title}
                </span>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <LocalizedClientLink
                        href={link.href}
                        className="font-vietnam text-sm text-kin-on-surface-variant hover:text-kin-primary transition-colors"
                      >
                        {link.label}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-16 pt-8 border-t border-kin-outline-variant">
          <p className="font-vietnam text-xs text-kin-on-surface-variant">
            © {new Date().getFullYear()} KIN STORE. Dành cho cộng đồng
            Transmasculine Việt Nam.
          </p>
          <div className="flex items-center gap-4 font-vietnam text-xs text-kin-on-surface-variant">
            <span>Đóng gói kín đáo</span>
            <span className="text-kin-outline-variant">·</span>
            <span>Hỗ trợ COD toàn quốc</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
