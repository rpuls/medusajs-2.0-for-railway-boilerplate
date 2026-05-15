# SC PRINTS backend flow map

How information moves through the platform — from customer-facing trigger to internal artefacts.

Pairs with [`STAFF_GUIDE.md`](./STAFF_GUIDE.md) (the "what should I click?" view).

Diagrams use Mermaid — they render natively on GitHub, in most IDEs (VS Code with Markdown Mermaid extension), and on `mermaid.live`.

---

## The big picture

```mermaid
flowchart TB
    subgraph CUST["Customer touchpoints"]
        STORE[Storefront catalog]
        CUSTOMIZER[Fabric.js customizer]
        ACCOUNT[/account dashboard]
        BYO[BYO inquiry form]
        EMAIL_REPLY[Reply to email]
    end

    subgraph CORE["Medusa core"]
        CART[(Cart)]
        ORDER[(Order)]
        CUSTOMER[(Customer)]
        PRODUCT[(Product)]
    end

    subgraph CUSTOM["SC PRINTS modules"]
        DESIGN[(Design + design_version)]
        WISHLIST[(Wishlist)]
        QUOTE[(Quote + events)]
        RECIPE[(Print recipe)]
        REJECT[(Production reject)]
        LOOKBOOK[(Lookbook)]
        ORG[(Organisation + members)]
        GROUP[(Group order + participants)]
        WORKSPACE[(customer_tag + customer_note + order_comment)]
    end

    subgraph EVENTS["Event bus"]
        EV_PLACED[order.placed]
        EV_STAGE[order.production_stage_changed]
        EV_ART[order.artwork_stage_changed]
        EV_CREATED[customer.created]
    end

    subgraph SUBS["Subscribers"]
        SUB_EMAIL[Email sender]
        SUB_AUTO[Automation rule engine]
        SUB_PERKS[Snapshot perks + tax_exempt]
        SUB_STAGE_STAMP[Stamp initial stage]
        SUB_PHOTO[Attach latest photo]
    end

    subgraph CRONS["Daily / weekly crons"]
        CRON_CART[Abandoned cart]
        CRON_WB[Win-back]
        CRON_NPS[NPS request]
        CRON_REORDER[Reorder reminders]
        CRON_STALE[Stale order scan]
        CRON_CROSS[Cross-sell refresh]
        CRON_PH[PostHog cohort sync]
        CRON_INV[Supplier inventory]
        CRON_SEO[SEO analytics]
    end

    subgraph OUT["Outbound channels"]
        RESEND[Resend email]
        SLACK[Slack webhook]
        POSTHOG[PostHog analytics]
        GA4[Google Analytics 4]
        SHIPSTATION[ShipStation]
        STRIPE[Stripe]
    end

    subgraph ADMIN["Admin"]
        STUDIO[Studio dashboard]
        ORDER_PAGE[Order detail widgets]
        CUSTOMER_PAGE[Customer detail widgets]
        REPORTS[Reports]
        GANTT[Production calendar]
        QUOTE_PAGE[Quote pipeline]
    end

    STORE --> CART
    CUSTOMIZER --> CART
    CART --> ORDER
    BYO --> QUOTE
    ACCOUNT -.reads.-> ORDER
    ACCOUNT -.reads.-> DESIGN
    ACCOUNT -.reads.-> WISHLIST

    ORDER --> EV_PLACED
    EV_PLACED --> SUB_EMAIL
    EV_PLACED --> SUB_AUTO
    EV_PLACED --> SUB_PERKS
    EV_PLACED --> SUB_STAGE_STAMP

    ORDER --> EV_STAGE
    EV_STAGE --> SUB_EMAIL
    EV_STAGE --> SUB_PHOTO

    CUSTOMER --> EV_CREATED
    EV_CREATED --> SUB_AUTO

    SUB_EMAIL --> RESEND
    SUB_AUTO --> WORKSPACE
    SUB_AUTO --> ORDER
    SUB_PERKS --> ORDER
    SUB_STAGE_STAMP --> ORDER

    CRON_CART --> RESEND
    CRON_WB --> RESEND
    CRON_NPS --> RESEND
    CRON_REORDER --> RESEND
    CRON_STALE --> ORDER
    CRON_STALE --> SLACK
    CRON_CROSS --> PRODUCT
    CRON_PH --> WORKSPACE

    CUSTOMIZER -.identify+events.-> POSTHOG
    STORE -.pageview+ecom.-> GA4
    STORE -.pageview+ecom.-> POSTHOG

    EMAIL_REPLY -.inbox+ord alias.-> WORKSPACE

    STUDIO -.reads.-> ORDER
    STUDIO -.reads.-> CUSTOMER
    STUDIO -.reads.-> QUOTE
    STUDIO -.reads.-> WORKSPACE
    ORDER_PAGE -.reads.-> ORDER
    ORDER_PAGE -.reads.-> RECIPE
    ORDER_PAGE -.reads.-> REJECT
    CUSTOMER_PAGE -.reads.-> POSTHOG
    REPORTS -.reads.-> ORDER

    classDef ext fill:#fef3c7,stroke:#92400e;
    classDef cron fill:#dbeafe,stroke:#1e40af;
    classDef sub fill:#e0e7ff,stroke:#3730a3;
    class RESEND,SLACK,POSTHOG,GA4,SHIPSTATION,STRIPE ext;
    class CRON_CART,CRON_WB,CRON_NPS,CRON_REORDER,CRON_STALE,CRON_CROSS,CRON_PH,CRON_INV,CRON_SEO cron;
    class SUB_EMAIL,SUB_AUTO,SUB_PERKS,SUB_STAGE_STAMP,SUB_PHOTO sub;
```

