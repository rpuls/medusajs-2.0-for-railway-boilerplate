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

      {/* контент поверх видео */}
      <div className="absolute inset-0 flex items-center justify-start pl-20 z-0">
        <div>
          <h1 className="text-5xl font-bold uppercase">gmorkl spring collection</h1>
          <h2 className="text-xl mt-2 tracking-wide uppercase">
            discover wearable art from cologne
          </h2>
        </div>
      </div>
    </div>
  )
}
