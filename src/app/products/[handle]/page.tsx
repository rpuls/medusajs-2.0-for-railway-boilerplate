import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getProductByHandle } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { enrichProductWithPayloadData } from '@/lib/services/integration'
import { RichText } from '@/components/payload/RichText'

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { handle: string } 
}): Promise<Metadata> {
  const region = await getRegion('us')
  
  if (!region) {
    return {
      title: 'Product Not Found',
    }
  }
  
  const product = await getProductByHandle({ handle: params.handle, regionId: region.id })
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.title} | Marketplace`,
    description: product.description,
  }
}

export default async function ProductPage({ 
  params 
}: { 
  params: { handle: string } 
}) {
  const region = await getRegion('us')
  
  if (!region) {
    notFound()
  }
  
  const product = await getProductByHandle({ handle: params.handle, regionId: region.id })
  
  if (!product) {
    notFound()
  }
  
  // Enrich the product with Payload CMS data
  const enrichedProduct = await enrichProductWithPayloadData(product)
  
  // Get the first variant and price
  const firstVariant = product.variants[0]
  const price = firstVariant?.calculated_price
  
  // Format the price
  const formattedPrice = price 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: region.currency_code,
      }).format(price / 100)
    : 'Free'
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="relative w-full h-96 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            {product.thumbnail ? (
              <Image 
                src={product.thumbnail} 
                alt={product.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image: any) => (
                <div key={image.id} className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <Image 
                    src={image.url} 
                    alt={product.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          
          <div className="mb-4">
            <span className="text-2xl font-bold">{formattedPrice}</span>
          </div>
          
          {/* Tags and Categories */}
          <div className="mb-6">
            {product.metadata?.engineType && (
              <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {product.metadata.engineType}
              </span>
            )}
            {product.metadata?.assetType && (
              <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {product.metadata.assetType}
              </span>
            )}
            {product.metadata?.pricingType && (
              <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {product.metadata.pricingType}
              </span>
            )}
            
            {enrichedProduct.enrichedCategories && enrichedProduct.enrichedCategories.length > 0 && (
              <div className="mt-2">
                {enrichedProduct.enrichedCategories.map((category: any) => (
                  <Link 
                    key={category.id}
                    href={`/marketplace/categories/${category.slug}`}
                    className="inline-block bg-blue-100 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Seller Info */}
          {enrichedProduct.seller && (
            <div className="mb-6 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Seller</h3>
              <div className="flex items-center">
                {enrichedProduct.seller.photo && enrichedProduct.seller.photo.url && (
                  <div className="relative w-12 h-12 mr-3">
                    <Image 
                      src={enrichedProduct.seller.photo.url} 
                      alt={enrichedProduct.seller.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-full"
                    />
                  </div>
                )}
                <div>
                  <Link 
                    href={`/sellers/${enrichedProduct.seller.slug}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {enrichedProduct.seller.name}
                  </Link>
                  {enrichedProduct.seller.isVerified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Add to Cart Button */}
          <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors mb-4">
            Add to Cart
          </button>
          
          {/* Wishlist Button */}
          <button className="w-full border border-gray-300 py-3 px-6 rounded-md font-medium hover:bg-gray-50 transition-colors">
            Add to Wishlist
          </button>
        </div>
      </div>
      
      {/* Product Description */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Description</h2>
        <div className="prose max-w-none">
          {product.description ? (
            <RichText content={product.description} />
          ) : (
            <p>No description available.</p>
          )}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Specifications</h3>
            <ul className="space-y-2">
              {product.metadata?.engineType && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Engine</span>
                  <span>{product.metadata.engineType}</span>
                </li>
              )}
              {product.metadata?.assetType && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Asset Type</span>
                  <span>{product.metadata.assetType}</span>
                </li>
              )}
              {product.metadata?.version && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Version</span>
                  <span>{product.metadata.version}</span>
                </li>
              )}
              {product.metadata?.fileSize && (
                <li className="flex justify-between">
                  <span className="text-gray-600">File Size</span>
                  <span>{product.metadata.fileSize}</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Requirements</h3>
            <ul className="space-y-2">
              {product.metadata?.requirements ? (
                <RichText content={product.metadata.requirements} />
              ) : (
                <li>No specific requirements listed.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Reviews */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <p>Reviews functionality coming soon.</p>
      </div>
    </div>
  )
}
