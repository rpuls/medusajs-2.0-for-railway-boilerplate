import { Metadata } from "next"
import JungleScene from "@modules/home/components/jungle-scene"

// Pixel-art asset attribution (CC-BY 4.0 / free-commercial licenses). Surfaced via
// page metadata as the user requested; if the lab page ever ships to the public
// catalog these credits should be moved to a visible footer line.
const ASSET_CREDITS =
  "Dinosaur sprites by Arks (@ArksDigital, CC-BY 4.0). Forest environment by " +
  "Anokolisa (Legacy Fantasy: High Forest). Plant accents by ToffeeCraft (Forest Nature Pack)."

export const metadata: Metadata = {
  title: "Jungle Scene — Lab",
  description: ASSET_CREDITS,
  robots: { index: false, follow: false },
  other: {
    "asset-credits": ASSET_CREDITS,
    "asset-credit-dinos": "Arks / @ArksDigital — https://arks.itch.io/dino-characters (CC-BY 4.0)",
    "asset-credit-forest": "Anokolisa — Legacy Fantasy: High Forest (free for commercial use)",
    "asset-credit-plants": "ToffeeCraft — Forest Nature Pack (free for commercial use)",
  },
}

export default function JungleScenePage() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <JungleScene style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
