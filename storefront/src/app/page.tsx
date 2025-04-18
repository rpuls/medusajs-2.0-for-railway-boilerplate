export default function Home() {
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
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center bg-black bg-opacity-50 p-8">
        <h1 className="text-4xl md:text-6xl text-white font-bold drop-shadow-lg">
          gmorkl spring collection is out now
        </h1>
        <h2 className="text-lg md:text-2xl text-white opacity-80 mt-4">
          discover wearable art from Cologne
        </h2>
      </div>
    </div>
  )
}
