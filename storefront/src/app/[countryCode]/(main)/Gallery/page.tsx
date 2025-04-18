"use client"

import Image from "next/image"
import { useState } from "react"

const images = [
  "/gallery/img1.jpg",
  "/gallery/img2.jpg",
  "/gallery/img3.jpg",
  "/gallery/img4.jpg",
  "/gallery/img5.jpg",
]

export default function GalleryPage() {
  const [count, setCount] = useState(1)

  const loadMore = () => {
    setCount(count + 1)
  }

  return (
    <div className="px-6 py-20 font-sans tracking-wide">
      <h1 className="text-4xl font-bold uppercase mb-10 text-center">Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array(count)
          .fill(images)
          .flat()
          .map((src, i) => (
            <div key={i} className="aspect-[3/4] relative overflow-hidden rounded-lg">
              <Image
                src={src}
                alt={`Gallery ${i}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
      </div>
      <div className="text-center mt-10">
        <button
          onClick={loadMore}
          className="px-6 py-2 bg-black text-white uppercase tracking-wider text-sm hover:bg-neutral-800"
        >
          Load More
        </button>
      </div>
    </div>
  )
}
