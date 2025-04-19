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

      {/* Контент поверх видео */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center bg-black/40 px-6">
        <h1 className="text-4xl md:text-6xl font-extralight tracking-wide uppercase drop-shadow-lg mb-4">
          gmorkl spring collection
        </h1>

        <Link href="/store" passHref>
          <a className="text-sm md:text-base font-light uppercase tracking-wide px-6 py-2 bg-white/10 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/20 transition-all duration-300">
            discover wearable art from cologne
          </a>
        </Link>
      </div>
    </div>
  )
}
