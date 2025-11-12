import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-border-base relative bg-gradient-to-br from-primary/10 via-background-base to-accent/5">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <div className="max-w-4xl mx-auto px-6">
          <Heading
            level="h1"
            className="text-4xl md:text-5xl lg:text-6xl leading-tight text-text-primary font-semibold mb-4"
          >
            Discover Your Style
          </Heading>
          <Heading
            level="h2"
            className="text-xl md:text-2xl leading-relaxed text-text-secondary font-normal mb-8"
          >
            Shop the latest trends and find your perfect look
          </Heading>
          <div className="flex gap-4 justify-center">
            <a
              href="/store"
              className="px-8 py-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              Shop Now
            </a>
            <a
              href="/collections"
              className="px-8 py-3 bg-secondary border-2 border-primary text-primary rounded-lg hover:bg-secondary-hover transition-colors font-medium"
            >
              Browse Collections
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
