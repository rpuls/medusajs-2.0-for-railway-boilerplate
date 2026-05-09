"use client"

import dynamic from "next/dynamic"

/** Three.js scene must run on the client only — the WebGL Canvas + the
 * `three` library both touch DOM/window APIs that don't exist during SSR.
 * Next.js 15+ requires `ssr: false` to live inside a Client Component;
 * placing it in the server `page.tsx` triggers a Turbopack build error. */
const HomeParticleThree = dynamic(
  () => import("@modules/home/components/home-particle-three"),
  { ssr: false }
)

type Props = {
  particleCount?: number
}

export default function ParticleThreeClient({ particleCount }: Props) {
  return <HomeParticleThree particleCount={particleCount} />
}
