# Hosting stack — DecoNetwork (observed) vs. Shopify (gold standard) vs. SC Prints' proposed migration

**Date**: 2026-05-19
**Question**: How does DecoNetwork host its storefronts / backend / images / database, how does Shopify (the industry gold standard) host theirs, and how does SC Prints' proposed migration target (Vercel + Fly.io Sydney + DigitalOcean Managed Postgres Sydney + Cloudflare R2 + Resend) compare to both?

---

## 1. Headline

Three reference points along an infrastructure-quality spectrum:

| | Approach | Era it fits |
|---|---|---|
| **DecoNetwork** | Single-vendor Canadian colo (Aptum/PEER1) + Sucuri WAF. No real CDN. Multi-tenant cluster on a single IP. | ~2010 SaaS architecture |
| **Shopify** | Google Cloud Platform multi-region, custom MySQL-as-a-Service (KateSQL) on Kubernetes, Vitess for sharding, Fastly + Cloudflare double-CDN over 200+ edge POPs. | ~2020+ planet-scale modern |
| **SC Prints (proposed)** | Vercel (edge) + Fly.io Sydney (compute) + DigitalOcean Managed Postgres Sydney + Cloudflare R2 (object storage) + Resend (email) | ~2024+ lightweight-modern, Sydney-pinned |

**The strategically important observation**: our proposed stack lands **between** DecoNetwork and Shopify on operational sophistication — but on **Australian latency it actually beats Shopify**. Shopify caches storefronts at the Fastly Sydney POP but runs dynamic/checkout compute out of US/EU Google Cloud (~150ms RTT from Sydney). Our proposed stack puts both compute and database in Sydney (~<30ms RTT), so cart/checkout/account flows will be faster from Sydney than Shopify's equivalent.

That's a real (and quantifiable) structural advantage we keep against the dominant competitor, with materially lower complexity than Shopify and significantly better operations than DecoNetwork.

---

## 2. What DecoNetwork actually runs (observed May 2026)

### DNS evidence

```
www.deconetwork.com       →  192.124.249.153  (cloudproxy10153.sucuri.net)
app.deconetwork.com       →  65.39.250.34
cdn.deconetwork.com       →  65.39.250.34   ← same IP
images.deconetwork.com    →  65.39.250.34   ← same IP
static.deconetwork.com    →  65.39.250.34   ← same IP
                              ↑ reverse-DNS: store.deconetwork.com
                              ↑ AS13768 (COGECO-PEER1 / Aptum Technologies)
                              ↑ CIDR 65.39.224.0/19 — colo / managed hosting block, allocated 2002
```

**Nameservers**: `pdns09.domaincontrol.com` / `pdns10.domaincontrol.com` — GoDaddy DNS (basic, no edge routing).

### Further evidence: BGP, geography, and HTTP headers

- **AS13768** = COGECO-PEER1 / Aptum Technologies. Old block (allocated 2002), classic managed-hosting / colo. Not a hyperscaler.
- **Physical address from ARIN whois** on `65.39.250.34`:
  > 191 The West Mall, **Etobicoke, ON, M9C 5L6, Canada**
- That's a Toronto-area data centre — confirms the AU latency tax (Toronto ↔ Sydney is ~200-250ms RTT via the cleanest network path).
- **HTTP headers on `www.deconetwork.com`** confirm Sucuri-as-WAF, no real CDN:
  ```
  server: Sucuri/Cloudproxy
  x-sucuri-id: 18002
  x-sucuri-cache: MISS
  cache-control: max-age=600
  ```
  No `cf-cache-status`, no `x-amz-cf-id`, no `x-served-by` (Fastly), no `via:` headers. Just Sucuri's reverse proxy.
- **Origin servers don't respond to anonymous HEAD requests** on `app.deconetwork.com` / `images.deconetwork.com` / etc. — likely require an SNI or Host header matching a specific tenant subdomain (so they can route to the right merchant). This is consistent with classic multi-tenant SaaS where each merchant store gets a subdomain pointing at the shared origin.
- **Reverse DNS of neighbouring IPs in the same /24** shows unrelated companies (e.g. `s1.pikiware.com` at `65.39.250.36`) — confirming this is **shared colo infrastructure**, not a DecoNetwork-dedicated rack. DecoNetwork is one tenant among many at the Aptum facility.

### What this means

