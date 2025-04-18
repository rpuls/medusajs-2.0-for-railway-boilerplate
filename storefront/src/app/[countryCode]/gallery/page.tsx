"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/gallery-list")
      .then((res) => res.json())
      .then(setImages)
  }, [])

  const closeModal = () => setSelectedIndex(null)
  const prevImage = () => setSelectedIndex((prev) => (prev! - 1 + images.length) % images.length)
  const nextImage = () => setSelectedIndex((prev) => (prev! + 1) % images.length)

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((file, i) => (
          <div
            key={i}
            onClick={() => setSelectedIndex(i)}
            className="cursor-zoom-in relative aspect-[3/4] overflow-hidden rounded-lg shadow"
          >
            <Image
              src={`/gallery/${file}`}
              alt={`Gallery ${i}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="absolute top-4 right-4 text-white cursor-pointer"
            onClick={closeModal}
          >
            <XMarkIcon className="h-8 w-8" />
          </div>

          <div
            className="absolute left-4 text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              prevImage()
            }}
          >
            <ChevronLeftIcon className="h-10 w-10" />
          </div>

          <div
            className="absolute right-4 text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
          >
            <ChevronRightIcon className="h-10 w-10" />
          </div>

          <div className="relative w-[90vw] h-[90vh]">
            <Image
              src={`/gallery/${images[selectedIndex]}`}
              alt="Preview"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
