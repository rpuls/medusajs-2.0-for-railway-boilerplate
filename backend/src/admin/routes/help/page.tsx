import { defineRouteConfig } from "@medusajs/admin-sdk"
import { QuestionMarkCircle } from "@medusajs/icons"
import {
  Badge,
  Container,
  Heading,
  Text,
} from "@medusajs/ui"
import { useEffect, useState } from "react"

/**
 * In-admin staff guide. Renders an embedded copy of `Docs/STAFF_GUIDE.md`
 * (curated to the bits staff actually need on a daily basis) so new
 * starters can hit `/app/help` and orient themselves without leaving
 * the admin.
 *
 * The canonical source of truth is the file in /Docs — this page
 * exists for *staff* who can't easily browse the repo. When updating,
 * change /Docs first and then mirror the relevant additions here.
 */

type Section = {
  id: string
  title: string
  body: React.ReactNode
}

const SECTIONS: Section[] = [
  {
    id: "start-here",
    title: "Start here — your daily home",
    body: (
      <>
        <Text>
          Open <strong>Studio</strong> (<a href="/app/studio" className="underline">/app/studio</a>) first thing every morning. It surfaces five buckets of things worth your attention right now:
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li><strong>VIPs who&apos;ve gone quiet</strong> — tagged VIP, no order in 60+ days.</li>
          <li><strong>Notable first-time orders</strong> — hand-written thank-yous build loyalty.</li>
          <li><strong>Quotes waiting on you</strong> — open quotes idle for 3+ days.</li>
          <li><strong>Recent low NPS scores</strong> — reach out before they churn quietly.</li>
          <li><strong>Snooze follow-ups due</strong> — notes you snoozed; the window has passed.</li>
        </ul>
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          Each row clicks straight through to the customer, order, or quote.
        </Text>
      </>
    ),
  },
  {
    id: "order-detail",
    title: "Order detail — what each widget does",
    body: (
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Stale badge (red)</strong> — auto-stamped if production stage hasn&apos;t moved in 3+ days. Clears when you advance.</li>
        <li><strong>Production stage tracker</strong> — three parallel tracks (artwork / blanks / production). Advance from here.</li>
        <li><strong>Customer perks</strong> — &quot;Free shipping (waive at fulfillment)&quot; surfaces when the customer&apos;s tag qualifies. Apply via Order Edit.</li>
        <li><strong>Deposit &amp; balance</strong> — track upfront payment + balance due date. Bookkeeping only, no money movement.</li>
        <li><strong>NPS</strong> — score + comment from the customer after delivery.</li>
        <li><strong>Watchers</strong> — up to 5 extra emails that get CC&apos;d on production-stage updates.</li>
        <li><strong>Production photos</strong> — snap from phone, latest auto-appears in customer&apos;s next stage email.</li>
        <li><strong>Print recipes</strong> — link reusable production settings (mesh count, flash temp, embroidery file).</li>
        <li><strong>Rejects / spoilage</strong> — log every scrapped garment. Powers the /app/production-rejects report.</li>
        <li><strong>Order timeline</strong> — one chronological feed of every signal we captured for this order.</li>
      </ul>
    ),
  },
  {
    id: "customer-detail",
    title: "Customer detail — the four widgets",
    body: (
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Lifetime value</strong> — LTV / orders / AOV / last-order tiles. &quot;Suggest VIP tag&quot; appears once they cross the threshold.</li>
        <li><strong>Tags + notes</strong> — coloured labels (VIP, Wholesale, Tricky) and pinnable internal notes. Add a snooze date to a note for follow-up reminders.</li>
        <li><strong>Tax status</strong> — mark tax-exempt (council, NFP, school) so invoices render without GST. Snapshots to orders at placement.</li>
        <li><strong>Customer journey</strong> — unified timeline of PostHog events + orders + NPS + saved designs + tag changes. Use before a sales call.</li>
        <li><strong>Order list</strong> — Medusa standard.</li>
      </ul>
    ),
  },
  {
    id: "quotes",
    title: "Quotes pipeline",
    body: (
      <>
        <Text>
          <a href="/app/quotes" className="underline">/app/quotes</a> — every BYO inquiry, contact form quote request, or admin lead lands here as <em>new</em>.
        </Text>
        <Text className="mt-2">
          Move through: <strong>new → quoted → accepted → (becomes a cart)</strong>. Lost / expired close the loop.
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>Mood board</strong> — reference images the customer attached are at the top of the quote detail.</li>
          <li><strong>Line items + total estimate</strong> — operator-edited freeform JSON, used as a working draft.</li>
          <li><strong>Copy customer accept link</strong> — HMAC-signed URL you paste into your email reply to the customer. They click → review → Accept → backend builds a real cart → checkout.</li>
        </ul>
      </>
    ),
  },
  {
    id: "production",
    title: "Production tooling",
    body: (
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Production calendar</strong> (<a href="/app/production-calendar" className="underline">/app/production-calendar</a>) — Gantt-style view of in-flight orders vs deadlines. Red bars = stale.</li>
        <li><strong>Print recipes</strong> (<a href="/app/print-recipes" className="underline">/app/print-recipes</a>) — reusable settings library. Capture &amp; link to orders so operators have the right setup.</li>
        <li><strong>Rejects</strong> (<a href="/app/production-rejects" className="underline">/app/production-rejects</a>) — waste report by reason + supplier brand over any date range.</li>
        <li><strong>Lookbook</strong> (<a href="/app/lookbook" className="underline">/app/lookbook</a>) — curated photos of past jobs rendered at /lookbook for social proof.</li>
      </ul>
    ),
  },
  {
    id: "organisations",
    title: "Organisation accounts (B2B)",
    body: (
      <>
        <Text>
          <a href="/app/organisations" className="underline">/app/organisations</a> — schools, clubs, businesses as first-class accounts. Add customers as members with a role (owner / purchaser / viewer).
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>Default pricing tier</strong> — sets up org-level pricing (future price-list integration).</li>
          <li><strong>Tax-exempt at org level</strong> — snapshots to every order placed by org members.</li>
          <li>Customers see their memberships at <code>/account/organisations</code> on the storefront.</li>
        </ul>
      </>
    ),
  },
  {
    id: "automation-rules",
    title: "Automation rules (no-code)",
    body: (
      <>
        <Text>
          <a href="/app/automation-rules" className="underline">/app/automation-rules</a> — &quot;when X happens, do Y&quot; rules. Examples:
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li>When an order is placed AND <code>lifetime_value &gt;= 1500</code>, tag the customer &quot;VIP&quot;.</li>
          <li>When stage moves to <code>quality_check</code>, post an internal order comment.</li>
          <li>When <code>order_count == 1</code>, send a thank-you alert email to a staff inbox.</li>
        </ul>
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          Triggers fire in real time from the backend event bus.
        </Text>
      </>
    ),
  },
  {
    id: "automatic",
    title: "What runs automatically (no action needed)",
    body: (
      <>
        <Text>Every cron is opt-in via an <code>*_ENABLED=true</code> env var:</Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>Stale-order scan</strong> — daily 08:00 UTC. Stamps red badge, posts Slack digest.</li>
          <li><strong>NPS request</strong> — daily 22:00 UTC. Fires 14 days after delivery.</li>
          <li><strong>Abandoned-cart reminder</strong> — daily 23:15 UTC.</li>
          <li><strong>Reorder reminder</strong> — daily 23:30 UTC. Repeat customers past their median order gap.</li>
          <li><strong>Win-back</strong> — Mondays 00:00 UTC. Drifting / at-risk / lost customers.</li>
          <li><strong>Cross-sell refresh</strong> — daily 02:00 UTC. Walks orders, counts co-purchases, writes to product metadata.</li>
          <li><strong>PostHog cohort sync</strong> — daily 03:30 UTC. Reconciles cohort memberships to customer tags.</li>
          <li><strong>Supplier inventory sync</strong> — AS Colour hourly, FashionBiz daily.</li>
        </ul>
      </>
    ),
  },
  {
    id: "common-tasks",
    title: "Common tasks → where to go",
    body: (
      <div className="grid grid-cols-1 small:grid-cols-2 gap-2 text-sm">
        <div><strong>What needs my attention today?</strong> <a href="/app/studio" className="underline">/app/studio</a></div>
        <div><strong>Mark a customer tax-exempt</strong> Customer detail → Tax status</div>
        <div><strong>Tag a customer VIP</strong> Customer detail → Tags</div>
        <div><strong>Generate accept link for a quote</strong> Quote detail → top right</div>
        <div><strong>Plan the week</strong> <a href="/app/production-calendar" className="underline">/app/production-calendar</a></div>
        <div><strong>Log a reject</strong> Order detail → Rejects/spoilage</div>
        <div><strong>Photo of the press</strong> Order detail → Production photos</div>
        <div><strong>Save settings that worked</strong> <a href="/app/print-recipes" className="underline">/app/print-recipes</a></div>
        <div><strong>Add an order watcher</strong> Order detail → Watchers</div>
        <div><strong>Set deposit + balance</strong> Order detail → Deposit &amp; balance</div>
        <div><strong>Add a school as an org</strong> <a href="/app/organisations" className="underline">/app/organisations</a></div>
        <div><strong>Add a gallery tile</strong> <a href="/app/lookbook" className="underline">/app/lookbook</a></div>
        <div><strong>Snooze a customer for Tuesday</strong> Customer detail → Notes → add note with snooze date</div>
        <div><strong>Tax invoice</strong> Customer side: /account/orders/[id] → Tax invoice button</div>
      </div>
    ),
  },
  {
    id: "glossary",
    title: "Glossary",
    body: (
      <dl className="text-sm space-y-1">
        <div><dt className="font-semibold inline">Production stage</dt> <dd className="inline">— where the order is in the build pipeline (received → in_production → shipped → delivered).</dd></div>
        <div><dt className="font-semibold inline">Artwork stage</dt> <dd className="inline">— parallel track tracking customer artwork approval.</dd></div>
        <div><dt className="font-semibold inline">Blanks stage</dt> <dd className="inline">— parallel track tracking the supplier garment order.</dd></div>
        <div><dt className="font-semibold inline">LTV</dt> <dd className="inline">— lifetime value. Sum of order totals across non-cancelled orders.</dd></div>
        <div><dt className="font-semibold inline">NPS</dt> <dd className="inline">— Net Promoter Score, 1-5 rating customers leave after delivery.</dd></div>
        <div><dt className="font-semibold inline">Watcher</dt> <dd className="inline">— extra email on an order that gets CC&apos;d on stage updates.</dd></div>
        <div><dt className="font-semibold inline">Stale order</dt> <dd className="inline">— production stage hasn&apos;t advanced in 3+ days.</dd></div>
        <div><dt className="font-semibold inline">Snooze</dt> <dd className="inline">— a customer note with a future &quot;remind me&quot; date.</dd></div>
        <div><dt className="font-semibold inline">Org</dt> <dd className="inline">— school / club / business — a group of customers sharing identity.</dd></div>
        <div><dt className="font-semibold inline">Recipe</dt> <dd className="inline">— reusable production settings (mesh count, ink, etc.).</dd></div>
      </dl>
    ),
  },
]