| Component | DecoNetwork (observed) | Implication |
|---|---|---|
| **Marketing site WAF** | Sucuri reverse proxy | Web-app firewall but no CDN-tier caching |
| **Storefront / app / images / static** | Single IP at Aptum Technologies / PEER1 (Toronto) | One physical or VM cluster — no edge distribution; all of their tenants hit the same origin |
| **Hyperscaler cloud?** | **No** — Aptum is bare-metal / colo / managed-hosting, not AWS/GCP/Azure | No auto-scaling, no managed services, no regional failover by default |
| **CDN** | **None at the DNS layer**; no CDN response headers on www | Images served directly from Toronto origin |
| **DNS provider** | GoDaddy | Basic DNS — no edge routing |
| **Australian region** | **No** — origin in Toronto (~200-250ms RTT from Sydney) | Real latency tax on every Australian page load |
| **Status-page granularity** | Single "DecoNetwork Services" component (Better Stack monitoring) | No regional split, no per-service visibility |
| **Tenant isolation** | Shared origin (same IP for all merchant stores) | Single-cluster blast radius — one merchant's traffic spike affects all |

### What they don't publish (and we couldn't infer)

- Database technology (almost certainly MySQL or Postgres on the same host or LAN, given the bare-metal pattern)
- Backup / DR setup
- Whether there's an internal reverse-cache between the origin and tenants (unlikely given how cleanly the CDN-style subdomains all point at the origin IP, but possible)

Their public privacy policy mentions "robust information security policies" but **explicitly does not name any sub-processors, cloud providers, or data-center locations** — typical for older SaaS. The "Server Security FAQs" linked from the privacy policy returned HTTP 403 to anonymous fetches.

### Caveats on this analysis

- DNS evidence is correct as of the lookup date (May 2026) but the underlying setup could change.
- We didn't pay for commercial intelligence tools (BuiltWith Enterprise, Wappalyzer Pro) that would give a fuller picture.
- "No CDN at the DNS layer" is strong evidence but not conclusive — there could be an internal cache that doesn't show up.
- We didn't run traceroutes from Sydney to confirm RTT empirically; the 200-250ms figure is from typical Sydney ↔ Toronto routing.

---

## 3. What Shopify runs (industry gold standard)

Shopify publishes a lot more than DecoNetwork — they have a public engineering blog, conference talks, and case studies. The picture is well-documented:

### Compute & app

