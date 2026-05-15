import { Metadata } from "next"
import JungleScene from "@modules/home/components/jungle-scene"

export const metadata: Metadata = {
  title: "Jungle Scene — Lab",
  robots: { index: false, follow: false },
}

export default function JungleScenePage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <JungleScene style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
