import Image from "next/image"
import Link from "next/link"

const CommunitySection = () => {
  return (
    <section className="py-12 md:py-16 max-w-kin mx-auto px-5 md:px-12">
      <div className="relative w-full h-[55vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6Qk7D57kz0UcCY3zf58g-fvrmbGcsEZfgL3t2MC1zqh-mHmiq3Yh_O9BgvHe0rfLY43-SvpGnZ0XQI7rb7Zm-r0UuE8K70KlK-w_7GKlt8hCvy0AWtnMEjBkJL5uVNz5oZ3eUIVZxMwKiqn_gQu3JR7laVcMX5hXqQTidFg8i4fBcZ-7iKE8LGSIP5wf8nFJ8xnvEqakmrwwsKTb80tzHONyogETcKkqmNh0ytuFloEe83Nnu-TF2TLpLsuMeBqz_2f5jWTEo7i_1"
          alt="Câu chuyện cộng đồng KIN STORE"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <p className="font-hanken text-sm font-semibold text-white uppercase tracking-widest mb-4">
            Câu chuyện cộng đồng
          </p>
          <h2 className="font-hanken text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
            KIN STORE ĐỒNG HÀNH CÙNG BẠN
          </h2>
          <Link
            href="/vn/blog"
            className="inline-block bg-transparent text-white px-8 py-4 font-hanken text-sm font-semibold uppercase tracking-widest border border-white hover:bg-white hover:text-kin-primary transition-colors"
          >
            Đọc nhật ký
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CommunitySection
