import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Row = {
  name: string
  handle: string
  compression: string
  use: string
  best: string
}

const rows: Row[] = [
  {
    name: "Nịt lửng",
    handle: "nit-lung-co-gen",
    compression: "Nhẹ – vừa",
    use: "Mặc hằng ngày, thoáng mát",
    best: "Người mới bắt đầu",
  },
  {
    name: "Binder Chui",
    handle: "binder-chui",
    compression: "Vừa – cao",
    use: "Định hình rõ, mặc đi học/đi làm",
    best: "Dùng thường xuyên",
  },
  {
    name: "Binder Khoá",
    handle: "binder-khoa",
    compression: "Cao",
    use: "Dễ mặc/cởi, định hình tối đa",
    best: "Cần mức nén cao",
  },
  {
    name: "Ba lỗ dài kèm nịt",
    handle: "ba-lo-dai-kem-nit",
    compression: "Vừa",
    use: "Kết hợp áo + nịt, tiện lợi",
    best: "Mặc liền mạch",
  },
]

const BinderCompare = () => {
  return (
    <section className="max-w-kin mx-auto px-kin-mobile md:px-kin-desktop py-16">
      <h2 className="font-hanken text-2xl md:text-3xl font-semibold text-kin-primary mb-3">
        Chọn binder phù hợp với bạn
      </h2>
      <p className="font-vietnam text-base text-kin-on-surface-variant mb-10 max-w-xl">
        So sánh nhanh các dòng binder theo mức nén và nhu cầu sử dụng.
      </p>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-kin-primary">
              {["Sản phẩm", "Mức nén", "Phù hợp", "Dành cho", ""].map((h) => (
                <th
                  key={h}
                  className="text-left py-4 pr-6 font-hanken text-xs font-semibold text-kin-primary uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.handle}
                className="border-b border-kin-outline-variant"
              >
                <td className="py-5 pr-6 font-hanken text-sm font-semibold text-kin-primary">
                  {r.name}
                </td>
                <td className="py-5 pr-6 font-vietnam text-sm text-kin-on-surface-variant">
                  {r.compression}
                </td>
                <td className="py-5 pr-6 font-vietnam text-sm text-kin-on-surface-variant">
                  {r.use}
                </td>
                <td className="py-5 pr-6 font-vietnam text-sm text-kin-on-surface-variant">
                  {r.best}
                </td>
                <td className="py-5">
                  <LocalizedClientLink
                    href={`/products/${r.handle}`}
                    className="font-hanken text-xs font-semibold text-kin-forest hover:underline whitespace-nowrap flex items-center gap-1"
                  >
                    Xem
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </LocalizedClientLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default BinderCompare
