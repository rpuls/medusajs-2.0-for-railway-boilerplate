/**
 * Industries surfaced in the main menu and at `/industries/[industry]`.
 *
 * Lightweight, hardcoded config — each industry resolves to a landing page that
 * frames our offering for that vertical (B2B SEO + entry point). When richer
 * content is needed (custom hero imagery, per-industry product filtering),
 * fold those props in here so the rendering page stays a single template.
 */

export type Industry = {
  slug: string
  name: string
  title: string
  description: string
  bullets: string[]
}

export const industries: Industry[] = [
  {
    slug: "trades",
    name: "Trades & Workwear",
    title: "Custom workwear & uniforms for trades",
    description:
      "Hi-vis polos, embroidered jackets, branded tees and workwear for sparkies, plumbers, builders and trades teams across Australia.",
    bullets: [
      "Hi-vis options to AS/NZS 4602 standards",
      "Embroidered logos that survive the wash",
      "Bulk pricing from 10 units",
      "Australian-stocked AS Colour, Syzmik, Biz Workwear",
    ],
  },
  {
    slug: "events",
    name: "Events & Festivals",
    title: "Event merchandise & festival apparel",
    description:
      "Crew tees, staff uniforms, attendee merch — printed, packed and shipped to your event timeline.",
    bullets: [
      "Same-week production for tight event timelines",
      "Bulk pricing from 25 units",
      "Multi-design and multi-name printing for staff teams",
      "Direct delivery to venue or warehouse",
    ],
  },
  {
    slug: "hospitality",
    name: "Hospitality",
    title: "Uniforms for cafes, restaurants & venues",
    description:
      "Branded tees, aprons, polos and headwear for hospitality teams. Designed to look sharp and survive a busy shift.",
    bullets: [
      "Aprons, tees, polos and caps",
      "Embroidered or screen-printed logos",
      "Re-label & swing-tag ready for premium venues",
      "Repeat orders from your saved design library",
    ],
  },
  {
    slug: "corporate",
    name: "Corporate & Uniforms",
    title: "Corporate uniforms & branded merch",
    description:
      "Polo shirts, business shirts, branded jackets and corporate merch for teams of ten to a thousand-plus.",
    bullets: [
      "Embroidered logos in your brand colours",
      "Volume pricing past 100 units",
      "Saved design library for repeat ordering",
      "Optional drop-shipping to individual employees",
    ],
  },
  {
    slug: "sports",
    name: "Sports & Clubs",
    title: "Custom sportswear & team apparel",
    description:
      "Jerseys, hoodies, tees, hats and supporter merch for sporting clubs and fan bases.",
    bullets: [
      "Multi-name and multi-number printing",
      "Sublimation, screen print, or embroidery — your choice",
      "Bulk pricing from 25 units",
      "Group ordering with deposit and balance payment links",
    ],
  },
  {
    slug: "schools",
    name: "Schools & Education",
    title: "School merch & teacher apparel",
    description:
      "School-branded apparel, teacher polos, year-12 leavers' merch, fundraising tees.",
    bullets: [
      "Multi-design and multi-name printing for year levels",
      "Bulk pricing from 25 units",
      "Quote-anchored ordering — pay a deposit then the balance",
      "Re-orderable saved designs for annual restocks",
    ],
  },
]

export function getIndustry(slug: string): Industry | null {
  return industries.find((i) => i.slug === slug) ?? null
}
