import { Metadata } from "next"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ParticleThreeClient from "./particle-three-client"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/particle-threejs`
  const description =
    "Three.js Points-mesh prototype of the SC Prints particle hero — same wordmark, GPU-accelerated rendering for 100k+ particles."

  return {
    title: "Particle three.js",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Particle three.js | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default function ParticleThreePage() {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed left-0 top-0 z-[40] w-full px-4 py-4 sm:px-6">
        <div className="pointer-events-auto inline-flex">
          <LocalizedClientLink
            href="/"
            className="txt-small text-white/80 transition-colors hover:text-white"
          >
            ← Back to home
          </LocalizedClientLink>
        </div>
      </div>
      <div className="pt-14">
        <ParticleThreeClient particleCount={140000} />
      </div>
    </div>
  )
}
