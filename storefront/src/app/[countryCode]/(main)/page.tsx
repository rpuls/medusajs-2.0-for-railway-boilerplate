"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/flower_power_AI.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start pl-8 md:pl-20 gap-3 bg-black/40">
        <h1 className="text-3xl md:text-5xl font-medium tracking-wide uppercase drop-shadow-lg leading-tight">
          GMORKL SPRING COLLECTION
        </h1>

        <Link
          href="/store" // автоматическая локализация работает
          className="text-base md:text-lg uppercase px-4 py-1 bg-white/10 text-white border border-white/30 tracking-wider hover:bg-white/20 transition rounded-none"
        >
          Discover wearable art from Cologne
        </Link>
      </div>
    </div>
  )
}
