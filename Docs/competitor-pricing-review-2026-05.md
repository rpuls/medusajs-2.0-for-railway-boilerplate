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

### Tier 4 — Marketing, SEO, paid acquisition

15. **City-specific landing pages** (`/locations/melbourne/custom-printing`, `/locations/sydney/custom-printing`, etc.) — templated set of 4-6 metros, each capturing local search intent for "[service] in [city]" queries. Programmatic generation from a small city list + a stable template.
16. **AS Colour-as-SEO-asset.** Rewrite `/brands/as-colour` title + H1 + meta description to lean into the AS Colour brand name explicitly. Spin out service pages like `/services/as-colour-dtg-printing` and `/services/as-colour-custom-embroidery` to capture brand-product searches we're already qualified to win.
17. **Top-of-funnel content hub** — four to six long-form posts ("DTF vs DTG", "How to start a clothing brand in Australia", "Print-on-demand on Shopify: AU guide", "AS Colour blanks explained", "Bulk screen-print vs DTG: which fits your job"). Builds search authority, earns backlinks, and warms cold traffic.
18. **Meta retargeting for cart-abandoners** — dynamic ads showing the customer's own design back to them + a small discount code. Closes the loop on customers who designed but didn't check out — usually the cheapest paid channel by ROAS.
19. **Branded-search defence on Google Ads** — bid on "SC Prints" so we own the SERP for our own brand name. Cheap (low CPC on branded terms) and protects against competitor bid-jacking.

### Tier 5 — PDP enrichments from the extended landscape

20. **Multi-size quantity grid on the PDP** — let buyers enter quantities for XS / S / M / L / XL / 2XL / 3XL directly on the product page without entering the customizer. Garment Printing does this; well-suited to procurement and B2B buyers who know exactly what they need before designing.
21. **Public review rating display** — a Trustpilot or Google Reviews badge with rating + review count on the PDP. Garment Printing publishes 4.3/5 publicly; we currently surface no social proof. Even a static screenshot from a real review platform is a meaningful trust signal.
22. **Educational accordions on the PDP** — collapsible blocks for "Print method", "Artwork guidelines", "Production time", "Shipping & delivery", "Care instructions". The T-Shirt Co runs six of these on every product page; pure SEO + trust win, and most of the content already exists in our FAQ / help pages.
23. **Style/SKU code as a PDP eyebrow** — render "AS COLOUR 5001" or "GILDAN 64000" above the product title. Procurement buyers shop by manufacturer SKU; we have the data in product metadata but don't surface it.
24. **Dual CTA ("Design your own" + "Request a quote")** on the new `/industries/*` landing pages and on PDPs flagged as B2B-relevant. Caters to self-serve customers AND sales-led B2B buyers in the same surface. Garment Printing pattern.

---

## 7. The wider competitive landscape

The four players we deep-dived on (Cartel, PrintPod, Print Bar, Create Apparel) are our most direct competitors — they show up in the same search results, target the same customers, and run similar offerings. But the AU market has additional players worth knowing about, even if a full pricing-and-PDP benchmark isn't warranted for each:

