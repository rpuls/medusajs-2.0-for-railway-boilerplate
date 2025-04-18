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
        <h1 className="text-4xl md:text-6xl text-white font-bold drop-shadow-lg">
          Welcome to Gmorkal Store
        </h1>
        <h2 className="text-lg md:text-2xl text-white opacity-80 mt-4">
          Discover curated products with cinematic experience
        </h2>
      </div>
    </div>
  )
}

export default Hero