**How to read it:**
- **Yellow** = external service (Resend, Slack, PostHog, etc.).
- **Blue** = cron job (runs on a schedule).
- **Indigo** = subscriber (runs in response to an event).
- Solid arrows = primary data flow.
- Dotted arrows = "reads from" or "captures into" (no write to the source).

---

## Order lifecycle (the spine)

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant SF as Storefront
    participant BE as Backend
    participant ST as Staff (Admin)
    participant EM as Email (Resend)
    participant SL as Slack

    C->>SF: Add to cart from customizer
    SF->>BE: POST /store/carts/.../scp-line-items
    BE-->>SF: cart updated

    C->>SF: Checkout + pay
    SF->>BE: complete cart
    BE->>BE: emit order.placed
    BE->>BE: stamp production_stage="received"
    BE->>BE: snapshot tax_exempt + perks
    BE->>BE: hydrate lifetime_value on payload
    BE->>BE: run automation rules
    BE->>EM: Order placed email (to customer + merchant)

    Note over BE: order moves through artwork + blanks + production tracks

    ST->>BE: Advance artwork to awaiting_approval
    BE->>BE: emit order.artwork_stage_changed
    BE->>EM: Artwork approval email (HMAC-signed link)
    EM->>C: deliver

    C->>SF: Click approve link
    SF->>BE: POST /store/artwork-approval
    BE->>BE: advance artwork_stage to approved
    BE->>BE: re-emit artwork_stage_changed

    ST->>BE: Upload production photo
    BE->>BE: store URL on order.metadata.production_photos

    ST->>BE: Advance to in_production
    BE->>BE: emit order.production_stage_changed
    BE->>BE: read latest photo from metadata
    BE->>EM: Stage email with photo + watcher BCCs
    EM->>C: deliver

    ST->>BE: Advance to shipped (Medusa core)
    BE->>EM: Order shipped email (Medusa core)

    ST->>BE: Advance to delivered
    Note over BE: 14 days later, NPS cron fires

    BE->>EM: NPS request email (HMAC-signed buttons)
    EM->>C: deliver
    C->>SF: Click 1-5 score
    SF->>BE: POST /store/nps
    BE->>BE: store on order.metadata.nps_*

    Note over BE: Daily stale-order scan at 08:00 UTC
    BE->>BE: Stamp is_stale on idle orders
    BE->>SL: Digest of newly-stale orders
