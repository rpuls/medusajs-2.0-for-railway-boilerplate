'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProductCollection } from '@/modules/products/components/product-collection'
import { Suspense } from 'react'
import { SkeletonProductGrid } from '@/modules/skeletons/components/skeleton-product-grid'

interface LandingPageProps {
  page: any // Type this properly based on your Payload schema
}

export const LandingPageRenderer: React.FC<LandingPageProps> = ({ page }) => {
  if (!page) return null

  return (
    <div className="flex flex-col gap-y-8">
      {/* Hero Section */}
      {page.hero && (
        <div className="relative w-full h-[500px] flex items-center">
          {page.hero.image && (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={page.hero.image.url}
                alt={page.hero.heading || 'Hero image'}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>
          )}
          <div className="relative z-10 container mx-auto px-4 text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.hero.heading}</h1>
            {page.hero.subheading && <p className="text-xl mb-6">{page.hero.subheading}</p>}
            {page.hero.ctaButton && page.hero.ctaButton.label && (
              <Link href={page.hero.ctaButton.link || '#'} className="btn-primary">
                {page.hero.ctaButton.label}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Content Sections */}
      {page.sections &&
        page.sections.map((section: any, index: number) => {
          switch (section.blockType) {
            case 'content':
              return (
                <div key={index} className="container mx-auto px-4">
                  {section.heading && <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>}
                  {section.content && (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
                  )}
                </div>
              )

            case 'featured-products':
              return (
                <div key={index} className="container mx-auto px-4">
                  {section.heading && <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>}
                  <Suspense fallback={<SkeletonProductGrid />}>
                    <ProductCollection
                      title=""
                      ids={section.productIds?.map((p: any) => p.productId) || []}
                    />
                  </Suspense>
                </div>
              )

            case 'featured-categories':
              return (
                <div key={index} className="container mx-auto px-4">
                  {section.heading && <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {section.categories?.map((category: any) => (
                      <Link
                        key={category.id}
                        href={`/marketplace/categories/${category.slug}`}
                        className="bg-gray-100 p-4 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <h3 className="font-medium">{category.name}</h3>
                      </Link>
                    ))}
                  </div>
                </div>
              )

            case 'testimonials':
              return (
                <div key={index} className="container mx-auto px-4 bg-gray-50 py-8 rounded-lg">
                  {section.heading && <h2 className="text-2xl font-bold mb-6 text-center">{section.heading}</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.testimonials?.map((testimonial: any, i: number) => (
                      <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="italic mb-4">"{testimonial.quote}"</p>
                        <div>
                          <p className="font-bold">{testimonial.author}</p>
                          {testimonial.role && <p className="text-gray-500 text-sm">{testimonial.role}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )

            default:
              return null
          }
        })}
    </div>
  )
}
