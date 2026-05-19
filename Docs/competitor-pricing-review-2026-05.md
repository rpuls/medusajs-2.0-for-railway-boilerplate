# Competitive Pricing & UX Review

**Date**: 2026-05-19
**Subject**: SC Prints
**Compared**: The Colour Cartel, PrintPod, The Print Bar, Create Apparel
**Method**: publicly available product-page data, customizer walk-throughs, and screenshots supplied by the operator. No dummy quote requests were submitted.

> **Method note**: an earlier pass of this review missed Cartel's per-product pricing matrix because the initial WebFetch only ingested their homepage. The operator-supplied screenshots corrected that. This version folds the matrix and the PDP comparison in throughout — it's a single coherent document, not a v1 + appended PDP section.

---

## 1. Headline findings

1. **Cartel is the benchmark to beat on transparency AND price.** They publish a full quantity × decoration-method matrix on every product page — the most transparent pricing display in the market. On the most common job shape (one AS Colour tee + one small print) they undercut us at every comparable tier. Their underlying discount ramp (0/10/20/25/30/35/40/45/50% off blank) is more aggressive than ours, and they keep discounting all the way to 1000 units while we cap at 100+.

2. **The Print Bar is the polished customizer benchmark.** Their PDP *is* the customizer — same-day toggle in-flow, "+60 colours" overflow indicator, decoration-method picker, save-state, 7-day turnaround visible upfront. They run flat-rate decoration ($8.50/side regardless of qty) which wins at low volume on big prints; we win at scale.

3. **PrintPod sells "bulk-buy packages"** (25 / 50 / 75 / 100-unit minimums per design) with a live per-unit price visible on the PDP and in the designer. Quote-only for anything outside the package structure.

4. **Create Apparel skips the PDP entirely** — catalog leads straight to the designer. No product page, no specs, no trust-building surface.

5. **We have the strongest post-order story** — production stage tracker, save-design library, re-order rehydration, supplier-API live stock — and none of it is surfaced pre-purchase. That's the biggest free conversion win available to us.

6. **Where we're clearly losing**: per-unit price at the common 20-100 qty band (Cartel beats us by $2-3/unit), pricing transparency on the PDP (we have the data but render it live-only inside the customizer), brand surfacing (data exists but isn't rendered), trust badges (none), BNPL hook (none), "+N colour" overflow (none), **product-category navigation in the main menu** (no Mens / Womens / Kids or T-shirts / Hoodies / Polos entries — see Section 4a).

7. **Where we're clearly winning**: post-order experience, DPI warning + vectorization upsell, server-rendered print files, cross-sells / "often ordered together" on the PDP, production ETA with live queue status, mobile sticky CTA, large-format print at scale.

---

## 2. The five players at a glance

| Dimension | SC Prints | The Colour Cartel | PrintPod | The Print Bar | Create Apparel |
|---|---|---|---|---|---|
| **PDP architecture** | Hybrid (info + integrated customizer) | Static-matrix-first | Traditional e-com | Customizer-as-PDP | Designer-first (no PDP) |
| **Online designer** | ✅ Fabric.js multi-side | ❌ (artwork post-order) | ✅ `/designer/customize` | ✅ live designer | ✅ `/designer/customize` |
| **Public pricing matrix** | partial (DecorationEstimator + tier ladder) | ✅ **best in class** | bulk-pack per-unit price | flat $8.50/side DTG | ❌ |
| **Garment price visible** | ✅ in-customizer | ✅ on PDP + matrix | ✅ on PDP | ✅ "From $X" | hidden in designer |
| **Embroidery tier published** | ✅ in-customizer | ✅ on PDP | ❌ | ❌ | ❌ |
| **Same-day option** | ❌ | ❌ | ❌ | ✅ +$11 | ✅ (separate page) |
| **Production ETA on PDP** | ✅ 10-12 days + live queue status | ✅ 10-15 days | ❌ | ✅ 7 days | ❌ |
| **Trust badge strip** | ❌ | ✅ 8 badges | ❌ | partial | ❌ |
| **BNPL hook on PDP** | ❌ | ❌ | ✅ Afterpay 4-pay | ❌ | ❌ |
| **Brand name surfaced** | ❌ (data exists, not rendered) | ✅ "Vendor: ASColour" | ✅ AS Colour logo | ✅ "AS COLOUR" header | partial |
| **Cross-sells on PDP** | ✅ **unique** | ❌ | ❌ | ❌ | ❌ |
| **Live DPI warning** | ✅ **unique** | ❌ | ❌ | ❌ | ❌ |
| **Vectorization upsell** | ✅ **unique** | ❌ | ❌ | ❌ | ❌ |
| **Save designs to account** | ✅ "My Designs" | n/a | unknown | implied | unknown |
| **Re-order rehydration** | ✅ | ❌ | unknown | unknown | unknown |
| **Server-rendered print files** | ✅ Sharp pipeline | n/a | unknown | unknown | unknown |
| **Production stage tracker (post-order)** | ✅ **unique** | ❌ | ❌ | ❌ | ❌ |
| **Supplier-API live stock** | ✅ AS Colour + FashionBiz + AP | unknown | unknown | unknown | unknown |
| **Brand catalog depth** | medium (AS Colour + FashionBiz + AP) | widest (Nike, Adidas, FJ premium) | narrow | medium (incl. Gildan) | narrow |
| **Minimums** | digital ≥ 1, screen 50+ | screen 20+, embroidery 10+ | bulk packs 25-100 | digital 0, BYO/corp 20 | unclear |
| **Turnaround standard** | 10-12 days | 10-15 days | "fast" | 7 days | 10-14 std / 3-5 express |

