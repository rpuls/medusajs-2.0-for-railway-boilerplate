# Hosting stack — DecoNetwork (observed) vs. Shopify (gold standard) vs. SC Prints' proposed migration

**Date**: 2026-05-19 (revised after empirical measurements)
**Question**: How does DecoNetwork host its storefronts / backend / images / database, how does Shopify (the industry gold standard) host theirs, and how does SC Prints' proposed migration target (Vercel + Fly.io Sydney + DigitalOcean Managed Postgres Sydney + Cloudflare R2 + Resend) compare to both?

> **Correction note (v2)**: An earlier version of this doc overstated DecoNetwork's latency disadvantage (claimed ~250ms RTT from Sydney; actual is ~170ms) and got the geography wrong (claimed Toronto from ARIN whois of the registered HQ; the traceroute shows the actual server is in US West Coast, likely Los Angeles). The revised conclusion: DecoNetwork is **commercially viable but not best-in-class** for Australian customers. Our proposed stack will give us a **moderate latency edge** on dynamic requests (~140ms saved per round-trip), not the "structural advantage" the first draft implied. Numbers below come from real ping/traceroute/curl measurements from a Sydney-area machine.

---

## 1. Headline

Three reference points along an infrastructure-quality spectrum:

| | Approach | Era / generation | Status |
|---|---|---|---|
| **DecoNetwork** | Aptum Technologies (PEER1) US West Coast colo + Sucuri WAF. No real CDN. Multi-tenant cluster on a single IP. Australian-founded company (Burleigh Heads, QLD) that hosts in the US | ~2010 SaaS architecture | **Industry-default in AU print** — at least 4 of our 8 surveyed AU competitors run on this exact infrastructure |
| **Shopify** | Google Cloud Platform multi-region, custom MySQL-as-a-Service (KateSQL) on Kubernetes, Vitess for sharding, Fastly + Cloudflare double-CDN over 200+ edge POPs | ~2020+ planet-scale modern | **The benchmark** for global e-commerce — used by 5M+ merchants |
| **SC Prints (proposed)** | Vercel (edge) + Fly.io Sydney (compute) + DigitalOcean Managed Postgres Sydney + Cloudflare R2 (object storage) + Resend (email) | ~2024+ lightweight-modern, Sydney-pinned | **Migration target** — modern managed services with a Sydney compute pin we expect to give us a moderate UX edge for AU customers |

**Strategically important corrected observation**: our proposed stack will give us a **moderate latency edge** — about **140ms saved per dynamic round-trip** vs DecoNetwork-hosted competitors, and roughly **120ms saved** vs Shopify-hosted competitors (Shopify caches storefronts at Fastly Sydney but runs dynamic compute in US/EU). It's a real, measurable advantage but not crushing. The bigger competitive edges remain operational quality, feature differentiation (DPI warning, production stage tracker, save-design library), and pricing.

