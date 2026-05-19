import { defineRouteConfig } from "@medusajs/admin-sdk"
import { QuestionMarkCircle } from "@medusajs/icons"
import {
  Badge,
  Container,
  Heading,
  Tabs,
  Text,
} from "@medusajs/ui"
import { useEffect, useState } from "react"
import SystemMapPage from "../system-map/page"

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
        <li><strong>Order owner</strong> — the staff member responsible for this specific order. Auto-stamps from the customer's owner (or rotation if un-owned) when <code>OWNER_AUTOSTAMP_ENABLED</code> is on. Override per-order if a different teammate is handling this job. See <em>Owner &amp; rotation</em>.</li>
        <li><strong>Stale badge (red)</strong> — auto-stamped if production stage hasn&apos;t moved in 3+ days. Clears when you advance. Phase 11 also auto-creates a Task for the owner ("Investigate stale order #N", priority high) so it lands in <a href="/app/tasks" className="underline">My tasks</a>.</li>
        <li><strong>Production stage tracker</strong> — three parallel tracks (artwork / blanks / production). Advance from here.</li>
        <li><strong>Customer perks</strong> — &quot;Free shipping (waive at fulfillment)&quot; surfaces when the customer&apos;s tag qualifies. Apply via Order Edit.</li>
        <li><strong>Deposit &amp; balance</strong> — track upfront payment + balance due date. Bookkeeping only, no money movement.</li>
        <li><strong>NPS</strong> — score + comment from the customer after delivery.</li>
        <li><strong>Watchers</strong> — up to 5 extra emails that get CC&apos;d on production-stage updates. Add/remove now writes audit rows.</li>
        <li><strong>Production photos</strong> — snap from phone, latest auto-appears in customer&apos;s next stage email.</li>
        <li><strong>Print recipes</strong> — link reusable production settings (mesh count, flash temp, embroidery file).</li>
        <li><strong>Rejects / spoilage</strong> — log every scrapped garment. Powers the /app/production-rejects report.</li>
        <li><strong>Order timeline</strong> — one chronological feed of every signal we captured for this order.</li>
      </ul>
    ),
  },
  {
    id: "customer-detail",
    title: "Customer detail — the widgets",
    body: (
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Account owner</strong> — the staff member responsible for this customer. New orders auto-inherit the owner so the same teammate handles every job (gated by <code>OWNER_AUTOSTAMP_ENABLED</code>). Setting an owner here populates a link table + writes an audit row. See <em>Owner &amp; rotation</em> below.</li>
        <li><strong>Lifetime value</strong> — LTV / orders / AOV / last-order tiles. &quot;Suggest VIP tag&quot; appears once they cross the threshold.</li>
        <li><strong>Tags + notes</strong> — coloured labels (VIP, Wholesale, Tricky) and pinnable internal notes. Add a snooze date to a note for follow-up reminders. Every tag/note change now writes an audit row visible on the Customer journey timeline.</li>
        <li><strong>Tax status</strong> — mark tax-exempt (council, NFP, school) so invoices render without GST. Snapshots to orders at placement.</li>
        <li><strong>Customer pricing tier</strong> — drop a known/repeat customer onto a tier (Platinum 1.10× → Member 1.45× of cost). They&apos;ll see a flat below-retail price on every product after sign-in. Detail in the <em>Pricing tiers</em> section below.</li>
        <li><strong>Customer journey</strong> — unified timeline of PostHog events + orders + NPS + saved designs + tag changes + every audit-log row (purple "Activity" badge: owner changes, notes pinned/snoozed, organisation joins, unsubscribes, automation rule fires). Use before a sales call.</li>
        <li><strong>Order list</strong> — Medusa standard.</li>
      </ul>
    ),
  },
  {
    id: "owner-rotation",
    title: "Account & order ownership",
    body: (
      <>
        <Text>
          Every customer and every order can have an "owner" — a staff member who's responsible for them. The whole point is that stale orders, quote follow-ups, and re-order chases land on a known inbox instead of falling through the cracks.
        </Text>

        <Text className="mt-3 font-semibold">How it works</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Manual assignment always wins.</strong> Pick an owner from the <em>Account owner</em> widget on the customer detail, or the <em>Order owner</em> widget on the order detail.</li>
          <li><strong>Order inherits customer owner.</strong> When a customer with an owner places an order, the order auto-stamps to the same owner. Different teammate handling a specific job? Override per-order from the widget.</li>
          <li><strong>Rotation fills in the gaps.</strong> When an un-owned customer places an order, the system picks the next teammate from the rotation table (oldest <code>last_picked_at</code> wins, position as tiebreaker) and stamps both the customer and the order with that user.</li>
        </ul>

        <Text className="mt-3 font-semibold">Setting up rotation</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><a href="/app/rotation" className="underline">/app/rotation</a> — admin page where you toggle who's "in rotation".</li>
          <li>Add at least one teammate before flipping <code>OWNER_AUTOSTAMP_ENABLED=true</code> in env — otherwise auto-stamp is a no-op.</li>
          <li><strong>On leave?</strong> Toggle a member's <em>Enabled</em> switch off. They stay in the rotation history but are skipped for picks. Flip back on when they return.</li>
          <li><strong>Position</strong> is a tiebreaker only — lower numbers picked first when <code>last_picked_at</code> is tied. Most setups can leave it at the default 100.</li>
        </ul>

        <Text className="mt-3 font-semibold">What owners are used for</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Stale-order escalation</strong> (Phase 11) — when an order goes stale, a Task is auto-created for the owner with priority <em>high</em> (or <em>urgent</em> after 7 days). If the order stays stale past <code>STALE_ORDER_ESCALATION_DAYS</code> (default 3), the manager email gets pinged once.</li>
          <li><strong>Automation rules</strong> (Phase 10) — the <code>create_task</code> action accepts the literal <code>owner</code> sentinel for <em>assignee</em>. Rules can route work to "whoever owns this customer / order" without hard-coding names.</li>
          <li><strong>Filtering</strong> — quotes already support <em>Assigned to</em> (the staff person responding); customer/order owner is the longer-term account assignment.</li>
        </ul>
      </>
    ),
  },
  {
    id: "pricing-tiers",
    title: "Pricing tiers — discounted pricing for known customers",
    body: (
      <>
        <Text>
          Eight customer tiers let you give known/valued customers a flat below-retail price without exposing the rate on the public storefront. A tiered customer who logs in sees <strong>one flat price per variant</strong> on the PDP and inside the customizer — the public 5-band quantity ladder is hidden for them.
        </Text>

        <Text className="mt-3 font-semibold">The 8 tiers</Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          Multiplier is applied to ex-GST cost and produces the GST-inclusive selling price (same convention as today&apos;s public ladder, which uses cost × 1.65 as its floor).
        </Text>
        <div className="mt-2 overflow-hidden rounded-md border border-ui-border-base">
          <table className="w-full text-sm">
            <thead className="bg-ui-bg-subtle text-ui-fg-subtle">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">Tier</th>
                <th className="px-3 py-1.5 text-left font-medium">Multiplier</th>
                <th className="px-3 py-1.5 text-left font-medium">Example: cost $5.40 →</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border-base">
              <tr><td className="px-3 py-1">Platinum</td><td className="px-3 py-1 tabular-nums">1.10×</td><td className="px-3 py-1 tabular-nums">$5.94</td></tr>
              <tr><td className="px-3 py-1">Gold Plus</td><td className="px-3 py-1 tabular-nums">1.15×</td><td className="px-3 py-1 tabular-nums">$6.21</td></tr>
              <tr><td className="px-3 py-1">Gold</td><td className="px-3 py-1 tabular-nums">1.20×</td><td className="px-3 py-1 tabular-nums">$6.48</td></tr>
              <tr><td className="px-3 py-1">Silver Plus</td><td className="px-3 py-1 tabular-nums">1.25×</td><td className="px-3 py-1 tabular-nums">$6.75</td></tr>
              <tr><td className="px-3 py-1">Silver</td><td className="px-3 py-1 tabular-nums">1.30×</td><td className="px-3 py-1 tabular-nums">$7.02</td></tr>
              <tr><td className="px-3 py-1">Bronze Plus</td><td className="px-3 py-1 tabular-nums">1.35×</td><td className="px-3 py-1 tabular-nums">$7.29</td></tr>
              <tr><td className="px-3 py-1">Bronze</td><td className="px-3 py-1 tabular-nums">1.40×</td><td className="px-3 py-1 tabular-nums">$7.56</td></tr>
              <tr><td className="px-3 py-1">Member</td><td className="px-3 py-1 tabular-nums">1.45×</td><td className="px-3 py-1 tabular-nums">$7.83</td></tr>
              <tr className="bg-ui-bg-subtle/40 text-ui-fg-subtle">
                <td className="px-3 py-1">Public retail (no tier)</td>
                <td className="px-3 py-1 tabular-nums">1.65× – 2.20×</td>
                <td className="px-3 py-1 tabular-nums">$8.91 (100+) – $11.88 (1-9)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Text className="mt-4 font-semibold">Who sees what</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Anonymous visitors</strong> — public 5-band quantity ladder. Unchanged.</li>
          <li><strong>Signed-in customers with no tier</strong> — public 5-band quantity ladder. Unchanged.</li>
          <li><strong>Signed-in customers with a tier</strong> — single flat price (<em>cost × tier multiplier</em>) on PDP, customizer, cart, and checkout. The quantity ladder is hidden so they don&apos;t see retail rates they aren&apos;t paying.</li>
        </ul>

        <Text className="mt-4 font-semibold">Assigning a tier</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li>Open the customer&apos;s detail page → <strong>Customer pricing tier</strong> widget in the right sidebar.</li>
          <li>Pick the tier from the dropdown → <em>Save</em>. The change takes effect on the customer&apos;s next page load (existing carts may need a refresh).</li>
          <li>Set the dropdown to &quot;No tier&quot; to remove tier pricing and put them back on the public ladder.</li>
          <li>If a customer ever lands in <em>two</em> tier groups, the widget surfaces a warning + a one-click &quot;Clear all tier memberships&quot; button. The highest-margin tier wins until you fix it.</li>
        </ul>

        <Text className="mt-4 font-semibold">Where the numbers come from</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li>Each product variant has a canonical ex-GST cost in <code>metadata.cost_price_ex_gst_minor</code>. Every importer (AS Colour, FashionBiz, Aussie Pacific, DNC) writes it.</li>
          <li>A <strong>nightly cron at 06:00 UTC</strong> regenerates all 8 tier price lists from current cost, after the supplier inventory + cost syncs finish. So if a supplier raises wholesale, tier prices follow within ~24h.</li>
          <li>Plumbing under the hood: 8 Medusa CustomerGroups (named &quot;Tier: Platinum&quot; … &quot;Tier: Member&quot;) backed by 8 PriceLists (type=OVERRIDE) scoped to the matching group. The customer&apos;s group is auto-injected into pricing context on every store request — no custom middleware.</li>
        </ul>

        <Text className="mt-4 font-semibold">What customers see</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li>On the PDP price block: &quot;Your <em>&lt;Tier&gt;</em> pricing&quot; tag below the headline price. Bulk-discount ladder is hidden.</li>
          <li>In the customizer&apos;s pricing panel: a green pill at the top with &quot;Your <em>&lt;Tier&gt;</em> pricing — $X.XX / unit — flat rate, no quantity ladder.&quot;</li>
          <li>At checkout: the tier price flows natively through Medusa&apos;s calculated_price, so cart subtotal, totals, and tax invoice all match what the customer was shown.</li>
        </ul>

        <Text size="xsmall" className="text-ui-fg-muted mt-3">
          Margin sanity check: Platinum (1.10× cost inc-GST) leaves ~0% margin after GST — reserve it for top accounts. Member (1.45×) is the entry tier and still ~30% below the lowest public retail tier (1.65× at qty 100+).
        </Text>
      </>
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
          Move through: <strong>new → quoted → accepted → (becomes an order)</strong>. Lost / expired close the loop.
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>Mood board</strong> — reference images the customer attached are at the top of the quote detail.</li>
          <li><strong>Line items + total estimate</strong> — operator-edited freeform JSON, used as a working draft.</li>
          <li><strong>Copy customer accept link</strong> — HMAC-signed URL you paste into your email reply to the customer. They click → review → Accept → backend builds a real cart → checkout.</li>
          <li><strong>Auto-conversion to order</strong> (Phase 11) — when an order is placed from an accepted quote&apos;s cart, the backend stamps <code>quote.metadata.order_id</code> and writes a <em>converted</em> audit row. Idempotent. Visible as &quot;Quote converted&quot; on the customer&apos;s journey timeline.</li>
          <li><strong>Quote expiry cron</strong> (Phase 5) — daily 23:45 UTC. Quotes with <code>expires_at</code> in the past flip from <em>quoted</em> to <em>expired</em>. Opt-in via <code>QUOTE_EXPIRY_CRON_ENABLED=true</code>.</li>
          <li><strong>Cancelled orders don&apos;t un-accept the quote.</strong> If an order from a converted quote gets cancelled, the quote stays <em>accepted</em> and a note is appended. Customer needs a fresh quote to re-order.</li>
        </ul>
      </>
    ),
  },
  {
    id: "tasks",
    title: "My tasks (staff to-do)",
    body: (
      <>
        <Text>
          <a href="/app/tasks" className="underline">/app/tasks</a> — your personal queue. Three tabs: <strong>Today</strong> (due today), <strong>Overdue</strong> (past due, still active), <strong>All active</strong> (everything assigned to you that&apos;s open or in-progress).
        </Text>

        <Text className="mt-3 font-semibold">When tasks appear</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Manually</strong> — quick-add form at the bottom of <a href="/app/tasks" className="underline">/app/tasks</a>. Pick assignee + title + (optional) due date + priority + notes.</li>
          <li><strong>Auto, from stale orders</strong> (Phase 11) — the daily stale-order scan creates a task for the order&apos;s owner: <em>"Investigate stale order #N"</em>, due in 1 day, priority <em>high</em> (urgent after 7 days stale).</li>
          <li><strong>Auto, from automation rules</strong> (Phase 10) — the <code>create_task</code> rule action with <code>assignee_user_id: "owner"</code> resolves at fire-time. Useful for "VIP order → follow up tomorrow" or "post-delivery → chase NPS manually" recipes.</li>
        </ul>

        <Text className="mt-3 font-semibold">What each row shows</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Anchor link</strong> — task is auto-attached to the source customer / order / quote / org. Click the anchor pill to jump.</li>
          <li><strong>Priority colour</strong> — grey (low), blue (normal), orange (high), red (urgent).</li>
          <li><strong>Due-date colour</strong> — red text when past due.</li>
        </ul>

        <Text className="mt-3 font-semibold">Actions</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Start</strong> — flips to <em>in_progress</em>. Still appears in Today / All buckets.</li>
          <li><strong>Done</strong> — stamps completed_at + completed_by. Task drops out of the active buckets.</li>
        </ul>

        <Text className="mt-3 font-semibold">Overdue notification cron</Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          Daily 09:00 UTC. Walks every active task past its due date, stamps a 23h notification cooldown, writes audit rows on every anchored entity, emits PostHog signals. Email/Slack delivery is wired separately. Opt-in via <code>TASKS_OVERDUE_CRON_ENABLED=true</code>.
        </Text>
      </>
    ),
  },
  {
    id: "production",
    title: "Production tooling",
    body: (
      <>
        <Text size="small" className="text-ui-fg-subtle mb-2">
          All production tools live under <a href="/app/production" className="underline">Production</a> (<code>/app/production</code>) as tabs.
        </Text>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Dashboard tab</strong> — live kanban/list/calendar of every in-flight order with stage, decoration method, and stale flag. The main daily view.</li>
          <li><strong>Print queue tab</strong> — today&apos;s in-production orders grouped by ink/decoration so operators run similar setups back-to-back. Stale orders float to the top.</li>
          <li><strong>Print recipes tab</strong> — reusable settings library. Capture &amp; link to orders so operators have the right setup.</li>
          <li><strong>Production calendar tab</strong> — Gantt-style view of in-flight orders vs deadlines. Red bars = stale.</li>
          <li><strong>Rejects tab</strong> — waste report by reason + supplier brand over any date range.</li>
          <li><strong>Lookbook</strong> (<a href="/app/lookbook" className="underline">/app/lookbook</a>) — curated photos of past jobs rendered at /lookbook for social proof. Still its own sidebar entry.</li>
        </ul>
      </>
    ),
  },
  {
    id: "print-queue",
    title: "Print queue optimiser",
    body: (
      <>
        <Text>
          <a href="/app/production" className="underline">Production → Print queue tab</a> — auto-buckets every <strong>in-production</strong> order by decoration method + ink colours so the press is set up once per bucket instead of per order.
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>How buckets are formed</strong> — orders with identical (method, colours) signatures group together. e.g. <code>screen_print · black,white</code> is one bucket, <code>screen_print · black,red</code> is another.</li>
          <li><strong>Bucket order</strong> — buckets with stale orders surface first, then largest-units-first, then alphabetical by signature. Stops you forgetting overdue jobs while chasing the easy wins.</li>
          <li><strong>Within a bucket</strong> — stale → earliest deadline → FIFO. Click any row to jump to the order.</li>
          <li><strong>Multi-method orders</strong> — an order that&apos;s screen-printed AND embroidered shows up in both buckets. Run the press once for the screen-print bucket, the machine once for embroidery.</li>
          <li><strong>What feeds it</strong> — reads <code>metadata.customizerDesign.prints[].method/inks/colours</code> on each cart line. Orders without customizer metadata still appear under <code>unknown</code> bucket so nothing is invisible.</li>
        </ul>
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          Live computation, no caching. Refresh the page to pick up stage advances / new orders.
        </Text>
      </>
    ),
  },
  {
    id: "ai-description",
    title: "AI product descriptions",
    body: (
      <>
        <Text>
          Product detail → <strong>Generate product description</strong> widget. Click <em>Generate drafts</em> and the LLM returns 3-5 short variants in SC PRINTS voice — pick one, edit if needed, click <em>Apply</em> to write it onto the product.
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>Optional hint</strong> — tell it "lean into the heavyweight cotton" or "highlight that it&apos;s WRAS certified" and it&apos;ll bias the drafts.</li>
          <li><strong>Inputs it sees</strong> — title, current handle, brand, product type, tags, variant options (sizes/colours), and a safe whitelist of metadata. It never sees SKU, cost, or supplier code.</li>
          <li><strong>Drafts are editable</strong> — change anything before clicking Apply. The Apply step calls the standard product update route so the new copy flows through subscribers/analytics.</li>
          <li><strong>Provider</strong> — controlled by env (<code>AI_PROVIDER=openai|anthropic</code>). If no key is configured, the widget shows a clear "not configured" message instead of failing silently.</li>
        </ul>
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          Use cases: filling in legacy product copy in bulk, generating SEO-friendly descriptions for newly-imported supplier products, refreshing tired listings.
        </Text>
      </>
    ),
  },
  {
    id: "group-orders",
    title: "Group orders (customer-driven)",
    body: (
      <>
        <Text>
          Customers can now spin up a group order from any saved design without contacting us first.
        </Text>
        <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
          <li><strong>Customer flow</strong> — /account/designs → "Use for a group order" → fill title/deadline → share the link with their team. Teammates submit name + size at the public page. Owner converts to cart when ready.</li>
          <li><strong>Public page is safe</strong> — shows design thumbnail + product preview only. Source files, MinIO URLs, and full customizer metadata are stripped before responding.</li>
          <li><strong>Convert to cart</strong> — owner clicks Convert; backend matches each participant&apos;s size_label to a real variant on the base product, builds one cart with one line per match, attaches <code>customizerDesign</code> metadata so production sees the artwork. Unmatched sizes are reported as <em>skipped</em> for the owner to resolve.</li>
          <li><strong>Idempotent</strong> — clicking Convert twice returns the same cart, doesn&apos;t create a second one.</li>
          <li><strong>If the design&apos;s base product was deleted</strong> — the owner gets a clear "pick a new base product" error rather than a half-built cart.</li>
        </ul>
        <Text size="xsmall" className="text-ui-fg-muted mt-2">
          What changed for staff: nothing day-to-day. Group orders show up as carts → orders like anything else; the only difference is the <code>group_order_id</code> stamped on order metadata for traceability.
        </Text>
      </>
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
          <a href="/app/automation-rules" className="underline">/app/automation-rules</a> — &quot;when X happens, do Y&quot; rules. Triggers fire in real time from the backend event bus.
        </Text>

        <Text className="mt-3 font-semibold">Triggers</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><code>order.placed</code> — every new order.</li>
          <li><code>order.production_stage_changed</code> — every stage advance.</li>
          <li><code>customer.created</code> — new customer signup or admin-created. <em>Gated by <code>AUTOMATION_EXPANDED_TRIGGERS_ENABLED</code>.</em></li>
          <li><code>order.delivered</code> — fires once when stage hits <em>delivered</em>. <em>Gated.</em></li>
        </ul>

        <Text className="mt-3 font-semibold">Actions</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Tag customer</strong> — adds a coloured label.</li>
          <li><strong>Post order comment</strong> — internal note on the order.</li>
          <li><strong>Send alert email</strong> — staff inbox notification (not for customer-facing emails — use a marketing-stream cron for those).</li>
          <li><strong>Set production stage</strong> — auto-advance the stage. Useful for "approved → in_production" automation when artwork approval comes in.</li>
          <li><strong>Create task</strong> — creates a row in <a href="/app/tasks" className="underline">/app/tasks</a>. <code>assignee_user_id</code> accepts the literal <code>owner</code> sentinel — resolves to the entity&apos;s owner at fire time. <em>Gated.</em></li>
          <li><strong>Assign owner</strong> — calls the Phase 6 ownership API. Targets customer or order. <em>Gated.</em></li>
        </ul>

        <Text className="mt-3 font-semibold">Recipe ideas</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li>When an order is placed AND <code>lifetime_value &gt;= 1500</code>, tag the customer "VIP" AND create a task for the owner ("VIP order — call to thank", due in 1 day).</li>
          <li>When a customer is created with a corporate-domain email, assign the owner to your B2B lead.</li>
          <li>When an order is delivered, create a task to manually chase a review.</li>
          <li>When stage moves to <code>quality_check</code>, post an internal order comment.</li>
        </ul>
      </>
    ),
  },
  {
    id: "marketing-compliance",
    title: "Marketing email opt-out & suppression",
    body: (
      <>
        <Text>
          Every marketing send (cart-reminder, reorder-reminder, winback, NPS) now passes through a single gate that checks the customer&apos;s consent <strong>and</strong> a suppression table before firing.
        </Text>

        <Text className="mt-3 font-semibold">How customers opt out</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>One-click unsubscribe link</strong> in marketing email footers. Lands at <code>/email/unsubscribe?email=...&amp;kind=...&amp;sig=...</code> with an HMAC signature. The backend inserts a suppression row, flips <code>customer.metadata.marketing_consent_email=false</code> for global unsubs, and redirects them to the storefront preference center.</li>
          <li><strong>Per-stream</strong> — they can opt out of <em>winback</em> only and still receive <em>cart-reminder</em>. Stream key is encoded in the link.</li>
          <li><strong>Account preferences page</strong> on the storefront — same toggle, signed-in path.</li>
        </ul>

        <Text className="mt-3 font-semibold">Admin: managing the suppression list</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>List + add</strong> — <code>GET /admin/email-suppressions</code> and <code>POST</code> from the admin (UI page is on the v1.1 roadmap; the REST endpoint is live).</li>
          <li><strong>Reasons</strong> — <em>user_unsubscribe</em>, <em>bounce</em>, <em>spam_complaint</em>, <em>manual_admin</em>. Pick <em>manual_admin</em> when you&apos;re suppressing on a customer&apos;s phone request.</li>
          <li><strong>Removing a suppression</strong> — <code>DELETE /admin/email-suppressions/[id]</code>. Use sparingly: re-enabling an unsubscribed customer without their permission is a compliance risk.</li>
        </ul>

        <Text className="mt-3 font-semibold">Activation checklist</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li>Set <code>UNSUBSCRIBE_LINK_SECRET</code> in Railway (must match across deploys or in-flight links break).</li>
          <li>Set <code>MARKETING_PREFERENCE_CENTER_URL</code> to your storefront preference page (e.g. <code>${'{STOREFRONT_URL}'}/email-preferences</code>).</li>
          <li>Flip <code>EMAIL_SUPPRESSION_TABLE_ENABLED=true</code> once the migration has applied — turns the suppression check on. Until you flip it the helper falls back to consent-only checks.</li>
        </ul>

        <Text size="xsmall" className="text-ui-fg-muted mt-3">
          Compliance note: Australian Spam Act + GDPR/UK PECR both require a working unsubscribe mechanism on commercial email. The one-click endpoint + per-stream toggles satisfy both. Bounces and spam complaints from Resend should be ingested into the same table (deferred — Phase 9 follow-up).
        </Text>
      </>
    ),
  },
  {
    id: "supplier-integrations",
    title: "Supplier API integrations",
    body: (
      <>
        <Text>
          Three supplier APIs back our garment catalog: <strong>AS Colour</strong>, <strong>FashionBiz</strong>, and <strong>Aussie Pacific</strong>. They share the same shape — a one-off product import script, a recurring inventory sync at a dedicated stock location, brand assignment, and (when the supplier exposes one) order forwarding for dropship. Differences are in the API shape, sync cadence, and whether the supplier accepts orders programmatically.
        </Text>

        <Text className="mt-3 font-semibold">At a glance</Text>
        <div className="mt-2 overflow-hidden rounded-md border border-ui-border-base">
          <table className="w-full text-sm">
            <thead className="bg-ui-bg-subtle text-ui-fg-subtle">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">Supplier</th>
                <th className="px-3 py-1.5 text-left font-medium">Auth</th>
                <th className="px-3 py-1.5 text-left font-medium">Inventory sync</th>
                <th className="px-3 py-1.5 text-left font-medium">Cost convention</th>
                <th className="px-3 py-1.5 text-left font-medium">Dropship</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border-base">
              <tr>
                <td className="px-3 py-1">AS Colour</td>
                <td className="px-3 py-1"><code>Subscription-Key</code> header</td>
                <td className="px-3 py-1">Hourly (delta)</td>
                <td className="px-3 py-1">Ex-GST, no adjustment</td>
                <td className="px-3 py-1">Yes — Order API</td>
              </tr>
              <tr>
                <td className="px-3 py-1">FashionBiz</td>
                <td className="px-3 py-1"><code>Authorization: Token</code></td>
                <td className="px-3 py-1">Daily 04:00 UTC (full sweep)</td>
                <td className="px-3 py-1">1-99 tier × <code>FASHIONBIZ_COST_ADJUSTMENT</code> (1.15× in prod)</td>
                <td className="px-3 py-1">No — supplier has no order endpoint</td>
              </tr>
              <tr>
                <td className="px-3 py-1">Aussie Pacific</td>
                <td className="px-3 py-1"><code>Authorization: Bearer</code></td>
                <td className="px-3 py-1">Daily 05:00 UTC (full sweep)</td>
                <td className="px-3 py-1">Ex-GST, no adjustment</td>
                <td className="px-3 py-1">Yes — POST <code>/order</code> (submit-only, no status)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Text className="mt-4 font-semibold">AS Colour</Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          Base URL <code>api.ascolour.com.au/v1</code> — API support at <a href="mailto:api@ascolour.com" className="underline">api@ascolour.com</a>.
        </Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>What their API exposes</strong> — Catalog (products, colours, variants, images), Inventory (delta via <code>updatedAt:min</code> + full SKU lookup), Pricelist (wholesale costs, Bearer-authed), Authentication (login → Bearer token), and an Order API for dropship.</li>
          <li><strong>What we pull</strong> — initial import via <code>src/scripts/import-as-colour-from-api.ts</code> creates one Medusa product per style and links it to the AS Colour Brand. Hourly stock delta at <em>AS Colour Warehouse</em> uses the <code>updatedAt:min</code> filter so we only pull what's changed. Pricelist drives <code>variant.metadata.cost_price_ex_gst_minor</code>, which feeds the public quantity ladder and the tier-pricing system.</li>
          <li><strong>What we push</strong> — dropship orders via <code>POST /v1/orders</code>. Trigger from the order detail page → <em>AS Colour dropship</em> widget; backend posts shipping address + SKU lines and stamps AS Colour's response on order metadata.</li>
          <li><strong>Quirk: discontinued styles</strong> — AS Colour appends <code>S</code> to a styleCode when it's superseded. The importer skips these by default. Set <code>IMPORT_INCLUDE_DISCONTINUED=1</code> only for one-off historical imports.</li>
          <li><strong>Where to look when it breaks</strong> — Railway logs for the <code>sync-ascolour-inventory</code> job; the dropship widget surfaces any send-to-AS-Colour error inline.</li>
        </ul>

        <Text className="mt-4 font-semibold">FashionBiz</Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          Base URL <code>fashionbizapis.com/api/v3</code> — covers Biz Collection, Biz Care, Biz Corporates, Syzmik.
        </Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>What their API exposes</strong> — eight GET endpoints under <code>/api/v3/products/&lt;brand&gt;/&lt;branch&gt;</code>: paginated and un-paginated product lists (with <code>?gender</code> / <code>?sales_status</code> / <code>?per_page</code> filters), per-slug product detail, per-colour stock lookup, and a <code>/categories</code> endpoint for the tag list. Each variant carries three wholesale tier prices (<code>1-99</code> / <code>100-499</code> / <code>500</code> — good-mates uses <code>Gold</code> for its lowest tier). No order endpoint, no webhooks.</li>
          <li><strong>What we pull</strong> — initial import via <code>src/scripts/import-fashionbiz-from-api.ts</code> creates products linked to the four FashionBiz brand entities (Biz Collection, Biz Care, Biz Corporates, Syzmik — <code>good-mates</code> is API-supported but deferred in our system). Branch defaults to <code>au</code> (override via <code>FASHIONBIZ_BRANCH</code>). Daily stock sweep at 04:00 UTC against <em>FashionBiz Warehouse</em>; because FashionBiz has no <code>updated_at</code> filter, every sync is a full catalog walk.</li>
          <li><strong>What we push</strong> — nothing. FashionBiz has no public order endpoint, so dropship orders are still placed manually through their portal.</li>
          <li><strong>Cost calibration (important)</strong> — the API's <code>1-99</code> tier is a published price, but FashionBiz's distributor storefront charges trade customers ~15% above that. Production sets <code>FASHIONBIZ_COST_ADJUSTMENT=1.15</code> so our retail ladder is built off the cost we'll actually be billed. Without the multiplier the storefront under-prices garments by ~15%. Raw 3-tier array + applied multiplier are preserved on <code>variant.metadata.raw_prices</code> and <code>variant.metadata.cost_adjustment</code> for audit.</li>
          <li><strong>Idempotency</strong> — create-only, keyed by handle (e.g. <code>biz-collection-p400ms</code>). Existing handles are skipped, so re-running the importer to refresh existing products is a no-op until an update path is added.</li>
        </ul>

        <Text className="mt-4 font-semibold">Aussie Pacific</Text>
        <Text size="xsmall" className="text-ui-fg-muted">
          Base URL <code>api.aussiepacific.com.au/api/v1</code> — full docs at <a href="https://api.aussiepacific.com.au/docs/" className="underline" target="_blank" rel="noreferrer">api.aussiepacific.com.au/docs</a>.
        </Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>What their API exposes</strong> — <code>/check</code> (auth ping), <code>/products</code> (with optional <code>include=variants,files,images</code>), get-product-by-style-code, get-variant-by-SKU, and <code>POST /order</code> for dropship.</li>
          <li><strong>What we pull</strong> — initial import via <code>src/scripts/import-aussie-pacific-from-api.ts</code>; daily stock sweep at 05:00 UTC against <em>Aussie Pacific Warehouse</em> (no <code>updated_at</code> filter — full walk every day). Per-variant cost varies within a style, so each variant gets its own price ladder; the first 5 styles per import emit a calibration log line so operators can spot-check the ex-GST assumption against AP invoices before going wide.</li>
          <li><strong>What we push</strong> — dropship orders via <code>POST /order</code>, from either the order-detail widget or the dedicated <a href="/app/dropship/aussie-pacific" className="underline">Aussie Pacific Orders</a> dashboard.</li>
          <li><strong>Quirk: run-out items skipped</strong> — products with <code>run_out === true</code> are skipped at import time (one log line per skipped style).</li>
          <li><strong>Quirk: AP gives us nothing back</strong> — no GET order endpoint, no shipment endpoint, no webhooks. After we send a dropship order AP returns a reference and that's it. Operators reconcile shipment progress via AP's email confirmations or distributor portal until AP adds a status endpoint.</li>
          <li><strong>Tag mapping</strong> — AP's <code>main_category</code> (Ladies / Mens / Kids / Unisex) maps to a demographic. <code>sub_category</code> drives the Medusa <code>product_type</code> via strict alias matching, so unknown values resolve to <code>null</code> rather than leaking demographic strings through as types.</li>
        </ul>

        <Text className="mt-4 font-semibold">Common ops</Text>
        <ul className="mt-1 list-disc pl-5 text-sm space-y-1">
          <li><strong>Where do I check a sync ran?</strong> Railway logs filtered to <code>sync-ascolour-inventory</code> / <code>sync-fashionbiz-inventory</code> / <code>sync-aussie-pacific-inventory</code>. Each job logs the SKU count it touched.</li>
          <li><strong>How do I import a new supplier brand or backfill?</strong> Run the importer on Railway: <code>cd /app/.medusa/server &amp;&amp; npx medusa exec src/scripts/import-&lt;supplier&gt;-from-api.js</code>. Locally, swap <code>.js</code> for <code>.ts</code> and use the <code>backend</code> working directory.</li>
          <li><strong>How do I confirm a supplier is configured?</strong> Each supplier's module only registers when its API token env var is set (<code>ASCOLOUR_SUBSCRIPTION_KEY</code>, <code>FASHIONBIZ_API_TOKEN</code>, <code>AUSSIE_PACIFIC_API_TOKEN</code>). If the token is missing the cron is a silent no-op rather than an error.</li>
          <li><strong>A supplier's portal shows a price that doesn't match what we billed against</strong> — check the cost-adjustment env var (<code>FASHIONBIZ_COST_ADJUSTMENT</code>, <code>AUSSIE_PACIFIC_COST_ADJUSTMENT</code>) and the <code>variant.metadata.cost_adjustment</code> field on a recent import. If the multiplier is wrong, raising it and re-importing corrects the cost cascade.</li>
        </ul>

        <Text size="xsmall" className="text-ui-fg-muted mt-3">
          Deeper detail — endpoint payloads, module file paths, env-var defaults — lives in <code>CLAUDE.md</code> at the repo root and the supplier folders under <code>backend/src/modules/</code> (<code>ascolour</code>, <code>fashionbiz</code>, <code>aussiepacific</code>).
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
          <li><strong>Stale-order scan</strong> — daily 08:00 UTC. Stamps red badge, posts Slack digest, creates a Task for the order owner (Phase 11), escalates to manager after <code>STALE_ORDER_ESCALATION_DAYS</code>.</li>
          <li><strong>Overdue tasks notification</strong> — daily 09:00 UTC. Walks active tasks past their due date, writes audit + PostHog. <em>(Phase 7, opt-in.)</em></li>
          <li><strong>NPS request</strong> — daily 22:00 UTC. Fires 14 days after delivery. Now respects marketing consent + suppression (Phase 8).</li>
          <li><strong>Abandoned-cart reminder</strong> — daily 23:15 UTC. Respects suppression.</li>
          <li><strong>Reorder reminder</strong> — daily 23:30 UTC. Repeat customers past their median order gap. Now respects marketing consent + suppression (Phase 8).</li>
          <li><strong>Quote expiry</strong> — daily 23:45 UTC. Auto-expires <em>quoted</em>-status quotes past their expires_at. <em>(Phase 5, opt-in.)</em></li>
          <li><strong>Win-back</strong> — Mondays 00:00 UTC. Drifting / at-risk / lost customers. Respects suppression.</li>
          <li><strong>Cross-sell refresh</strong> — daily 02:00 UTC. Walks orders, counts co-purchases, writes to product metadata.</li>
          <li><strong>PostHog cohort sync</strong> — daily 03:30 UTC. Reconciles cohort memberships to customer tags.</li>
          <li><strong>Supplier inventory sync</strong> — AS Colour hourly, FashionBiz daily 04:00 UTC, Aussie Pacific daily 05:00 UTC. See <a href="#supplier-integrations" className="underline">Supplier API integrations</a> for what each sync touches.</li>
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
        <div><strong>What&apos;s on my plate?</strong> <a href="/app/tasks" className="underline">/app/tasks</a></div>
        <div><strong>Mark a customer tax-exempt</strong> Customer detail → Tax status</div>
        <div><strong>Tag a customer VIP</strong> Customer detail → Tags</div>
        <div><strong>Give a customer tier pricing</strong> Customer detail → Customer pricing tier</div>
        <div><strong>Assign a customer or order to a teammate</strong> Customer/Order detail → Account/Order owner widget</div>
        <div><strong>Manage owner rotation</strong> <a href="/app/rotation" className="underline">/app/rotation</a></div>
        <div><strong>Create a task for myself or a teammate</strong> <a href="/app/tasks" className="underline">/app/tasks</a> → quick-add form</div>
        <div><strong>Generate accept link for a quote</strong> Quote detail → top right</div>
        <div><strong>Plan the week</strong> <a href="/app/production" className="underline">Production → Production calendar tab</a></div>
        <div><strong>Group today&apos;s press setups</strong> <a href="/app/production" className="underline">Production → Print queue tab</a></div>
        <div><strong>Auto-write a product description</strong> Product detail → Generate description widget</div>
        <div><strong>Log a reject</strong> Order detail → Rejects/spoilage</div>
        <div><strong>Photo of the press</strong> Order detail → Production photos</div>
        <div><strong>Save settings that worked</strong> <a href="/app/production" className="underline">Production → Print recipes tab</a></div>
        <div><strong>Add an order watcher</strong> Order detail → Watchers</div>
        <div><strong>Set deposit + balance</strong> Order detail → Deposit &amp; balance</div>
        <div><strong>Add a school as an org</strong> <a href="/app/organisations" className="underline">/app/organisations</a></div>
        <div><strong>Add a gallery tile</strong> <a href="/app/lookbook" className="underline">/app/lookbook</a></div>
        <div><strong>Snooze a customer for Tuesday</strong> Customer detail → Notes → add note with snooze date</div>
        <div><strong>Tax invoice</strong> Customer side: /account/orders/[id] → Tax invoice button</div>
        <div><strong>Stop marketing emails to an address</strong> Customer calls? <code>POST /admin/email-suppressions</code> (admin REST). UI page on the roadmap.</div>
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
        <div><dt className="font-semibold inline">Pricing tier</dt> <dd className="inline">— customer-group-scoped flat price (cost × 1.10 to 1.45). Hides the public quantity ladder for that customer.</dd></div>
        <div><dt className="font-semibold inline">Owner</dt> <dd className="inline">— the staff member responsible for a customer or order. Inherits customer → order; rotation fills gaps for un-owned customers. Different from a quote&apos;s <em>assigned_to</em>, which is the person actively responding to that quote.</dd></div>
        <div><dt className="font-semibold inline">Rotation</dt> <dd className="inline">— the admin-managed list at <a href="/app/rotation" className="underline">/app/rotation</a> of staff who can be auto-assigned new customers/orders. Round-robin by oldest <em>last_picked_at</em>.</dd></div>
        <div><dt className="font-semibold inline">Task</dt> <dd className="inline">— a staff to-do anchored to a customer / order / quote / org. Single assignee, optional due_at + priority. Lives at <a href="/app/tasks" className="underline">/app/tasks</a>.</dd></div>
        <div><dt className="font-semibold inline">Audit log</dt> <dd className="inline">— the polymorphic activity feed. Every meaningful staff action (tag add, note pin, owner change, watcher add, automation fire) writes a row. Surfaced on the customer-journey widget as the purple "Activity" track.</dd></div>
        <div><dt className="font-semibold inline">Suppression</dt> <dd className="inline">— a marketing-email opt-out. Stored by email (works for guests too). Global or per-stream. Blocks every marketing-job send.</dd></div>
      </dl>
    ),
  },
]

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState<"guide" | "system-map">("guide")
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
          <Heading level="h1">Help & guide</Heading>
          <Text size="xsmall" className="text-ui-fg-muted">
            Staff guide and system documentation
          </Text>
        </div>
        <Badge color="blue">v1</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "guide" | "system-map")}>
        <div className="px-6 pt-4 border-b border-ui-border-base">
          <Tabs.List>
            <Tabs.Trigger value="guide">Guide</Tabs.Trigger>
            <Tabs.Trigger value="system-map">System map</Tabs.Trigger>
          </Tabs.List>
        </div>

        <Tabs.Content value="guide">
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
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">System map</span> — available as the <strong>System map tab</strong> above. Interactive diagram of every service, module, event bus, cron, and how they connect.
              </li>
              <li>
                <code>Docs/STAFF_GUIDE.md</code> — full version of this page with more detail per section.
              </li>
              <li>
                <code>CLAUDE.md</code> — repo-root developer guide.
              </li>
            </ul>
          </div>
        </div>
        </div>
        </Tabs.Content>

        <Tabs.Content value="system-map" className="p-0">
          <SystemMapPage />
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Help & guide",
  icon: QuestionMarkCircle,
})

export default HelpPage
