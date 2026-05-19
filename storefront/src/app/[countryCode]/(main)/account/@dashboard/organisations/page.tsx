import { Metadata } from "next"

import { listMyOrganisations } from "@lib/data/organisations"

export const metadata: Metadata = {
  title: "My organisations",
  description:
    "Schools, clubs, and businesses you're connected to at SC PRINTS.",
}

export default async function OrganisationsPage() {
  const memberships = await listMyOrganisations()

  return (
    <div className="w-full">
      <header className="mb-8 border-l-4 border-[var(--brand-secondary)] pl-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
          Memberships
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ui-fg-base small:text-3xl">
          My organisations
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-ui-fg-subtle small:text-base">
          Schools, clubs, and businesses you order with. Staff add and remove
          you from organisations via the admin &mdash; get in touch if
          anything looks wrong.
        </p>
      </header>

      {memberships.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ui-border-base bg-white p-10 text-center">
          <p className="text-sm text-ui-fg-subtle small:text-base">
            You&apos;re not part of any organisation yet. Schools, sports
            clubs, and businesses use organisations to share orders and brand
            kits.
          </p>
        </div>
      ) : (
        <ul className="flex list-none flex-col gap-3 p-0">
          {memberships.map((m) =>
            m.organisation ? (
              <li
                key={m.organisation.id}
                className="rounded-2xl border border-ui-border-base bg-white p-6 transition hover:border-[var(--brand-secondary)]/40 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
                      Organisation
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ui-fg-base">
                      {m.organisation.name}
                    </p>
                    <p className="mt-1 text-xs text-ui-fg-muted">
                      Your role: <span className="text-ui-fg-subtle">{m.role}</span>
                      {m.joined_at
                        ? ` · joined ${new Date(m.joined_at).toLocaleDateString("en-AU")}`
                        : ""}
                    </p>
                  </div>
                  {m.organisation.tax_exempt ? (
                    <span className="inline-flex items-center rounded-full border border-[var(--brand-accent)]/30 bg-[var(--brand-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-accent)]">
                      Tax-exempt
                    </span>
                  ) : null}
                </div>
                {m.organisation.notes ? (
                  <p className="mt-4 whitespace-pre-wrap rounded-xl bg-ui-bg-subtle px-4 py-3 text-sm leading-relaxed text-ui-fg-base">
                    {m.organisation.notes}
                  </p>
                ) : null}
              </li>
            ) : null
          )}
        </ul>
      )}
    </div>
  )
}
