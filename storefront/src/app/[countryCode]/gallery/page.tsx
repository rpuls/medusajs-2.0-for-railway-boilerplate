"use client"

import { useState } from "react"
import Image from "next/image"
import clsx from "clsx"

const IMAGES = Array.from({ length: 20 }, (_, i) => `/gallery/img${i + 1}.jpg`)

export default function GalleryPage() {
  const [count, setCount] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const loadMore = () => setCount((c) => c + 1)

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {IMAGES.slice(0, count * 6).map((src, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(src)}
            className="aspect-[3/4] relative overflow-hidden rounded-lg group"
          >
            <Image
              src={src}
              alt={`Gallery ${i}`}
              fill
              className="object-cover group-hover:opacity-80 transition"
            />
          </button>
        ))}
      </div>

      {count * 6 < IMAGES.length && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            className="px-6 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-neutral-800"
          >
            Load More
          </button>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={selectedImage}
              alt="Selected"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
