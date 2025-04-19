"use client"

import Link from "next/link"

const Hero = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-white text-center">
        <h1 className="mt-20 mb-6 text-white text-4xl tracking-wider font-medium uppercase text-center">
          GMORKL SPRING COLLECTION
        </h1>
        <Link href="/de/store">
          <span className="mb-12 text-white text-sm tracking-widest uppercase border border-white px-6 py-3 hover:bg-white/10 transition-colors duration-300">
            DISCOVER WEARABLE ART FROM COLOGNE
          </span>
        </Link>
      </div>
    </section>
  )
}

export default Hero