```

---

## The production-stage state machine

```mermaid
stateDiagram-v2
    [*] --> received: order.placed

    state Production {
        received --> in_production
        in_production --> quality_check
        quality_check --> shipped
        shipped --> delivered
        delivered --> [*]
    }

    state Artwork {
        [*] --> pending: parallel start
        pending --> in_review
        in_review --> awaiting_approval
        awaiting_approval --> approved: customer clicks Approve
        awaiting_approval --> in_review: customer requests changes
    }

    state Blanks {
        [*] --> not_started: parallel start
        not_started --> ordered
        ordered --> arrived
    }

    note right of Artwork
        runs in parallel
        with Production
    end note

    note right of Blanks
        runs in parallel
        with Production
    end note
```

The three tracks run in parallel; nothing is hard-gated. Customer sees one "Preparing" milestone collapsing artwork + blanks; the production-stage tracker on `/account/orders/details/<id>` shows the two mini-tracks side by side.

Emails fire only on specific transitions (`STAGES_THAT_EMAIL` in `backend/src/lib/production-stage.ts`). Rollbacks don't re-send.

---

## How customer marketing data flows

```mermaid
flowchart LR
    subgraph SOURCES["Where customer data is captured"]
        SIGNUP[Storefront signup]
        NEWSLETTER[Newsletter footer form]
        QUOTE_REQ[Quote request]
        CHAT[Crisp / Tidio chat]
    end

    subgraph CONSENT["Consent layer"]
        FLAG[customer.metadata.marketing_consent_email]
    end

    subgraph SEGMENT["Segmentation"]
        TAG[customer_tag]
        LTV_AUTO[Automation rule:<br/>LTV > $1500 → VIP tag]
        PH_COHORT[PostHog cohort sync]
    end

    subgraph CAMPAIGNS["Outbound campaigns"]
        ABANDONED[Abandoned cart cron]
        WINBACK[Win-back cron]
        REORDER[Reorder reminder cron]
        NPS_C[NPS request cron]
        CROSSSELL[Cross-sell PDP block]
    end

    SIGNUP --> FLAG
    NEWSLETTER --> FLAG
    QUOTE_REQ -.contact form.-> FLAG

    FLAG --> ABANDONED
    FLAG --> WINBACK
    FLAG --> REORDER
    FLAG --> NPS_C

    LTV_AUTO --> TAG
    PH_COHORT --> TAG
    TAG --> CROSSSELL

    TAG -.read by.-> ABANDONED
    TAG -.read by.-> WINBACK

    classDef consent fill:#fee2e2,stroke:#991b1b;
    classDef seg fill:#dcfce7,stroke:#166534;
    classDef camp fill:#dbeafe,stroke:#1e3a8a;
    class FLAG consent;
    class TAG,LTV_AUTO,PH_COHORT seg;
    class ABANDONED,WINBACK,REORDER,NPS_C,CROSSSELL camp;
```

**Consent gates every marketing send.** If a customer's `marketing_consent_email` is explicitly `false`, none of the four crons (abandoned, win-back, reorder, NPS) will email them. Tags are still applied — they just don't trigger automated outreach.

---

## Quote → cart conversion flow

```mermaid
sequenceDiagram
    autonumber
    participant C as Customer
    participant BYO as BYO form
    participant ST as Staff (Admin)
    participant BE as Backend
    participant EM as Email

    C->>BYO: Submit inquiry + mood board
    BYO->>BE: POST /api/quote → /store/quotes
    BE->>BE: Create quote (status=new)
    BE->>BE: Upload mood board to MinIO
    BE->>EM: Notify merchant team

    ST->>BE: Open quote in /app/quotes
    ST->>BE: Edit line items + total estimate
    ST->>BE: Set status=quoted
    ST->>BE: Copy accept link
    Note over ST,C: Staff pastes link into their<br/>own email to the customer

    C->>BE: GET /store/quotes/:id?sig=...
    BE-->>C: Render quote details

    C->>BE: POST /store/quotes/:id/accept
    BE->>BE: Verify HMAC signature
    BE->>BE: Pick region + sales_channel
    BE->>BE: createCartWorkflow
    BE->>BE: For each line_item with variant_id:<br/>addToCartWorkflow
    BE->>BE: Mark quote accepted + log event
    BE-->>C: { cart_id, lines_added }

    C->>C: Redirect to /cart
    Note over C,BE: Customer reviews + checks out<br/>via normal Stripe flow
