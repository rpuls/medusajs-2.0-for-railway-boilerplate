'use client'
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  // Stare pentru imaginea principală
  const [mainImage, setMainImage] = useState<HttpTypes.StoreProductImage>(images[0])

  return (
    <div className="flex flex-col items-start relative">
      {/* Imaginea principală mai mică */}
      <Container className="relative aspect-[29/34] lg:w-[500px]  overflow-hidden bg-ui-bg-subtle mb-4">
        {!!mainImage.url && (
          <Image
            src={mainImage.url}
            priority={true}
            className="absolute inset-0 rounded-rounded"
            alt={`Main product image`}
            fill
            sizes="(max-width: 476px) 140px, (max-width: 768px) 180px, (max-width: 992px) 240px, 400px"
            style={{
              objectFit: "cover",
            }}
          />
        )}
      </Container>

      {/* Miniaturile pentru imagini */}
      <div className="flex gap-x-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => setMainImage(image)} // Schimbă imaginea principală la click
            className="cursor-pointer relative aspect-[29/34] w-20 h-20 overflow-hidden bg-ui-bg-subtle"
          >
            {!!image.url && (
              <Image
                src={image.url}
                alt={`Thumbnail image ${index + 1}`}
                fill
                sizes="80px"
                className="absolute inset-0 rounded-rounded"
                style={{
                  objectFit: "cover",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
