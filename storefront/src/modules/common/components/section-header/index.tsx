import type { ReactNode } from "react"

type Props = {
  eyebrow: string
  title: string
  action?: ReactNode
  align?: "left" | "center"
  id?: string
  className?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  action,
  align = "left",
  id,
  className,
}: Props) {
  const isCenter = align === "center"

  const headerBlock = (
    <div
      className={
        isCenter
          ? "mx-auto max-w-3xl text-center"
          : "border-l-4 border-[var(--brand-secondary)] pl-4"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2 text-3xl font-semibold text-ui-fg-base"
      >
        {title}
      </h2>
    </div>
  )

  if (action && !isCenter) {
    return (
      <div
        className={
          "mb-6 flex flex-wrap items-end justify-between gap-3" +
          (className ? ` ${className}` : "")
        }
      >
        {headerBlock}
        {action}
      </div>
    )
  }

  return (
    <div className={"mb-6" + (className ? ` ${className}` : "")}>
      {headerBlock}
      {action && isCenter ? (
        <div className="mt-6 flex justify-center">{action}</div>
      ) : null}
    </div>
  )
}
