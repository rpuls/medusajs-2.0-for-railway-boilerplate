"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/gallery/list")
      .then((res) => res.json())
      .then(setImages)
  }, [])

  const close = () => setIndex(null)
  const next = () => setIndex((prev) => (prev! + 1) % images.length)
  const prev = () => setIndex((prev) => (prev! - 1 + images.length) % images.length)

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((src, i) => (
          <div
            key={i}
            onClick={() => setIndex(i)}
            className="cursor-pointer overflow-hidden rounded-lg shadow-md"
          >
            <Image
              src={src}
              alt={`Gallery ${i}`}
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: "100%", height: "auto" }}
              className="rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Модалка */}
      {index !== null && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <button className="absolute top-4 right-6 text-white text-4xl" onClick={close}>
            &times;
          </button>
          <button
            className="absolute left-4 text-white text-3xl"
            onClick={prev}
          >
            ⬅
          </button>
          <button
            className="absolute right-4 text-white text-3xl"
            onClick={next}
          >
            ➡
          </button>
          <Image
            src={images[index]}
            alt={`Gallery ${index}`}
            width={0}
            height={0}
            sizes="80vw"
            style={{ width: "auto", height: "80vh" }}
            className="rounded-xl shadow-xl"
          />
        </div>
      )}
    </div>
  )
}