```

---

## What writes where (data ownership map)

```mermaid
flowchart LR
    subgraph CORE_TABLES["Core Medusa tables"]
        T_ORDER[order]
        T_CUSTOMER[customer]
        T_CART[cart]
        T_PRODUCT[product]
    end

    subgraph CUSTOM_TABLES["SC PRINTS tables"]
        T_DESIGN[design / design_version]
        T_WISHLIST[wishlist_item]
        T_QUOTE[quote / quote_event]
        T_RECIPE[print_recipe]
        T_REJECT[production_reject]
        T_LOOKBOOK[lookbook_item]
        T_ORG[organisation / organisation_member]
        T_GROUP[group_order / group_order_participant]
        T_TAG[customer_tag]
        T_NOTE[customer_note]
        T_COMMENT[order_comment]
    end

    subgraph META["Stored on order.metadata"]
        M_STAGE[production_stage_*]
        M_ARTWORK[artwork_stage_*]
        M_BLANKS[blanks_stage_*]
        M_PHOTOS[production_photos]
        M_NPS[nps_score / nps_comment]
        M_PERKS[applied_perks]
        M_TAX[tax_exempt + reason]
        M_WATCHERS[watcher_emails]
        M_DEPOSIT[deposit_*]
        M_STALE[is_stale + stale_since]
        M_RECIPE_LINKS[print_recipe_ids]
    end

    subgraph CUST_META["Stored on customer.metadata"]
        CM_CONSENT[marketing_consent_*]
        CM_TAX[tax_exempt + reason]
        CM_LAST_WINBACK[last_winback_sent_at]
        CM_LAST_NPS[last_nps_request_sent_at]
        CM_LAST_REORDER[last_reorder_reminder_sent_at]
    end

    subgraph PRODUCT_META["Stored on product.metadata"]
        PM_XSELL[cross_sell_product_ids]
    end

    T_ORDER --> M_STAGE
    T_ORDER --> M_ARTWORK
    T_ORDER --> M_BLANKS
    T_ORDER --> M_PHOTOS
    T_ORDER --> M_NPS
    T_ORDER --> M_PERKS
    T_ORDER --> M_TAX
    T_ORDER --> M_WATCHERS
    T_ORDER --> M_DEPOSIT
    T_ORDER --> M_STALE
    T_ORDER --> M_RECIPE_LINKS

    T_CUSTOMER --> CM_CONSENT
    T_CUSTOMER --> CM_TAX
    T_CUSTOMER --> CM_LAST_WINBACK
    T_CUSTOMER --> CM_LAST_NPS
    T_CUSTOMER --> CM_LAST_REORDER

    T_PRODUCT --> PM_XSELL
