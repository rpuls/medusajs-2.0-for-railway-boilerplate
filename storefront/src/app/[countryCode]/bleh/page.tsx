import { Metadata } from "next"

import NewmixTunerExperience from "@modules/common/components/newmix-tuner-experience"
import { NEWMIX_PRESET } from "../(main)/particle-logo/newmix-preset"

export const metadata: Metadata = { title: "Bleh" }

export default function BlehPage() {
  return (
    <NewmixTunerExperience
      lsKeyPrefix="bleh"
      initialTuning={NEWMIX_PRESET}
      sectionAriaLabel="Bleh — particle animation"
      logoSrc="/branding/bleh-image.png"
    />
  )
}
