"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

const Hero = () => {
  const { countryCode } = useParams()

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
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start text-left bg-black/40 px-6 sm:px-20">
        <h1 className="text-4xl sm:text-5xl text-white font-light uppercase tracking-wide drop-shadow-lg">
          Gmorkl Spring Collection
        </h1>
        <Link
          href={`/${countryCode}/store`}
          className="mt-2 inline-block px-5 py-2 text-white text-sm uppercase tracking-wide bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 transition"
        >
          Discover Wearable Art from Cologne
        </Link>
      </div>
    </div>
  )
}

export default Hero