```

**Rule of thumb when adding new state:**
- "Read in many places, written in many places, queried for reports" → new table.
- "Read in one or two places, snapshot of a moment in time" → metadata on order / customer / product.

---

## Group order → cart conversion

```mermaid
sequenceDiagram
    autonumber
    participant C as Coach (customer)
    participant SF as Storefront
    participant BE as Backend
    participant P as Participant (parent / player)

    C->>SF: Save a design in customizer
    C->>SF: /account/designs → "Use for a group order"
    SF->>BE: POST /store/group-orders { base_design_id, base_product_id, ... }
    BE-->>SF: { public_token }
    SF-->>C: Share link

    Note over C,P: Coach distributes share link

    P->>SF: GET /group-order/[token]
    SF->>BE: GET /store/group-orders/[token]
    BE-->>SF: { group_order, design_preview, product_preview, participants }
    SF-->>P: Render design + product preview + size picker (sized by real variants)

    P->>SF: Submit name + size + qty
    SF->>BE: POST /store/group-orders/[token]/participants
    BE-->>SF: { participant }

    Note over C: Coach closes the group order

    C->>SF: /account/group-orders → Convert to cart
    SF->>BE: POST /store/customers/me/group-orders/[id]/convert-to-cart
    BE->>BE: For each participant:<br/>match size_label → variant_id
    BE->>BE: createCartWorkflow + addToCartWorkflow per matched line
    BE->>BE: Stamp group_order.status=converted + cart_id
    BE-->>SF: { cart_id, lines_added, skipped: [...] }

    C->>SF: Review skipped + open /cart
    SF->>BE: Checkout via standard Stripe flow
```

Convert-to-cart edge cases:

- **0 participants** → 400, "Add at least one participant".
- **No base product** → 400, "Add a base product".
- **Base product no longer exists** → 404.
- **No size matches** → 400 with the full skipped list so the coach can fix sizes.
- **Some matches, some misses** → cart is built, skipped list returned (success path).
- **Already converted** → returns existing cart_id, doesn't double-build.
- **Caller isn't the owner** → 404 (don't leak existence).

---

## AI description generator

```mermaid
flowchart LR
    subgraph IN[Admin product detail]
        ADMIN[Admin clicks Generate]
        HINT[Optional hint]
    end

    subgraph BACKEND_AI[Backend]
        ROUTE[POST /admin/products/:id/generate-description]
        CTX[ProductContext]
        PROMPT[Pure prompt builder]
        SVC[generateProductDescriptions]
    end

    subgraph EXT[External LLM]
        OPENAI[OpenAI Chat Completions]
        ANTHROPIC[Anthropic Messages API]
    end

    PARSE[parseDescriptionResponse]
    DRAFTS[3 drafts: Short / Standard / Detailed]

    ADMIN --> ROUTE
    HINT --> ROUTE
    ROUTE --> CTX
    CTX --> PROMPT
    PROMPT --> SVC
    SVC -- AI_PROVIDER=openai --> OPENAI
    SVC -- AI_PROVIDER=anthropic --> ANTHROPIC
    OPENAI --> PARSE
    ANTHROPIC --> PARSE
    PARSE --> DRAFTS
    DRAFTS --> ADMIN

    classDef ext fill:#fef3c7,stroke:#92400e;
    class OPENAI,ANTHROPIC ext;
