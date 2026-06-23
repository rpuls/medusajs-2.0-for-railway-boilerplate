import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hệ thống cửa hàng | KIN STORE",
  description:
    "Địa chỉ và thông tin liên hệ cửa hàng KIN STORE — 6B/B19 Nghĩa Tân, Cầu Giấy, Hà Nội.",
}

const ADDRESS = "6B/B19 Nghĩa Tân, Cầu Giấy, Hà Nội"
const PHONE_DISPLAY = "0986 688 821"
const PHONE_TEL = "0986688821"

export default function HeThongCuaHangPage() {
  return (
    <div className="max-w-kin mx-auto px-5 md:px-12 py-12 md:py-20">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant mb-4">
          Cửa hàng
        </p>
        <h1 className="font-hanken text-4xl md:text-5xl font-bold text-kin-primary tracking-tight mb-5">
          Hệ thống cửa hàng
        </h1>
        <p className="font-vietnam text-base md:text-lg text-kin-on-surface-variant leading-relaxed">
          Ghé cửa hàng KIN STORE để thử trực tiếp sản phẩm và được tư vấn tận
          tình.
        </p>
      </div>

      {/* Thông tin cửa hàng + bản đồ */}
      <div className="border border-kin-warm-grey rounded-2xl p-8 max-w-2xl">
        <h2 className="font-hanken text-xl font-bold text-kin-primary mb-4">
          KIN STORE Hà Nội
        </h2>

        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-kin-on-surface-variant text-xl leading-none mt-0.5">
              location_on
            </span>
            <p className="font-vietnam text-base text-kin-on-surface leading-relaxed">
              {ADDRESS}
            </p>
          </div>

          <a
            href={`tel:${PHONE_TEL}`}
            className="flex items-center gap-3 group"
          >
            <span className="material-symbols-outlined text-kin-on-surface-variant text-xl leading-none">
              call
            </span>
            <p className="font-vietnam text-base text-kin-on-surface group-hover:text-kin-primary transition-colors">
              {PHONE_DISPLAY}
            </p>
          </a>
        </div>

        <div className="rounded-2xl overflow-hidden border border-kin-warm-grey">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              ADDRESS
            )}&output=embed`}
            width="100%"
            height="350"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Bản đồ KIN STORE"
            className="w-full aspect-video"
          />
        </div>
      </div>
    </div>
  )
}
