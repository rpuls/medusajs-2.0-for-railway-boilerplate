"use client"

import fs from "fs"
import path from "path"
import { useEffect, useState } from "react"
import Image from "next/image"

const GalleryPage = () => {
  const [images, setImages] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch("/api/gallery/list")
      const files: string[] = await res.json()
      setImages(files)
    }

    fetchImages()
  }, [])

  return (
    <div className="px-4 py-20 font-sans tracking-wide">
      <h1 className="text-4xl text-center uppercase mb-10">Gallery</h1>

      <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
        {images.map((src, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg cursor-pointer hover:opacity-80"
            onClick={() => setSelected(src)}
          >
            <Image
              src={src}
              alt={`Image ${i}`}
              width={800}
              height={800}
              layout="responsive"
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-[90%] max-h-[90%]">
            <Image
              src={selected}
              alt="Selected"
              width={1200}
              height={1200}
              className="rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
