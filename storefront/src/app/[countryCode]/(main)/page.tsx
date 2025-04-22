"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Home() {
  const pathname = usePathname()
  const countryCode = pathname.split("/")[1] || "de" // fallback на "de"

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

      {/* Контент поверх видео */}
      <div className="absolute inset-0 flex flex-col justify-center items-start pl-20 z-10">
        <h1 className="text-4xl font-[505] uppercase tracking-wider drop-shadow-md">
          GMORKL SPRING COLLECTION
        </h1>

        <Link
          href={`/${countryCode}/store`}
          className="mt-0.5 px-6 py-2 border border-white text-base font-semibold tracking-wide uppercase bg-white/10 hover:bg-white/30 transition-colors"
        >
          DISCOVER WEARABLE ART FROM COLOGNE
        </Link>
      </div>
    </div>
  )
}
