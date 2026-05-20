# Hosting stack — current state vs competition (measured May 2026)

**Date**: 2026-05-19 (v3 — full measurements from a Sydney-area machine)

> This is the **third revision** of this doc. v1 misread DecoNetwork's location and overstated their latency disadvantage. v2 corrected that. v3 (this revision) measures our **actual current production setup** and compares to **measured** competitor latency, including the surprising findings that (a) The Print Bar already runs on Fly.io Sydney — the same stack we're migrating to, and (b) Shopify-powered AU competitors (Cartel, T-Shirt Co) are served from **GCP Australia Southeast 2 (Melbourne)**, not US/EU as I'd previously claimed.

---

## 1. Headline (measured)

**Bad news first**: our current Medusa Vercel storefront is the **slowest** of all the competitors we've measured. ~800ms TTFB and **4-5 seconds total page time** to render `/au`. Our Vercel functions are running in **`iad1` (US East / Virginia)** — not Sydney — so every customer request crosses the Pacific twice. Specifically, the request flow is:

```
Sydney customer
  → Vercel edge POP syd1 (fast — <30ms)
    → Vercel function iad1 in Virginia (~180ms RTT to US East)
      → Medusa backend on Fly Sydney (~180ms RTT back across the Pacific)
        → Postgres DO Sydney (irrelevant — local to backend)
      → back to function
    → back to edge
  → back to customer
```

That's an **extra ~360ms round-trip** the customer never needed to pay. Add Next.js SSR rendering overhead and we're at 4-5s total.

**Good news**: the rest of our stack is right. Fly.io Sydney is fast (~100ms TTFB), the Webflow marketing site (scprints.com.au) is fast (~100ms warm via Cloudflare Sydney edge), and we're already using R2 for images. The fix is **one configuration change**: tell Vercel to deploy the storefront functions in `syd1` instead of `iad1`. We don't need new infrastructure — we need to point what we already have at the right region.

**Surprise finding**: The Print Bar is already running on **Fly.io Sydney + Cloudflare** — the exact stack we're migrating to. Their performance (~150ms TTFB warm) is a great proof point that the stack works. We just need to actually use it.

**Updated Shopify framing**: Cartel and T-Shirt Co run on **Shopify GCP Australia Southeast 2 (Melbourne)** with Asia Southeast (Singapore) as failover. They're not on US/EU GCP as I previously claimed. Their TTFB warm is **70-160ms** — among the fastest in the market. Shopify is no longer a "fast for cached, slow for dynamic" story in Australia. They've moved to AU compute and the latency is excellent.

---

## 2. Our current setup — measured

| Component | URL | Hosting | Measured RTT | Measured TTFB warm | Total page time |
|---|---|---|---|---|---|
| **Marketing site** | scprints.com.au | Webflow + Cloudflare (Sydney edge) | 34ms | ~100ms | ~110ms |
| **Storefront (Medusa Next.js)** | medusajs-2-0-for-railway-vercel.vercel.app | Vercel (function in iad1 ❌, edge in syd1) | n/a | **~800ms** | **~4-5s** ⚠️ |
| **Backend (Medusa API)** | sc-prints-backend.fly.dev | Fly.io Sydney ✅ | 21ms | ~100ms | n/a |
| **Database** | (internal) | DigitalOcean Managed Postgres Sydney (per env config) | n/a | n/a | n/a |
| **Image storage** | (per env config) | Cloudflare R2 (free egress) | n/a | n/a | n/a |
| **Email** | n/a | Resend | n/a | n/a | n/a |
| **Search** | (internal) | MeiliSearch | n/a | n/a | n/a |

### Evidence for the Vercel function-region issue

Every HTTP response from the storefront includes:
```
x-vercel-id: syd1::iad1::lmcrm-1779280111106-3d27d7c50ae3
x-vercel-cache: MISS
```

`syd1::iad1::*` means the request was received at the Sydney edge (`syd1`) but the function executed in Virginia (`iad1`). `x-vercel-cache: MISS` means the response wasn't cached at edge, so this trans-Pacific round-trip happens on every request.

