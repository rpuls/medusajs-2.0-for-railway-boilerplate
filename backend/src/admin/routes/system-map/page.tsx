import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { type ReactNode, useEffect, useId, useRef, useState } from "react"

// ─── Mermaid lazy-loader ───────────────────────────────────────────────────────

type MermaidAPI = {
  initialize: (cfg: Record<string, unknown>) => void
  render: (id: string, def: string) => Promise<{ svg: string }>
}

let _m: MermaidAPI | null = null
let _p: Promise<MermaidAPI> | null = null

const loadMermaid = (): Promise<MermaidAPI> => {
  if (_m) return Promise.resolve(_m)
  if (_p) return _p
  _p = import("mermaid").then((mod) => {
    const api = mod.default as MermaidAPI
    api.initialize({
      startOnLoad: false,
      theme: "base",
      securityLevel: "loose",
      themeVariables: {
        // Foundation
        background: "#ffffff",
        mainBkg: "#f8fafc",
        nodeBkg: "#f8fafc",
        nodeBorder: "#e2e8f0",
        clusterBkg: "#f8fafc",
        clusterBorder: "#e2e8f0",
        titleColor: "#0f172a",

        // Primary nodes — violet tint
        primaryColor: "#f5f3ff",
        primaryTextColor: "#1e293b",
        primaryBorderColor: "#8b5cf6",

        // Secondary nodes — slate
        secondaryColor: "#f1f5f9",
        secondaryTextColor: "#475569",
        secondaryBorderColor: "#94a3b8",

        // Tertiary nodes — amber (external services)
        tertiaryColor: "#fffbeb",
        tertiaryTextColor: "#92400e",
        tertiaryBorderColor: "#f59e0b",

        // Edges & labels
        lineColor: "#94a3b8",
        edgeLabelBackground: "#f8fafc",
        textColor: "#334155",

        // Typography
        fontFamily: 'Inter, "system-ui", -apple-system, sans-serif',
        fontSize: "13px",

        // Sequence diagrams
        actorBkg: "#f5f3ff",
        actorBorder: "#8b5cf6",
        actorTextColor: "#1e293b",
        actorLineColor: "#e2e8f0",
        signalColor: "#64748b",
        signalTextColor: "#334155",
        noteBkgColor: "#fefce8",
        noteTextColor: "#713f12",
        noteBorderColor: "#fbbf24",
        activationBkgColor: "#ede9fe",
        activationBorderColor: "#8b5cf6",
        sequenceNumberColor: "#ffffff",
        labelBoxBkgColor: "#f5f3ff",
        labelBoxBorderColor: "#8b5cf6",
        labelTextColor: "#1e293b",
        loopTextColor: "#1e293b",

        // State diagrams
        labelColor: "#1e293b",
        altBackground: "#f1f5f9",
        compositeBackground: "#f8fafc",
        compositeBorder: "#e2e8f0",
        compositeTitleBackground: "#ede9fe",

        // Gantt
        gridColor: "#e2e8f0",
        section0: "#f5f3ff",
        section1: "#f8fafc",
        sectionBkgColor: "#f5f3ff",
        altSectionBkgColor: "#f8fafc",
        sectionBkgColor2: "#f5f3ff",
        taskBkgColor: "#8b5cf6",
        taskBorderColor: "#7c3aed",
        taskTextColor: "#ffffff",
        taskTextLightColor: "#ffffff",
        taskTextOutsideColor: "#334155",
        taskTextClickableColor: "#334155",
        activeTaskBkgColor: "#6d28d9",
        activeTaskBorderColor: "#5b21b6",
        doneTaskBkgColor: "#c4b5fd",
        doneTaskBorderColor: "#8b5cf6",
        critBkgColor: "#fecaca",
        critBorderColor: "#ef4444",
        todayLineColor: "#ef4444",
      },
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
      sequence: { useMaxWidth: true, mirrorActors: false },
    })
    _m = api
    return api
  })
  return _p
}

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const reactId = useId()
  const id = `mmd${reactId.replace(/\W/g, "")}`
  const ref = useRef<HTMLDivElement>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let gone = false
    loadMermaid()
      .then((m) => m.render(id, chart))
      .then(({ svg }) => {
        if (!gone && ref.current) ref.current.innerHTML = svg
      })
      .catch((e) => {
        if (!gone) setErr(String(e))
      })
    return () => { gone = true }
  }, [id, chart])

  if (err)
    return (
      <div className="rounded border border-ui-border-error bg-ui-bg-subtle p-3 text-sm text-ui-fg-error">
        Diagram render error — {err}
      </div>
    )
  return <div ref={ref} className="overflow-x-auto [&_svg]:max-w-full [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto" />
}

