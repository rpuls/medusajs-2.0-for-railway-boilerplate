import { Metadata } from "next"

import JoinForm from "@modules/group-order/components/join-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getGroupOrderByToken } from "@lib/data/group-order"

export const metadata: Metadata = {
  title: "Join group order",
  description: "Submit your size for a SC PRINTS group order.",
  robots: { index: false, follow: false },
}

type RouteParams = { countryCode: string; token: string }

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

export default async function GroupOrderJoinPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { token } = await params
  const data = await getGroupOrderByToken(token)

  if (!data) {
    return (
      <div className="content-container py-14 small:py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]/70">
            Group order
          </p>
          <h1 className="page-title-marketing mt-3 tracking-tight">
            Group order not found
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-ui-fg-subtle">
            Double-check the link. If it&apos;s expired, reach out to whoever
            shared it.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <LocalizedClientLink
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-lg bg-[var(--brand-secondary)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              Contact support
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    )
  }

  const { group_order, participants, design_preview, product_preview } = data
  const preferredSizes = product_preview?.available_sizes ?? []

  return (
    <div className="content-container max-w-3xl py-12">
      <section className="rounded-2xl border border-ui-border-base bg-white p-6 shadow-sm small:p-8">
        <header className="border-l-4 border-[var(--brand-secondary)] pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            {group_order.organisation_name ?? "Group order"}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ui-fg-base small:text-3xl">
            {group_order.title}
          </h1>
          {group_order.owner_name ? (
            <p className="mt-2 text-sm text-ui-fg-subtle">
              Organised by{" "}
              <span className="font-semibold text-ui-fg-base">
                {group_order.owner_name}
              </span>
            </p>
          ) : null}
          {group_order.deadline_at ? (
            <p className="mt-1 text-sm text-ui-fg-subtle">
              Submit by{" "}
              <span className="font-semibold text-ui-fg-base">
                {new Date(group_order.deadline_at).toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </p>
          ) : null}
        </header>

        {group_order.notes ? (
          <p className="mt-5 whitespace-pre-wrap rounded-xl bg-ui-bg-subtle px-4 py-3 text-sm leading-relaxed text-ui-fg-base">
            {group_order.notes}
          </p>
        ) : null}

        {(design_preview?.thumbnail_url || product_preview?.thumbnail) ? (
          <div className="mt-6 grid grid-cols-1 gap-4 small:grid-cols-2">
            {design_preview?.thumbnail_url ? (
              <figure className="overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design_preview.thumbnail_url}
                  alt={design_preview.name ?? "Design preview"}
                  className="block w-full"
                />
                <figcaption className="px-3 py-2 text-xs text-ui-fg-subtle">
                  Design{design_preview.name ? ` · ${design_preview.name}` : ""}
                </figcaption>
              </figure>
            ) : null}
            {product_preview?.thumbnail ? (
              <figure className="overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-subtle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product_preview.thumbnail}
                  alt={product_preview.title ?? "Garment"}
                  className="block w-full"
                />
                <figcaption className="px-3 py-2 text-xs text-ui-fg-subtle">
                  {product_preview.title ?? "Garment"}
                </figcaption>
              </figure>
            ) : null}
          </div>
        ) : null}

        <hr className="my-6 border-ui-border-base" />

        {group_order.status !== "open" ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            This group order is no longer accepting submissions.
          </div>
        ) : (
          <JoinForm token={token} sizeOptions={preferredSizes} />
        )}
      </section>

      {participants.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-ui-border-base bg-white p-6 shadow-sm small:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Crew &middot; {participants.length} joined
          </p>
          <h2 className="mt-2 text-lg font-semibold text-ui-fg-base">
            Who&apos;s already in
          </h2>
          <ul className="mt-4 list-none divide-y divide-ui-border-base p-0">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-ui-fg-base">
                    {p.name}
                    {p.player_number ? (
                      <span className="ml-1 text-ui-fg-muted">
                        &middot; #{p.player_number}
                      </span>
                    ) : null}
                  </p>
                  {p.custom_notes ? (
                    <p className="text-xs text-ui-fg-subtle">{p.custom_notes}</p>
                  ) : null}
                </div>
                <span className="text-sm font-medium text-ui-fg-base">
                  Size {p.size_label}
                  {p.quantity > 1 ? ` × ${p.quantity}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
