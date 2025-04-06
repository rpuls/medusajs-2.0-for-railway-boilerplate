import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// Import the ContentRenderer component
const ContentRenderer = dynamic(
  () => import("@/components/payload/ContentRenderer"),
  { ssr: true }
)

// Function to fetch landing page data from Payload CMS
async function getLandingPage() {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'
    const response = await fetch(`${payloadUrl}/api/landing-pages?where[slug][equals]=marketplace&depth=2`, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return null
  }
}

// Function to fetch featured categories from Payload CMS
async function getFeaturedCategories(limit = 6) {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'
    const response = await fetch(
      `${payloadUrl}/api/asset-categories?limit=${limit}&where[isActive][equals]=true&sort=displayOrder&depth=1`, 
      {
        next: { revalidate: 10 }, // Cache for 10 seconds
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Function to fetch featured products from Medusa
async function getFeaturedProducts(limit = 6) {
  try {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const response = await fetch(`${medusaUrl}/store/products?limit=${limit}&is_featured=true`, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export const metadata: Metadata = {
  title: 'Marketplace | Digital Assets for Game Development',
  description: 'Discover high-quality digital assets for your game development projects',
}

export default async function MarketplacePage() {
  const landingPage = await getLandingPage()
  const categories = await getFeaturedCategories()
  const products = await getFeaturedProducts()

  return (
    <div>
      {/* Hero Section */}
      {landingPage?.hero ? (
        <ContentRenderer content={landingPage.hero} type="hero" />
      ) : (
        <div className="relative py-20 bg-gray-100">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Digital Assets Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Discover high-quality assets for your game development projects
            </p>
            <Link 
              href="/marketplace/categories"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      )}
      
      {/* Featured Categories */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Browse Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.length > 0 ? (
              categories.map((category: any) => (
                <Link 
                  key={category.id}
                  href={`/marketplace/categories/${category.slug}`}
                  className="group"
                >
                  <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-gray-100">
                    {category.featuredImage && category.featuredImage.url ? (
                      <Image 
                        src={category.featuredImage.url} 
                        alt={category.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {category.icon && category.icon.url ? (
                          <Image 
                            src={category.icon.url} 
                            alt={category.name}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="text-center font-medium">{category.name}</h3>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center">No categories found.</p>
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/marketplace/categories"
              className="inline-block text-blue-600 font-medium hover:text-blue-800"
            >
              View All Categories
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Assets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.length > 0 ? (
              products.map((product: any) => (
                <Link 
                  key={product.id}
                  href={`/products/${product.handle}`}
                  className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
                >
                  <div className="relative w-full h-48">
                    {product.thumbnail ? (
                      <Image 
                        src={product.thumbnail} 
                        alt={product.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {product.metadata?.engineType && (
                        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700 mr-2">
                          {product.metadata.engineType}
                        </span>
                      )}
                      {product.metadata?.assetType && (
                        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
                          {product.metadata.assetType}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-bold">
                        {product.variants[0]?.prices[0]?.amount 
                          ? `$${(product.variants[0].prices[0].amount / 100).toFixed(2)}` 
                          : 'Free'}
                      </span>
                      <span className="text-blue-600">View Details</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-center">No featured products found.</p>
            )}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/marketplace/products"
              className="inline-block text-blue-600 font-medium hover:text-blue-800"
            >
              View All Assets
            </Link>
          </div>
        </div>
      </div>
      
      {/* Content Sections from Payload */}
      {landingPage?.sections && landingPage.sections.map((section: any, index: number) => (
        <ContentRenderer 
          key={index} 
          content={section} 
          type={section.blockType} 
        />
      ))}
    </div>
  )
}