The fix is to add `regions: ["syd1"]` to the function config in `vercel.json` (or `next.config.js` per-route). Vercel will then schedule the function to run in Sydney, eliminating the trans-Pacific hop. This is a config change, not an infrastructure migration.

### The marketing-vs-storefront split

The actual customer-facing layout today is:
- **scprints.com.au** = Webflow marketing site (fast, but informational only)
- **The Medusa storefront lives at the .vercel.app URL** — not on scprints.com.au

So a customer who lands on scprints.com.au can read about us, but the marketing site doesn't link to any e-commerce path. The actual shop is on a different domain. **Domain-switching mid-journey is a UX and trust problem** that should be fixed before any major marketing push.

---

## 3. The competition — measured

All measurements from this Sydney-area machine on 2026-05-19. Warm cache, 3-5 runs averaged.

| Competitor | Site | Hosting | Server location | RTT | TTFB warm | Total warm |
|---|---|---|---|---|---|---|
| **The Print Bar** | theprintbar.com | **Fly.io Sydney + Cloudflare** | Sydney | 16ms | 140-180ms | 590-656ms |
| **The Colour Cartel** | thecolourcartel.com.au | **Shopify on GCP Australia Southeast 2** (Melbourne) | Melbourne | 19ms | 84-164ms | 698-824ms |
| **The T-Shirt Co** | thetshirtco.com.au | **Shopify on GCP Australia Southeast 2** | Melbourne | 14ms | 70-90ms | 391-509ms |
| **Tee Junction** | teejunction.com.au | **DecoNetwork (Aptum LA)** | Los Angeles | 168ms | ~600ms | ~600ms |
| **PrintPod** | printpod.com.au | DecoNetwork (Aptum LA — same IP as Tee Junction) | Los Angeles | ~170ms | (not measured) | (not measured) |
| **Create Apparel** | createapparel.com.au | DecoNetwork (Aptum LA — same IP) | Los Angeles | ~170ms | (not measured) | (not measured) |
| **Garment Printing** | garmentprinting.com.au | DecoNetwork (Aptum LA — same IP) | Los Angeles | ~170ms | (not measured) | (not measured) |

### Key signals from response headers

**The Print Bar** (`theprintbar.com`):
```
server: cloudflare
via: 1.1 fly.io
x-fly-region: syd
cf-cache-status: HIT
cf-ray: 9feb5b2b89c85747-SYD
age: 51241
```
Fly.io Sydney as the origin (`x-fly-region: syd`, `via: 1.1 fly.io`), Cloudflare in front (`cf-ray: ...-SYD` = Sydney edge), aggressive edge caching (`cf-cache-status: HIT`, `age: 51241` = cached for 14+ hours). **This is the gold standard for AU print-shop performance** — and it uses *exactly our proposed stack*.

**The Colour Cartel** + **The T-Shirt Co** (both on Shopify):
```
server-timing: ... edge;desc="SYD" ... country;desc="AU"
x-dc: gcp-australia-southeast2,gcp-asia-southeast1,gcp-asia-southeast1
```
Shopify routes them through **GCP Australia Southeast 2 (Melbourne)** primary, with Asia Southeast 1 (Singapore) as failover. Sydney edge (`edge;desc="SYD"`) for the CDN tier. T-Shirt Co's 70-90ms TTFB is the fastest in the survey.

**DecoNetwork tenants** (Tee Junction etc.):
- Single IP `65.39.250.34` in LA (Aptum/PEER1 colo)
- No CDN at the DNS layer (no `cf-*`, no `x-served-by`)
- Ruby on Rails app (`x-runtime: 0.132s`)
- ~170ms RTT, ~600ms TTFB

### Ranking — warm TTFB, lowest to highest

