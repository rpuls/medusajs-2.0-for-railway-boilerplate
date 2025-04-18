"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import clsx from "clsx"

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
              width={800}
              height={800}
              className="w-full h-auto rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Модалка */}
      {index !== null && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={close}
        >
          {/* Навигация ← Назад */}
          <div className="absolute top-6 left-6 z-50 text-white">
            <button
              onClick={close}
              className="uppercase text-sm tracking-wider hover:underline"
            >
              ← back to gallery
            </button>
          </div>

          {/* Левая стрелка */}
          {images.length > 1 && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                prev()
              }}
              className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-4 z-50"
            >
              <div className="text-white text-5xl font-light select-none">&#x2039;</div>
            </div>
          )}

          {/* Правая стрелка */}
          {images.length > 1 && (
            <div
              onClick={(e) => {
                e.stopPropagation()
                next()
              }}
              className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-4 z-50"
            >
              <div className="text-white text-5xl font-light select-none">&#x203A;</div>
            </div>
          )}

          {/* Изображение */}
          <div
            className="max-w-[90vw] max-h-[90vh] p-4 z-40 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[index]}
              alt={`Fullscreen ${index}`}
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