// ─── Section definitions ───────────────────────────────────────────────────────

type Section = {
  id: string
  title: string
  diagram?: string
  body?: ReactNode
}

const SECTIONS: Section[] = [
  // ── 1. Big picture ──────────────────────────────────────────────────────────
  {
    id: "big-picture",
    title: "The big picture",
    diagram: `flowchart TB
    subgraph CUST["Customer touchpoints"]
        STORE[Storefront catalog]
        CUSTOMIZER[Fabric.js customizer]
        ACCOUNT["/account dashboard"]
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
    class SUB_EMAIL,SUB_AUTO,SUB_PERKS,SUB_STAGE_STAMP,SUB_PHOTO sub;`,
    body: (
      <ul className="text-sm list-disc pl-5 space-y-1 text-ui-fg-subtle mt-2">
        <li><span className="inline-block w-3 h-3 rounded-sm bg-amber-100 border border-amber-800 mr-1" /> <strong>Yellow</strong> = external service (Resend, Slack, PostHog…)</li>
        <li><span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-800 mr-1" /> <strong>Blue</strong> = cron job (runs on a schedule)</li>
        <li><span className="inline-block w-3 h-3 rounded-sm bg-indigo-100 border border-indigo-800 mr-1" /> <strong>Indigo</strong> = subscriber (fires on an event)</li>
        <li>Solid arrows = primary data flow. Dotted = reads from / captures into (no write to source).</li>
      </ul>
    ),
  },

  // ── 2. Order lifecycle ───────────────────────────────────────────────────────
  {
    id: "order-lifecycle",
    title: "Order lifecycle (the spine)",
    diagram: `sequenceDiagram
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
    BE->>BE: stamp production_stage=received
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
    BE->>BE: store on order.metadata.nps_star

    Note over BE: Daily stale-order scan at 08:00 UTC
    BE->>BE: Stamp is_stale on idle orders
    BE->>SL: Digest of newly-stale orders`,
  },

  // ── 3. Production-stage state machine ────────────────────────────────────────
  {
    id: "state-machine",
    title: "Production-stage state machine",
    diagram: `stateDiagram-v2
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
    end note`,
    body: (
      <Text size="small" className="text-ui-fg-subtle mt-2">
        The three tracks run in parallel — nothing is hard-gated. Emails fire only on specific transitions
        (<code>STAGES_THAT_EMAIL</code> in <code>backend/src/lib/production-stage.ts</code>).
        Rollbacks don&apos;t re-send.
      </Text>
    ),
  },

  // ── 4. Customer marketing data flow ──────────────────────────────────────────
  {
    id: "marketing-data",
    title: "Customer marketing data flow",
    diagram: `flowchart LR
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
        LTV_AUTO[Automation rule: LTV > $1500 = VIP tag]
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
    class ABANDONED,WINBACK,REORDER,NPS_C,CROSSSELL camp;`,
    body: (
      <Text size="small" className="text-ui-fg-subtle mt-2">
        Consent gates every marketing send. If <code>marketing_consent_email</code> is <code>false</code>,
        none of the four crons email the customer. Tags are still applied — they just don&apos;t trigger automated outreach.
      </Text>
    ),
  },

  // ── 5. Quote → cart conversion ───────────────────────────────────────────────
  {
    id: "quote-conversion",
    title: "Quote → cart conversion",
    diagram: `sequenceDiagram
    autonumber
    participant C as Customer
    participant BYO as BYO form
    participant ST as Staff (Admin)
    participant BE as Backend
    participant EM as Email

    C->>BYO: Submit inquiry + mood board
    BYO->>BE: POST /store/quotes
    BE->>BE: Create quote (status=new)
    BE->>BE: Upload mood board to MinIO
    BE->>EM: Notify merchant team

    ST->>BE: Open quote in /app/quotes
    ST->>BE: Edit line items + total estimate
    ST->>BE: Set status=quoted
    ST->>BE: Copy accept link
    Note over ST,C: Staff pastes link into their own email to the customer

    C->>BE: GET /store/quotes/:id?sig=...
    BE-->>C: Render quote details

    C->>BE: POST /store/quotes/:id/accept
    BE->>BE: Verify HMAC signature
    BE->>BE: Pick region + sales_channel
    BE->>BE: createCartWorkflow
    BE->>BE: addToCartWorkflow per line_item with variant_id
    BE->>BE: Mark quote accepted + log event
    BE-->>C: cart_id + lines_added

    C->>C: Redirect to /cart
    Note over C,BE: Customer reviews + checks out via normal Stripe flow`,
  },

  // ── 6. Data ownership map ────────────────────────────────────────────────────
  {
    id: "data-ownership",
    title: "What writes where (data ownership map)",
    diagram: `flowchart LR
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

    T_PRODUCT --> PM_XSELL`,
    body: (
      <Text size="small" className="text-ui-fg-subtle mt-2">
        Rule of thumb: <strong>read/written in many places, queried for reports</strong> → new table.{" "}
        <strong>Snapshot of a moment in time, read in one or two places</strong> → metadata on order / customer / product.
      </Text>
    ),
  },

  // ── 7. Group order → cart ────────────────────────────────────────────────────
  {
    id: "group-order",
    title: "Group order → cart conversion",
    diagram: `sequenceDiagram
    autonumber
    participant C as Coach (customer)
    participant SF as Storefront
    participant BE as Backend
    participant P as Participant

    C->>SF: Save a design in customizer
    C->>SF: /account/designs - Use for a group order
    SF->>BE: POST /store/group-orders
    BE-->>SF: public_token
    SF-->>C: Share link

    Note over C,P: Coach distributes share link

    P->>SF: GET /group-order/token
    SF->>BE: GET /store/group-orders/token
    BE-->>SF: group_order + design preview + product preview + participants
    SF-->>P: Render design + size picker

    P->>SF: Submit name + size + qty
    SF->>BE: POST /store/group-orders/token/participants
    BE-->>SF: participant

    Note over C: Coach closes the group order

    C->>SF: /account/group-orders - Convert to cart
    SF->>BE: POST /store/customers/me/group-orders/id/convert-to-cart
    BE->>BE: Match each participant size_label to variant_id
    BE->>BE: createCartWorkflow + addToCartWorkflow per matched line
    BE->>BE: Stamp group_order.status=converted + cart_id
    BE-->>SF: cart_id + lines_added + skipped list

    C->>SF: Review skipped + open /cart
    SF->>BE: Checkout via standard Stripe flow`,
    body: (
      <ul className="text-sm list-disc pl-5 space-y-1 text-ui-fg-subtle mt-2">
        <li>0 participants → 400 "Add at least one participant"</li>
        <li>Base product deleted → 404</li>
        <li>No size matches at all → 400 with full skipped list</li>
        <li>Some matches, some misses → cart built, skipped list returned</li>
        <li>Already converted → returns existing <code>cart_id</code>, no double-build</li>
        <li>Caller isn&apos;t the owner → 404 (don&apos;t leak existence)</li>
      </ul>
    ),
  },

  // ── 8. AI description generator ─────────────────────────────────────────────
  {
    id: "ai-descriptions",
    title: "AI description generator",
    diagram: `flowchart LR
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
    class OPENAI,ANTHROPIC ext;`,
    body: (
      <Text size="small" className="text-ui-fg-subtle mt-2">
        Never sends pricing, SKUs, or stock to the LLM — only safe-keyed metadata (<code>fabric_blend</code>,{" "}
        <code>gsm</code>, <code>fit</code>, <code>country_of_origin</code>, <code>decoration_methods</code> etc.).
        The pure prompt builder (<code>prompt.ts</code>) is fully unit-tested with no network dependency.
      </Text>
    ),
  },

  // ── 9. Print queue optimiser ─────────────────────────────────────────────────
  {
    id: "print-queue",
    title: "Print queue optimiser",
    diagram: `flowchart TB
    subgraph IN[Inputs]
        ORDERS[(In-flight orders received to in_production)]
        LINES[Line item metadata customizerDesign / decorationDesign]
        META[Order metadata: decoration_method, ink_colours, deadline_at, is_stale]
        RECIPES[(Linked print_recipe ids)]
    end

    subgraph PIPE[Get queue]
        SPLIT[Split each order into N jobs one per decoration method]
        EXTRACT[Extract method + colours from line items fall back to order metadata]
    end

    subgraph PURE[Pure buildPrintQueue]
        SIG[colourSignature: lowercase + sorted + dedupe]
        BUCKETS[Bucket jobs by method + colours]
        SORT_J[Sort within bucket: stale then deadline asc then FIFO]
        SORT_B[Sort buckets: has_stale then total_units desc then alphabetical]
    end

    OUT[(Ordered batches rendered at Production - Print queue tab)]

    ORDERS --> EXTRACT
    LINES --> EXTRACT
    META --> EXTRACT
    EXTRACT --> SPLIT
    SPLIT --> SIG
    RECIPES --> BUCKETS
    SIG --> BUCKETS
    BUCKETS --> SORT_J
    SORT_J --> SORT_B
    SORT_B --> OUT`,
    body: (
      <Text size="small" className="text-ui-fg-subtle mt-2">
        Pure compute — no DB writes, no caching. An order with multiple decoration techniques appears in
        multiple buckets (deliberate, so each machine setup runs once per technique). Same colour set in
        different order or case → same bucket.
      </Text>
    ),
  },

  // ── 10. External services ────────────────────────────────────────────────────
  {
    id: "external-services",
    title: "External services",
    body: (
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-ui-border-base">
              <th className="text-left py-2 pr-4 font-semibold text-ui-fg-base">Service</th>
              <th className="text-left py-2 pr-4 font-semibold text-ui-fg-base">Purpose</th>
              <th className="text-left py-2 pr-4 font-semibold text-ui-fg-base">Auth env var</th>
            </tr>
          </thead>
          <tbody className="text-ui-fg-subtle">
            {[
              ["Resend", "All outbound email", "RESEND_API_KEY"],
              ["MinIO", "File storage — photos, mood boards, lookbook, customer originals", "MINIO_*"],
              ["PostHog", "Analytics + cohort sync + LLM tracking", "POSTHOG_*"],
              ["GA4", "E-commerce funnel tracking", "NEXT_PUBLIC_GA_MEASUREMENT_ID"],
              ["Stripe", "Card payments", "STRIPE_API_KEY + webhook secret"],
              ["PayPal", "Card alternative", "PAYPAL_*"],
              ["ShipStation", "Shipping label rates + tracking", "SHIPSTATION_*"],
              ["AS Colour API", "Supplier garment catalog + inventory", "ASCOLOUR_*"],
              ["FashionBiz API", "Supplier garment catalog + inventory", "FASHIONBIZ_*"],
              ["Google GSC + GA4 admin", "SEO reporting", "GOOGLE_SERVICE_ACCOUNT_JSON"],
              ["Crisp / Tidio", "Live chat", "NEXT_PUBLIC_CRISP_WEBSITE_ID"],
              ["OpenAI / Anthropic (optional)", "AI product description generator", "AI_PROVIDER + API key"],
              ["Slack (optional)", "Production-floor stale-order alerts", "SLACK_PRODUCTION_WEBHOOK_URL"],
              ["Inbound email (optional)", "Customer email replies → order comments", "ORDER_INBOX_DOMAIN + INBOUND_EMAIL_SECRET"],
              ["Meilisearch", "Catalog search", "MEILISEARCH_HOST"],
            ].map(([svc, purpose, auth]) => (
              <tr key={svc} className="border-b border-ui-border-base last:border-0">
                <td className="py-2 pr-4 font-medium text-ui-fg-base whitespace-nowrap">{svc}</td>
                <td className="py-2 pr-4">{purpose}</td>
                <td className="py-2 font-mono text-xs">{auth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },

  // ── 11. Cron schedule ────────────────────────────────────────────────────────
  {
    id: "cron-schedule",
    title: "Cron schedule (all UTC)",
    diagram: `gantt
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
    Report alerts                  :23:45, 15m`,
    body: (
      <Text size="small" className="text-ui-fg-subtle mt-2">
        Weekly: win-back fires Mondays 00:00 UTC. Monthly: report digest fires the 2nd at 22:00 UTC.
        Every cron is gated by an <code>*_ENABLED=true</code> env var — dev / staging stays quiet by default.
      </Text>
    ),
  },

  // ── 12. Where things live ────────────────────────────────────────────────────
  {
    id: "code-locations",
    title: "Where things live in the codebase",
    body: (
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-ui-border-base">
              <th className="text-left py-2 pr-4 font-semibold text-ui-fg-base">Feature</th>
              <th className="text-left py-2 font-semibold text-ui-fg-base">File / directory</th>
            </tr>
          </thead>
          <tbody className="text-ui-fg-subtle">
            {[
              ["Production stage list + emails", "backend/src/lib/production-stage.ts"],
              ["Stage-changed subscriber", "backend/src/subscribers/order-production-stage-changed.ts"],
              ["Artwork approval flow", "backend/src/services/artwork-approval/ + backend/src/api/store/artwork-approval/"],
              ["LTV computation", "backend/src/services/customer-ltv/compute-ltv.ts"],
              ["Studio aggregator", "backend/src/services/studio-dashboard/build.ts"],
              ["Quote → cart conversion", "backend/src/api/store/quotes/[id]/accept/route.ts"],
              ["Cross-sell recommendations", "backend/src/services/cross-sell-recommendations/"],
              ["Production ETA", "backend/src/services/production-eta/"],
              ["Print queue optimiser", "backend/src/services/print-queue/build.ts + get-queue.ts"],
              ["AI description generator", "backend/src/services/ai-copy/prompt.ts + generate.ts"],
              ["Group order convert-to-cart", "backend/src/api/store/customers/me/group-orders/[id]/convert-to-cart/route.ts"],
              ["Stale-order scan", "backend/src/services/stale-orders/scan.ts"],
              ["Order timeline aggregator", "backend/src/services/order-timeline/build.ts"],
              ["Customer journey aggregator", "backend/src/services/customer-journey/build.ts"],
              ["Inbound email webhook", "backend/src/api/hooks/inbound-email/route.ts"],
              ["Tax invoice HTML", "backend/src/api/store/customers/me/orders/[id]/invoice/route.ts"],
              ["Email templates", "backend/src/modules/email-notifications/templates/"],
              ["Automation rule engine", "backend/src/services/automation-rules/evaluate.ts"],
            ].map(([feature, path]) => (
              <tr key={feature} className="border-b border-ui-border-base last:border-0">
                <td className="py-2 pr-4 text-ui-fg-base">{feature}</td>
                <td className="py-2 font-mono text-xs">{path}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },

  // ── 13. New feature checklist ────────────────────────────────────────────────
  {
    id: "new-feature",
    title: "When you add a new feature — checklist",
    body: (
      <ol className="text-sm list-decimal pl-5 space-y-2 text-ui-fg-subtle mt-2">
        <li><strong>Does this state live across multiple read paths?</strong> → new entity, not metadata.</li>
        <li><strong>Does it need a migration?</strong> → add to <code>backend/src/modules/&#x3C;name&#x3E;/migrations/</code> — Medusa auto-runs on boot.</li>
        <li><strong>Does it fire an event?</strong> → add a subscriber under <code>backend/src/subscribers/</code>.</li>
        <li><strong>Does it need to react to a schedule?</strong> → add to <code>backend/src/jobs/</code> and pick a free slot from the Gantt above.</li>
        <li><strong>Is it gated for safety?</strong> → add an <code>*_ENABLED=true</code> env var with <code>false</code> default.</li>
        <li><strong>Does staff need to see / interact with it?</strong> → admin widget at the right zone, or new route under <code>backend/src/admin/routes/</code>.</li>
        <li><strong>Does the customer see it?</strong> → storefront page + data lib under <code>storefront/src/lib/data/</code>.</li>
        <li><strong>Does it produce a number worth tracking?</strong> → emit a PostHog event with <code>getPostHog()?.capture(...)</code>.</li>
        <li><strong>Should staff understand it without asking?</strong> → add a <code>&#x3C;HelpTooltip&#x3E;</code> next to the heading explaining the <em>why</em> and the gotchas.</li>
      </ol>
    ),
  },
]

// ─── Page component ────────────────────────────────────────────────────────────

const SystemMapPage = () => {
  const [active, setActive] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
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
          <Heading level="h1">System map</Heading>
          <Text size="xsmall" className="text-ui-fg-muted">
            How every service, module, event, and cron connects. Source of truth: <code>Docs/BACKEND_FLOW.md</code>
          </Text>
        </div>
        <Badge color="blue">11 diagrams</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
        <nav className="border-r border-ui-border-base p-4 lg:sticky lg:top-0 lg:self-start lg:max-h-[85vh] lg:overflow-y-auto">
          <ul className="flex flex-col gap-y-1 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`block rounded px-2 py-1 leading-snug ${
                    active === s.id
                      ? "bg-ui-bg-subtle font-semibold text-[var(--brand-primary,#7c3aed)]"
                      : "text-ui-fg-base hover:bg-ui-bg-subtle"
                  }`}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 flex flex-col gap-y-12">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <Heading level="h2" className="mb-1 text-ui-fg-base">
                {s.title}
              </Heading>
              <div className="mb-4 h-px bg-ui-border-base" />
              {s.diagram && (
                <div className="rounded-xl border border-ui-border-base bg-white p-6 shadow-sm overflow-hidden">
                  <MermaidDiagram chart={s.diagram} />
                </div>
              )}
              {s.body && <div className="mt-4">{s.body}</div>}
            </section>
          ))}
        </div>
      </div>
    </Container>
  )
}

// Page is now embedded as "System map" tab in Help & guide;
// direct URL /app/system-map still works for deep links

export default SystemMapPage
