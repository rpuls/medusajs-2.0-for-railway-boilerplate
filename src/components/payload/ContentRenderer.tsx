'use client'

import React from 'react'
import { RichText } from '@/components/payload/RichText'

interface ContentBlockProps {
  content: any
  type: string
}

export const ContentRenderer: React.FC<ContentBlockProps> = ({ content, type }) => {
  if (!content) return null

  switch (type) {
    case 'richText':
      return <RichText content={content} />
    
    case 'hero':
      return (
        <div className="relative py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            {content.heading && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.heading}</h1>
            )}
            {content.subheading && (
              <p className="text-xl md:text-2xl mb-8">{content.subheading}</p>
            )}
            {content.ctaButton && content.ctaButton.label && (
              <a 
                href={content.ctaButton.link || '#'} 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                {content.ctaButton.label}
              </a>
            )}
          </div>
        </div>
      )
    
    case 'content':
      return (
        <div className="py-12">
          <div className="container mx-auto px-4">
            {content.heading && (
              <h2 className="text-3xl font-bold mb-6">{content.heading}</h2>
            )}
            {content.content && (
              <RichText content={content.content} />
            )}
          </div>
        </div>
      )
    
    case 'featuredProducts':
      // This would connect to Medusa to fetch the products
      return (
        <div className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {content.heading && (
              <h2 className="text-3xl font-bold mb-8 text-center">{content.heading}</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Product cards would go here */}
              <p className="text-center col-span-full">Featured products will be displayed here</p>
            </div>
          </div>
        </div>
      )
    
    default:
      return <div>Unknown content type: {type}</div>
  }
}

export default ContentRenderer
