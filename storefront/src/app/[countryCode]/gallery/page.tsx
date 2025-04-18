"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [index, setIndex] = useState<number | null>(null)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const context = require.context(
      '../../../../public/gallery',
      false,
      /\.(jpe?g|png|gif|webp)$/i
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
    <div className="px-6 pt-20 pb-32 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="w-full cursor-pointer overflow-hidden rounded-lg"
            onClick={() => loaded[src] && setIndex(i)}
          >
            <Image
              src={src}
              alt={`Image ${i}`}
              width={1000}
              height={1000}
              onLoadingComplete={() =>
                setLoaded((prev) => ({ ...prev, [src]: true }))
              }
              className="w-full h-auto object-contain rounded-lg transition-all duration-300"
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

          <div
            className="relative z-40 max-w-[90vw] max-h-[90vh] p-4 pointer-events-none"
          >
            <Image
              src={images[index]}
              alt={`Fullscreen ${index}`}
              width={1600}
              height={1600}
              className="object-contain w-auto h-auto max-h-[90vh] rounded-xl shadow-xl"
              loading="eager"
            />
          </div>
        </div>
      )}
    </div>
  )
}
