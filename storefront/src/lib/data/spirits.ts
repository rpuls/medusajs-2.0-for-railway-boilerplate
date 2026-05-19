/**
 * Storefront-side taxonomy of spirit types we sell custom-printed bottles for.
 * Mirrors `SPIRIT_SUBS` in [backend/src/lib/shop-categories.ts](../../../backend/src/lib/shop-categories.ts)
 * — keep the slugs in sync. Each slug maps to a Medusa category handle
 * `spirits-<slug>` that the importer/admin creates on first save.
 */

export type SpiritSlug =
  | "vodka"
  | "gin"
  | "whisky"
  | "rum"
  | "tequila"
  | "cognac"
  | "champagne"
  | "liqueur"
  | "mezcal"

export type SpiritType = {
  slug: SpiritSlug
  /** Display name on cards and breadcrumbs. */
  name: string
  /** Short SEO-friendly tagline shown on hub cards + landing heroes. */
  tagline: string
  /** Long description for SEO copy and the per-spirit landing page intro. */
  description: string
  /** Emoji icon used on the hub pills (cheap visual cue — replace with SVG later). */
  emoji: string
  /** Plural noun used inline ("vodka bottles", "champagne bottles"). */
  noun: string
}

export const SPIRIT_TYPES: SpiritType[] = [
  {
    slug: "vodka",
    name: "Vodka",
    tagline: "Crystal-clear bottles, your design",
    description:
      "Print your custom label on premium vodka bottles. Perfect for events, gifts, and brand activations.",
    emoji: "🍸",
    noun: "vodka",
  },
  {
    slug: "gin",
    name: "Gin",
    tagline: "Botanical bottles, your story",
    description:
      "Custom-printed gin bottles for weddings, milestone birthdays, and bespoke gifting.",
    emoji: "🌿",
    noun: "gin",
  },
  {
    slug: "whisky",
    name: "Whisky",
    tagline: "Aged spirit, personal touch",
    description:
      "UV-printed labels on whisky bottles — corporate gifts, anniversaries, and limited runs.",
    emoji: "🥃",
    noun: "whisky",
  },
  {
    slug: "rum",
    name: "Rum",
    tagline: "Caribbean classics, custom finish",
    description:
      "Custom-printed rum bottles for parties, brand launches, and bespoke gifts.",
    emoji: "🏝️",
    noun: "rum",
  },
  {
    slug: "tequila",
    name: "Tequila",
    tagline: "Agave bottles, your mark",
    description:
      "Personalised tequila bottles — celebrations, corporate gifts, and event swag.",
    emoji: "🌵",
    noun: "tequila",
  },
  {
    slug: "cognac",
    name: "Cognac",
    tagline: "Premium spirits, premium print",
    description:
      "Custom-printed cognac bottles for high-end gifting and brand events.",
    emoji: "🥂",
    noun: "cognac",
  },
  {
    slug: "champagne",
    name: "Champagne",
    tagline: "Toast it your way",
    description:
      "Custom-printed champagne bottles for weddings, launches, and milestone moments.",
    emoji: "🍾",
    noun: "champagne",
  },
  {
    slug: "liqueur",
    name: "Liqueur",
    tagline: "Flavoured bottles, custom labels",
    description:
      "Personalised liqueur bottles — gifts, parties, and brand collaborations.",
    emoji: "🍹",
    noun: "liqueur",
  },
  {
    slug: "mezcal",
    name: "Mezcal",
    tagline: "Smoky agave, signature label",
    description:
      "Custom mezcal bottles for collectors, gifts, and brand activations.",
    emoji: "🌶️",
    noun: "mezcal",
  },
]

export const SPIRIT_BY_SLUG: Record<string, SpiritType> = Object.fromEntries(
  SPIRIT_TYPES.map((s) => [s.slug, s])
)

export const SPIRIT_CATEGORY_HANDLE = (slug: SpiritSlug) => `spirits-${slug}`