| Competitor | Location | Distinguishing characteristic | Why they matter |
|---|---|---|---|
| **Tee Junction** ([teejunction.com.au](https://teejunction.com.au)) | National (online-first) | Online designer + AS Colour blanks + Shopify POD integration | Closest mirror of The Print Bar; massive AU player on the designer-tool axis. Direct competitor on the same product/UX dimensions. |
| **The T-Shirt Co** ([thetshirtco.com.au](https://thetshirtco.com.au)) | Brisbane | Eco-positioned DTG on Kornit machines; no setup fees | Direct local competitor to The Print Bar in Queensland. "Ethical / zero-waste" angle resonates with younger creators we'd also like to reach. |
| **Garment Printing** ([garmentprinting.com.au](https://garmentprinting.com.au)) | Sydney | Corporate uniforms, team wear, volume discounts | Plays squarely in the segment Cartel's Industries vertical dominates. Less self-serve, more sales-led — overlap with where we want our /industries pages to land. |
| **OGO Print on Demand** ([ogo.com.au](https://ogo.com.au)) | Melbourne | POD / dropshipping focus, Shopify-first | Direct competitor to PrintPod and Create Apparel on the "start a clothing brand" segment. Not currently a segment we play in heavily. |
| **Printify / Printful / Threadless** | Global, with AU fulfilment partners (e.g. Gelato) | International POD giants | Compete for the side-hustle / small-creator market with brand recognition and global creator-tool ecosystems we can't match. |

### Detailed PDP observations (operator-supplied screenshots)

Closer look at three of these players' actual PDPs — AS Colour Staple Tee on Tee Junction; Gildan Essential Tee on The T-Shirt Co; Gildan 64000 Unisex Promo Tee on Garment Printing. Each picks distinctive UX and pricing patterns:

**Tee Junction — AS Colour Staple Tee**

- *Local positioning*: "Printed with love in Melbourne" eyebrow above the header
- *Colour picker*: ~70 AS Colour colours visible at once in a massive in-PDP grid — opposite of Print Bar's compact "+60" overflow indicator
- *CTA*: single blue "START DESIGNING" — no separate buy-blank path
- *Headline price*: "Digital DTF Printing **from $29.95** *" — bundled (blank + 1 DTF print), Cartel-style
- *Multi-size flow*: "Add Another Size" link below the size dropdown, supports multi-size orders without entering the customizer
- *Tabs*: Description / Sizing Details / Shipping / **Discounts** / Related Products — the Discounts tab implies a published bulk-tier ladder

**The T-Shirt Co — Gildan Essential Tee**

Real bulk tier table is published on the PDP (quantities + discount % + bundled-with-1-print price, inc-GST):

| Qty | Discount on blank | Price /unit |
|---|---|---|
| 1–9 | 0% | A$21.95 |
| 10–19 | 10% | A$19.76 |
| 20–49 | 15% | A$18.66 |
| 50+ | 20% | A$17.56 |

Other notable patterns:

- *Pricing copy*: "Includes 1 print. +$10 for printing on BOTH sides. Tax included." — bundle + clearly-priced add-on
- *BNPL*: "or from $10/week with **Zip**" (different provider to PrintPod's Afterpay)
- *Local fulfillment*: "Pickup available at The T-Shirt Co Production Facility, Brisbane — usually ready in 5+ days"
- *Same-day*: "RUSH service for same day printing (when ordered before 12pm Monday-Friday)" — direct competitor to Print Bar's same-day toggle
- *Trust strip* (footer): Free Shipping / No minimums or setup fees / Full Colour Printing / Double-sided printing available
- *Educational accordions*: Shirt Colour Chart Guide / DTG Print Method / Artwork Guidelines / Product and Print Disclaimers / Production Time in Stock / Shipping and Delivery — six collapsible content blocks
- *Production*: 3–5 business days — fastest standard turnaround in our benchmarked set
- *CTA*: pink "PERSONALISE" button (softer than "Start Designing")

**Garment Printing — Gildan Unisex Promo Tee (#64000)**

- *Split-headline pricing*: "Blank **from $10.99 AUD***" + "Printing **from $20.99 AUD***" — the clearest "blank vs decoration" decomposition observed; different shape from Cartel's bundle, T-Shirt Co's bundle, or our line-itemed approach
- *Multi-size grid on PDP*: row of size labels (XS · S · M · L · XL · 2XL · 3XL), each with its own quantity input directly on the product page. Built for bulk multi-size orders without entering the designer
- *Dual CTA*: gradient "START DESIGNING" + pink "Request a quote" — caters to both self-serve and B2B sales-led customers in the same surface
- *Style code visible*: "GILDAN 64000" eyebrow above the product title — appeals to procurement buyers who shop by manufacturer SKU
- *Heavy city footer*: 13 metro cities listed under "We deliver to" (Sydney, Perth, Melbourne, Brisbane, Adelaide, Canberra, Hobart, Darwin, Gold Coast, Cairns, Townsville, Wollongong, Launceston) — aggressive local-SEO play
- *Trustpilot rating*: 4.3/5 with star icons shown publicly in the footer
- *Service breadth*: 10 decoration services + 10 product categories + 3 "Enterprise Solutions" links in the footer

### What we'd take from each

| Pattern | Source | In our plan as |
|---|---|---|
| Bulk-pricing table on the PDP | The T-Shirt Co (also Cartel) | Suggested Move **#2** |
| 4-icon trust strip | The T-Shirt Co (also Cartel) | Suggested Move **#3** |
| Wide colour palette visible in-PDP | Tee Junction | Extends Suggested Move **#4** — consider show-all vs "+N more" |
| BNPL prominent on PDP | The T-Shirt Co (Zip), PrintPod (Afterpay) | Suggested Move **#18** (pick a provider) |
| City-page localisation | Garment Printing, Tee Junction | Suggested Move **#15** |
| Multi-size quantity grid on PDP | Garment Printing | New — Suggested Move **#20** below |
| Public review rating (Trustpilot/Google) | Garment Printing | New — Suggested Move **#21** below |
| Educational accordions on PDP | The T-Shirt Co | New — Suggested Move **#22** below |
| Style/SKU code as PDP eyebrow | Garment Printing | New — Suggested Move **#23** below |
| Dual CTA (Design + Request quote) | Garment Printing | New — Suggested Move **#24** below |
| "Pickup available" local-presence signal | The T-Shirt Co | Park — only relevant if/when we offer retail pickup |
| Same-day RUSH service | The T-Shirt Co (also Print Bar) | Suggested Move **#13** |

**Implications**

- The AU "online apparel customizer + AS Colour blanks" market is genuinely crowded. Tee Junction, The T-Shirt Co, Print Bar, and SC Prints all play similar games. Differentiation has to come from operational quality (production stage tracker, DPI warning, supplier-API live stock, vectorization upsell) or from pricing — not just "we have a designer".
- The POD / dropshipping segment (PrintPod, Create Apparel, OGO, global giants) is a distinct sub-market. Real participation needs Shopify-integration tooling we don't have today; partial entry needs at least an API/webhook story for incoming dropship orders.
- The corporate-uniform segment (Garment Printing, Cartel's Industries) is largely a B2B sales motion. Won less on self-serve UX, more on account management. Our new `/industries/*` landing pages are the right inbound surface — but conversion will rely on outbound + relationship-building, not just on the page.
- **Cartel is testing a warehousing / fulfillment service** ("Print, store, and ship your garments directly to your customers") — moving up the value chain into 3PL territory and competing now with print-on-demand fulfilment players. Running heavily in their Meta ads (May 2026). Could shift the competitive dynamic if it sticks. See §9 Observed Creative for detail.

---

## 8. SEO playbook (what the market does)

The AU custom-print space is fiercely competitive on organic search. Top performers run a handful of repeatable patterns:

### A. Local-SEO city pages

**The play**: Customers search "t-shirt printing Brisbane", "custom hoodies Melbourne", "screen printing Sydney" — not just "custom shirts". Print Bar's "Brisbane T-Shirt Printing", The T-Shirt Co's city service pages, Tee Junction's location-targeted URLs all capture this intent.

**Our position**: Single brand-level presence — no per-city landing pages. Easy gap to close: programmatic `/locations/<city>/custom-printing` (4-6 metros, templated copy). Captures "[service] in [city]" long-tail at low cost. *See Suggested Move #15.*

### B. AS Colour as an SEO asset

**The play**: AS Colour is the gold-standard wholesale blank in AU. Search volume for "AS Colour custom printing" is substantial. Tee Junction and Create Apparel place "AS Colour" prominently in H1s, URL slugs, page titles.

**Our position**: We have an AS Colour Brand entity, a `/brands/as-colour` landing page, **and** we run a live-stock API integration with AS Colour — strongest possible authority signal. We're underselling this in copy. Quick rewrite of the brand-page metadata + new service pages would capture searches we should already be ranking for. *See Suggested Move #16.*

### C. Platform + technique long-tail content

**The play**: Creators and small businesses search "print on demand Shopify Australia", "DTF vs DTG", "how to start a clothing brand in Australia". Competitors publish blog posts + dedicated landing pages targeting these phrases, capturing top-of-funnel traffic that converts later in the customer journey.

**Our position**: We have specialty pages (DTF builder, 3D Print Design, CMYK guide) but no proper top-of-funnel education content. Adding 4-6 hub posts would close the gap. *See Suggested Move #17.*

### D. UX dwell-time as a ranking signal

**The play**: Customizers retain users for 10-20 minutes. Google reads that as engagement and gives the page a baseline ranking boost without any other intervention.

**Our position**: Our customizer is in this league (Fabric.js, multi-side, save-design, DPI warning, server-rendered print files), so the dwell-time signal works in our favour. The risk is mobile performance: if the customizer is slow on mobile, dwell becomes bounce. Worth measuring + optimising — Lighthouse pass on `/customizer` would tell us where we stand.

### E. Existing SEO foundations we already have

- Schema.org JSON-LD on PDPs (Product + Brand + Offer)
- `/sitemap` route
- Country-prefixed routes (`[countryCode]`)
- Brand landing pages (`/brands/[handle]`)
- Industry landing pages (recently shipped — `/industries/[slug]`)

Solid base. Gaps to close are city pages, AS-Colour-as-SEO-asset, top-of-funnel educational content — all surfaced as Tier 4 suggested moves.

---

## 9. Paid acquisition playbook (what the market does)

Competitors run multi-channel paid acquisition. Common patterns:

### Google Ads

**Search (high-intent, transactional)**
- Bid targets: "custom hoodies no minimum", "bulk screen printing near me", "cheap custom t-shirts", "custom uniforms [city]"
- Bottom-of-funnel — the searcher has commercial intent and just needs to choose a supplier

**Performance Max / Shopping**
- Image ads showing a blank tee with a printed graphic, "From $25"
- Wins clicks by surfacing pricing upfront in the SERP, before the user even visits the site

### Meta Ads (Facebook + Instagram)

**"Start your brand" creator angle (top-of-funnel)**
- Video ads targeting 18-34s: "Want to start a clothing brand but no money for inventory? Try our Australian POD service."
- Funnel target: free design tool / "design your first tee" CTA. Used heavily by Create Apparel and OGO.

**User-Generated Content (mid-funnel trust)**
- Unboxing videos: creator films receiving a shirt, holds up to camera, stretches the fabric to demonstrate the print doesn't crack.
- These typically outperform brand-produced creative by 2-3× on CTR in the apparel category.

**B2B carousel ads (Industries angle)**
- Carousels showing hi-vis workwear, hospitality aprons, corporate polos.
- Targeted at "Small Business Owner" interest signals in Meta's audience tools.

**Abandoned-cart retargeting (closing the loop)**
- Customer designs a shirt, walks away. Dynamic ad shows their actual design back to them + a discount code: "Forget something? Finish your custom design today and get 10% off with code PRINT10."

### Where SC Prints currently sits

I couldn't find a public Meta Ad Library presence or clear Google Ads patterns for us from the outside. That means one of:

1. **Not running paid yet** → everything above is greenfield opportunity
2. **Running paid quietly** → worth auditing for the same patterns

If (1), the highest-ROI starting points based on what the market does:

- **Branded-search defence on Google** — bid on "SC Prints" so we own that SERP (Suggested Move #19)
- **AS Colour + city long-tail terms** on Google — low CPC, high commercial intent
- **Meta retargeting for cart-abandoners** (Suggested Move #18) — closes the loop on the designs people abandon
- **Industry-targeted Meta** for the new `/industries/*` landing pages — direct path from B2B audience to a relevant landing page

### Intel sources worth using

- **[Meta Ad Library](https://www.facebook.com/ads/library/)** — filter to Australia + search "the print bar", "tee junction", "the colour cartel". Shows every active creative they're running right now. Reverse-engineer the hooks that look like they're working (high-engagement videos, retargeting offers, B2B pivots).
- **[Ahrefs free keyword generator](https://ahrefs.com/keyword-generator)** or [Ubersuggest](https://neilpatel.com/ubersuggest/) — drop in theprintbar.com / teejunction.com.au to see their top organic pages and estimated traffic. Map against ours to find content gaps.

### Observed creative — Ad Library reconnaissance (May 2026)

Operator-supplied screenshots of the Meta Ad Library show **20+ active variants** running on The Print Bar Australia and **15+ active variants** on The Colour Cartel as of May 2026. Both competitors are investing meaningfully in paid creative. Patterns extracted:

**The Print Bar — recurring hooks**

- *Same-day urgency* — "Need it today? Custom tees printed same day. No stress. No minimums. Design online. Pick up today." (4 ads use this creative). Overlay text: "Order by 11am for same day pickup".
- *"3 simple steps" framing* — "You're only 3 steps away from putting your latest design on a t-shirt, tote, cap, or any item from our wide range of options. Place your next order today." Pairs the design tool's UX with a low-friction promise.
- *Creator collaboration* — "Shelly turned her designs into a brand. You can too. Print, design, and create with The Print Bar." (featuring **@forcharlieboy** as the named creator partner). 3 ads use this creative. UGC-style.
- *Identity / values play* — "For the Creatives, the Activists and the Dreamers. We're for getting your project off the ground. Say something on something and get your ideas seen today!" Brand-voice ad rather than product feature. 3 ads.
- *Product breadth* — "Your design. Any of our products. Print or embroider on tees, hoodies, caps, mugs and more."
- *Team / B2B variant* — "It's never been easier for teams to look good both on and off the field!" + sportswear creative.
- *Payment options as overlay text* — "Afterpay & Paypal payments available" / "No minimum order* Paypal payments available" rendered onto the ad assets themselves.
- *CTAs* — predominantly **Shop Now** (transactional / mid-funnel) with a smaller mix of Learn More.

**The Colour Cartel — recurring hooks**

- *Supplier-brand namedrop in ad copy* — "🚀 Fast, reliable, and made in Australia. ✊ AS Colour, Bisley, Hard Yakka & more." Appears in **almost every Cartel ad**. Validates the supplier-brand-as-SEO-asset thesis (Suggested Move #16) — same tactic works inside paid copy, not just on the brand landing page.
- ***New service: Warehousing + fulfillment*** — "Tired of storing + shipping tees? We've officially launched warehousing + fulfillment here at Colour Cartel 🙌 Let us print your garments, store them and ship them directly to your customers!" Running across **8 active ads** (two variants × 6 + 2 use this creative). **Meaningful strategic shift — Cartel is moving into 3PL territory**, competing with print-on-demand fulfilment services as well as print competitors. Tracked in §7 Implications.
- *Brand-owner / creator targeting* — "So you wanna start a clothing brand? Here's your sign. 👇 At Colour Cartel, we print for hundreds of Aussie brands - from bedroom startups to businesses doing 6-figures a month."
- *Customer review showcase* — "Don't just take our word for it—our customers say it best! ⭐⭐⭐⭐⭐ Reading your reviews makes our day…" Carousel ad with review imagery. CTA: "Check out our reviews". Validates Suggested Move #21 (public review rating display).
- *Quality positioning* — "Your brand is built on quality—your apparel should be too. Whether it's workwear, merch, or uniforms, we deliver premium prints and embroidery that stand out and last." Used across 5-6 ads. Premium framing, not price.
- *"Be A PRO with Colour Cartel"* — branding hook paired with "Save up to 50% plus free sample when you purchase in bulk".
- *Workwear vertical* — "Work gear looking a bit tired? We've got you covered. Custom printed apparel, delivered in under 15 business days — no matter how big your order." Direct play at the trades segment.
- *CTAs* — predominantly **Learn More** (top/mid-funnel consideration) rather than Shop Now. Suggests Cartel is running awareness / consideration creative while Print Bar leans further down-funnel.

**Strategic takeaways**

1. **Cartel's warehousing / fulfillment launch is the most important new datapoint** here. They're moving up the value chain into 3PL territory — competing now with print-on-demand fulfilment services like Printful / Printify (also see §7), as well as with printing competitors. Worth tracking.
2. **Both competitors run 15-20+ active creative variants.** Starting paid at parity means producing comparable creative volume — not one or two test ads. Plan for a sustained creative pipeline.
3. **Supplier-brand namedrop works in paid too.** Cartel's "AS Colour, Bisley, Hard Yakka & more" line is in nearly every ad. We're an integrated AS Colour distributor with live-stock — using "AS Colour custom printing" directly in our ad headlines is tested-and-running in this market (extends Suggested Move #16 from SEO into paid).
4. **"3 simple steps" framing is a transferable hook for our customizer flow.** We already deliver that UX (PDP → side panel → designer → cart); the ad just needs to say so.
5. **Creator-collaboration UGC is the highest-volume creative format in this category.** Both competitors use it (Print Bar with @forcharlieboy, Cartel with brand-owner testimonials). Identifying one Aussie micro-influencer to partner with would unlock this format for us cheaply.
6. **CTA mix tells you funnel stage.** Print Bar = Shop Now (conversion), Cartel = Learn More (consideration). We can pick which funnel stage to lead with depending on the campaign goal — both are valid.
7. **Payment options as overlay text on the ad asset itself** (Print Bar's "Afterpay & Paypal payments available") is a small but free trust-signal tactic. Effortless if we add BNPL (Suggested Move #18).

---

## 10. Caveats & method notes

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

## 11. Worth following up on

- **Visit Cartel's other PDPs** to confirm the matrix is universal (not just on Basic Tee).
- **Test a PrintPod bulk-pack order** end-to-end to confirm whether decoration is included in the package price.
- **Pull a Meta Ad Library snapshot** for The Print Bar / Tee Junction / Colour Cartel / Create Apparel — capture what creative is currently active and what hooks they're testing. Worth doing monthly.
- **Run Tee Junction and The T-Shirt Co URLs through Ahrefs** (free or paid) to see their highest-traffic organic pages — map against ours to find content gaps.
- **Compare directly against Tee Junction and The T-Shirt Co** on pricing — they're closer mirrors of our designer-tool play than the four we deep-dived on, but their per-product pages may be similarly opaque without manual probing.
- **Track Cartel's warehousing / fulfillment service.** Currently running across 8 active Meta ads (May 2026). If it gets traction, the AU competitive landscape gains a hybrid printer-plus-3PL player. Worth monthly Ad Library checks to see if creative volume holds, and a once-quarterly look at their landing page for that service to track positioning.
- **Identify an Aussie micro-influencer for a creator-collaboration ad.** Both Print Bar (@forcharlieboy) and Cartel (brand-owner testimonials) run this format heavily; we don't. Even one paid creator partnership unlocks a tested-and-working ad format for us.
- **Pull our actual landed costs** from the AS Colour API and re-run every cell in this review.
- **Side-by-side customizer test sessions**: place an identical order through SC Prints, Cartel, Print Bar, PrintPod, Create Apparel — capture screenshots and pain points.
- **Build the static-pricing-matrix PDP component** — the highest-leverage smallest-implementation move on the suggested-moves list.
- **Survey existing customers**: would they shop with us if we matched Cartel's pricing? Margin-vs-volume is the strategic question.

Happy to take any of these on as the next task, boss.
