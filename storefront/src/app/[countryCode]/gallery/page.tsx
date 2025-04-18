"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])

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
          <div key={i} className="aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image
              src={`/gallery/${file}`}
              alt={`Gallery ${i}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
