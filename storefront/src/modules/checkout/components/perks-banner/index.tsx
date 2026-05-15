import type { ActivePerk } from "@lib/data/perks"

const PERK_HEADLINE: Record<string, string> = {
  free_shipping: "Free shipping on this order",
}

const PERK_DETAIL: Record<string, string> = {
  free_shipping:
    "Our team will waive the shipping charge for you before dispatch — no action needed at checkout.",
}

const PerksBanner = ({ perks }: { perks: ActivePerk[] }) => {
  if (!perks || perks.length === 0) return null

  return (
    <div className="mb-6 rounded-xl border border-[rgba(255,46,99,0.25)] bg-[rgba(255,46,99,0.06)] px-5 py-4 small:px-6 small:py-5">
      <div className="flex flex-col gap-y-2 small:flex-row small:items-center small:justify-between small:gap-x-6">
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-secondary)]">
            {perks[0].granted_by_tag} perk
          </p>
          <p className="text-sm font-semibold text-[var(--brand-primary)] small:text-base">
            {PERK_HEADLINE[perks[0].perk] ?? perks[0].perk}
          </p>
        </div>
        <p className="text-xs text-ui-fg-subtle small:max-w-md small:text-sm">
          {PERK_DETAIL[perks[0].perk] ?? null}
        </p>
      </div>
    </div>
  )
}

export default PerksBanner
