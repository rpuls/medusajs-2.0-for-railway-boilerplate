"use client"

import { useState } from "react"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

type State = "idle" | "loading" | "success" | "error"

const StorySubmitForm = () => {
  const [state, setState] = useState<State>("idle")
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "",
    age: "",
    city: "",
    email: "",
    content: "",
    anonymous: true,
  })

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState("loading")
    setError("")
    try {
      const res = await fetch(`${BACKEND_URL}/store/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.")
        setState("error")
        return
      }
      setState("success")
    } catch {
      setError("Không thể kết nối đến server. Vui lòng thử lại sau.")
      setState("error")
    }
  }

  if (state === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
        <div className="text-4xl mb-4">💚</div>
        <h3 className="font-hanken text-xl font-bold text-kin-primary mb-2">
          Cảm ơn bạn đã chia sẻ
        </h3>
        <p className="font-vietnam text-base text-kin-on-surface-variant leading-relaxed">
          Câu chuyện của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ nếu muốn
          đăng lên — và luôn hỏi ý kiến bạn trước.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name + Age + City */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant">
            Tên <span className="text-kin-primary">*</span>
          </label>
          <input
            required
            type="text"
            placeholder="Tên thật hoặc tên giả"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="border border-kin-warm-grey rounded-xl px-4 py-3 font-vietnam text-sm focus:outline-none focus:border-kin-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant">
            Tuổi
          </label>
          <input
            type="number"
            min="13"
            max="99"
            placeholder="VD: 22"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            className="border border-kin-warm-grey rounded-xl px-4 py-3 font-vietnam text-sm focus:outline-none focus:border-kin-primary"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant">
            Thành phố
          </label>
          <input
            type="text"
            placeholder="VD: Hà Nội"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className="border border-kin-warm-grey rounded-xl px-4 py-3 font-vietnam text-sm focus:outline-none focus:border-kin-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <label className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant">
          Câu chuyện của bạn <span className="text-kin-primary">*</span>
        </label>
        <textarea
          required
          rows={8}
          placeholder="Viết thoải mái — không cần văn chương, chỉ cần thật..."
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          className="border border-kin-warm-grey rounded-xl px-4 py-3 font-vietnam text-sm focus:outline-none focus:border-kin-primary resize-none leading-relaxed"
        />
        <p className="text-xs text-kin-on-surface-variant font-vietnam">
          {form.content.length} ký tự (tối thiểu 50)
        </p>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant">
          Email liên hệ <span className="font-normal normal-case tracking-normal">(để chúng tôi hỏi ý kiến trước khi đăng)</span>
        </label>
        <input
          type="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className="border border-kin-warm-grey rounded-xl px-4 py-3 font-vietnam text-sm focus:outline-none focus:border-kin-primary"
        />
      </div>

      {/* Anonymous toggle */}
      <div
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => set("anonymous", !form.anonymous)}
      >
        <div className={`w-5 h-5 mt-0.5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
          form.anonymous ? "bg-kin-primary border-kin-primary" : "bg-white border-gray-300"
        }`}>
          {form.anonymous && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div>
          <p className="font-vietnam text-sm font-medium text-kin-on-surface">Đăng ẩn danh</p>
          <p className="font-vietnam text-xs text-kin-on-surface-variant mt-0.5">
            Tên của bạn sẽ không hiển thị công khai nếu câu chuyện được đăng.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 font-vietnam bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="bg-kin-primary text-white font-hanken text-sm font-semibold uppercase tracking-widest px-8 py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 self-start"
      >
        {state === "loading" ? "Đang gửi..." : "Gửi câu chuyện"}
      </button>
    </form>
  )
}

export default StorySubmitForm
