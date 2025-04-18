"use client"

import Image from "next/image"
import { useState } from "react"
import { Dialog } from "@headlessui/react"

const imageList = Array.from({ length: 20 }, (_, i) => `/gallery/${i + 1}.jpg`)

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {imageList.map((src, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(src)}
            className="w-full aspect-[4/5] relative overflow-hidden"
          >
            <Image
              src={src}
              alt={`Gallery Image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
          {selectedImage && (
            <Image
              src={selectedImage}
              alt="Enlarged Image"
              width={800}
              height={1000}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
      </Dialog>
    </>
  )
}

export default Gallery
