# SC PRINTS staff guide

A practical "where do I do X?" map of the admin. Written for new starters but useful for anyone catching up on a feature they don't use every day.

This guide pairs with [`BACKEND_FLOW.md`](./BACKEND_FLOW.md) — that one's the technical "how does data move through the system" map. This one's the "what should I click and when?" version.

---

## Your daily home — **Studio**

Path: `/app/studio`

Studio is the dashboard that surfaces customers and orders worth your attention *today*. Open it first thing every morning. Four buckets:

| Bucket | What it surfaces | Why it matters |
| --- | --- | --- |
| **VIPs who've gone quiet** | Customers tagged "VIP" with no order in 60+ days | A short call/email keeps the relationship warm before they drift |
| **Notable first-time orders** | First orders over half the VIP threshold in the last 14 days | Hand-written thank-yous convert better than later automated win-back |
| **Quotes waiting on you** | Open quotes with no activity in 3+ days | Bring them home or mark lost so the pipeline stays accurate |
| **Recent low NPS scores** | Customers who rated 1 or 2 in the last 30 days | Reach out before they churn quietly |
| **Snooze follow-ups due** | Customer notes you snoozed; the snooze window has passed | Don't drop the ball on "follow up Tuesday" promises |

Each row is a one-click jump to the customer or quote.

---

## Order management

### The order detail page

Every order page has these stacked widgets (some only render when relevant):

| Widget | Lives at | What it does |
| --- | --- | --- |
| **Stale badge** | top of page (red) | Auto-stamped if the production stage hasn't advanced in 3+ days. Clears automatically when you move it forward. |
| **Order details + production stage tracker** | top | Standard Medusa + our custom multi-track stage system (artwork / blanks / production) |
| **Customer perks** | side, top | "Free shipping (waive at fulfillment)" surfaces when the customer's tag (e.g. VIP, Wholesale) qualifies. Apply via Order Edit. |
| **Deposit & balance** | side, top | Multi-step payment tracking. Mark deposit received, set balance due date. Bookkeeping only — actual money via Stripe. |
| **NPS** | side, bottom | Survey score (1–5) the customer left after delivery + their comment. |
| **Watchers** | side, bottom | Up to 5 extra email addresses to CC on production-stage updates. Useful when one parent orders but the whole P&C wants updates. |
| **Production photos** | main column | Snap a photo of the print on the press. The latest photo auto-appears in the customer's next production-stage email. |
| **Print recipes** | main column | Reusable production settings (mesh count, flash temp, embroidery digitization file). Link existing recipes here so the operator has the settings. |
| **Rejects / spoilage** | main column | Log every garment scrapped. Drives the `/app/production-rejects` report. |
| **Customer applied perks** | side, bottom | Snapshot of what the customer was entitled to at order placement. |
| **Order timeline** | bottom | One chronological feed of every signal — stage changes, photos, comments, NPS, rejects, watcher adds. |

### Moving an order forward

1. Customer places order → automatically stamps `production_stage = "received"` and starts the artwork + blanks parallel tracks.
2. You advance stages from the production-stage widget. Some transitions email the customer (`awaiting_approval`, `in_production`); see `backend/src/lib/production-stage.ts:STAGES_THAT_EMAIL`.
3. Reply emails from the customer land back in the order timeline if `ORDER_INBOX_DOMAIN` is configured (replies to `inbox+ord<id>@<domain>`).
4. Once `delivered`, the NPS request fires automatically 14 days later (if `NPS_REQUESTS_ENABLED=true`).

### Approving customer artwork

When you advance artwork to `awaiting_approval`, the customer receives an email with a signed approval link. They click → see the proof + production photo → hit Approve → artwork stage auto-advances to `approved` and the production track unblocks.

You'll see the approval recorded on the order timeline + on the artwork track in the production-stage widget.

### Stale-order alerts

If you forget about an order for 3+ days, the system flags it with a red badge and (if `SLACK_PRODUCTION_WEBHOOK_URL` is set) posts a digest to `#production` Slack. Move the stage forward and the flag clears.

---

## Customer management

### The customer detail page

| Widget | What it does |
| --- | --- |
| **Lifetime value** | LTV, order count, AOV, days-since-last + "Suggest VIP tag" button when threshold is crossed |
| **Tags + notes** | Pinnable internal notes and colour-coded labels (VIP, Wholesale, Tricky, etc.) |
| **Tax status** | Flag a customer as tax-exempt (no GST on invoices). Their orders snapshot this flag at placement so invoices stay accurate. |
| **Customer journey** | Unified timeline pulling PostHog page-views + orders + NPS + saved designs + tag changes |

