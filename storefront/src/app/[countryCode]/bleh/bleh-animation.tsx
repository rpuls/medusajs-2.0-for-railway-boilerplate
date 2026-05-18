"use client"

import NewmixTunerExperience from "@modules/common/components/newmix-tuner-experience"
import { NEWMIX_PRESET } from "../(main)/particle-logo/newmix-preset"

export default function BlehAnimation() {
  return (
    <NewmixTunerExperience
      lsKeyPrefix="bleh"
      initialTuning={NEWMIX_PRESET}
      sectionAriaLabel="Bleh — particle animation"
      bodyClassWhileMounted="bleh-page"
      logoSrc="/branding/bleh-image.png"
      wordmarkImageSrc="/branding/bleh-image.png"
      inkPolarity="alpha"
      presentation="fullscreen"
    />
  )
}
