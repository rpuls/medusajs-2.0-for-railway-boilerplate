"use client"

import { useEffect } from "react"

import HomeParticleLogoHero from "@modules/home/components/home-particle-logo-hero"
import { NEWMIX_PRESET } from "../(main)/particle-logo/newmix-preset"

export default function BlehAnimation() {
  useEffect(() => {
    document.body.classList.add("bleh-page")
    return () => {
      document.body.classList.remove("bleh-page")
    }
  }, [])

  return (
    <>
      <style>{`
        body.bleh-page button[aria-label="Open chat"],
        body.bleh-page button[aria-label="Close chat"],
        body.bleh-page footer {
          display: none !important;
        }
      `}</style>
      <HomeParticleLogoHero
        presentation="fullscreen"
        interactionMode="newmix"
        logoSrc="/branding/bleh-image.png"
        wordmarkImageSrc="/branding/bleh-image.png"
        newmixLiveTuning={NEWMIX_PRESET}
      />
    </>
  )
}
