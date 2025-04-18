'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    const context = require.context(
      '../../../../public/gallery',
      false,
      /\.(jpe?g|png|gif|webp)$/i
    )
    const paths = context.keys().map((key) => `/gallery/${key.replace('./', '')}`)
    setImages(paths)
  }, [])

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>
      <div className="columns-2 sm:columns-3 gap-4 space-y-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelected(i)}
          >
            <Image
              src={src}
              alt={`Gallery ${i}`}
              width={800}
              height={800}
              className="w-full h-auto rounded-lg"
            />
          </div>
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-zoom-out"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-full max-h-full p-4">
            <Image
              src={images[selected]}
              alt={`Fullscreen ${selected}`}
              width={1200}
              height={1200}
              className="max-h-[90vh] w-auto h-auto object-contain rounded-xl"
            />
            {/* Стрелка влево */}
            {selected > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelected(selected - 1)
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl"
              >
                ‹
              </button>
            )}
            {/* Стрелка вправо */}
            {selected < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelected(selected + 1)
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