```

Pure separation: `prompt.ts` (build + parse) has zero network dependency and is tested with literal fixtures (16 unit tests). `generate.ts` adds provider dispatch + timeout + error normalisation. The route adds context-gathering + status-code mapping.

Failure modes returned to the admin:

| Code | Error | What the widget shows |
| --- | --- | --- |
| 503 | `not_configured` | "AI provider not configured. Set AI_PROVIDER + the matching API key…" |
| 504 | `timeout` | "Provider took too long — try again." |
| 429 | `rate_limited` | "Provider rate-limited us — try again shortly." |
| 502 | `upstream` | Provider's error message (truncated). |
| 502 | `empty` | "Model responded but no drafts parseable — try a different hint." |

Never sends pricing, SKUs, or stock to the LLM. Only safe-keyed metadata (`fabric_blend`, `gsm`, `fit`, `neckline`, `season`, `country_of_origin`, `care_instructions`, `decoration_methods`).

---

## Print queue optimiser

```mermaid
flowchart TB
    subgraph IN[Inputs]
        ORDERS[(In-flight orders<br/>received → in_production)]
        LINES[Line item metadata<br/>customizerDesign / decorationDesign]
        META[Order metadata<br/>decoration_method, ink_colours, deadline_at, is_stale]
        RECIPES[(Linked print_recipe ids)]
    end

    subgraph PIPE[Get queue]
        SPLIT[Split each order into N jobs<br/>one per decoration method]
        EXTRACT[Extract method + colours from line items<br/>fall back to order metadata]
    end

    subgraph PURE[Pure buildPrintQueue]
        SIG[colourSignature:<br/>lowercase + sorted + dedupe]
        BUCKETS[Bucket jobs by &lt;method, colours&gt;]
        SORT_J[Sort within bucket:<br/>stale → deadline asc → FIFO]
        SORT_B[Sort buckets:<br/>has_stale → total_units desc → alphabetical]
    end

    OUT[(Ordered batches rendered<br/>at /app/print-queue)]

    ORDERS --> EXTRACT
    LINES --> EXTRACT
    META --> EXTRACT
    EXTRACT --> SPLIT
    SPLIT --> SIG
    RECIPES --> BUCKETS
    SIG --> BUCKETS
    BUCKETS --> SORT_J
    SORT_J --> SORT_B
    SORT_B --> OUT
```

Pure compute (16 unit tests). Container wrapper pulls inputs and feeds them in. The route just returns the buckets — no DB writes, no caching layer.

Edge-case handling in the pure function:

- Empty / null input → empty output.
- Malformed jobs (no order_id, no method) → silently dropped.
- Same colour set in different order / case → same bucket.
- Order with multiple techniques → appears in multiple buckets (deliberate).
- Null / invalid deadlines → sorted to end-of-bucket.
- Tied buckets → alphabetical tiebreaker, deterministic output.
- Identical inputs in different order → identical output (re-run safe).

---

## External services touched

| Service | Purpose | Auth | Where configured |
| --- | --- | --- | --- |
| **Resend** | All outbound email | `RESEND_API_KEY` | `backend/src/lib/constants.ts` |
| **MinIO** | File storage (photos, mood boards, lookbook, customer originals) | `MINIO_*` | `backend/src/lib/constants.ts` |
| **PostHog** | Analytics + cohort sync + LLM tracking | `POSTHOG_*` | env vars; SDK in `storefront/src/lib/posthog.ts` |
| **GA4** | E-commerce funnel tracking | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `storefront/src/lib/analytics.ts` |
| **Stripe** | Card payments | `STRIPE_API_KEY` + webhook secret | Medusa payment provider |
| **PayPal** | Card alternative | `PAYPAL_*` | Medusa payment provider |
| **ShipStation** | Shipping label rates + tracking | `SHIPSTATION_*` | `backend/src/api/hooks/shipstation/` |
| **AS Colour API** | Supplier garment catalog + inventory | `ASCOLOUR_*` | `backend/src/modules/ascolour/` |
| **FashionBiz API** | Supplier garment catalog + inventory | `FASHIONBIZ_*` | `backend/src/modules/fashionbiz/` |
| **Google Search Console + GA4 admin** | SEO reporting | `GOOGLE_SERVICE_ACCOUNT_JSON` | `backend/src/services/seo-analytics/` |
| **Crisp / Tidio** | Live chat | `NEXT_PUBLIC_CRISP_WEBSITE_ID` or `NEXT_PUBLIC_TIDIO_PUBLIC_KEY` | storefront layout |
| **OpenAI / Anthropic** (optional) | AI product description generator | `AI_PROVIDER` + `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | `backend/src/services/ai-copy/` |
| **Slack** (optional) | Production-floor alerts | `SLACK_PRODUCTION_WEBHOOK_URL` | `backend/src/services/stale-orders/scan.ts` |
| **Postmark / SendGrid / Resend inbound** (optional) | Customer email replies → order comments | `ORDER_INBOX_DOMAIN` + `INBOUND_EMAIL_SECRET` + DNS MX | `backend/src/api/hooks/inbound-email/` |
| **Meilisearch** | Catalog search | `MEILISEARCH_HOST` | Medusa search plugin |

