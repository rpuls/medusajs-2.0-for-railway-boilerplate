import { Metadata } from "next"

import JoinForm from "@modules/group-order/components/join-form"
import { getGroupOrderByToken } from "@lib/data/group-order"

export const metadata: Metadata = {
  title: "Join group order",
  description: "Submit your size for a SC PRINTS group order.",
  robots: { index: false, follow: false },
}

type RouteParams = { countryCode: string; token: string }

export default async function GroupOrderJoinPage({
  params,
}: {
  params: Promise<RouteParams>
}) {
  const { token } = await params
  const data = await getGroupOrderByToken(token)

  if (!data) {
    return (
      <div className="content-container py-12 max-w-2xl">
        <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--brand-primary)]">
            Group order not found
          </h1>
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Double-check the link. If it&apos;s expired, reach out to whoever
            shared it.
          </p>
        </div>
      </div>
    )
  }

  const { group_order, participants, design_preview, product_preview } = data
  const preferredSizes = product_preview?.available_sizes ?? []

  return (
    <div className="content-container py-12 max-w-3xl">
      <div className="rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
          {group_order.organisation_name ?? "Group order"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--brand-primary)]">
          {group_order.title}
        </h1>
        {group_order.owner_name ? (
          <p className="mt-1 text-sm text-ui-fg-subtle">
            Organised by {group_order.owner_name}
          </p>
        ) : null}
        {group_order.deadline_at ? (
          <p className="mt-2 text-sm text-ui-fg-subtle">
            Submit by {new Date(group_order.deadline_at).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "short" })}
          </p>
        ) : null}
        {group_order.notes ? (
          <p className="mt-4 text-sm text-ui-fg-base whitespace-pre-wrap">
            {group_order.notes}
          </p>
        ) : null}

        {(design_preview?.thumbnail_url || product_preview?.thumbnail) ? (
          <div className="mt-5 grid grid-cols-1 small:grid-cols-2 gap-4">
            {design_preview?.thumbnail_url ? (
              <figure className="overflow-hidden rounded-xl border border-[rgba(26,26,46,0.08)] bg-ui-bg-subtle">
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
              <figure className="overflow-hidden rounded-xl border border-[rgba(26,26,46,0.08)] bg-ui-bg-subtle">
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

        <hr className="my-6 border-[rgba(26,26,46,0.08)]" />

        {group_order.status !== "open" ? (
          <p className="text-sm text-rose-700">
            This group order is no longer accepting submissions.
          </p>
        ) : (
          <JoinForm token={token} sizeOptions={preferredSizes} />
        )}
      </div>

      {participants.length > 0 ? (
        <div className="mt-6 rounded-2xl border border-[rgba(26,26,46,0.1)] bg-white/95 p-6 shadow-[0_4px_40px_rgba(26,26,46,0.08)]">
          <h2 className="text-base font-semibold tracking-tight text-[var(--brand-primary)]">
            Who&apos;s already in ({participants.length})
          </h2>
          <ul className="mt-3 divide-y divide-[rgba(26,26,46,0.06)]">
            {participants.map((p) => (
              <li key={p.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-primary)]">
                    {p.name}
                    {p.player_number ? ` · #${p.player_number}` : ""}
                  </p>
                  {p.custom_notes ? (
                    <p className="text-xs text-ui-fg-subtle">{p.custom_notes}</p>
                  ) : null}
                </div>
                <span className="text-sm text-ui-fg-base">
                  Size {p.size_label}
                  {p.quantity > 1 ? ` × ${p.quantity}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
