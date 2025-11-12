"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { useTranslation } from "@lib/i18n/hooks/use-translation"

interface BannerSlide {
  id: string
  title: string
  subtitle?: string
  image?: string
  link?: string
  buttonText?: string
}

interface BannerSliderProps {
  slides?: BannerSlide[]
}

const BannerSlider = ({ slides }: BannerSliderProps) => {
  const { t } = useTranslation()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Default slides using translations
  const defaultSlides: BannerSlide[] = [
    {
      id: "1",
      title: t("homepage.hero.title"),
      subtitle: t("homepage.hero.subtitle"),
      link: "/store",
      buttonText: t("homepage.hero.cta"),
    },
  ]

  const displaySlides = slides || defaultSlides

  useEffect(() => {
    if (displaySlides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length)
    }, 5000) // Auto-advance every 5 seconds

    return () => clearInterval(interval)
  }, [displaySlides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % displaySlides.length)
  }

  if (displaySlides.length === 0) return null

  const currentSlideData = displaySlides[currentSlide]

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-primary/10 via-background-base to-accent/5">
      {/* Slide Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-text-primary mb-4">
            {currentSlideData.title}
          </h1>
          {currentSlideData.subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-text-secondary mb-8">
              {currentSlideData.subtitle}
            </p>
          )}
          {currentSlideData.link && currentSlideData.buttonText && (
            <LocalizedClientLink
              href={currentSlideData.link}
              className="inline-block px-8 py-3 bg-primary text-text-inverse rounded-lg hover:bg-primary-hover transition-colors font-medium"
            >
              {currentSlideData.buttonText}
            </LocalizedClientLink>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-text-primary" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-text-primary" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BannerSlider