---

## Cron schedule cheatsheet (all UTC)

```mermaid
gantt
    title Daily cron schedule (UTC)
    dateFormat HH:mm
    axisFormat %H:%M

    section Inventory + analytics
    AS Colour inventory (hourly)   :00:00, 1h
    Cross-sell refresh             :02:00, 30m
    PostHog cohort sync            :03:30, 30m
    FashionBiz inventory           :04:00, 30m
    SEO analytics                  :05:00, 30m

    section Production
    Stale-order scan               :08:00, 15m

    section Marketing
    NPS request                    :22:00, 30m
    Abandoned-cart reminder        :23:15, 30m
    Reorder reminder               :23:30, 30m
    Report alerts                  :23:45, 15m
```

Weekly: win-back fires Mondays 00:00 UTC. Monthly: report digest fires the 2nd at 22:00 UTC.

Every cron is gated by an `*_ENABLED=true` env var so dev / staging stays quiet by default.

---

## Where things live in the codebase

Quick lookup for "I want to read / change the code for…":

| Feature | File / directory |
| --- | --- |
| Production stage list + emails | `backend/src/lib/production-stage.ts` |
| Stage-changed subscriber | `backend/src/subscribers/order-production-stage-changed.ts` |
| Artwork approval flow | `backend/src/services/artwork-approval/` + `backend/src/api/store/artwork-approval/` |
| LTV computation | `backend/src/services/customer-ltv/compute-ltv.ts` |
| Studio aggregator | `backend/src/services/studio-dashboard/build.ts` |
| Quote → cart conversion | `backend/src/api/store/quotes/[id]/accept/route.ts` |
| Cross-sell recommendations | `backend/src/services/cross-sell-recommendations/` |
| Production ETA | `backend/src/services/production-eta/` |
| Print queue optimiser | `backend/src/services/print-queue/build.ts` (+ `get-queue.ts`) |
| AI description generator | `backend/src/services/ai-copy/prompt.ts` + `generate.ts` |
| Group order convert-to-cart | `backend/src/api/store/customers/me/group-orders/[id]/convert-to-cart/route.ts` |
| Stale-order scan | `backend/src/services/stale-orders/scan.ts` |
| Order timeline aggregator | `backend/src/services/order-timeline/build.ts` |
| Customer journey aggregator | `backend/src/services/customer-journey/build.ts` |
| Inbound email webhook | `backend/src/api/hooks/inbound-email/route.ts` |
| Tax invoice HTML | `backend/src/api/store/customers/me/orders/[id]/invoice/route.ts` |
| Email templates | `backend/src/modules/email-notifications/templates/` |
| Automation rule engine | `backend/src/services/automation-rules/evaluate.ts` |

---

## When you add a new feature, the checklist

1. **Does this state live across multiple read paths?** → new entity, not metadata.
2. **Does it need a migration?** → add to `backend/src/modules/<name>/migrations/` and Medusa auto-runs on boot.
3. **Does it fire an event?** → add a subscriber under `backend/src/subscribers/`.
4. **Does it need to react to a schedule?** → add to `backend/src/jobs/` and pick a free slot from the Gantt above.
5. **Is it gated for safety?** → add an `*_ENABLED=true` env var with `false` default.
6. **Does staff need to see / interact with it?** → admin widget at the right zone, or new route under `backend/src/admin/routes/`.
7. **Does the customer see it?** → storefront page + data lib under `storefront/src/lib/data/`.
8. **Does it produce a number worth tracking?** → emit a PostHog event with `getPostHog()?.capture(...)`.
9. **Should staff understand it without asking?** → add a `<HelpTooltip>` next to the heading explaining the *why* and the gotchas.

Following this checklist keeps every feature consistent with the patterns already in the codebase. Deviating is fine when there's a reason — just be deliberate.