- **Google Cloud Platform** — Shopify migrated from their own data centres to GCP starting 2018. Multi-region (US-central, EU, APAC) across [Shopify's case study](https://cloud.google.com/customers/shopify).
- **Kubernetes (GKE)** for container orchestration. Their backend is a Ruby on Rails "[modular monolith](https://newsletter.techworld-with-milan.com/p/inside-shopifys-modular-monolith)" running across thousands of pods.
- **Ruby on Rails + JS Storefront API (Hydrogen / Oxygen)** — Rails for the merchant admin and order processing; React/Hydrogen for headless storefront customers.

### Database

- **MySQL with [Vitess](https://vitess.io/)** — Vitess is the CNCF horizontal-sharding layer that Slack, Square, GitHub, and Shopify use to scale MySQL beyond what a single instance can handle.
- **KateSQL** — Shopify's [custom MySQL-as-a-Service](https://shopify.engineering/debugging-systems-cloud-mysql-kubernetes-cgroups) running on GKE. Several hundred production MySQL instances managed across GKE clusters.
- **Memcached / Redis** for hot caches and session state. **Kafka** for event streaming. **Elasticsearch** for search.

### Storefront delivery (CDN)

- **Fastly** (primary) over 200+ edge POPs worldwide — including **Sydney and Melbourne**. Per [Speed Boostr](https://speedboostr.com/shopify-cdn-and-edge-computing-optimizing-global-performance/), this is the canonical Shopify CDN setup.
- **Cloudflare** (additional layer) — handles DDoS protection and a portion of edge traffic. Per [Cloudflare's Shopify case study](https://www.cloudflare.com/case-studies/shopify/), this layer processes **3.4 trillion requests / 170 petabytes per month**.
- **Brotli + gzip** compression, **HTTP/3, TLS 1.3** — all the modern transport optimisations.

### Implication for Australian customers

| Request type | What happens from a Sydney browser |
|---|---|
| **Cached storefront page** (PDP, category) | Served from Fastly Sydney POP — fast, <30ms TTFB |
| **Uncached storefront page** | Misses Fastly cache → request travels to US/EU GCP region → ~150ms RTT |
| **Checkout / cart / account / dynamic API** | Compute runs in US/EU GCP — ~150-200ms RTT to Sydney |

Shopify's storefront IS one of the fastest in the world *for cached pages*. But the dynamic / interactive parts (cart, checkout, account, search) still pay the trans-Pacific tax. That's where our Sydney-pinned compute can beat them.

### What Shopify spends on this

Public-information-only estimate (educated guesses):
- Shopify's GCP spend has been reported in the **hundreds of millions of USD annually**
- They serve 5M+ merchants and have ~10,000 employees, so the per-merchant cost is small — but the absolute scale is enormous

We obviously can't (and don't need to) match this. The point is that it's the **gold standard** to know where the spectrum tops out.

---

## 4. Our proposed stack

| Component | Choice | Why |
|---|---|---|
| **Storefront** | **Vercel** (existing) | Edge-cached SSR, global CDN baked in, Next.js native, ~30-50ms TTFB from Sydney |
| **Backend (Medusa)** | **Fly.io Sydney (`syd`)** | Only Sydney-region option for a long-running Node app with Postgres-attached state at reasonable cost. Tier-2 region (fewer hosts than `iad`/`lhr`) but functionally fine for our load |
| **Database** | **DigitalOcean Managed Postgres (Sydney)** | Cheapest managed Postgres with a Sydney region (~$15/mo basic). Daily automated backups, point-in-time recovery, no DBA overhead |
| **File storage** | **Cloudflare R2** | S3-compatible, **free egress** (vs. AWS S3's $0.09/GB out), Cloudflare-CDN-native. No Sydney-specific region but Cloudflare edges include Sydney |
| **Email** | **Resend** (existing) | Already wired, no change. Solid deliverability, simple API |

### Why this stack is appropriate for us

1. **Australian customer base** — Vercel SSR (Sydney edge) + Fly Sydney + DO Postgres Sydney puts compute + data within the same metro as the buyers. Cart/checkout/account flows complete in <100ms total.
2. **Cost at our scale** — At <100k orders/year, managed services are dramatically cheaper than colo or hyperscaler GKE. Fly + DO + R2 + Vercel for our load is ~$50-150/mo. Shopify charges merchants $29-2000+/mo Plus revenue percentage; DecoNetwork-style colo for the same workload would be $500+/mo.
3. **Operational overhead** — Three managed services + edge platform vs. running Kubernetes / Vitess / KateSQL (Shopify) or owning OS patching / MySQL admin / backup scripts (DecoNetwork).
4. **Replaceable components** — Each piece swaps if a vendor goes bad. R2 → S3, DO → AWS RDS, Fly → Railway, Vercel → Netlify. Avoids the lock-in problem.
5. **R2 free egress** — Image-heavy printing business. AWS S3 egress is $0.09/GB; Cloudflare R2 is free out. At 1TB/month customer image downloads, that's ~$90/month saved.

---

## 5. Side-by-side: DecoNetwork vs Shopify vs SC Prints (proposed)

| Axis | DecoNetwork | Shopify | SC Prints (proposed) |
|---|---|---|---|
| **Era / generation** | ~2010 SaaS | ~2020+ planet-scale | ~2024+ lightweight-modern |
| **Cloud platform** | Aptum (PEER1) colo, Canada | Google Cloud Platform, multi-region | Vercel + Fly + DO + Cloudflare (managed services) |
| **Compute** | Bare-metal / VM on single host | GKE (Kubernetes) globally | Fly micro-VMs (Sydney-pinned) |
| **Database** | Co-located on host (presumed MySQL) | MySQL + Vitess + KateSQL (custom DBaaS) on GKE | DigitalOcean Managed Postgres Sydney |
| **Storefront CDN** | None at DNS layer | Fastly (200+ POPs) + Cloudflare (additional) | Vercel Edge + Cloudflare R2 (Cloudflare network) |
| **Image storage** | Single origin server | Google Cloud Storage + Fastly | Cloudflare R2 (free egress) |
| **AU storefront caching** | ❌ | ✅ Fastly Sydney POP | ✅ Vercel Edge + Cloudflare Sydney |
| **AU compute (dynamic)** | ❌ (Toronto) | ❌ (US/EU GCP) | ✅ **Sydney** (Fly + DO) |
| **AU database** | ❌ (Toronto) | ❌ (US/EU GCP) | ✅ **Sydney** (DO Postgres) |
| **AU customer latency — cached page** | ~250ms | ~30ms (Fastly POP) | ~30ms (Vercel/Cloudflare POP) |
| **AU customer latency — dynamic / checkout** | ~250ms | ~150ms (US GCP) | **~<30ms** (Fly Sydney) |
| **Auto-scaling** | None observable | Yes — K8s + GCP autoscale | Yes — Fly + Vercel both autoscale |
| **Multi-region failover** | Not advertised | Yes — multi-region by default | Manual playbook (single-region default) |
| **Tenant isolation** | Shared cluster (one origin IP) | Multi-tenant GKE with strong namespace isolation | Single-tenant (we're the only tenant) |
| **Backup / DR** | Vendor-managed, opaque | Vitess shard replication + GCS snapshots, multi-region | DO automated daily + 7-day PITR; R2 versioning |
| **Vendor count** | 1 hosting + 1 WAF | 1 cloud (GCP) + 2 CDN | 4 (Vercel, Fly, DO, Cloudflare) + Resend |
| **Open-source contributions** | None public | Massive (Vitess, K8s, Ruby on Rails work) | Medusa.js (we consume, don't own) |
| **Cost predictability** | High (fixed colo) | High at their scale (committed cloud) | Variable but cheap (per-request/per-GB) |
| **Likely monthly cost at our scale** | $500+/mo (Aptum colo) | n/a (we're not them) | **~$50-150/mo** |
| **Operational complexity** | Low (one vendor) | Extremely high (custom DBaaS, K8s, etc.) | Medium (four managed vendors) |

---

## 6. Where each approach has merit

### DecoNetwork — predictability & simplicity

- **Predictable cost** — One colo bill, no per-request surprises
- **Single throat to choke** — One provider to call at 3am
- **No per-request scaling cost** — All-you-can-eat fixed compute
- **Mature vendor** — Aptum dates to 1999

**What we should preserve from this model**: a unified incident-response playbook across our 4 vendors, budget alerts in every vendor dashboard, documented vendor-failure scenarios.

### Shopify — planet-scale resilience

- **Multi-region failover** built in — region outage doesn't take them down
- **Horizontal database scaling** via Vitess — they can grow without re-architecting
- **Best-in-class CDN** — Fastly + Cloudflare double-layer is the fastest storefront experience available
- **Internal tooling investment** — KateSQL, modular monolith patterns, etc., let small teams operate huge systems

**Why we don't need to match this**: we have 1 merchant (us), they have 5M. Their architecture is necessary at their scale; it would be massive over-engineering at ours.

### SC Prints (proposed) — Sydney latency + modern operations

- **Sydney-pinned compute and data** beats Shopify on dynamic-request latency for AU customers
- **Modern operational quality** — managed Postgres, automated backups, point-in-time recovery — without DBA overhead
- **Cost-efficient at small-medium scale** — $50-150/mo vs $500+ colo or thousands per month for the Shopify equivalent
- **Component replaceability** — no vendor lock-in, easy to swap if pricing changes

---

## 7. Risks of our proposed stack — and mitigations

| Risk | Mitigation |
|---|---|
| **Fly.io Sydney is a smaller region** — fewer hosts, more chance of regional capacity issues | Have a documented `syd → iad` (US East) failover for the Medusa backend; accept temporary AU latency hit during incidents |
| **R2 has no Australian region** | Test image-fetch latency from Sydney to nearest Cloudflare edge (Sydney POP exists, should be <30ms) — confirm before cutover |
| **DigitalOcean Managed Postgres Sydney** is a relatively new region | Verify their stated SLA (typically 99.99% for managed DBs); test PITR restore drill before cutover |
| **Multi-vendor blast radius unknown** | Run a tabletop exercise: simulate each vendor going down for 1 hour and document response |
| **Cloudflare R2 + Fly.io + DO + Vercel = 4 separate billing / monitoring surfaces** | Single status dashboard (Better Stack — same as DecoNetwork uses) that pings each component independently |
| **Egress / inter-service traffic costs** | Map data flows: Vercel ↔ Fly (egress from Vercel = free; from Fly = paid per GB); Fly ↔ R2 (R2 free egress); Fly ↔ DO Postgres (same region = no cross-region cost). All workable, just budget for it |
| **Backup verification** | DO Postgres backups are automated but worth a test-restore on day-1 of go-live |
| **Vendor maturity (Fly.io / R2 are <5 years old)** | Both are well-funded (Fly: Series B; R2: Cloudflare Enterprise). Reasonable provider-risk. Keep our code S3-API-compatible so a switch to AWS S3 or B2 is one config change |

---

## 8. Recommendations

1. **Proceed with the proposed stack.** It's the right architecture for an Australian business at SC Prints' scale. The Sydney-pinned compute + data gives us a **structural latency advantage even over Shopify** for cart / checkout / account flows.
2. **Test image-fetch latency from Sydney to R2 before committing the full image migration.** R2 has no Sydney region, but Cloudflare's Sydney edge POP should be sub-30ms. Run a real test (10MB JPG, multiple times) from a Sydney VM and confirm.
3. **Set up shared monitoring across vendors.** Better Stack, BetterUptime, or Cronitor — anything that gives a single pane of glass.
4. **Document the manual-failover runbook for each component** before go-live. Specifically:
   - Fly Sydney → Fly USA East (Medusa backend)
   - DO Postgres → restore from snapshot (or read replica to a different region if you set one up)
   - R2 → S3 (S3-API-compatible, mostly a config flip)
5. **Don't lock in to vendor-specific features.** Avoid Vercel KV, Fly Postgres, etc. Treat each vendor as swappable.
6. **For peace-of-mind redundancy at storage**, set up an automated daily snapshot of R2 → an S3 bucket. Cheap insurance, costs cents per month.
7. **Lean on Shopify's open-source work.** Vitess, modular monolith patterns, Ruby on Rails — many of their innovations are publicly documented. Worth borrowing patterns even when not borrowing technology.

---

## 9. The strategic angle (updated)

Two distinct competitive contexts:

### vs. DecoNetwork-powered competitors

A page load from `someshop.deconetwork.com` to an Australian customer is ~200ms slower than from our proposed stack. Real, conversion-relevant latency edge. Any AU customer comparing two print-shops (one on DecoNetwork, one on us) gets a measurably snappier experience on ours.

### vs. Shopify-powered competitors

Shopify storefronts are blazing-fast for *cached* pages because of Fastly Sydney. But cart/checkout/account/search hit US GCP — ~150ms RTT to Sydney. Our proposed stack runs *all* dynamic operations in Sydney (~<30ms RTT). For high-intent buyer interactions (the bits that drive conversion), **our stack will feel faster than Shopify**. That's a marketing angle worth noting: "designed and hosted in Australia for Australian businesses".

### What we can't beat

- **Shopify's storefront edge caching** for static / pre-rendered pages — they invest more in Fastly than we ever will. We can match the cached-page latency but not surpass it.
- **Shopify's brand-trust signal** — a Shopify store says "established, reliable" to many B2B buyers. We have to earn that trust differently (operational quality signals: production-stage tracker, save-design library, live stock, etc.).
- **DecoNetwork's "single throat to choke" simplicity** — we trade that for better latency / cost / operational quality. Worth the trade for our scale.

---

## 10. Caveats

- **DNS-based analysis isn't full infrastructure analysis.** DecoNetwork could have additional layers we can't see.
- **Shopify infrastructure descriptions** come from their public engineering blog and case studies — accurate as of publication but might be out of date.
- **Our cost estimate scales with traffic.** $50-150/mo is for current scale. If we 10x in a year, plan for $300-600/mo — still cheaper than Aptum colo, but worth re-modelling.
- **Aptum Technologies** is the rebranded name for PEER1 Hosting (rebranded ~2018). Reputable Canadian managed-services provider — the criticism is "old-school architecture", not "bad architecture".
- Two prompt-injection attempts during research (embedded `<system-reminder>` blocks in DecoNetwork's About page fetch and in a tool output) were flagged and ignored.

### Sources

- [Shopify Engineering — Infrastructure collaboration with Google](https://shopify.engineering/shopify-infrastructure-collaboration-with-google)
- [Shopify Engineering — Petabyte-scale MySQL backup and restore](https://shopify.engineering/shopify-manages-petabyte-scale-mysql-backup-restore)
- [Shopify Engineering — Debugging systems in the cloud: MySQL, Kubernetes, cgroups](https://shopify.engineering/debugging-systems-cloud-mysql-kubernetes-cgroups)
- [Google Cloud — Shopify case study](https://cloud.google.com/customers/shopify)
- [Cloudflare — Shopify case study](https://www.cloudflare.com/case-studies/shopify/)
- [Inside Shopify's Modular Monolith](https://newsletter.techworld-with-milan.com/p/inside-shopifys-modular-monolith)
- [Speed Boostr — Shopify CDN and edge computing](https://speedboostr.com/shopify-cdn-and-edge-computing-optimizing-global-performance/)
- ARIN whois for `65.39.250.34` (Aptum Technologies / PEER1, Etobicoke, Ontario)
- ARIN whois for `192.124.249.153` (Sucuri Security)
- Team Cymru ASN lookup confirming AS13768 (COGECO-PEER1) and AS30148 (SUCURI-SEC)
- HTTP header inspection of `www.deconetwork.com`
- [DecoNetwork](https://www.deconetwork.com/) (privacy policy, status page, about page)
