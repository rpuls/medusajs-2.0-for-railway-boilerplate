export type ServiceItem = {
  slug: string
  title: string
  shortDescription: string
  heroDescription: string
  bulletPoints: string[]
  bestFor: string
  notIdealFor: string
  typicalTurnaround: string
}

export const services: ServiceItem[] = [
  {
    slug: "screen-printing",
    title: "Screen Printing",
    shortDescription:
      "Best-value print method for larger runs, delivering bold colour, strong wash durability, and consistent repeat results.",
    heroDescription:
      "Screen printing is ideal when you need reliable, high-impact branding across medium and large quantities. We separate and burn artwork with production-ready setups, match colours accurately, and run quality checks through every print stage for a clean, durable finish.",
    bulletPoints: [
      "Most cost-effective method as order quantities increase",
      "Strong colour opacity and long-term wash performance",
      "Suitable for uniforms, promo campaigns, events, and merch drops",
      "Pantone colour matching available for brand consistency",
    ],
    bestFor:
      "Medium-to-large quantity orders that need strong colour, durability, and repeat consistency across all pieces.",
    notIdealFor:
      "Very small runs with many design variations where setup-heavy methods can be less efficient.",
    typicalTurnaround:
      "Typically around 7-10 business days after artwork approval, depending on run size and garment availability.",
  },
  {
    slug: "embroidery",
    title: "Embroidery",
    shortDescription:
      "Premium stitched branding for uniforms and retail garments where a structured, high-end finish is required.",
    heroDescription:
      "Embroidery is perfect for businesses and teams that want a polished, premium look. We digitise your artwork to stitch cleanly, recommend sizing and placement for readability, and run test-outs where needed before full production.",
    bulletPoints: [
      "Premium textured finish that elevates uniforms and branded apparel",
      "Excellent for polos, caps, jackets, workwear, and hospitality garments",
      "Built to hold shape and detail across repeated wear and laundering",
      "In-house digitising support for clean, production-ready stitch files",
    ],
    bestFor:
      "Corporate uniforms, hospitality teams, and retail branding that benefit from a premium stitched finish.",
    notIdealFor:
      "Very fine detail or tiny text that cannot hold clarity in thread at small sizes.",
    typicalTurnaround:
      "Usually 7-10 business days once digitising and sample approval are complete.",
  },
  {
    slug: "digital-transfers",
    title: "Digital Transfers",
    shortDescription:
      "Flexible full-colour decoration for short runs, variable data jobs, and fast-turnaround orders.",
    heroDescription:
      "Digital transfers are ideal when flexibility and speed are priorities. They handle gradients, fine detail, and variable names or numbers without large setup overheads, making them a strong option for short runs and mixed design sets.",
    bulletPoints: [
      "Great for full-colour logos, gradients, and detailed artwork",
      "Fast setup and efficient for urgent or deadline-driven jobs",
      "Ideal for variable runs like names, numbers, and team kits",
      "Works across a wide range of fabric types and garment styles",
    ],
    bestFor:
      "Short-to-mid runs, variable data jobs, and fast-turnaround projects with detailed full-colour artwork.",
    notIdealFor:
      "Very large repeat runs where traditional screen printing is usually more cost-effective per unit.",
    typicalTurnaround:
      "Often 5-8 business days after artwork sign-off, depending on garment supply and print complexity.",
  },
  {
    slug: "uv-printing",
    title: "UV Printing",
    shortDescription:
      "Direct-to-surface branding for hard goods and promo products requiring crisp detail and fast turnaround.",
    heroDescription:
      "UV printing allows us to decorate rigid and non-textile items with sharp, high-definition results. It is a strong fit for promotional products, event assets, and branded accessories where clean detail and quick production are important.",
    bulletPoints: [
      "Designed for hard surfaces and specialty promotional items",
      "High-resolution output for logos, text, and fine line detail",
      "Fast-curing process with durable, production-ready finish",
      "Great for branded collateral, accessories, and custom campaigns",
    ],
    bestFor:
      "Promotional products and rigid materials where sharp detail and clean logo placement are critical.",
    notIdealFor:
      "Soft textile garments that are better suited to screen printing, embroidery, or transfer methods.",
    typicalTurnaround:
      "Generally 5-10 business days, based on substrate type, quantity, and finishing requirements.",
  },
  {
    slug: "uv-dtf",
    title: "UV DTF",
    shortDescription:
      "Full-colour UV transfers for hard goods and curved surfaces — bottles, tumblers, helmets, signage, and more.",
    heroDescription:
      "UV DTF pairs the colour fidelity of UV printing with the flexibility of a transfer. We print your artwork onto a clear UV-cured film that's then applied to almost any hard surface — including the curves direct UV printing struggles with. Perfect for branded drinkware, signage accents, and promo runs where shape gets in the way.",
    bulletPoints: [
      "Wraps around curved surfaces — bottles, tumblers, helmets, mugs",
      "High-resolution full-colour artwork including gradients and white",
      "Durable, scratch- and water-resistant finish",
      "Low minimums — great for short runs and prototypes",
    ],
    bestFor:
      "Branded drinkware, promo accessories, and any hard goods with curves or odd shapes where direct UV printing isn't practical.",
    notIdealFor:
      "Soft textile garments — DTF transfers, screen print, or embroidery are better matched to fabric.",
    typicalTurnaround:
      "Typically 3-7 business days after artwork sign-off, depending on quantity and finish requirements.",
  },
]

export const getServiceBySlug = (slug: string) =>
  services.find((service) => service.slug === slug)
