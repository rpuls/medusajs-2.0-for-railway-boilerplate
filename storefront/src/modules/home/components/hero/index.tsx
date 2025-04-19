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
        <div className="flex flex-col items-center gap-y-2 mt-10 mb-10">
          <h1 className="text-white text-4xl tracking-wider font-medium uppercase text-center font-[505]">
            GMORKL SPRING COLLECTION
          </h1>
          <Link href="/de/store">
            <span className="text-white text-sm tracking-widest uppercase border border-white px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors duration-300 cursor-pointer">
              DISCOVER WEARABLE ART FROM COLOGNE
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