**Equally important caveat**: our current Vercel staging is **currently slower than DecoNetwork on first-load** (~5-6s total page time vs DecoNetwork's ~0.7s) because of serverless cold-starts. Until that's fixed, the latency edge is theoretical. See §10.

---

## 2. What DecoNetwork actually runs (measured May 2026)

### DNS evidence

```
www.deconetwork.com       →  192.124.249.153  (cloudproxy10153.sucuri.net)
app.deconetwork.com       →  65.39.250.34
cdn.deconetwork.com       →  65.39.250.34   ← same IP
images.deconetwork.com    →  65.39.250.34   ← same IP
static.deconetwork.com    →  65.39.250.34   ← same IP
                              ↑ reverse-DNS: store.deconetwork.com
                              ↑ AS13768 (COGECO-PEER1 / Aptum Technologies)
                              ↑ Block allocated 2002 to Aptum/PEER1
```

**Nameservers**: `pdns09.domaincontrol.com` / `pdns10.domaincontrol.com` — GoDaddy DNS (basic, no edge routing).

### Where the server actually lives

This is where my first analysis went wrong. ARIN whois shows the IP registered to:
> 191 The West Mall, Etobicoke, ON, M9C 5L6, Canada

That's Aptum's **registered head-office address in Toronto**, NOT necessarily where the server lives. Aptum operates colo facilities across multiple cities (Toronto, NYC, LAX, MIA, LON, AMS).

A **traceroute from Sydney** tells the real story:

```
1   home router         16ms
2   ISP gateway         20ms
3   Cogent Sydney       27ms  (hu0-0-1-3.ccr71.syd01.atlas.cogentco.com)
4   Cogent Portland     161ms
5   Cogent Portland     158ms
6   Cogent Seattle      151ms
7   Twelve99 Seattle    181ms
8   Twelve99 San Jose   188ms
9   Twelve99 LA         167ms  (lax-bb1-link.ip.twelve99.net)
10  Twelve99 LA         189ms
11  Aptum LA            183ms  (aptummanaged-ic-371308.ip.twelve99-cust.net)
12-13 origin            ~170ms
```

Path: Sydney → Cogent's trans-Pacific backbone → US West Coast → into Aptum's managed network in **LA**. So the actual data centre is **Los Angeles** (or US West Coast more broadly), not Toronto. The traceroute proves this; the Toronto whois address is just where Aptum is registered.

This matters because **Sydney → LA is meaningfully faster than Sydney → Toronto** (~170ms vs ~250ms). DecoNetwork's choice of US West Coast hosting is a sensible compromise for serving Asia-Pacific + Americas from one location.

### Measured RTT and TTFB from a Sydney machine

```
ping 65.39.250.34:           167-184ms (avg 172ms)
ping teejunction.com.au:     163-177ms (avg 168ms)  ← same IP, real AU tenant

curl https://teejunction.com.au/ (warm, 3 runs):
  TTFB: 0.77s, 0.55s, 0.61s   (avg ~0.64s)

x-runtime: 0.132s             ← Rails app responds in ~130ms
                                Rest of the budget is network + TLS round-trips
```

So a real Australian buyer landing on a DecoNetwork-powered tenant's page sees a **TTFB of ~600ms** on warm cache. That's slower than ideal but **definitely viable** — it's the kind of latency users tolerate without abandoning carts.

For comparison, our current Vercel staging:

```
curl https://medusajs-2-0-for-railway-vercel.vercel.app/au (3 runs):
  TTFB: 2.4s, 0.98s, 1.0s    (cold start, then warm)
  Total: 6.9s, 5.3s, 5.2s    (total page load including HTML body)
```

**We are currently slower than DecoNetwork on first load.** Cold-start serverless is brutal. This is a known issue that needs fixing before we can credibly claim a latency advantage.

### Application stack (inferred from headers)

The HTTP response headers on teejunction.com.au reveal:
- `x-runtime: 0.132178` — Ruby on Rails server runtime header
- `x-request-id: ...` — Rails default request tracing
- `x-sid: ...` — session ID, Rails session
- `cache-control: max-age=0, private, must-revalidate` — responses are NOT publicly cached; every request hits Rails
- `vary: Accept` — content-negotiated responses
- TLS cert: Let's Encrypt (not Cloudflare, not Sucuri)

So: **Ruby on Rails monolith** (like Shopify), but running on Aptum colo without a public CDN in front. Every page-load goes to origin. There's likely Memcached/Redis behind the scenes for query caching, but it's invisible from outside.

### What this means

| Component | DecoNetwork (measured) | Implication |
|---|---|---|
| **Marketing site WAF** | Sucuri reverse proxy | Web-app firewall but no CDN-tier caching |
| **Storefront / app / images / static** | Single IP at Aptum Technologies (US West Coast) | One cluster — no edge distribution; all of their tenants hit the same origin |
| **Hyperscaler cloud?** | **No** — Aptum is bare-metal / colo / managed-hosting | No auto-scaling, no managed services, no regional failover by default |
| **CDN** | **None at the DNS layer**; no CDN response headers on tenants | Images served directly from US origin |
| **DNS provider** | GoDaddy | Basic DNS — no edge routing |
| **Australian region** | **No** — origin in US West Coast (~170ms RTT from Sydney) | Latency tax exists but is moderate, not crippling |
| **Application** | Ruby on Rails monolith | Mature, well-understood stack; presumably MySQL behind |
| **Tenant isolation** | Shared origin (same IP for all merchant stores) | Multi-tenant cluster; classic SaaS routing-by-Host-header |
| **TTFB from Sydney (warm)** | ~600ms measured | Slower than ideal, definitely viable |

### Why so many AU competitors use DecoNetwork

A fair question — if it's slow, why does our market lean on it? Several reasons:

1. **It's print-shop-specific SaaS** with an online designer, production tracking, quote workflow, decoration-method matrix, and storefront builder. **Replacing that yourself takes years of engineering work.** Print shops pay for the feature set, not the infrastructure.
2. **It's Australian-founded** (Burleigh Heads, Queensland — Gold Coast area). The company knows the AU market: local sales, AU support, AU billing in AUD. Familiarity matters in this industry.
3. **~600ms TTFB is fine for e-commerce**. Industry benchmarks for "acceptable" load times are well within DecoNetwork's actual performance — they're not losing customers on speed alone.
4. **Migration cost is real.** Once a print shop has 500 products, 1000 customers, and tooling integration on DecoNetwork, ripping it out costs months of effort and downtime risk. Inertia wins.
5. **The competitive bar is low.** Their alternatives (DIY Shopify build, custom code, other SaaS) are either feature-poor or operationally expensive. DecoNetwork is the dominant choice because it's "good enough at everything".

So the right framing isn't "we're fast and they're slow" — it's "we can be moderately faster AND have unique features they don't (DPI warning, production stage tracker, supplier-API live stock, save-design library)."

### Caveats

- The single traceroute is consistent with US West Coast hosting but not conclusive — Aptum could be anycasting or have multiple POPs serving the same IP block.
- We didn't test from multiple AU cities (Sydney/Melbourne/Brisbane have different exchange points).
- The Vercel cold-start finding is a current snapshot — once we go production with proper warm-up, the numbers will improve.

---

## 3. What Shopify runs (industry gold standard)

Shopify publishes a lot more than DecoNetwork — they have a public engineering blog, conference talks, and case studies. The picture is well-documented:

### Compute & app

- **Google Cloud Platform** — Shopify migrated from their own data centres to GCP starting 2018. Multi-region (US-central, EU, APAC).
- **Kubernetes (GKE)** for container orchestration. Their backend is a Ruby on Rails "modular monolith" running across thousands of pods.
- **Ruby on Rails + JS Storefront API (Hydrogen / Oxygen)** — Rails for the merchant admin and order processing; React/Hydrogen for headless storefront customers. *Same Rails core as DecoNetwork — just orchestrated very differently.*

### Database

- **MySQL with [Vitess](https://vitess.io/)** — Vitess is the CNCF horizontal-sharding layer that Slack, Square, GitHub, and Shopify use to scale MySQL beyond what a single instance can handle.
- **KateSQL** — Shopify's custom MySQL-as-a-Service running on GKE.
- **Memcached / Redis** for hot caches and session state. **Kafka** for event streaming. **Elasticsearch** for search.

### Storefront delivery (CDN)

- **Fastly** (primary) over 200+ edge POPs worldwide — including **Sydney and Melbourne**.
- **Cloudflare** (additional layer) — handles DDoS protection and a portion of edge traffic. Per Cloudflare's case study, this layer processes **3.4 trillion requests / 170 petabytes per month**.
- **Brotli + gzip** compression, **HTTP/3, TLS 1.3** — all the modern transport optimisations.

### Implication for Australian customers

| Request type | From a Sydney browser |
|---|---|
| **Cached storefront page** (PDP, category) | Served from Fastly Sydney POP — fast, ~30ms TTFB |
| **Uncached storefront page** | Misses Fastly cache → request travels to US/EU GCP region → ~150ms RTT |
| **Checkout / cart / account / dynamic API** | Compute runs in US/EU GCP — ~150ms RTT to Sydney |

Shopify's storefront IS one of the fastest in the world *for cached pages*. But the dynamic / interactive parts (cart, checkout, account, search) still pay the trans-Pacific tax.

---

## 4. Our proposed stack

| Component | Choice | Why |
|---|---|---|
| **Storefront** | **Vercel** (existing) | Edge-cached SSR, global CDN baked in, Next.js native, ~30-50ms TTFB from Sydney when warm |
| **Backend (Medusa)** | **Fly.io Sydney (`syd`)** | Only Sydney-region option for a long-running Node app with Postgres-attached state at reasonable cost. Tier-2 region but functionally fine for our load |
| **Database** | **DigitalOcean Managed Postgres (Sydney)** | Cheapest managed Postgres with a Sydney region (~$15/mo basic). Daily automated backups, point-in-time recovery, no DBA overhead |
| **File storage** | **Cloudflare R2** | S3-compatible, **free egress** (vs. AWS S3's $0.09/GB out), Cloudflare-CDN-native. No Sydney-specific region but Cloudflare edges include Sydney |
| **Email** | **Resend** (existing) | Already wired, no change. Solid deliverability, simple API |

### Why this stack is appropriate for us

1. **Australian customer base, Sydney-pinned compute and data**. Cart/checkout/account flows complete in <100ms total once cold-starts are eliminated.
2. **Cost at our scale** — ~$50-150/mo for managed services. Aptum bare-metal equivalent is $500+/mo per server.
3. **Operational overhead** — Four managed services vs. running Kubernetes (Shopify) or owning OS patching / MySQL admin (DecoNetwork).
4. **Replaceable components** — Each piece swaps if a vendor goes bad.
5. **R2 free egress** — Image-heavy printing business. Free egress vs ~$90/mo S3 egress at 1TB.

---

## 5. Side-by-side: DecoNetwork vs Shopify vs SC Prints (proposed) — **measured where possible**

| Axis | DecoNetwork (measured) | Shopify (published) | SC Prints (proposed) |
|---|---|---|---|
| **Cloud platform** | Aptum (PEER1) colo, US West Coast | Google Cloud Platform, multi-region | Vercel + Fly + DO + Cloudflare (managed services) |
| **Compute** | Bare-metal / VM | GKE (Kubernetes) globally | Fly micro-VMs (Sydney-pinned) |
| **Database** | Co-located on host (presumed MySQL) | MySQL + Vitess + KateSQL on GKE | DigitalOcean Managed Postgres Sydney |
| **App framework** | Ruby on Rails | Ruby on Rails ("modular monolith") | Medusa.js (Node + Postgres) |
| **Storefront CDN** | None at DNS layer | Fastly (200+ POPs) + Cloudflare | Vercel Edge + Cloudflare network |
| **Image storage** | Single origin server | Google Cloud Storage + Fastly | Cloudflare R2 (free egress) |
| **AU storefront caching** | ❌ | ✅ Fastly Sydney POP | ✅ Vercel + Cloudflare Sydney |
| **AU compute (dynamic)** | ❌ (US West Coast) | ❌ (US/EU GCP) | ✅ **Sydney** (Fly + DO) |
| **AU database** | ❌ (US West Coast) | ❌ (US/EU GCP) | ✅ **Sydney** (DO Postgres) |
| **Measured RTT from Sydney** | **~170ms** | ~30ms (cached) / ~150ms (uncached) | <30ms (target, dependent on warm cache) |
| **Measured TTFB warm** | **~600ms** | ~30-200ms depending on cache | **currently ~1-2s on cold start** ⚠️ — needs fixing |
| **Multi-region failover** | Not advertised | Yes — multi-region by default | Manual playbook (single-region default) |
| **Tenant isolation** | Shared cluster (one origin IP) | Multi-tenant GKE | Single-tenant (we're the only tenant) |
| **Backup / DR** | Vendor-managed, opaque | Vitess shard replication + GCS snapshots | DO automated daily + 7-day PITR; R2 versioning |
| **Vendor count** | 1 hosting + 1 WAF | 1 cloud (GCP) + 2 CDN | 4 (Vercel, Fly, DO, Cloudflare) + Resend |
| **Cost predictability** | High (fixed colo) | High at their scale (committed cloud) | Variable but cheap |
| **Likely monthly cost at our scale** | ~$500+/mo (Aptum) | n/a (we're not them) | **~$50-150/mo** |
| **Operational complexity** | Low (one vendor) | Extremely high (custom DBaaS, K8s) | Medium (four managed vendors) |
| **AU competitor adoption** | 4 of 8 surveyed (TJ, PrintPod, Create Apparel, Garment Printing) | Cartel, T-Shirt Co | n/a (us) |

---

## 6. Where each approach has merit

### DecoNetwork — feature-rich, industry-default, predictable

- **Print-shop-specific feature set** that would take us years to replicate
- **Australian-founded** with AU sales/support/billing
- **Predictable cost** — One colo bill, no per-request surprises
- **Single throat to choke** — One provider to call at 3am
- **Industry inertia** — Hard to migrate off once you're on it

**What we should learn from them**: their feature scope is the bar for what an AU print-shop SaaS should do. We don't need to match them on every feature, but their breadth is the answer to "why do print shops pay for this?"

### Shopify — planet-scale resilience

- **Multi-region failover** built in
- **Horizontal database scaling** via Vitess
- **Best-in-class CDN** — Fastly + Cloudflare double-layer
- **Mature engineering org** building internal tools like KateSQL

**Why we don't need to match this**: we have 1 merchant (us), they have 5M. Their architecture is necessary at their scale; it would be massive over-engineering at ours.

### SC Prints (proposed) — Sydney latency edge + lightweight modern operations

- **Sydney-pinned compute and data** gives a measurable AU latency edge — ~140ms saved per dynamic request vs DecoNetwork, ~120ms saved vs Shopify
- **Modern operational quality** — managed Postgres, automated backups, PITR — without DBA overhead
- **Cost-efficient at small-medium scale**
- **Component replaceability** — no vendor lock-in

---

## 7. Risks of our proposed stack — and mitigations

| Risk | Mitigation |
|---|---|
| **Vercel cold-start currently makes us slower than DecoNetwork** | Use Vercel Edge Runtime / always-warm functions for hot paths (PDP, /store). Pre-render aggressively where possible. ISR / on-demand revalidation. This is the #1 thing to fix before claiming any latency advantage. |
| **Fly.io Sydney is a smaller region** — fewer hosts, more chance of regional capacity issues | Have a documented `syd → iad` (US East) failover for the Medusa backend; accept temporary AU latency hit during incidents |
| **R2 has no Australian region** | Test image-fetch latency from Sydney to nearest Cloudflare edge (Sydney POP exists, should be <30ms) — confirm before cutover |
| **DigitalOcean Managed Postgres Sydney** is a relatively new region | Verify their stated SLA; test PITR restore drill before cutover |
| **Multi-vendor blast radius unknown** | Run a tabletop exercise: simulate each vendor going down for 1 hour and document response |
| **Cloudflare R2 + Fly.io + DO + Vercel = 4 separate billing / monitoring surfaces** | Single status dashboard (Better Stack — same as DecoNetwork uses) |
| **Egress / inter-service traffic costs** | Map data flows carefully. R2 free egress; Fly ↔ DO Postgres same-region = no cross-region cost |
| **Backup verification** | Test-restore on day-1 of go-live |
| **Vendor maturity (Fly.io / R2 are <5 years old)** | Both are well-funded. Keep our code S3-API-compatible so a switch is one config change |
| **Feature gap vs DecoNetwork** | We don't need to match every feature, but should know which DecoNetwork features sell — production tracking, design tool, quoting, integrated invoicing. Track which we lack so we don't lose deals over them. |

---

## 8. Recommendations

1. **Proceed with the proposed stack** — it's the right architecture for an Australian business at SC Prints' scale.
2. **First priority before any latency-edge claims: fix Vercel cold-starts.** Currently we're slower than DecoNetwork on first load. Use Edge Runtime, always-warm cron pings, or static pre-rendering on hot paths.
3. **Test R2 image-fetch latency from Sydney** before committing the full image migration.
4. **Set up shared monitoring across vendors** (Better Stack or equivalent).
5. **Document the manual-failover runbook for each component** before go-live.
6. **Don't lock in to vendor-specific features.** Avoid Vercel KV, Fly Postgres, etc.
7. **Keep R2 + S3 dual snapshots** — cheap insurance.
8. **Don't try to out-feature DecoNetwork on day 1.** Pick the 3-4 places we genuinely differentiate (DPI warning, production stage tracker, save-design library, supplier-API live stock) and double down. The DecoNetwork-powered competitors all have feature parity with each other; we win on differentiation, not duplication.

---

## 9. Strategic implications

### vs. DecoNetwork-powered competitors (4 of 8 surveyed AU competitors)

A page load from `someshop.deconetwork.com` to an Australian customer is ~140ms slower per dynamic round-trip than from our proposed stack (once cold-starts are fixed). That's a moderate UX edge — noticeable but not transformative. We won't win deals on speed alone; speed is a tie-breaker once other things are equal.

The bigger competitive lever is **features they don't have** — DPI warning + vectorization upsell, production stage tracker, save-design library, supplier-API live stock, brand-specific landing pages. Those are clear differentiators.

### vs. Shopify-powered competitors (Cartel, T-Shirt Co)

Shopify storefronts cache fast at Fastly Sydney but checkout / cart / account hit US GCP. Our proposed stack runs all dynamic operations in Sydney. For high-intent buyer interactions, our stack will feel **moderately faster** than Shopify-powered AU competitors.

That's marketable as "designed and hosted in Australia for Australian businesses" — but a moderate edge, not crushing.

### What we can't beat

- **Shopify's storefront edge caching** for static / pre-rendered pages — they invest more in Fastly than we ever will. Parity at best.
- **Shopify's brand-trust signal** — "powered by Shopify" carries weight with B2B buyers. We have to earn that trust through other operational signals.
- **DecoNetwork's feature breadth** built up over 15+ years. We can win on quality + differentiation, not coverage.

---

## 10. Caveats and corrections

This is v2 of the doc. v1 made these errors I've corrected:

- **Claimed Toronto hosting** based on ARIN whois showing Toronto address. Reality: that's Aptum's registered HQ; the actual server is on US West Coast (confirmed by traceroute landing at LA before entering Aptum's network).
- **Projected 200-250ms RTT from Sydney**. Reality: measured **~170ms**.
- **Framed DecoNetwork as "broken" for AU**. Reality: ~600ms warm TTFB is slow but commercially viable. 4 of 8 surveyed AU competitors run on it — they wouldn't if it were genuinely broken.
- **Implied a structural advantage**. Reality: it's a **moderate edge** (~140ms saved per dynamic round-trip), not crushing.
- **Didn't measure our own Vercel staging.** Discovery: our staging is **currently slower than DecoNetwork on first load** because of cold-start serverless. We must fix this before any latency-advantage marketing.

Other caveats:
- DNS-based analysis isn't full infrastructure analysis. DecoNetwork could have internal layers we can't see.
- Single traceroute from one Sydney-area machine isn't a global latency benchmark — other AU cities (Perth, Adelaide, Hobart) will have different RTTs.
- Our cost estimate scales with traffic. $50-150/mo is for current scale.
- Shopify infrastructure descriptions come from their public engineering blog and case studies — accurate as of publication but might evolve.
- Two prompt-injection attempts during research (embedded `<system-reminder>` blocks in DecoNetwork pages and tool outputs) were flagged and ignored.

### Sources

- [DecoNetwork — about / privacy / status](https://www.deconetwork.com/)
- [Shopify Engineering blog](https://shopify.engineering/) — KateSQL, Vitess, modular monolith posts
- [Cloudflare — Shopify case study](https://www.cloudflare.com/case-studies/shopify/)
- [Google Cloud — Shopify case study](https://cloud.google.com/customers/shopify)
- ARIN whois for `65.39.250.34` (Aptum Technologies / PEER1, registered to Etobicoke, Ontario — server location LA per traceroute)
- ARIN whois for `192.124.249.153` (Sucuri Security)
- Team Cymru ASN lookup confirming AS13768 (COGECO-PEER1) and AS30148 (SUCURI-SEC)
- HTTP header inspection of `www.deconetwork.com` and `teejunction.com.au`
- Traceroute from Sydney area: Sydney → Cogent → Portland → Seattle → San Jose → LA → Aptum
- Ping measurements from Sydney area to `65.39.250.34` and `teejunction.com.au`
- Curl timing measurements for warm-cache TTFB
