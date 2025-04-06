import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import dynamic from 'next/dynamic'

// Import the RefreshRouteOnSave component dynamically to avoid SSR issues
const RefreshRouteOnSave = dynamic(
  () => import("@/components/payload/RefreshRouteOnSave"),
  { ssr: false }
)

// Import the RichText component
const RichText = dynamic(
  () => import("@/components/payload/RichText"),
  { ssr: true }
)

// Function to fetch seller data from Payload CMS
async function getSeller(slug: string) {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'
    const response = await fetch(`${payloadUrl}/api/sellers?where[slug][equals]=${slug}&depth=2`, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching seller:', error)
    return null
  }
}

// Function to fetch seller products from Medusa
async function getSellerProducts(storeId: string) {
  try {
    const medusaUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
    const response = await fetch(`${medusaUrl}/store/products?store_id=${storeId}`, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error('Error fetching seller products:', error)
    return []
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const seller = await getSeller(params.slug)

  if (!seller) {
    return {
      title: 'Seller Not Found',
    }
  }

  return {
    title: `${seller.name} | Marketplace`,
    description: seller.biography ? 'Seller profile for ' + seller.name : undefined,
  }
}

export default async function SellerPage({ params }: { params: { slug: string } }) {
  const seller = await getSeller(params.slug)

  if (!seller) {
    notFound()
  }

  // Fetch seller's products from Medusa
  const products = await getSellerProducts(seller.storeId)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {seller.banner && seller.banner.url && (
          <div className="relative w-full h-64 mb-6">
            <Image 
              src={seller.banner.url} 
              alt={`${seller.name} banner`}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
            />
          </div>
        )}
        
        <div className="flex items-center mb-6">
          {seller.photo && seller.photo.url && (
            <div className="relative w-24 h-24 mr-4">
              <Image 
                src={seller.photo.url} 
                alt={seller.name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-full"
              />
            </div>
          )}
          
          <div>
            <h1 className="text-3xl font-bold">{seller.name}</h1>
            {seller.isVerified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                Verified Seller
              </span>
            )}
          </div>
        </div>
        
        {seller.biography && (
          <div className="prose max-w-none mb-8">
            <RichText content={seller.biography} />
          </div>
        )}
        
        {seller.socialLinks && seller.socialLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Connect with {seller.name}</h2>
            <div className="flex flex-wrap gap-3">
              {seller.socialLinks.map((link: any, index: number) => (
                <a 
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Products by {seller.name}</h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="border rounded-lg overflow-hidden">
                {product.thumbnail && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={product.thumbnail} 
                      alt={product.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{product.title}</h3>
                  <p className="text-gray-600 mt-1">{product.description?.substring(0, 100)}...</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-bold">${(product.variants[0]?.prices[0]?.amount / 100).toFixed(2)}</span>
                    <a 
                      href={`/products/${product.handle}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No products found for this seller.</p>
        )}
      </div>
      
      {/* Add RefreshRouteOnSave for live preview */}
      <RefreshRouteOnSave />
    </div>
  )
}
