import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BrandImageLink = {
  name: string
  href: string
  imageSrc: string
  imageAlt: string
}

const brandImageLinks: BrandImageLink[] = [
  {
    name: "AS Colour",
    href: "/store?brand=AS%20Colour",
    imageSrc: "/images/brands/as-colour-banner.png",
    imageAlt: "AS Colour apparel range",
  },
  {
    name: "Syzmik",
    href: "/store?brand=Syzmik",
    imageSrc: "/images/brands/syzmik-banner.png",
    imageAlt: "Syzmik workwear collection",
  },
  {
    name: "Biz Collection",
    href: "/store?brand=Biz%20Collection",
    imageSrc: "/images/brands/biz-collection-banner.png",
    imageAlt: "Biz Collection uniforms and apparel",
  },
  {
    name: "Aussie Pacific",
    href: "/store?brand=Aussie%20Pacific",
    imageSrc: "/images/brands/aussie-pacific-banner.png",
    imageAlt: "Aussie Pacific workwear and casualwear",
  },
  {
    name: "DNC Workwear",
    href: "/dnc",
    imageSrc: "/images/brands/dnc-banner.png",
    imageAlt: "DNC Workwear segmented hi-vis and workwear range",
  },
]

const ScrollingPictureBar = () => {
  const scrollingImages = [...brandImageLinks, ...brandImageLinks]

  return (
    <section className="w-full bg-ui-bg-base py-8 small:py-10">
      <div className="content-container mb-4 small:mb-6">
        <div className="border-l-4 border-[var(--brand-secondary)] pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
            Shop by brand
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-ui-fg-base">
            Pick a brand to view matching products
          </h2>
        </div>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="scrolling-picture-track flex w-max gap-8 py-1 motion-reduce:!animate-none">
          {scrollingImages.map((brandImage, index) => (
            <LocalizedClientLink
              key={`${brandImage.name}-${index}`}
              href={brandImage.href}
              className="group relative h-[38vh] w-[84vw] shrink-0 overflow-hidden rounded-2xl border border-ui-border-base shadow-elevation-card-rest transition-all hover:border-[var(--brand-secondary)]/60 small:h-[48vh] small:w-[72vw]"
            >
              <Image
                src={brandImage.imageSrc}
                alt={brandImage.imageAlt}
                fill
                sizes="(max-width: 1024px) 84vw, 72vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-white/25 bg-black/45 px-3 py-2 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-white small:text-base">
                  {brandImage.name}
                </p>
                <p className="text-xs text-white/80">View products</p>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ScrollingPictureBar
