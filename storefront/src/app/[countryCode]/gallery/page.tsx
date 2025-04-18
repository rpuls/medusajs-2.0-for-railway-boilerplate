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

  // Клавиатурная навигация
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (index === null) return
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next()
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev()
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [index, next, prev])

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>

      <div className="columns-2 sm:columns-3 gap-4 space-y-4">
        {images.map((src, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
          >
            <Image
              src={src}
              alt={`Image ${i}`}
              width={800}
              height={800}
              className="w-full h-auto rounded-lg"
            />
          </div>
        ))}
      </div>

      {index !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
        >
          {/* Левая зона для перехода назад */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            className="absolute inset-y-0 left-0 w-1/2 cursor-pointer z-40 flex items-center justify-start pl-4"
          >
            <div className="text-white text-4xl select-none">&lsaquo;</div>
          </div>

          {/* Правая зона для перехода вперёд */}
          <div
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            className="absolute inset-y-0 right-0 w-1/2 cursor-pointer z-40 flex items-center justify-end pr-4"
          >
            <div className="text-white text-4xl select-none">&rsaquo;</div>
          </div>

          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={images[index]}
              alt="Fullscreen"
              width={1200}
              height={1200}
              className="object-contain w-auto h-auto max-h-[90vh] rounded-xl shadow-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