### Snooze notes

Add a note with a snooze date ("call back Tuesday"). It dims until that date, then surfaces in Studio's "Snoozes due" bucket so you don't drop the ball.

### Marketing consent (customer side)

Customers manage their own email/SMS/retargeting consent from their account profile page. The "Marketing emails" toggle gates every automated marketing send (abandoned cart, win-back, NPS request).

---

## Quote pipeline

Path: `/app/quotes`

Every BYO inquiry, contact form quote request, or admin-created lead lands here as a "new" quote. Move it through the pipeline:

```
new → quoted → accepted → (becomes a real cart)
           ↘ lost / expired
```

**Per-quote actions:**

- **Edit line items** — operator-edited freeform JSON; used as the working draft.
- **Set total estimate** — what you're quoting them in AUD.
- **Assign to staff** — drives the "Quotes waiting on you" Studio bucket.
- **Copy customer accept link** — generates an HMAC-signed URL you paste into the customer email. Customer clicks → reviews the line items → hits Accept → backend builds a real cart and sends them to checkout.

**Mood boards:** Inquiries from the BYO form can include up to 5 reference images. They appear as thumbnails at the top of the quote detail.

---

## Organisation accounts

Path: `/app/organisations`

For schools, sports clubs, businesses — anything that groups multiple customers under one shared purchasing identity.

- **Members:** add individual customers with a role (`owner` / `purchaser` / `viewer`).
- **Default pricing tier:** future hook for price-list overrides.
- **Tax-exempt:** flag snapshots to every order placed by org members.
- **Notes:** internal context for the sales team.

Customers see their memberships at `/account/organisations` on the storefront.

---

## Production tooling

### Production calendar (Gantt)

Path: `/app/production-calendar`

Every in-flight order plotted against its created_at + deadline. Colour = stage. Red glow = stale. Click any bar to open the order.

Use it to:
- Eyeball capacity before promising a deadline ("can we fit this in?").
- Spot deadlines that need attention (red bars approaching today).
- Plan resource allocation for the week.

### Production rejects report

Path: `/app/production-rejects`

Aggregates every reject row staff log on order detail pages.

- **By reason:** misprint → operator drift; supplier_defect → bad batch; artwork_error → customer problem.
- **By supplier brand:** dollar value of waste per supplier (AS Colour vs FashionBiz vs etc.). Use it as evidence when chasing supplier credits.

### Print recipes

Path: `/app/print-recipes`

Reusable production settings library. Capture mesh count, flash temp, ink type, embroidery digitization file location, etc. Link recipes to specific orders so operators have the right settings without asking senior staff.

Searchable by name, filterable by decoration method (screen print / DTF / embroidery / etc.).

### Lookbook (public gallery)

Path: `/app/lookbook` → renders to `/lookbook` on the storefront

Curated photos of real SC PRINTS jobs as a Pinterest-style grid. Use it to:
- Soft-sell outcomes (tagged hoodie on a real player) instead of blanks.
- Build social proof for new visitors.
- Reuse approved customer photos with attribution.

Tag tiles by theme (sports / corporate / school / embroidery) — they show as filter chips on the public page. Toggle published on/off without deleting.

---

## Reports

Path: `/app/reports`

The Reports page (pre-existing) covers business-level KPIs. Monthly digest of these goes to `MONTHLY_DIGEST_RECIPIENTS` on the 1st of each month.

The SEO analytics page at `/app/seo-analytics` shows GSC + GA4 metrics with a 28-day window.

---

## Automation rules

Path: `/app/automation-rules`

No-code "when X happens, do Y" rules. Triggers on `order.placed` and `order.production_stage_changed`. Conditions support `eq / neq / gt / gte / lt / lte / contains / exists` operators. Actions:
- Tag a customer (e.g. "if LTV > $1500, tag VIP")
- Post an internal order comment
- Send an alert email to staff
- Advance the production stage

Useful for catching patterns without writing code.

---

## What runs automatically (you don't have to do anything)

