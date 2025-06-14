"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Leaf, Award, Heart, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("products-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const addToCart = (productId: number) => {
    setCartCount((prev) => prev + 1)
  }

  const products = [
    {
      id: 1,
      name: "Cashmere Cloud",
      price: 120,
      image: "/placeholder.svg?height=600&width=600",
      collection: "Artisan Collection",
      availability: 3,
    },
    {
      id: 2,
      name: "Silk Whisper",
      price: 160,
      image: "/placeholder.svg?height=600&width=600",
      collection: "Limited Edition",
      availability: 2,
    },
    {
      id: 3,
      name: "Velvet Dreams",
      price: 90,
      image: "/placeholder.svg?height=600&width=600",
      collection: "Signature Series",
      availability: 4,
    },
  ]

  const renderAvailabilityDots = (available: number, total = 5) => {
    return (
      <div className="flex gap-1 justify-center mt-2">
        {[...Array(total)].map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < available ? "bg-[#6B46C1]" : "bg-gray-200"}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D]">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrollY > 50 ? "bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-[#E8E5FF]/30" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="font-serif text-2xl font-light tracking-wide">CloudPaws</div>
          <div className="hidden md:flex items-center gap-12 font-light">
            <a href="#collection" className="hover:text-[#6B46C1] transition-colors duration-300">
              Collection
            </a>
            <a href="#story" className="hover:text-[#6B46C1] transition-colors duration-300">
              Our Story
            </a>
          </div>
          <div className="relative">
            <ShoppingCart className="w-6 h-6 cursor-pointer hover:text-[#6B46C1] transition-colors duration-300" />
            {cartCount > 0 && (
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#FFE5EC] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#6B46C1] rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 pt-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-light text-[#2D2D2D] mb-8 leading-tight tracking-tight">
            Where Exceptional
            <br />
            Cats Rest
          </h1>

          <p className="text-xl md:text-2xl font-light text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
            Handcrafted luxury blankets for the modern feline
          </p>

          <div className="relative mb-16 group">
            <div
              className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] mx-auto"
              style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            >
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="CloudPaws luxury cat blanket"
                fill
                className="object-cover rounded-3xl transition-all duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-700"></div>
            </div>
          </div>

          <button className="bg-[#6B46C1] hover:bg-[#5B3BA3] text-white px-12 py-4 text-lg font-light rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl animate-gentle-pulse mb-12 inline-flex items-center">
            View Collection
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>

          <p className="text-sm font-light text-gray-500 tracking-wide">Trusted by 10,000+ discerning cat parents</p>
        </div>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-8 text-xs font-light text-gray-400">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span>Ethically Sourced</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Handcrafted</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Lifetime Quality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 md:gap-20">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`text-center group cursor-pointer transition-all duration-700 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative mb-8 overflow-hidden rounded-2xl">
                  <div className="aspect-square relative">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className={`object-cover transition-all duration-700 ${
                        hoveredProduct === product.id ? "scale-110" : "scale-100"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-black/10 to-transparent transition-opacity duration-700 ${
                        hoveredProduct === product.id ? "opacity-100" : "opacity-0"
                      }`}
                    ></div>
                  </div>

                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                      hoveredProduct === product.id ? "opacity-100 backdrop-blur-sm" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <button
                      onClick={() => addToCart(product.id)}
                      className="bg-white/90 hover:bg-white text-[#2D2D2D] px-8 py-3 rounded-full font-light transition-all duration-300 hover:scale-105"
                    >
                      Select
                    </button>
                  </div>
                </div>

                <p className="text-xs font-light text-gray-500 mb-3 tracking-wide uppercase">{product.collection}</p>
                <h3 className="text-2xl md:text-3xl font-serif font-light text-[#2D2D2D] mb-4">{product.name}</h3>
                <p className="text-xl font-light text-gray-600 mb-3">${product.price}</p>
                {renderAvailabilityDots(product.availability)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-32 px-8 bg-[#E8E5FF]/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <blockquote className="text-3xl md:text-4xl font-serif font-light text-[#2D2D2D] mb-8 leading-relaxed italic">
              "My Persian has never looked more regal. Worth every penny."
            </blockquote>
            <cite className="text-lg font-light text-gray-600">Sarah M., Manhattan</cite>
          </div>

          <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] rounded-3xl overflow-hidden mb-12">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="Cat lounging on CloudPaws blanket in minimalist apartment"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
          </div>

          
            href="#stories"
            className="text-sm font-light text-gray-500 hover:text-[#6B46C1] transition-colors duration-300 tracking-wide"
          >
            Read their stories
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-[#E8E5FF]/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-16">
            <h3 className="text-2xl font-serif font-light text-[#2D2D2D] mb-6">Join our exclusive circle</h3>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white border border-[#E8E5FF] rounded-l-full focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20 font-light"
              />
              <button className="bg-[#6B46C1] hover:bg-[#5B3BA3] text-white px-8 py-4 rounded-r-full font-light">
                Join
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-12 mb-12 text-sm font-light text-gray-500">
            <a href="#shipping" className="hover:text-[#6B46C1] transition-colors duration-300">
              Shipping
            </a>
            <a href="#returns" className="hover:text-[#6B46C1] transition-colors duration-300">
              Returns
            </a>
            <a href="#contact" className="hover:text-[#6B46C1] transition-colors duration-300">
              Contact
            </a>
          </div>

          <p className="text-sm font-light text-gray-400 flex items-center justify-center gap-2">
            © 2024 CloudPaws
            <Heart className="w-4 h-4 text-[#FFE5EC]" />
          </p>
        </div>
      </footer>
    </div>
  )
}
