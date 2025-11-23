"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  productName?: string
}

const ImageGallery = ({ images, productName }: ImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square w-full overflow-hidden bg-background-elevated rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center text-text-tertiary">
          No image available
        </div>
      </div>
    )
  }

  const selectedImage = images[selectedImageIndex] || images[0]

  return (
    <div className="flex flex-row gap-4">
      {/* Thumbnail Strip - Left Side */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col gap-3 flex-shrink-0">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative w-20 h-20 overflow-hidden bg-background-elevated rounded-lg border-2 transition-all ${selectedImageIndex === index
                ? "border-primary shadow-md"
                : "border-border-base hover:border-primary/50"
                }`}
              aria-label={`View image ${index + 1}`}
            >
              {image.url && (
                <Image
                  src={image.url}
                  loading="lazy"
                  className="object-cover"
                  alt={`${productName || "Product"} - Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  quality={60}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="flex-1 relative aspect-square w-full overflow-hidden bg-background-elevated rounded-lg group">
        {selectedImage?.url && (
          <>
            <Image
              src={selectedImage.url}
              priority={selectedImageIndex === 0}
              loading={selectedImageIndex === 0 ? "eager" : "lazy"}
              className="object-cover transition-opacity duration-300"
              alt={`${productName || "Product"} - Main image`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={90}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />

            {/* Image Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex > 0
                        ? selectedImageIndex - 1
                        : images.length - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-5 h-5 text-text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex < images.length - 1
                        ? selectedImageIndex + 1
                        : 0
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <svg
                    className="w-5 h-5 text-text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Mobile Thumbnail Strip - Bottom */}
      {images.length > 1 && (
        <div className="md:hidden flex flex-row gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 overflow-hidden bg-background-elevated rounded-lg border-2 transition-all ${selectedImageIndex === index
                ? "border-primary shadow-md"
                : "border-border-base"
                }`}
              aria-label={`View image ${index + 1}`}
            >
              {image.url && (
                <Image
                  src={image.url}
                  loading="lazy"
                  className="object-cover"
                  alt={`${productName || "Product"} - Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  quality={60}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