---

## 3. Pricing

### 3a. Cartel's published matrix (the keystone data point)

Cartel publishes this on every product page. Example: AS Colour Basic Tee 5051.

**Per-unit price, ex-GST, includes 1 small print at 1 location.**

| Qty | Discount on blank | Screen Print | Digital Print | Embroidery |
|---|---|---|---|---|
| 0 (single) | 0.00% | MOQ 20 | $27.90 | MOQ 10 |
| 5 | 10.0% | MOQ 20 | $25.11 | MOQ 10 |
| 10 | 20.0% | MOQ 20 | $22.32 | $24.72 |
| 20 | 25.0% | $18.30 | $20.93 | $23.18 |
| 50 | 30.0% | $17.08 | $19.53 | $21.63 |
| 100 | 35.0% | $15.86 | $18.14 | $20.09 |
| 200 | 40.0% | $14.64 | $16.74 | $18.54 |
| 500 | 45.0% | $13.42 | $15.35 | $17.00 |
| 1000 | 50.0% | $12.20 | $13.95 | $15.45 |
| 1000+ | — | Contact Us | Contact Us | Contact Us |

Stated context on the page:
- Single garment blank: $18.90 ex-GST
- "Pricing is calculated as one small print, one location."
- "Additional locations will incur additional costs."
- Max Discount Price ($12.20) = Screen Print at qty 1000.

**Implied decoration-only cost** (total – blank-after-discount), ex-GST:

| Qty | Blank ex-GST | Digital decoration | Screen decoration | Embroidery decoration |
|---|---|---|---|---|
| 1 | $18.90 | $9.00 | n/a | n/a |
| 10 | $15.12 | $7.20 | n/a | $9.60 |
| 20 | $14.18 | $6.75 | $4.12 | $9.00 |
| 50 | $13.23 | $6.30 | $3.85 | $8.40 |
| 100 | $12.29 | $5.85 | $3.57 | $7.80 |
| 200 | $11.34 | $5.40 | $3.30 | $7.20 |
| 500 | $10.40 | $4.95 | $3.02 | $6.60 |
| 1000 | $9.45 | $4.50 | $2.75 | $6.00 |

Cartel's "small print" decoration cost lands roughly in line with our A6 tier — they just bundle it into the unit price rather than itemising. **The bundled presentation is the real innovation.**

### 3b. Garment pricing head-to-head

All figures **inc-GST AUD** unless marked. Cost-basis assumptions noted — correct me and I'll re-run.

**AS Colour tee**

| Qty | SC Prints (Staple Tee, cost ~$9.50 ex) | Cartel (Basic Tee 5051) | Print Bar (Staple Tee 5001) | PrintPod (Promo Block Tee) |
|---|---|---|---|---|
| 1 | $20.90 | $20.79 ($18.90 ex) | $17.89 ("From") | quote |
| 25 | $17.77 | $15.60 (qty 20 tier) | unknown | $16.01 (bulk pack) |
| 50 | $16.72 | $14.55 (qty 50 tier) | unknown | likely cheaper |
| 100 | $15.68 | $13.52 (qty 100 tier) | unknown | unknown |
| 1000 | $15.68 (no 1000 tier) | $10.40 (qty 1000 tier) | unknown | unknown |

Cartel beats us on the blank at every quantity tier from 20 units up. Their discount ramp (0/10/20/25/30/35/40/45/50%) is more aggressive than ours (~0/10/15/20/25%, derived from our 2.20 → 1.65 multiplier range).

