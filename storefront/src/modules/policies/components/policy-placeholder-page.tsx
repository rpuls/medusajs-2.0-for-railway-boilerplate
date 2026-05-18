type PolicySection = {
  heading: string
  body: string[]
}

type PolicyPlaceholderPageProps = {
  title: string
  intro: string
  sections: PolicySection[]
}

export default function PolicyPlaceholderPage({
  title,
  intro,
  sections,
}: PolicyPlaceholderPageProps) {
  return (
    <div className="content-container py-14 small:py-20">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
          Policy &middot; Placeholder
        </p>
        <h1 className="page-title-marketing mt-3 tracking-tight">{title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ui-fg-subtle small:text-lg">
          {intro}
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-3xl space-y-5">
        {sections.map((section, index) => (
          <section
            key={section.heading}
            className="rounded-2xl border border-ui-border-base bg-white p-6 small:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              Section {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ui-fg-base small:text-2xl">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ui-fg-subtle small:text-base">
              {section.body.map((paragraph, i) => (
                <p key={`${section.heading}-${i}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
