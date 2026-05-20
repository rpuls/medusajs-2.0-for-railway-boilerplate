# Hosting stack — DecoNetwork (observed) vs. SC Prints' proposed migration

**Date**: 2026-05-19
**Question**: How does DecoNetwork host its storefronts / backend / images / database, and how does that compare to the stack SC Prints is migrating towards (Vercel + Fly.io Sydney + DigitalOcean Managed Postgres Sydney + Cloudflare R2 + Resend)?

---

## 1. Headline

DecoNetwork runs on an **old-school single-vendor managed-hosting setup**: Sucuri WAF in front, then Aptum Technologies (formerly PEER1) bare-metal / colo behind. The marketing site, the tenant app, the "CDN", images, and static assets **all resolve to the same single IP** (`65.39.250.34`) — there's no real CDN layer, no hyperscaler cloud, no Australian region, and no architectural separation between storefront and backend.

Our proposed stack (Vercel + Fly.io Sydney + DO Managed Postgres Sydney + Cloudflare R2 + Resend) is **a generation ahead** on every axis that matters for an Australian customer base: latency, redundancy, cost-at-our-scale, operational overhead. The migration is strategically sound.

The one thing DecoNetwork has that we should consciously preserve: predictability of cost and a single throat to choke. Multi-vendor stacks can fragment when something goes wrong.

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
                              ↑ owned by Aptum Technologies (PEER1), Canada
                              ↑ CIDR 65.39.224.0/19 — colo/managed hosting block