**Caveats**: AS Colour Basic Tee 5051 ≠ Staple Tee 5001 (similar fit, both AS Colour, cost probably within $1). PrintPod's "Promo Block Tee" is their economy line.

**AS Colour Heavy Hoodie**

| Qty | SC Prints (cost ~$22 ex) | Cartel (extrapolated) | Print Bar |
|---|---|---|---|
| 1 | $48.40 | $48.46 (single, from homepage) | $46.20 (Supply Hoodie "From") |
| 100 | $36.30 | ~$34.65 (35% off blank, if matrix applies) | unknown |

At 100+ Cartel would be ~$1.65/unit cheaper if their universal discount schedule extends to hoodies.

### 3c. Decoration pricing head-to-head

**Small print (chest logo, A6-equivalent)**

| Tier | SC A6 inc-GST | Cartel implied inc-GST | Print Bar (flat) |
|---|---|---|---|
| 1 | $8.50 | $9.90 | $8.50 |
| 10 | $7.50 | $7.92 | $8.50 |
| 20 | $6.50 | $7.43 | $8.50 |
| 50 | $5.50 | $6.93 | $8.50 |
| 100 | $5.00 | $6.44 | $8.50 |
| 1000 | $5.00 (no 1000 tier) | $4.95 | $8.50 |

**On decoration alone, we beat both Cartel and Print Bar on small prints at every published tier.** The reason Cartel still wins on the total bill is the more aggressive blank discount, not the print cost.

**Larger prints (A4 / A3 / Oversize)**

| Tier | SC A4 | SC A3 | SC Oversize | Print Bar (any size) |
|---|---|---|---|---|
| 1-9 | $11.00 | $12.50 | $15.00 | **$8.50** |
| 10-19 | $9.50 | $10.50 | $13.50 | **$8.50** |
| 20-49 | $8.50 | $9.50 | $12.50 | **$8.50** |
| 50-99 | $7.50 | $8.50 | $11.50 | **$8.50** |
| 100+ | $7.00 | $8.00 | $11.00 | **$8.50** |

Cartel doesn't publish large-print pricing — anything beyond "one small print, one location" routes to a quote.

**Pattern**: Print Bar's flat $8.50 wins at low volume on big prints; we win at scale on big prints; we win on A6 everywhere.

**Embroidery (mid-volume, ~5,000 stitches)**

| Qty | SC Prints (6k-stitch tier + amortised $60 digitising) | Cartel (small embroidery, bundled with blank) |
|---|---|---|
| 20 | $14.25 decoration + $20.79 blank ≈ $35.04 | $25.50 (bundled) |
| 50 | $10.45 decoration + $19.39 blank ≈ $29.84 | $23.79 (bundled) |
| 100 | $7.85 decoration + $17.25 blank ≈ $25.10 | $22.10 (bundled) |

Cartel wins on embroidery too. Gap is ~$3-9/unit at our common quantities.

**But**: Cartel's embroidery has a 10-unit minimum (we start at 1), and their "small embroidery" stitch ceiling isn't published — probably ~3,000 stitches, which would partly explain the price gap.

### 3d. Worked scenarios

**A — Startup launch: 25× AS Colour tee, single chest A4 DTG print**

