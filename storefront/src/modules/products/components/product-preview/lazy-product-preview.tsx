"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { HttpTypes } from "@medusajs/types"

// Lazy load product preview component
const ProductPreview = dynamic(() => import("./index"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 aspect-[9/16] rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ),
})

type LazyProductPreviewProps = {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}

/**
 * Lazy-loaded product preview using Intersection Observer
 * Only loads when the product card enters the viewport
 */
const LazyProductPreview = ({
  product,
  isFeatured,
  region,
}: LazyProductPreviewProps) => {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={ref}>
      {isInView ? (
        <ProductPreview
          product={product}
          isFeatured={isFeatured}
          region={region}
        />
      ) : (
        <div className="animate-pulse">
          <div className="bg-gray-200 aspect-[9/16] rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}
    </div>
  )
}

export default LazyProductPreview

