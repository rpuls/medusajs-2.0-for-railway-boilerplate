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
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">My organisations</h1>
        <p className="text-base-regular">
          Schools, clubs, and businesses you order with. Staff add and remove
          you from organisations via the admin — get in touch if anything
          looks wrong.
        </p>
      </div>

      {memberships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ui-border-base p-10 text-center">
          <p className="text-sm text-ui-fg-subtle">
            You&apos;re not part of any organisation yet. Schools, sports clubs,
            and businesses use organisations to share orders and brand kits.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-y-3">
          {memberships.map((m) =>
            m.organisation ? (
              <li
                key={m.organisation.id}
                className="rounded-xl border border-ui-border-base bg-white p-5"
              >
                <div className="flex items-start justify-between gap-x-3">
                  <div className="flex flex-col">
                    <p className="text-base font-semibold text-[var(--brand-primary)]">
                      {m.organisation.name}
                    </p>
                    <p className="text-xs text-ui-fg-muted">
                      Your role: {m.role}
                      {m.joined_at
                        ? ` · joined ${new Date(m.joined_at).toLocaleDateString("en-AU")}`
                        : ""}
                    </p>
                  </div>
                  {m.organisation.tax_exempt ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                      Tax-exempt
                    </span>
                  ) : null}
                </div>
                {m.organisation.notes ? (
                  <p className="mt-3 text-sm text-ui-fg-base whitespace-pre-wrap">
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