```

**Nameservers**: `pdns09.domaincontrol.com` / `pdns10.domaincontrol.com` — GoDaddy DNS.

### What this means

| Component | DecoNetwork (observed) | Implication |
|---|---|---|
| **Marketing site WAF** | Sucuri (US, generic security proxy) | Web-app firewall but no CDN-tier caching |
| **Storefront / app / images / static** | Single IP at Aptum Technologies (PEER1) | One physical or virtual server cluster — no edge distribution |
| **Hyperscaler cloud?** | **No** — Aptum is bare-metal / colo / managed-hosting, not AWS/GCP/Azure | No auto-scaling, no managed services, no regional failover by default |
| **CDN** | **None at the DNS layer** | Images served directly from origin server in Canada/US |
| **DNS provider** | GoDaddy | Basic DNS — no edge routing |
| **Australian region** | **No** — Aptum's nearest POPs are US/Canada | Latency tax on Australian shoppers (~150-250ms RTT minimum) |
| **Status-page granularity** | Single "DecoNetwork Services" component, 99.991% uptime | No regional split, no per-service granularity |

### What they don't publish (and we couldn't infer)

- Specific data centre city (Aptum has multiple — TOR, NYC, LAX, MIA, LON, AMS most likely)
- Database technology (almost certainly MySQL or Postgres on the same host, given the bare-metal pattern)
- Backup / DR setup
- Whether there's any internal CDN we can't see at the DNS layer (unlikely given how cleanly the CDN-style subdomains all point at the origin IP)

Their public privacy policy mentions "robust information security policies" but **explicitly does not name any sub-processors, cloud providers, or data-center locations** — typical for older SaaS that doesn't want to commit to specifics. The "Server Security FAQs" linked from the privacy policy returned HTTP 403 to anonymous fetches, so we couldn't read the explicit security claims.

### Caveats on this analysis

- DNS evidence is correct as of the lookup date (May 2026) but the underlying setup could change.
- We didn't pay for / submit to commercial intelligence tools (BuiltWith, Wappalyzer Pro) that would give a fuller picture.
- "No CDN at the DNS layer" is strong evidence but not conclusive — they could have an internal reverse-cache that doesn't surface in DNS.
- Their actual database technology, backup strategy, and DR posture are not externally observable.

---

## 3. Our proposed stack

| Component | Choice | Why |
|---|---|---|
| **Storefront** | **Vercel** (existing) | Edge-cached SSR, global CDN baked in, Next.js native, ~30-50ms TTFB from Sydney |
| **Backend (Medusa)** | **Fly.io Sydney (`syd`)** | Only Sydney-region option for a long-running Node app with Postgres-attached state at reasonable cost. Fly's `syd` is a tier-2 region with fewer hosts than `iad`/`lhr` but functionally fine for our load |
| **Database** | **DigitalOcean Managed Postgres (Sydney)** | Cheapest managed Postgres with a Sydney region (~$15/mo basic). Daily automated backups, point-in-time recovery, no DBA overhead |
| **File storage** | **Cloudflare R2** | S3-compatible, **free egress** (vs. AWS S3's $0.09/GB out), Cloudflare-CDN-native, no Sydney-specific region but Cloudflare edges are everywhere |
| **Email** | **Resend** (existing) | Already wired, no change. Solid deliverability, simple API |

### Why this stack is appropriate for us

1. **Australian customer base** — Vercel SSR + Fly Sydney + DO Postgres Sydney puts compute + data within the same metro as the buyers. DecoNetwork's customers in Australia pay a 150-250ms RTT tax on every page load.
2. **Cost at our scale** — At <100k orders/year, managed services are dramatically cheaper than colo. Fly + DO + R2 + Vercel for our load is ~$50-150/mo. Aptum bare-metal is typically $500+/mo per server.
3. **Operational overhead** — Three managed services (Fly, DO, R2) vs. one bare-metal provider where we'd own OS patching, MySQL/Postgres admin, backup scripts, etc.
4. **Replaceable components** — Each piece swaps if a vendor goes bad. R2 → S3, DO → AWS RDS, Fly → Railway, Vercel → Netlify. DecoNetwork's all-in on Aptum means any incident is single-vendor.
5. **R2 free egress** — Image-heavy printing business. AWS S3 egress would be ~$0.09/GB; Cloudflare R2 is free out. At even modest volume (1TB/month of customer image downloads) that's $90/month saved vs S3.

---

## 4. Side-by-side comparison

| Axis | DecoNetwork (observed) | Our proposed stack |
|---|---|---|
| **Hosting model** | Bare-metal / colo (Aptum/PEER1) | Serverless edge (Vercel) + region-pinned VM (Fly) + managed services |
| **Storefront delivery** | Origin-served from single IP in N. America | Edge-cached SSR with global CDN |
| **CDN for images** | None at DNS layer — origin-served | Cloudflare R2 + Cloudflare CDN baked in |
| **Database** | Co-located with app on same host (presumed) | DigitalOcean Managed Postgres, separate VM, automated backups |
| **Australian latency** | 150-250ms RTT (Canada/US origin) | <30ms (Sydney region) |
| **Auto-scaling** | None observable (single IP under load = single host limits) | Fly machines auto-scale; Vercel scales serverless; DO Postgres vertical-scale |
| **Failure mode** | Single-vendor cascading (one Aptum incident = full outage) | Vendor-isolated (Vercel down ≠ Fly down ≠ DO down) |
| **Backup / DR** | Vendor-managed (opaque to outside) | DO automated daily snapshots + 7-day PITR; R2 versioning; Vercel zero-state |
| **Cost predictability** | High (fixed colo bill) | Variable (per-request / per-GB / per-machine) but cheap at our scale |
| **WAF / DDoS** | Sucuri in front of marketing site | Cloudflare in front of R2 + Vercel; can add Cloudflare in front of Fly if desired |
| **Multi-region failover** | Not advertised | DO Postgres single-region by default (add read replicas if needed); Fly can deploy to multiple regions easily |
| **Vendor count** | 1 hosting + 1 WAF | 4 (Vercel, Fly, DO, Cloudflare) + Resend |
| **Likely monthly cost at our scale** | $500+ (Aptum colo) — but we're DecoNetwork-sized, they're spread across many tenants | ~$50-150 (Fly + DO + R2 + Vercel free tier + Resend) |
| **Operational complexity** | Low (one vendor) | Medium (four vendors, but all managed) |

---

## 5. Where DecoNetwork's approach has merit

A single-vendor managed-hosting setup is **not stupid** — they likely chose it for real reasons:

1. **Predictability of cost** — One colo bill. No per-request pricing surprises. Easier to budget at the scale of a 600-employee LinkedIn SaaS company.
2. **Single throat to choke** — When something breaks at 3am, there's one provider to call. With our proposed stack, an incident might require Vercel + Fly + DO to coordinate.
3. **No per-request scaling cost** — All-you-can-eat compute. At very high traffic the per-request pricing of serverless can become more expensive than fixed hardware.
4. **Mature vendor** — Aptum has been around since 1999. Some of our chosen vendors (Fly.io, R2) are <5 years old and have higher provider-risk.
5. **All-on-one-host architecture** is simple — app ↔ DB ↔ static all on the same network = no inter-service latency, no cross-VPC fees, no service-mesh complexity.

**What we should explicitly preserve from this model when we migrate**:

- **A single incident-response playbook** that covers all four vendors (don't fragment ops by vendor).
- **Cost monitoring** so we don't get surprised by per-request scaling — set budget alerts in each vendor's dashboard.
- **Documented vendor-failure scenarios** — what happens if R2 goes down? What if Fly Sydney goes down? Have a fallback plan even if it's "manual recovery in 2 hours".

---

## 6. Risks of the proposed stack we should mitigate

| Risk | Mitigation |
|---|---|
| **Fly.io Sydney is a smaller region** — fewer hosts, more chance of regional capacity issues | Have a documented `syd → iad` (US East) failover for the Medusa backend, accept temporary AU latency hit during incidents |
| **R2 has no Australian region** | Test image-fetch latency from Sydney to nearest Cloudflare edge (Sydney POP exists, should be <30ms) — confirm before cutover |
| **DigitalOcean Managed Postgres Sydney** is a relatively new region | Verify their stated SLA (typically 99.99% for managed DBs) and confirm PITR works on the Sydney region — test restore drill before cutover |
| **Multi-vendor blast radius unknown** | Run a tabletop exercise: simulate each vendor going down for 1 hour and document response |
| **Cloudflare R2 + Fly.io + DO + Vercel = 4 separate billing / monitoring surfaces** | Set up a single status-monitoring dashboard (e.g. Better Stack — same as DecoNetwork uses) that pings each component independently |
| **Egress / inter-service traffic costs** | Map data flows: Vercel ↔ Fly (egress from Vercel = free; from Fly = paid per GB); Fly ↔ R2 (R2 free egress = clean); Fly ↔ DO Postgres (same region = no cross-region cost). All workable, just budget for it |
| **Backup verification** | DO Postgres backups are automated but worth a test-restore on day-1 of go-live |

---

## 7. Specific recommendations

1. **Proceed with the proposed stack.** It's the right call for a Sydney-based business at SC Prints' scale. The latency, cost-at-our-volume, and operational quality are all materially better than DecoNetwork's approach.
2. **Test image-fetch latency from Sydney to R2 before committing the full image migration.** R2 has no Sydney region but Cloudflare's Sydney edge POP should be sub-30ms. Run a real test (10MB JPG, multiple times) from a Sydney AWS / Vercel host and confirm.
3. **Set up shared monitoring across vendors.** Better Stack, BetterUptime, or Cronitor — anything that gives a single pane of glass for "is the full stack healthy". DecoNetwork uses Better Stack already; that's a fine choice.
4. **Document the manual-failover runbook for each component** before go-live. Specifically: Fly Sydney → Fly USA East; DO Postgres → restore from snapshot; R2 → S3 (R2 is S3-API-compatible so this is a config flip).
5. **Don't try to make all four vendors talk to one another.** Keep each as an independent service with clean API boundaries. Resist the temptation to use vendor-specific lock-in features (e.g. Vercel KV, Fly Postgres). Treat each vendor as swappable.
6. **For peace-of-mind redundancy at the storage layer**, set up an automated daily snapshot of R2 → an S3 bucket. Cheap insurance — costs cents per month for a small business.

---

## 8. The strategic angle

DecoNetwork is a **decade-old multi-tenant SaaS** built on infrastructure that was state-of-the-art in 2010 (Aptum/PEER1 was the cool option then). They have inertia: they can't easily migrate 1000+ tenant storefronts off Aptum without massive engineering effort.

We are migrating **before** that inertia builds up. Picking the right modern stack now means we don't carry technical debt forward for the next decade.

The other angle: when we compete against DecoNetwork-powered print shops on speed, we have a real edge. A page load from `someshop.deconetwork.com` to an Australian customer is ~200ms slower than a page load from `scprints.com.au` would be on our proposed stack. That's a real conversion advantage.

---

## 9. Caveats

- **DNS-based analysis isn't full infrastructure analysis.** DecoNetwork could have additional layers (internal CDN, separate database hosts) that don't show up in public DNS.
- **Their stack might be evolving.** Public DNS evidence is a point-in-time snapshot.
- **Our actual costs depend on traffic volume.** The $50-150/mo estimate is for SC Prints' current scale. If we 10x in a year, the figure could be $300-600/mo — still cheaper than Aptum colo, but worth re-modelling annually.
- **Aptum Technologies** is the rebranded name for PEER1 Hosting (rebranded ~2018). They're a real, reputable Canadian-based managed-services provider — not a fly-by-night colo. So the criticism is "old-school architecture", not "bad architecture".
