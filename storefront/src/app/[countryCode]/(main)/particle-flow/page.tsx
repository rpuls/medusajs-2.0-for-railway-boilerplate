import { Metadata } from "next"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ParticleFlowTuner from "./particle-flow-tuner"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/particle-flow`
  const description =
    "Particle flow lab: cursor-as-obstacle carry-along streamlines on the SC Prints wordmark."

  return {
    title: "Particle flow",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Particle flow | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default function ParticleFlowPage() {
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
        <ParticleFlowTuner />
      </div>
    </div>
  )
}
