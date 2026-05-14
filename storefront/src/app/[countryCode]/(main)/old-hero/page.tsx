import { Metadata } from "next"

import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import type { NewmixLiveTuning } from "@modules/home/components/home-particle-logo-hero/newmix-live-tuning"
import { WORDMARK_GRADIENT } from "@modules/common/lib/wordmark-gradient"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/old-hero`
  const description =
    "The original SC Prints home page hero — an interactive particle physics wordmark that reacts to cursor movement."

  return {
    title: "Old home page animation",
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: canonicalPath },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Old home page animation | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

const V3_TUNING: Partial<NewmixLiveTuning> = {
  radius: 45,
  velSmoothing: 0.45,
  sideSwirlForce: 12,
  frontPush: 5.0,
  backInward: 12,
  falloffPower: 2.4,
  trailFollowMs: 4000,
  wakePace: 0.75,
  wakePaceJitter: 0.18,
  wakeLateralSpreadBmp: 3,
  wakeReleaseStaggerMs: 200,
  wakeBandSpreadBmp: 4,
  wakeAlongStretchBmp: 20,
  wakeDiffusionBmp: 0,
  wakeDiffusionHz: 0.6,
  wakeTimeOffsetMs: 0,
  releaseVelocityKeep: 0.0,
  exitVelocityBoostBmp: 0,
  leadingEdgePullForce: 7,
  friction: 0.95,
  springStiffnessMult: 0.55,
  homeSpringSuppress: 0.85,
  homeReturnMs: 1500,
  homeReturnCurveBmp: 90,
  homeReturnDurationJitter: 0.7,
  homeReturnDiffusionBmp: 0,
  idleThresholdMs: 1200,
  trailingProbability: 1.0,
  inDiskCarryFactor: 0.9,
  motionGateSpeed: 2.5,
  wakeBandTaperPower: 0.6,
  coreEjectionForce: 5,
  coreEjectionRadiusFrac: 0.50,
  wakeAlphaMult: 1.0,
  homeReturnSpring: 0.008,
  homeReturnFriction: 0.93,
  homeReturnGravity: 0.05,
  vortexStrength: 6.0,
  vortexOffsetBmp: 28,
  vortexLagBmp: -6,
  vortexRadiusBmp: 38,
  vortexFalloffPower: 1.6,
}

export default function OldHeroPage() {
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
      <HomeParticleLogoHero
        interactionMode="newmix"
        animatedParticleCap={55000}
        newmixLiveTuning={V3_TUNING}
        bgClassName="bg-ui-fg-base"
        wordmarkGradient={WORDMARK_GRADIENT}
      />
    </div>
  )
}