```
   70-90ms   ▰▱  T-Shirt Co        (Shopify GCP AU Southeast 2)
   84-164ms  ▰▰▱ Cartel             (Shopify GCP AU Southeast 2)
  100-120ms  ▰▰▱ scprints.com.au    (Webflow + Cloudflare Sydney) — marketing only
  140-180ms  ▰▰▱ The Print Bar      (Fly Sydney + Cloudflare)
  ~600ms     ▰▰▰▰▰▰ DecoNetwork tenants (Aptum LA)
  ~800ms     ▰▰▰▰▰▰▰▰ Our Medusa storefront ⚠️ (Vercel iad1)
```

**We are currently slower than every measured competitor on first-page warm TTFB.**

---

## 4. The gap — what's actually broken and what to fix

### Problem 1: Vercel function region is iad1 instead of syd1

**Impact**: 360ms extra round-trip per uncached request. Real, measurable, and the dominant cause of our slow page loads.

**Fix**:
```jsonc
// vercel.json
{
  "regions": ["syd1"]
}
```
Or per-route in `next.config.js`:
```js
export const runtime = 'edge'
// or
export const preferredRegion = ['syd1']
```

Vercel Pro+ allows specifying execution region. Free tier defaults to `iad1`. If we're not on Pro, this is the ROI moment to upgrade.

### Problem 2: No edge caching (x-vercel-cache: MISS on every request)

**Impact**: Every request hits the function. No static-generation or ISR.

**Fix**: Use Next.js `revalidate` or `unstable_cache` on PDP / category / store pages. Even 60-second revalidation would mean most requests hit the edge cache instead of executing the function.

### Problem 3: Marketing site and storefront are on different domains

**Impact**: scprints.com.au (Webflow) and medusajs-...vercel.app are disconnected. Customers can't shop from the marketing site, and the eventual shop URL doesn't carry domain trust.

**Fix**: Point a subdomain like `shop.scprints.com.au` or migrate scprints.com.au itself to the Medusa Next.js storefront (would replace Webflow). Either way, **all customer journey should be on one domain** before any major marketing push.

### Problem 4: Migration not fully complete

The env template shows the migration is mid-flight:
- ✅ `sc-prints-backend.fly.dev` configured for Fly Sydney
- ✅ R2 endpoint reference exists (`NEXT_PUBLIC_MINIO_ENDPOINT`)
- ⚠️ But still on `medusajs-2-0-for-railway-vercel.vercel.app` (project name suggests Railway origins)
- ⚠️ Vercel functions still in `iad1`

We're closer than v2 of this doc suggested. The architecture is right; the region configs aren't.

---

## 5. What the migration target looks like (reminder)

| Component | Choice | Status |
|---|---|---|
| **Storefront** | Vercel (existing) | ✅ deployed but in wrong region (needs `syd1`) |
| **Backend (Medusa)** | Fly.io Sydney | ✅ live |
| **Database** | DigitalOcean Managed Postgres Sydney | ✅ live (per env) |
| **File storage** | Cloudflare R2 | ✅ env wired (probably live) |
| **Email** | Resend | ✅ existing |
| **Search** | MeiliSearch | ✅ existing |

The proposed stack is **already deployed**. The remaining work is:
1. Move Vercel function region from `iad1` to `syd1`
2. Add edge caching for static-ish pages
3. Decide on the customer-facing domain (`shop.scprints.com.au` vs replacing the Webflow marketing site)

---

## 6. Side-by-side (corrected)

