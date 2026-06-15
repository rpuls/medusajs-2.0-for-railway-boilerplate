import { Metadata } from "next"
import { notFound } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getStory } from "@lib/data/stories"

export const dynamic = "force-dynamic"

type Props = {
  params: { slug: string; countryCode: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = getStory(params.slug)
  if (!story) return {}
  return {
    title: `${story.title} | KIN STORE`,
    description: story.excerpt,
  }
}

export default function StoryPage({ params }: Props) {
  const story = getStory(params.slug)
  if (!story) return notFound()

  const paragraphs = story.content.split("\n\n").filter(Boolean)

  return (
    <div className="max-w-kin mx-auto px-5 md:px-12 py-12 md:py-20">
      {/* Breadcrumb */}
      <div className="font-hanken text-xs font-semibold uppercase tracking-widest text-kin-on-surface-variant mb-10 flex gap-2">
        <LocalizedClientLink href="/" className="hover:text-kin-primary transition-colors">
          Trang chủ
        </LocalizedClientLink>
        <span>/</span>
        <LocalizedClientLink href="/cau-chuyen" className="hover:text-kin-primary transition-colors">
          Câu chuyện
        </LocalizedClientLink>
        <span>/</span>
        <span className="text-kin-primary truncate max-w-[200px]">{story.title}</span>
      </div>

      <div className="max-w-2xl">
        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-6">
          {story.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-hanken font-semibold uppercase tracking-wider text-kin-on-surface-variant bg-kin-beige px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-hanken text-3xl md:text-4xl font-bold text-kin-primary leading-tight mb-6">
          {story.title}
        </h1>

        {/* Author */}
        <div className="flex items-center gap-3 pb-8 mb-8 border-b border-kin-warm-grey">
          <div className="w-10 h-10 rounded-full bg-kin-primary/10 flex items-center justify-center font-hanken font-bold text-kin-primary text-sm">
            {story.author[0]}
          </div>
          <div>
            <p className="font-hanken text-sm font-semibold text-kin-primary">
              {story.author}, {story.authorAge} tuổi — {story.city}
            </p>
            <p className="font-vietnam text-xs text-kin-on-surface-variant">
              {new Date(story.date).toLocaleDateString("vi-VN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="font-vietnam text-base md:text-lg text-kin-on-surface leading-relaxed space-y-5">
          {paragraphs.map((para, i) => {
            // Bold text marked with **...**
            const parts = para.split(/\*\*(.*?)\*\*/g)
            return (
              <p key={i}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            )
          })}
        </div>

        {/* Back */}
        <div className="mt-14 pt-8 border-t border-kin-warm-grey">
          <LocalizedClientLink
            href="/cau-chuyen"
            className="inline-flex items-center gap-2 font-hanken text-sm font-semibold text-kin-on-surface-variant hover:text-kin-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Đọc thêm câu chuyện khác
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