| Cron | When | What |
| --- | --- | --- |
| AS Colour inventory sync | hourly | Pulls stock from supplier API |
| Cross-sell recommendations | 02:00 UTC daily | Recomputes "frequently bought together" per product |
| PostHog cohort sync | 03:30 UTC daily | Reconciles PostHog cohorts to Medusa customer_tags |
| FashionBiz inventory sync | 04:00 UTC daily | Same as AS Colour for FashionBiz brands |
| SEO analytics refresh | 05:00 UTC daily | Pulls GSC + GA4 metrics |
| Stale-order scan | 08:00 UTC daily | Stamps `is_stale` on orders not advancing |
| NPS request | 22:00 UTC daily | Sends NPS emails 14 days after delivery |
| Abandoned-cart reminders | 23:15 UTC daily | Emails customers with stale carts |
| Reorder reminders | 23:30 UTC daily | Pings repeat customers past their median order gap |
| Report alerts | 23:45 UTC daily | Threshold breach checks |
| Win-back | 00:00 UTC Mondays | Weekly inactive-customer email |
| Monthly digest | 22:00 UTC, 2nd of month | Reports digest to staff |

Each cron has its own `*_ENABLED` env var (see `backend/src/lib/constants.ts`). They default to off so dev / staging environments stay quiet.

---

## Common tasks → where to do them

| I want to… | Go to |
| --- | --- |
| See what needs my attention today | `/app/studio` |
| Find a customer who hasn't ordered in a while | `/app/studio` → "VIPs who've gone quiet" |
| Add a snooze reminder for a customer | Customer detail → Notes → add note with snooze date |
| Mark a customer tax-exempt | Customer detail → Tax status widget |
| Tag a customer as VIP / Wholesale | Customer detail → Tags widget |
| Run a quote through to a paid order | `/app/quotes` → edit → Copy customer accept link → email it |
| Plan the week's production | `/app/production-calendar` |
| Log a reject from this morning's misprint | Order detail → Rejects/spoilage widget |
| Photo of the print on the press | Order detail → Production photos widget (upload from phone) |
| Save settings that worked for a tricky job | `/app/print-recipes` → New recipe → link to the order |
| Add a parent to receive order updates | Order detail → Watchers widget (or customer does it themselves) |
| Set a deposit + balance schedule | Order detail → Deposit & balance widget |
| Group order for a sports club | The club creates one via API; share the link they got back |
| Add a school as an org account | `/app/organisations` → New organisation → add members |
| Surface a finished job on the gallery | `/app/lookbook` → New tile → upload photo |
| See where waste is coming from | `/app/production-rejects` |
| Audit a customer's interactions | Customer detail → Customer journey widget |
| Resend an accept link to a customer | Quote detail → Copy customer accept link |
| Generate a tax invoice | Customer side: `/account/orders/[id]` → Tax invoice button |
| Anonymise a customer (right to be forgotten) | Backend API only — not a button in admin (deliberate) |

---

## What's *not* in the admin yet

These features exist as backend infrastructure but don't have admin UI:

- **Right-to-be-forgotten** — there's a `POST /admin/customers/:id/anonymize` endpoint, but no button. Use a tool like `curl` or Postman when needed.
- **Mass design action (customizer)** — the modal component is built but not yet wired into the customizer template chrome. Drop it in when you're ready.
- **Inbound email webhook** — needs a DNS MX record + inbound parser config at your email provider (Postmark / SendGrid / Resend Inbound). Until then, reply-to aliases bounce.

---

## When something looks wrong

1. **Check `/app/reports/system-health`** — quick view of cron statuses and external services.
2. **Check the Railway logs** — every cron + subscriber logs a one-liner on each run.
3. **Check the order's timeline widget** — every event the system captured for that order, newest first.
4. **Ask in `#production` Slack** — many alerts post there automatically.

---

## Glossary

- **Production stage** — Where the order is in the build pipeline (received / art_review / in_production / shipped / delivered).
- **Artwork stage** — Parallel track tracking the customer's artwork approval (pending / in_review / awaiting_approval / approved).
- **Blanks stage** — Parallel track tracking the supplier garment order (not_started / ordered / arrived).
- **LTV** — Lifetime value. Sum of order totals across non-cancelled orders.
- **NPS** — Net Promoter Score. Customer rates 1–5 after delivery.
- **Watcher** — Extra email address on an order that gets CC'd on stage-change emails.
- **Stale order** — Order whose production stage hasn't advanced in 3+ days.
- **Snooze** — A customer note with a future "remind me" date.
- **Org / organisation** — A school, club, business — a group of customers sharing identity.
- **Recipe** — Reusable production settings for a job (mesh count, ink, etc.).

---

## Getting help

If something doesn't behave like this guide describes, the most likely causes are:

1. The relevant `*_ENABLED` env var is off.
2. The relevant email provider key isn't set.
3. The migration for a new feature hasn't run yet (boot the backend; it auto-migrates).

If none of those fix it, the technical context lives in [`/CLAUDE.md`](../CLAUDE.md) at the repo root, and the data-flow map is in [`BACKEND_FLOW.md`](./BACKEND_FLOW.md).
