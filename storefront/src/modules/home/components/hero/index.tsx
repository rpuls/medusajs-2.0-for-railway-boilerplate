"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
      {/* Видеофон */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/flower_power_AI.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Контент поверх видео */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-start pl-8 md:pl-20 gap-4 bg-black/40">
        <h1 className="text-4xl md:text-6xl font-normal tracking-wide uppercase drop-shadow-lg">
          GMORKL SPRING COLLECTION
        </h1>

        <Link
          href="/store" // автоматическая локализация сработает, если ты используешь `app/[countryCode]/store`
          className="px-6 py-2 bg-white/10 text-white text-sm md:text-base uppercase tracking-wide border border-transparent hover:bg-white/20 transition rounded-none"
        >
          Discover wearable art from Cologne
        </Link>
      </div>
    </div>
  )
}
