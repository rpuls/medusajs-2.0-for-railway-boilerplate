"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const Hero = () => {
  const pathname = usePathname()
  const countryCode = pathname.split("/")[1] || "de"

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/flower_power_AI.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start text-left bg-black/40 p-8 sm:p-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl text-white font-semibold tracking-wide uppercase">
          GMORKL SPRING COLLECTION
        </h1>

        <Link
          href={`/${countryCode}/store`}
          className="mt-3 px-5 py-2 bg-white/10 text-white text-sm sm:text-base tracking-wider uppercase transition hover:bg-white/20"
        >
          DISCOVER WEARABLE ART FROM COLOGNE
        </Link>
      </div>
    </div>
  )
}

export default Hero
