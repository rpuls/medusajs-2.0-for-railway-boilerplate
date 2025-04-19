"use client"

import Link from "next/link"

const Hero = () => {
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

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center bg-black/40 px-6">
        <h1 className="text-4xl md:text-6xl text-white font-extralight tracking-wide drop-shadow-lg uppercase mb-6">
          gmorkl spring collection
        </h1>

        <Link href="/store" passHref>
          <a className="text-white text-sm md:text-base font-light uppercase tracking-wider px-6 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/20 transition-all duration-300">
            discover wearable art from cologne
          </a>
        </Link>
      </div>
    </div>
  )
}

export default Hero
