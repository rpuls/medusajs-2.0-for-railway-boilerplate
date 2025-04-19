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
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center bg-black bg-opacity-40 p-8">
        <h1 className="text-4xl md:text-6xl text-white font-extralight tracking-wide drop-shadow-lg uppercase mb-4">
          gmorkl spring collection
        </h1>

        <button className="text-white text-sm md:text-base font-light uppercase tracking-wider px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300">
          discover wearable art from cologne
        </button>
      </div>
    </div>
  )
}

export default Hero
