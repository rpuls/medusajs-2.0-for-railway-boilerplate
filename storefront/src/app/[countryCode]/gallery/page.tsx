"use client"

import { useEffect, useState, useCallback, useRef } from "react"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef<number | null>(null)
  const dragOffsetX = useRef<number>(0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  useEffect(() => {
    const context = require.context(
      '../../../../public/gallery',
      false,
      /\.(jpe?g|png|webp)$/i
    )
    const paths = context.keys().map((key) => `/gallery/${key.replace('./', '')}`)
    setImages(paths)
  }, [])

  const close = () => setIndex(null)

  const next = useCallback(() => {
    if (index !== null) setIndex((prev) => (prev! + 1) % images.length)
  }, [index, images])

  const prev = useCallback(() => {
    if (index !== null) setIndex((prev) => (prev! - 1 + images.length) % images.length)
  }, [index, images])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (index === null) return
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [index, next, prev])

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    dragStartX.current = e.touches[0].clientX
    dragOffsetX.current = 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || dragStartX.current === null || !sliderRef.current) return
    const currentX = e.touches[0].clientX
    dragOffsetX.current = currentX - dragStartX.current
    sliderRef.current.style.transition = 'none'
    sliderRef.current.style.transform = `translateX(${dragOffsetX.current}px)`
  }

  const handleTouchEnd = () => {
    if (!isMobile || !sliderRef.current) return
    const threshold = 80

    if (dragOffsetX.current < -threshold) {
      sliderRef.current.style.transition = 'transform 0.2s ease'
      sliderRef.current.style.transform = 'translateX(-100vw)'
      requestAnimationFrame(() => {
        setTimeout(() => {
          next()
          if (sliderRef.current) {
            sliderRef.current.style.transition = 'none'
            sliderRef.current.style.transform = 'translateX(100vw)'
            requestAnimationFrame(() => {
              if (sliderRef.current) {
                sliderRef.current.style.transition = 'transform 0.2s ease'
                sliderRef.current.style.transform = 'translateX(0)'
              }
            })
          }
        }, 50)
      })
    } else if (dragOffsetX.current > threshold) {
      sliderRef.current.style.transition = 'transform 0.2s ease'
      sliderRef.current.style.transform = 'translateX(100vw)'
      requestAnimationFrame(() => {
        setTimeout(() => {
          prev()
          if (sliderRef.current) {
            sliderRef.current.style.transition = 'none'
            sliderRef.current.style.transform = 'translateX(-100vw)'
            requestAnimationFrame(() => {
              if (sliderRef.current) {
                sliderRef.current.style.transition = 'transform 0.2s ease'
                sliderRef.current.style.transform = 'translateX(0)'
              }
            })
          }
        }, 50)
      })
    } else {
      sliderRef.current.style.transition = 'transform 0.2s ease'
      sliderRef.current.style.transform = 'translateX(0)'
    }

    dragStartX.current = null
    dragOffsetX.current = 0
  }

  return (
    <div className="px-6 pt-10 pb-32 font-sans tracking-wide">
      <h1 className="text-4xl font-[505] uppercase mb-8 tracking-wider text-center">
        GALLERY
      </h1>

      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setIndex(i)}
          >
            <img
              src={src}
              alt={`Gallery ${i}`}
              className="w-full h-auto rounded-lg transition-opacity duration-300 hover:opacity-80"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center overflow-hidden pt-14 sm:pt-20"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Стрелки — только на десктопе */}
          <div className="absolute inset-0 z-50 pointer-events-none hidden sm:block">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="text-white text-6xl font-light hover:opacity-80"
              >
                &#x2039;
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="text-white text-6xl font-light hover:opacity-80"
              >
                &#x203A;
              </button>
            </div>
          </div>

          {/* Картинка со свайпом */}
          <div
            ref={sliderRef}
            className="relative z-40 max-w-[90vw] max-h-[90vh] p-4 pointer-events-none flex items-center"
          >
            <img
              src={images[index]}
              alt={`Fullscreen ${index}`}
              className="max-h-[90vh] max-w-full h-auto w-auto rounded-xl shadow-xl pointer-events-none object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}
