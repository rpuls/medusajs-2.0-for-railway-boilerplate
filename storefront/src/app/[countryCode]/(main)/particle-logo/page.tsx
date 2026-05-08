import { Metadata } from "next"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NewmixTunerExperience from "@modules/common/components/newmix-tuner-experience"
import { NEWMIX_PRESET } from "./newmix-preset"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/particle-logo`
  const description =
    "Newmix-style particle logo: cursor pushes a velocity field with pressure projection, particles ride the field bilinearly."

  return {
    title: "Interactive particle logo",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Interactive particle logo | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default function ParticleLogoPage() {
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
        <NewmixTunerExperience
          lsKeyPrefix="particle-logo"
          initialTuning={NEWMIX_PRESET}
          sectionAriaLabel="SC Prints — interactive particle logo"
          bodyClassWhileMounted="particle-logo-page"
        />
      </div>
    </div>
  )
}
