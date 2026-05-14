import { Metadata } from "next"
import SpaceHero from "@modules/home/components/space-hero"

export const metadata: Metadata = {
  title: "Space Hero — Lab",
  robots: { index: false, follow: false },
}

export default function SpaceHeroPage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <SpaceHero style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
