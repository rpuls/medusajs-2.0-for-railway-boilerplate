"use client"

import type { InstagramMediaItem } from "@lib/types/instagram"

type Props = {
  items: InstagramMediaItem[]
  profileUrl: string
  handleDisplay: string | null
}

export default function InstagramFeedStrip({
  items,
  profileUrl,
  handleDisplay,
}: Props) {
  const label = handleDisplay ? `@${handleDisplay}` : "Instagram"

  const track = [...items, ...items]

  return (
    <section className="border-t border-ui-border-base bg-ui-bg-subtle">
      <div className="content-container flex flex-wrap items-center justify-between gap-3 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-primary)]/80">
          On the gram
        </p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-[var(--brand-secondary)] transition hover:text-[var(--brand-accent)]"
        >
          Follow {label} →
        </a>
      </div>

      <div
        className="relative w-full overflow-hidden pb-4 pt-1"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        {items.length === 0 ? (
          <div className="content-container flex justify-center py-10">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-ui-border-base bg-white px-5 py-2.5 text-sm font-semibold text-ui-fg-base shadow-sm transition hover:border-[var(--brand-secondary)]/50"
            >
              <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" aria-hidden />
              Follow {label} for photos &amp; updates
            </a>
          </div>
        ) : (
          <div className="instagram-feed-track flex w-max gap-3 py-2 motion-reduce:!animate-none">
            {track.map((item, index) => (
              <a
                key={`${item.id}-${index}`}
                href={item.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base shadow-sm small:h-44 small:w-44"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Instagram CDN hostnames vary */}
                <img
                  src={item.imageUrl}
                  alt={item.alt}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                  sizes="176px"
                />
                <span className="sr-only">Open on Instagram</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
