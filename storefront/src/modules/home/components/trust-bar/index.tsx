const TrustBar = () => {
  const items = [
    { icon: "autorenew", title: "Đổi size dễ dàng", desc: "Miễn phí cho lần đầu tiên." },
    { icon: "inventory_2", title: "Đóng gói kín đáo", desc: "Bảo vệ sự riêng tư của bạn." },
    { icon: "support_agent", title: "Tư vấn riêng tư", desc: "Hỗ trợ 1-1 tận tình." },
    { icon: "local_shipping", title: "Giao hàng toàn quốc", desc: "Nhanh chóng và an toàn." },
  ]

  return (
    <section className="py-16 bg-kin-surface border-t border-kin-outline-variant">
      <div className="max-w-kin mx-auto px-kin-desktop">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-kin-outline-variant">
          {items.map((item) => (
            <div key={item.title} className="px-4">
              <span className="material-symbols-outlined text-4xl text-kin-forest mb-4 block" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                {item.icon}
              </span>
              <h4 className="font-hanken text-xs font-semibold text-kin-primary uppercase tracking-widest mb-2">
                {item.title}
              </h4>
              <p className="font-vietnam text-sm text-kin-on-surface-variant">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrustBar
