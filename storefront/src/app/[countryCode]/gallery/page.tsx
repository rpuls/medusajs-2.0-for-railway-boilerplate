"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

const GalleryPage = () => {
  const [images, setImages] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/gallery-list")
      .then((res) => res.json())
      .then(setImages)
  }, [])

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((file, i) => (
          <div key={i} onClick={() => setSelected(file)} className="cursor-zoom-in">
            <Image
              src={`/gallery/${file}`}
              alt={`Gallery ${i}`}
              width={800}
              height={600}
              className="w-full h-auto object-cover rounded-lg shadow"
            />
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-5xl w-[90vw] max-h-[90vh] relative">
            <Image
              src={`/gallery/${selected}`}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
