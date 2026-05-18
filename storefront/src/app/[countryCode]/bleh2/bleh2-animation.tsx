"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"

const HomeParticleThree = dynamic(
  () => import("@modules/home/components/home-particle-three"),
  { ssr: false }
)

export default function Bleh2Animation() {
  useEffect(() => {
    document.body.classList.add("bleh2-page")
    return () => {
      document.body.classList.remove("bleh2-page")
    }
  }, [])

  return (
    <>
      <style>{`
        body.bleh2-page button[aria-label="Open chat"],
        body.bleh2-page button[aria-label="Close chat"],
        body.bleh2-page footer {
          display: none !important;
        }
      `}</style>
      <HomeParticleThree
        logoSrc="/branding/bleh-image.png"
        particleCount={140000}
        logoFit="cover"
      />
    </>
  )
}
