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

      <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setIndex(i)}
          >
            <Image
              src={src}
              alt={`Image ${i}`}
              width={600}
              height={900}
              className="w-full h-auto rounded-lg transition-opacity duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Модалка */}
      {index !== null && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
          onClick={close}
        >
          {/* Левая стрелка */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-6 z-50 cursor-pointer"
          >
            <div className="text-white text-5xl font-light">&#x2039;</div>
          </div>

          {/* Правая стрелка */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-6 z-50 cursor-pointer"
          >
            <div className="text-white text-5xl font-light">&#x203A;</div>
          </div>

          {/* Изображение */}
          <div
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <div className="relative max-w-[90vw] max-h-[90vh] p-4">
              <Image
                src={images[index]}
                alt={`Fullscreen ${index}`}
                width={1200}
                height={1600}
                className="object-contain w-auto h-auto max-h-[90vh] rounded-xl shadow-xl pointer-events-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