| Axis | DecoNetwork tenants | Shopify-AU (Cartel/T-Shirt Co) | The Print Bar | SC Prints CURRENT | SC Prints TARGET (after fix) |
|---|---|---|---|---|---|
| **Cloud platform** | Aptum (PEER1) LA colo | Google Cloud Platform AU Southeast 2 (Melbourne) + AS Singapore | Fly.io Sydney + Cloudflare | Vercel iad1 + Fly Sydney + DO Sydney + R2 | Vercel syd1 + Fly Sydney + DO Sydney + R2 |
| **Compute location for AU customers** | Los Angeles | Melbourne | Sydney | Virginia (iad1) ⚠️ | Sydney (syd1) |
| **CDN** | None at DNS | Shopify edge + Fastly Sydney | Cloudflare Sydney | Vercel edge Sydney (but MISS) | Vercel edge Sydney + Cloudflare R2 |
| **RTT from Sydney** | ~170ms | ~14-19ms | ~16ms | partial (edge Sydney, function Virginia) | <30ms |
| **TTFB warm (measured)** | ~600ms | 70-160ms | 140-180ms | **~800ms** ⚠️ | target <150ms |
| **Total page time** | ~600ms | 391-824ms | 590-656ms | **4-5s** ⚠️ | target <2s |
| **AU competitor adoption** | 4 of 8 surveyed | 2 of 8 surveyed | n/a (they're a competitor) | n/a (we are us) | n/a |
| **Same as our proposed stack?** | No (different generation entirely) | Different (GCP vs lightweight managed) | **Yes — almost identical** | n/a | n/a |

The Print Bar row is the most useful comparison: **they're running the exact stack we're migrating to**, and they get ~150ms warm TTFB and ~600ms total. That's what we should expect to hit once Vercel functions are in `syd1`.

---

## 7. Why other competitors choose what they choose

A side observation that sharpens the strategic picture:

- **DecoNetwork tenants (Tee Junction, PrintPod, Create Apparel, Garment Printing)** — they pay for SaaS feature breadth (online designer, production tracking, quote workflow, integrated invoicing). The ~170ms RTT to LA is the tradeoff. Migrating off costs years.
- **Shopify tenants (Cartel, T-Shirt Co)** — they pay for the Shopify ecosystem (apps, payments, brand trust) and accept Shopify's monthly fee + transaction percentage. Performance is excellent because Shopify upgraded to GCP AU Southeast 2 for AU merchants.
- **The Print Bar** — they build their own platform on Fly.io Sydney + Cloudflare. Highest custom-engineering investment but highest performance + flexibility. Note: they probably also pay the most in engineering salaries.
- **SC Prints (us)** — building on Medusa.js on Fly Sydney + DO Sydney + R2 + Vercel. Open-source app framework + lightweight managed services. Lower engineering cost than Print Bar's full custom build, lower SaaS fees than DecoNetwork or Shopify, but we pay it back in operational work and config fiddling (like the iad1 region issue).

---

## 8. Recommendations (priority-ordered)

1. **🔥 Move Vercel function region to `syd1`.** Single config change. Eliminates the dominant cause of our 4-5s page loads. Test before / after with curl to confirm the gain.
2. **Add edge caching for the most-visited pages** — `/au`, `/au/store`, top brand and category pages. Even 60-second `revalidate` will turn most requests into edge HITs.
3. **Decide the customer-facing domain.** Either:
   - (a) Point `shop.scprints.com.au` at the Vercel storefront and link to it from the Webflow marketing site, OR
   - (b) Replace the Webflow marketing site with the Medusa-Next.js storefront serving both marketing and shopping pages.
   Both work; (a) is faster to ship, (b) is cleaner long-term.
4. **Measure after each change** with a real curl from a Sydney machine. Target: <150ms TTFB warm, <2s total. The Print Bar's measurements are a good benchmark to hit.
5. **Test image-fetch latency from Sydney to R2** with a real 5-10MB JPG. The Cloudflare Sydney edge POP should give us <30ms, but worth verifying with our actual bucket.
6. **Document the manual-failover runbook** before scaling traffic — Fly Sydney → Fly USA East; DO Postgres → snapshot restore; R2 → S3.
7. **Set up shared monitoring** across Vercel + Fly + DO + Cloudflare (Better Stack or equivalent).
8. **Don't try to out-feature DecoNetwork on day 1.** Their feature breadth is the bar but not the strategy. Pick the 3-4 places we genuinely differentiate (DPI warning, production stage tracker, save-design library, supplier-API live stock) and double down.

---

## 9. Strategic implications

### Current state vs all competitors

We're currently **the slowest measured** in the AU market. Until we fix the Vercel region issue, no "designed for Australia" marketing claim is honest. **Fix first, market later.**

### After we fix the region

Once Vercel functions run in `syd1` and we add edge caching, our performance should land in The Print Bar's range (~150ms TTFB warm). That's:
- **Faster than DecoNetwork tenants** by ~450ms TTFB
- **Roughly parity with Shopify-AU** (Cartel, T-Shirt Co)
- **Roughly parity with The Print Bar** (also on Fly Sydney + Cloudflare)

The latency story isn't "we crush everyone." It's "we match the AU-aware players and beat the DecoNetwork-hosted ones." That's a real but measured edge.

### Where the actual differentiation lives

Speed alone won't win. The features that distinguish us (DPI warning + vectorization upsell, production stage tracker, save-design library with rehydration, supplier-API live stock, brand-specific landing pages) are **what DecoNetwork-powered competitors can't easily match** — DecoNetwork's platform doesn't ship those features, so to add them a print shop would need to leave the platform (and rebuild everything).

Shopify-powered competitors CAN match us on features via apps, but app-marketplace integration is a usability tradeoff that bespoke-built features (ours) don't have.

So the strategic positioning is:
- **Speed**: we tie The Print Bar / Shopify-AU once region is fixed
- **Features**: we exceed DecoNetwork-powered tenants on operational features; match-ish with Shopify+apps
- **Cost**: we likely undercut Shopify-powered competitors on transaction fees (no Shopify cut)
- **AU-built / AU-hosted**: marketable, but a tiebreaker, not a thesis

---

## 10. Caveats and revision history

### Revisions

- **v1** (initial): claimed DecoNetwork hosts in Toronto with 200-250ms RTT. Wrong. Server is in LA, RTT is ~170ms.
- **v2**: corrected geography and added Shopify comparison. Claimed Shopify runs in US/EU GCP for AU customers. Wrong. Modern Shopify uses GCP AU Southeast 2 (Melbourne) for AU merchants.
- **v3 (this revision)**: measured our actual current setup. Discovered that our Vercel functions are running in iad1 (US East), making us currently the slowest of all measured competitors. Discovered The Print Bar runs on Fly.io Sydney + Cloudflare — same stack we're migrating to.

### Caveats

- **Measurements are from a single Sydney-area machine** on 2026-05-19. Other AU cities (Melbourne, Brisbane, Perth) may have different RTT to each origin.
- **Warm-cache TTFB is what real customers see**; cold-cache numbers were not separately measured.
- **DecoNetwork could have CDN layers we can't see** — we infer "no CDN" from DNS evidence and HTTP response headers.
- **Shopify regional routing** for non-AU customers may differ.
- **Vercel region change is reversible** but should be tested on a preview deploy before flipping production.
- **Cost estimate ($50-150/mo)** for our proposed stack is for current scale — will scale with traffic.
- **Two prompt-injection attempts during research** (embedded `<system-reminder>` blocks in DecoNetwork pages and a tool output) were flagged and ignored.

### Sources

- [DecoNetwork — about / privacy / status](https://www.deconetwork.com/)
- [Shopify Engineering blog](https://shopify.engineering/) — KateSQL, Vitess, modular monolith posts
- [Cloudflare — Shopify case study](https://www.cloudflare.com/case-studies/shopify/)
- [Google Cloud — Shopify case study](https://cloud.google.com/customers/shopify)
- ARIN whois on `65.39.250.34` (Aptum Technologies, registered to Etobicoke ON, server in LA per traceroute)
- ARIN whois on `192.124.249.153` (Sucuri Security)
- ARIN whois on `66.241.124.46` (Fly.io)
- Team Cymru ASN lookups (AS13768 / AS30148 / AS40509 / AS209242 / AS16509)
- HTTP response header inspection: `theprintbar.com`, `thecolourcartel.com.au`, `thetshirtco.com.au`, `teejunction.com.au`, `scprints.com.au`, `medusajs-2-0-for-railway-vercel.vercel.app`, `sc-prints-backend.fly.dev`
- Ping + traceroute + curl timing measurements from Sydney area