const HelpPage = () => {
  const [active, setActive] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -65% 0px" }
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div>
          <Heading level="h1">Staff guide</Heading>
          <Text size="xsmall" className="text-ui-fg-muted">
            How to use everything in the admin. Update <code>Docs/STAFF_GUIDE.md</code> when behaviour changes.
          </Text>
        </div>
        <Badge color="blue">v1</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-0">
        <nav className="border-r border-ui-border-base p-4 lg:sticky lg:top-0 lg:self-start lg:max-h-[80vh] lg:overflow-y-auto">
          <ul className="flex flex-col gap-y-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`block rounded px-2 py-1 ${
                    active === s.id
                      ? "bg-ui-bg-subtle font-semibold text-[var(--brand-primary)]"
                      : "text-ui-fg-base hover:bg-ui-bg-subtle"
                  }`}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 flex flex-col gap-y-8">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <Heading level="h2" className="mb-3">
                {s.title}
              </Heading>
              <div className="prose prose-sm max-w-none text-ui-fg-base">
                {s.body}
              </div>
            </section>
          ))}

          <div className="mt-8 rounded-md border border-ui-border-base bg-ui-bg-subtle p-4 text-sm">
            <Heading level="h3" className="text-base mb-2">
              The deeper docs
            </Heading>
            <ul className="list-disc pl-5">
              <li>
                <code>Docs/STAFF_GUIDE.md</code> — full version of this page with more detail per section.
              </li>
              <li>
                <code>Docs/BACKEND_FLOW.md</code> — the technical "how data moves through the system" map with diagrams.
              </li>
              <li>
                <code>CLAUDE.md</code> — repo-root developer guide.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Help & guide",
  icon: QuestionMarkCircle,
})

export default HelpPage
