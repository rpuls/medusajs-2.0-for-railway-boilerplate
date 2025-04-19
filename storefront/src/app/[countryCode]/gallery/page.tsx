"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [index, setIndex] = useState<number | null>(null)

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

  return (
    <div className="px-6 pt-10 pb-32 font-sans tracking-wide">
      <h1 className="text-4xl font-medium uppercase mb-8 tracking-wider text-center">
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
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center"
          onClick={close}
        >
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                className="text-white text-7xl font-light hover:opacity-80"
              >
                &#x2039;
              </button>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                className="text-white text-7xl font-light hover:opacity-80"
              >
                &#x203A;
              </button>
            </div>
          </div>

          <div className="relative z-40 max-w-[90vw] max-h-[90vh] p-4 pointer-events-none">
            <img
              src={images[index]}
              alt={`Fullscreen ${index}`}
              className="max-h-[90vh] w-auto h-auto rounded-xl shadow-xl pointer-events-none object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