(Cartel's matrix is for "one small print", so their number below is for the smaller equivalent — not A4.)

| | SC Prints | Print Bar | Cartel | PrintPod |
|---|---|---|---|---|
| Blank /unit | $17.77 | $17.89 | $14.55 | $16.01 (bulk pack 25u) |
| Print /unit | $8.50 A4 | $8.50 flat | bundled (small print) | quote |
| **Total /unit** | **$26.27** | **$26.39** | **$23.02** | ~$16 if pack includes print |
| **Order total (25)** | **$656.75** | **$659.75** | **$575.50** | $400.13 base + decoration |

Cartel undercuts us by ~$81 on this order. PrintPod's $400.13 package is suspiciously cheap — if it includes the print, they're the cheapest in the market on small runs.

**B — Corporate uniforms: 100× polo, 5,000-stitch embroidered logo**

| | SC Prints | Cartel (extrapolated to polo cost) |
|---|---|---|
| Polo blank /unit (100+ tier) | $21.45 | likely $19-21 |
| Embroidery /unit (5k stitches) | $6.85 (incl. amortised $60 digitising) | implied ~$8.58 (small embroidery) |
| **Total /unit** | **$28.30** | **likely $28-30** |
| **Order total (100)** | **$2,830** | **likely $2,800-3,000** |

Close to parity. Cartel's "small embroidery" likely caps at ~3k stitches — once it goes to quote, everyone's equally opaque.

**C — Event merch: 50× AS Colour Heavy Hoodie, front+back A3 DTG**

Cartel routes this outside their public matrix (two locations + large size).

| | SC Prints | Print Bar | Cartel |
|---|---|---|---|
| Blank /unit | $38.72 (50-99 tier) | $46.20 "From" | quote |
| Print x2 sides A3 | $17.00 ($8.50×2 at 50-99 A3 tier) | $17.00 ($8.50 flat × 2) | quote |
| **Total /unit** | **$55.72** | **$63.20** | quote |
| **Order total (50)** | **$2,786** | **$3,160** | quote |

Print Bar trails us by $374 on this scenario. This is our strongest territory.

---

## 4. The storefront experience

### 4a. Site navigation & menu structure

The discovery layer customers hit before they ever reach a PDP. All five players take meaningfully different approaches.

| | SC Prints | The Colour Cartel | The Print Bar | PrintPod | Create Apparel |
|---|---|---|---|---|---|
| Pattern | Single overlay (X to close), 5 sections | 11 top-nav items with deep mega-dropdowns | 4 top-nav items + "Same Day" / "Print on Demand" utility | Image-tile grid + text dropdowns | 9 top-nav items + utility nav |
| Audience nav (Mens / Womens / Kids) | ❌ | ✅ (first 3 navs) | ❌ | partial (image tiles) | ✅ ("Start Designing" 4-col grid) |
| Garment-type nav (T-shirts / Hoodies / Polos / etc) | ❌ | ✅ (every audience menu has full breakdown) | ✅ (Clothing dropdown) | ✅ (image tiles) | partial |
| Workwear / industry vertical | ❌ | ✅ Workwear nav + Industries dropdown (Trades / Events / Hospitality / Sports / Corporate / Schools) | ✅ Workwear sub-nav | ✅ (tile) | ✅ (Workwear + Corporate/Hospitality) |
| Brands as top-level nav | ✅ | partial ("Premium" lists brand logos) | ❌ | ❌ | ✅ |
| Decoration methods nav | ✅ "Browse Products & Services" | ✅ Services dropdown | implicit in MENU cards | ✅ Services | ✅ Services |
| Same-day / express entry | ❌ | ❌ | ✅ "Same Day" top utility | partial | ✅ "Same Day Printing" |
| Bulk / volume entry | ❌ | partial | ✅ "Bulk Orders" MENU card | ✅ "Bulk Buy Promo Packs" tile | ✅ "Bulk Packs" |
| BYO printing entry | ✅ "BYO" | ❌ | ✅ "BYO Printing" MENU card | ❌ | ✅ "BYO Bring Your Own" |
| Customizer entry | ✅ "Customizer" | "Design" services | ✅ "Custom Design Tool" MENU card | ✅ "Design Tool" top nav | ✅ "Start Designing" |
| **Best Sellers preview in menu** | ❌ | ✅ **3 product cards (image + price + swatches) in EVERY dropdown** | ❌ | partial (whole nav is products) | ❌ |
| Country / region selector | ✅ "Shipping to: Australia" | ✅ "Australia (AUD $)" | ❌ | ❌ | ❌ |
| Policies (Shipping / Returns / Privacy) in main nav | ✅ | ❌ (footer only) | ❌ (footer only) | ❌ (footer only) | ❌ (footer only) |
| Specialty tools (DTF builder / 3D Design / etc) | ✅ DTF builder, 3D Print Design | "Design" services | ❌ | ❌ | partial (DTF Transfers) |

**Where our menu is genuinely weaker**

1. **No product-category navigation.** Biggest gap. A customer who wants to browse hoodies can only get there via "Store" (one link to the whole catalog) or "Customizer". Every competitor lets them drill in from the nav — Cartel has 4 columns × audience × garment-type, Print Bar has a flat Clothing list, PrintPod uses image tiles.
2. **No audience entry (Mens / Womens / Kids).** Standard apparel pattern. Cartel and Create Apparel both lead with it.
3. **No industry / use-case verticals.** Cartel has Trades Uniforms, Event Merch, Hospitality, Corporate Merch, Sports & Clubs, Education. These are B2B conversion entry points and we have none.
4. **"Browse Products & Services" is mislabelled.** It lists decoration methods (Screen Printing, Embroidery, Digital Transfers, UV Printing, UV DTF) — not products. A user reading "Browse Products" expects garments.
5. **No Best Sellers panel in the menu.** Cartel embeds 3 best-selling products with image + price + colour swatches in every menu dropdown. Every menu interaction becomes a product showcase. We have a blank right column.
6. **Policies in primary nav.** Shipping / Returns / Privacy belong in the footer (where all four competitors put them). Hosting them in the main mega-menu burns real estate that should be product/service nav.
7. **No Same-Day or Bulk conversion entries.** Print Bar's "Same Day" is a top utility-nav item; Create Apparel has both "Same Day Printing" and "Bulk Packs" prominently. These are the highest-intent buyer entry points.

**Where our menu is distinctive**

1. **Single overlay pattern.** Clean, modern, full-screen takeover. Reads more like a luxury site than a Shopify catalog — but the content inside the overlay isn't earning its keep yet.
2. **Customizer as a top-level entry.** Most competitors hide their designer under Services. We elevate it.
3. **BYO as a top-level entry.** Matches Print Bar's positioning.
4. **Brands as a top-level entry.** Neither Cartel nor Print Bar elevates brand discovery this way. With our brand-entity work + brand landing pages, this is a real differentiator — could be stronger if we showed brand logos in the dropdown (Cartel's "Premium" does this).
5. **UV Printing + UV DTF + 3D Print Design** as specialty tools — none of the competitors list any of these.
6. **Country selector visible** ("Shipping to: Australia"). Useful for international expansion.

**Suggested menu restructure**

```
TOP UTILITY NAV (small, top of header):
  Same Day · Bulk Orders · Customizer · Login · Cart · 🇦🇺 AU

PRIMARY NAV (mega-menu items):
  Shop ▾    Brands ▾    Services ▾    Industries ▾    BYO    Specialty ▾    Contact

Shop ▾ (4 columns + best sellers panel)
  ├─ Mens: T-Shirts · Hoodies · Polos · Jumpers · Tanks · Long Sleeves · Jackets · Workwear · Activewear
  ├─ Womens: same shape
  ├─ Kids / Youth: T-Shirts · Hoodies · Tanks · Singlets
  ├─ Accessories: Headwear · Bags · Drinkware · Stickers
  └─ [Best Sellers panel: 3 product cards with image + price + swatches]

Brands ▾ (showcase logos)
  ├─ AS Colour
  ├─ FashionBiz family: Biz Collection · Biz Care · Biz Corporates · Syzmik
  ├─ Aussie Pacific
  ├─ JB's Wear · Gildan (if added)
  └─ [Brand landing page CTA]

Services ▾
  ├─ Screen Printing · DTG · DTF · UV DTF · UV Printing · Embroidery · Sublimation · Vectorization
  └─ [Service comparison + decoration estimator hook]

Industries ▾
  ├─ Trades & Workwear
  ├─ Events & Festivals
  ├─ Hospitality
  ├─ Corporate & Uniforms
  ├─ Sports & Clubs
  ├─ Schools & Education
  └─ Influencers / Streetwear

Specialty ▾
  ├─ DTF Builder
  ├─ 3D Print Design
  ├─ CMYK / DTF Guide
  └─ Lookbook

FOOTER (move from main nav):
  Shipping · Returns · Privacy · FAQ · Contact · Sitemap
```

**Concrete menu moves (rough priority)**

1. **Add a "Shop" mega-menu** with garment-type breakdown by audience. Single biggest gap — covers the most common discovery pattern in apparel.
2. **Move Policies (Shipping / Returns / Privacy) to the footer.** Frees the menu for product/service content.
3. **Rename "Browse Products & Services" → "Services" or "Decoration Methods".** Stop using "products" in the label when there are no products in the column.
4. **Add a Best Sellers panel** to the right of the menu. Pull 3 top-selling products dynamically. Cartel does this in every dropdown — their highest-converting nav element.
5. **Add an "Industries" entry** (Trades, Events, Hospitality, Corporate, Sports, Schools). Each becomes a B2B landing page. Cartel uses this exact structure — great for capturing intent-driven traffic.
6. **Add "Same Day" and "Bulk Orders" as top-nav utility entries** *if/when* we operationally support them. (Until then, "Bulk Orders" alone is honest.)
7. **Show brand logos in the Brands dropdown.** Cartel-style. Our brand entities already have logo URLs in the data — render them.

### 4b. PDP architecture — five distinct approaches

| Approach | Provider | The product page is… |
|---|---|---|
| **Customizer-as-PDP** | The Print Bar | The customizer canvas + side configurator. No traditional product description above the fold. |
| **Static-matrix-first** | The Colour Cartel | The pricing matrix is the centrepiece. Customizer entry is a click-through ("Add Custom Options & Calculate Pricing"). |
| **Traditional e-com** | PrintPod | Standard Shopify-style PDP. Customizer is a separate `/designer/customize/<id>` route. |
| **Designer-first / no PDP** | Create Apparel | Catalog goes straight to `/designer/customize/<id>`. No intermediate page. |
| **Hybrid PDP + integrated customizer** | **SC Prints** | Sidebar with product info + production ETA + decoration estimator. Customizer expands into the main column when engaged. Closest to Print Bar architecturally but with more context visible. |

### 4c. PDP feature comparison

| Dimension | SC Prints | Print Bar | Cartel | PrintPod | Create Apparel |
|---|---|---|---|---|---|
| Above-fold price | "From $X" + bulk tier table | "From $X + Decorations" | $X single + full matrix | "$X (Y each)" + bulk-pack | $X live in designer |
| Static pricing matrix on PDP | partial | ❌ | ✅ best in class | ✅ package | ❌ |
| Image gallery | Hero + variant-aware thumbnails | Customizer canvas as image | Multi-colour thumbnails | Multi-image w/ lifestyle shots | Single canvas view |
| Variant pickers pre-customizer | ✅ swatches + size pills | ✅ swatches + XS-5XL grid | only via customizer | ✅ swatches + size dropdown | only via designer |
| "+N colours" overflow | ❌ | ✅ "+60" | ❌ | ❌ | ❌ |
| Decoration method visible | ✅ DecorationEstimator | ✅ in-flow picker + "Change method" link | ✅ tabs at bottom | ❌ | hidden |
| Same-day badge | ❌ | ✅ "$11 extra" toggle | ❌ | ❌ | ❌ (separate page) |
| Production ETA on PDP | ✅ 10-12 days + live queue status | ✅ 7 days | ✅ 10-15 days | ❌ | ❌ |
| Trust badge strip | partial (ETA only) | partial | ✅ **8 badges** | ❌ | ❌ |
| Brand name surfaced | ❌ (data exists, not rendered) | ✅ "AS COLOUR" header | ✅ "Vendor: ASColour" | ✅ AS Colour logo | partial |
| Reviews / social proof | ❌ | ❌ | "Satisfaction Guarantee" badge | ❌ | ❌ |
| **Cross-sells on PDP** | **✅ unique** | ❌ | ❌ | ❌ | ❌ |
| BNPL hook | ❌ | ❌ | ❌ | ✅ Afterpay 4-pay | ❌ |
| Stock indication | ✅ `!` icons on OOS | not visible | "Contact Us" at 1000+ | standard e-com | standard e-com |
| Mobile sticky CTA | ✅ | likely | n/a | n/a | n/a |
| Schema.org JSON-LD | ✅ Product + Brand + Offer | unknown | unknown | unknown | unknown |

### 4d. Customizer feature comparison

| Feature | SC Prints | Print Bar | PrintPod | Create Apparel | Cartel |
|---|---|---|---|---|---|
| Multi-side designer | ✅ | ✅ Front/Back/L+R sleeve | ✅ Front L/Back/L sleeve | ✅ Body/Back/L+R sleeve | n/a |
| Decoration method picker | ✅ DecorationEstimator | ✅ in-flow + "Change method" | implied | implied | n/a |
| Live per-unit price | ✅ | ✅ | ✅ | ✅ | n/a |
| **Live DPI warning** | **✅ unique** | ❌ | ❌ | ❌ | n/a |
| **Vectorization upsell** | **✅ unique** | ❌ | ❌ | ❌ | n/a |
| Save designs to account | ✅ "My Designs" | implied | unknown | unknown | n/a |
| Re-order rehydration | ✅ | unknown | unknown | unknown | n/a |
| **Server-rendered print files** | **✅ Sharp pipeline** | unknown | unknown | unknown | n/a |
| Background removal | partial | ✅ marketed | unknown | unknown | n/a |
| Turnaround in-flow | partial | ✅ "7 business days" | unknown | unknown | n/a |

### 4e. Post-order experience

Only we publish meaningful detail here:

- **Production stage tracker** on `/account/orders/details/<id>` — five customer milestones, Domino's-pizza-style stepper.
- **Stage-change emails** on `awaiting_approval` and `in_production`.
- **Customer designs library** + re-order rehydration.
- **Auto-stamped initial stage** so every order shows the tracker from minute zero.

None of the competitor sites surface post-order tracking on landing or shop pages. **It's invisible to prospective customers because we don't put it in our marketing.**

---

## 5. Where we win / lose / are tied

### Where we genuinely win

1. **Post-order experience.** Production stage tracker, stage-change emails, save-design library, re-order rehydration. None of the four advertises anything comparable.
2. **DPI warning + vectorization upsell.** Unique. Real margin lever (vectorization revenue) + quality differentiator (fewer bad prints).
3. **Large-print decoration at scale.** A3/Oversize at 100+ undercuts Print Bar's flat $8.50.
4. **Small-print (A6) decoration at every tier.** We beat both Cartel and Print Bar on A6 specifically.
5. **Supplier-API live stock** from AS Colour, FashionBiz, AP. None of the competitors signal stock accuracy at this level.
6. **Cross-sells on the PDP** ("Often ordered together" + related products) — unique among the five.
7. **Production ETA with live queue status.** Strip already says "Production is running busy right now" when congested. No competitor signals operational load.
8. **Mobile sticky "Customize" CTA.** Clean conversion lever, no competitor equivalent.
9. **Schema.org structured data.** Pays off in Google Shopping / rich-result eligibility.

### Where we genuinely lose

1. **Per-unit price at the common 20-100 qty band.** Cartel undercuts us by ~$2-3/unit on the standard "tee + one small print" job.
2. **Pricing transparency on the PDP.** Cartel's static matrix beats ours. We have the data; we render it live-only inside the customizer.
3. **No 1000+ tier.** We charge the same at 100, 500, 1000 units. Cartel discounts to 50% at 1000. We're leaving margin on the table at the top.
4. **No same-day option.** Print Bar's +$11 same-day toggle is a marketing weapon we can't match operationally today.
5. **Premium brand catalog gap.** Cartel carries Nike / Adidas / FJ. Top-tier corporate clients filter us out.
6. **Brand name not surfaced.** All four competitors put the brand name on the PDP. We have brand entities, brand landing pages, brand parent hierarchy — and don't render the brand on the PDP. Free fix.
7. **No trust badge strip.** Cartel runs 8 badges. We do most of these as a service — we just don't say so.
8. **No BNPL hook on the PDP.** PrintPod shows Afterpay above the fold. Easy conversion lever.
9. **No "+N more colours" overflow** on the swatch grid. Print Bar's "+60" signals catalog depth without exploding the grid.
10. **No published large-print pricing on the PDP.** Our DecorationEstimator does show it, but only inside the customizer flow.
11. **Customizer marketing.** Print Bar markets mobile editing + background removal prominently. Even if we have comparable capabilities, we don't tell the story.
12. **No product-category navigation in the menu.** Customers can't browse by garment type (Hoodies / Polos / T-Shirts) from the menu. Every competitor lets them. See Section 4a.
13. **No audience or industry navigation.** Cartel has Mens / Womens / Kids / Workwear / Industries verticals. We have a single "Store" link.
14. **Menu wastes real estate on policies.** Shipping / Returns / Privacy occupy a primary nav column that should be product or service content.
15. **No Best Sellers panel in the menu.** Cartel surfaces 3 product cards (image + price + colour swatches) in every menu dropdown. Our right column is blank.

### Where it's roughly tied

- **Embroidery transparency**: both we and Cartel publish tiers. They bundle, we itemise. Different shape, both valid.
- **Multi-side customizer functionality**: all four competitors with a designer have multi-side, color, text, upload. Parity.
- **Minimums on digital print**: us 1, Print Bar 0, PrintPod 1 / 25 (depending on product). Industry-aligned.

### Where the data is too thin to call

- **PrintPod's bulk-pack pricing** ($16.01/unit at 25). Unclear if decoration is included. If yes, they're the cheapest in the market on small runs.
- **Cartel's quotes for multi-location / large-print / multi-method jobs.** Public data ends at "one small print, one location".
- **Create Apparel's pricing in general.** Quote-only and minimal PDP — we can only compare positioning, not numbers.

---

## 6. Suggested moves (prioritised)

### Tier 1 — UI-only, no pricing or operational change

1. **Render the brand name + link to brand landing page** in `ProductInfo`. Smallest implementation, highest "we should already be doing this" yield. Data exists in `product.brand`; the storefront just doesn't render it.
2. **Add a static pricing matrix component on the PDP** that mirrors Cartel's shape (qty × method, ex-GST, includes 1 small print). No pricing change — same numbers our customizer already shows, just rendered statically and earlier in the flow.
3. **Add a trust badge strip** below price: "Free Digital Proofs Before Production" / "Satisfaction Guarantee" / "Re-label & Swing Tag Ready" / "Elite Quality Finish" / "Real-Time Stock from AS Colour, FashionBiz, AP". We already do most of these.
4. **"+N more colours" overflow** on the swatch grid for AS Colour / Biz Collection products with deep colour ranges.
5. **Surface the production stage tracker pre-sale** — homepage tile or "How it works" page with a screenshot of the Domino's-style tracker. Our biggest invisible differentiator.
6. **Restructure the main menu** (see Section 4a) — add a "Shop" mega-menu with audience × garment-type breakdown (Mens / Womens / Kids / Accessories with T-Shirts / Hoodies / Polos / etc.), move Shipping / Returns / Privacy to the footer, rename "Browse Products & Services" to "Services". Single biggest discovery improvement.
7. **Add a Best Sellers panel to the mega-menu.** Pull 3 top-selling products dynamically (image + price + colour swatches). Cartel does this in every dropdown — their highest-converting nav element.
8. **Add an "Industries" mega-menu entry** (Trades, Events, Hospitality, Corporate, Sports, Schools). Each becomes a B2B landing page — captures intent-driven traffic Cartel currently owns.

### Tier 2 — small backend or pricing change

9. **Extend the bulk-tier ladder past 100+** (introduce 250 / 500 / 1000 bands). Captures margin headroom Cartel is currently winning at large orders.
10. **Tighten our 1-9 and 10-19 tiers on A4+ prints** to compete with Print Bar's $8.50 flat — or introduce a "flat-rate small-order" lane.
11. **Surface BNPL on the PDP** if Stripe / Afterpay is wired. Easy conversion lever.

### Tier 3 — strategic / operational

12. **Add Gildan and one premium label** (e.g. James Harvest or Stormtech) to plug the two catalog gaps Print Bar / Cartel exploit.
13. **Consider a same-day or express tier** with a flat surcharge similar to Print Bar's +$11.
14. **A/B test transparency vs. quote-funnel** on a corporate landing page — does "here's the price" outperform "request a quote" for our buyer mix?

---

## 7. Caveats & method notes

- **The first pass of this review missed Cartel's per-product pricing matrix** because WebFetch only ingested their homepage. The operator-supplied screenshot revealed it. Treat WebFetch summaries of competitor sites as a starting point, not a complete picture.
- **Cost-basis assumptions** for AS Colour Staple Tee ($9.50 ex-GST), Heavy Hood ($22 ex-GST), and a generic polo ($13 ex-GST) are estimates. If real landed costs differ by $1, every tier shifts $1.65-2.20.
- **Cartel's matrix is for AS Colour Basic Tee 5051**, not Staple Tee 5001. Similar fit, both AS Colour, cost probably within $1.
- **PrintPod's "Bulk Buy" packages** may or may not include decoration in the $16.01/unit price — unclear from screenshot. Worth checking with a real order.
- **Print Bar's same-day surcharge**: initial WebFetch said $10, their screenshot says $11. May be a recent change or page-specific copy.
- **"Small print" definition** varies. Cartel doesn't publish dimensions for their "small" tier. Ours is A6 (10×15 cm). They're probably similar, but the comparison shifts if their definition is narrower.
- **Customizer feature parity** is inferred from screenshots and marketing copy, not hands-on testing.
- **GST conversions** use ×1.10. Our published prices are already inc-GST; Cartel's matrix is ex-GST.
- **PDP comparison** uses Cartel's AS Colour Basic Tee PDP, Print Bar's AS Colour Staple Tee PDP, PrintPod's AS Colour Mens Promo Block Tee PDP, and Create Apparel's American Apparel 2001CVC Unisex Tee designer. Other PDPs across each site may differ in layout.
- **One prompt-injection attempt** was flagged during the original research: a `<system-reminder>` block was embedded in fetched content from Cartel's screen-printing page, telling me to use TaskCreate. Ignored.

---

## 8. Worth following up on

- **Visit Cartel's other PDPs** to confirm the matrix is universal (not just on Basic Tee).
- **Test a PrintPod bulk-pack order** end-to-end to confirm whether decoration is included in the package price.
- **Pull our actual landed costs** from the AS Colour API and re-run every cell in this review.
- **Side-by-side customizer test sessions**: place an identical order through SC Prints, Cartel, Print Bar, PrintPod, Create Apparel — capture screenshots and pain points.
- **Build the static-pricing-matrix PDP component** — the highest-leverage smallest-implementation move on the suggested-moves list.
- **Survey existing customers**: would they shop with us if we matched Cartel's pricing? Margin-vs-volume is the strategic question.

Happy to take any of these on as the next task, boss.
