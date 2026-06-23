"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!images.length) {
    return (
      <div className="w-full aspect-square bg-kin-beige" aria-hidden />
    )
  }

  const activeImage = images[activeIndex]

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square bg-kin-beige relative overflow-hidden group">
        {!!activeImage?.url && (
          <Image
            src={activeImage.url}
            alt={`Hình ảnh sản phẩm ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={clx(
                "w-full aspect-square bg-kin-beige overflow-hidden focus:outline-none transition-colors border relative",
                {
                  "border-kin-primary": index === activeIndex,
                  "border-transparent hover:border-kin-warm-grey":
                    index !== activeIndex,
                }
              )}
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
