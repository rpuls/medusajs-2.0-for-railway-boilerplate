"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])

  // Статически прописываем список файлов, если не можем сделать fs.readdir
  useEffect(() => {
    // Можем заменить этот массив автоматически сгенерированным списком, если он появится
    const files = [
      "photo_2025-04-18 23.09.29.jpeg",
      "photo_2025-04-18 23.09.34.jpeg",
      "photo_2025-04-18 23.09.37.jpeg",
      "photo_2025-04-18 23.09.45.jpeg",
      "photo_2025-04-18 23.09.48.jpeg",
      "photo_2025-04-18 23.09.51.jpeg",
      "photo_2025-04-18 23.10.00.jpeg",
      "photo_2025-04-18 23.10.04.jpeg",
      "photo_2025-04-18 23.10.06.jpeg",
      "photo_2025-04-18 23.10.13.jpeg",
      "photo_2025-04-18 23.10.19.jpeg",
      "photo_2025-04-18 23.10.21.jpeg",
      "photo_2025-04-18 23.10.24.jpeg",
      "photo_2025-04-18 23.10.27.jpeg",
      "photo_2025-04-18 23.10.29.jpeg",
      "photo_2025-04-18 23.10.31.jpeg",
      "photo_2025-04-18 23.10.37.jpeg",
      "photo_2025-04-18 23.10.41.jpeg",
      "photo_2025-04-18 23.10.44.jpeg",
      "photo_2025-04-18 23.10.48.jpeg",
    ]
    setImages(files)
  }, [])

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((file, i) => (
          <div
            key={i}
            className="relative w-full aspect-[3/4] overflow-hidden rounded-lg shadow"
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
    </div>
  )
}
