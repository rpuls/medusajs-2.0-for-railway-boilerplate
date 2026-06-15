import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { stories } from "@lib/data/stories"
import StorySubmitForm from "@modules/community/components/story-submit-form"

export const metadata: Metadata = {
  title: "Câu chuyện của mình | KIN STORE",
  description:
    "Những câu chuyện thật từ cộng đồng transmasculine Việt Nam — hành trình, phong cách, và cảm giác được là chính mình.",
}

export default function CauChuyenPage() {
  return (
    <div className="max-w-kin mx-auto px-5 md:px-12 py-12 md:py-20">
      {/* Header */}
      <div className="max-w-2xl mb-14">
        <p className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant mb-4">
          Cộng đồng
        </p>
        <h1 className="font-hanken text-4xl md:text-5xl font-bold text-kin-primary tracking-tight mb-5">
          Câu chuyện của mình
        </h1>
        <p className="font-vietnam text-base md:text-lg text-kin-on-surface-variant leading-relaxed">
          Không ai kể câu chuyện của bạn tốt hơn chính bạn. Đây là không gian
          của những người đã, đang, và sẽ tìm thấy chính mình — qua quần áo,
          qua gương, qua từng ngày nhỏ.
        </p>
      </div>

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {stories.map((story) => (
          <LocalizedClientLink
            key={story.slug}
            href={`/cau-chuyen/${story.slug}`}
            className="group block"
          >
            <article className="border border-kin-warm-grey rounded-2xl p-8 h-full flex flex-col gap-4 hover:border-kin-primary hover:shadow-sm transition-all">
              <div className="flex gap-2 flex-wrap">
                {story.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-hanken font-semibold uppercase tracking-wider text-kin-on-surface-variant bg-kin-beige px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-hanken text-xl font-bold text-kin-primary leading-snug group-hover:underline underline-offset-2">
                {story.title}
              </h2>
              <p className="font-vietnam text-base text-kin-on-surface-variant leading-relaxed flex-1">
                {story.excerpt}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-kin-warm-grey">
                <span className="font-hanken text-sm font-semibold text-kin-primary">
                  {story.author}, {story.authorAge} tuổi — {story.city}
                </span>
                <span className="font-vietnam text-xs text-kin-on-surface-variant">
                  {new Date(story.date).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </article>
          </LocalizedClientLink>
        ))}
      </div>

      {/* Form chia sẻ */}
      <div className="bg-kin-primary/5 border border-kin-primary/20 rounded-2xl p-8 md:p-12 max-w-2xl mx-auto">
        <h2 className="font-hanken text-2xl font-bold text-kin-primary mb-2">
          Bạn muốn chia sẻ câu chuyện của mình?
        </h2>
        <p className="font-vietnam text-base text-kin-on-surface-variant mb-8 leading-relaxed">
          Bạn có thể ẩn danh hoàn toàn. Chúng tôi sẽ liên hệ hỏi ý kiến trước khi đăng.
        </p>
        <StorySubmitForm />
      </div>
    </div>
  )
}
