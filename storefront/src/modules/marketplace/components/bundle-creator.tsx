'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { sdk } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// Define the form data type
type BundleFormData = {
  title: string
  description: string
  price: number
  productIds: string[]
  thumbnail: FileList
}

export default function BundleCreator() {
  const router = useRouter()
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [regularPrice, setRegularPrice] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BundleFormData>()

  const watchPrice = watch('price')

  // Fetch available products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // In a real implementation, you would filter by products that allow bundling
        const { products } = await sdk.products.list({
          is_giftcard: false,
          limit: 100,
        })

        // Filter to only include products that allow bundling
        const bundleableProducts = products.filter(product => 
          product.metadata?.allowBundling !== false
        )

        setAvailableProducts(bundleableProducts)
      } catch (error) {
        console.error('Error fetching products:', error)
        toast.error('Failed to load available products')
      }
    }

    fetchProducts()
  }, [])

  // Update regular price when selected products change
  useEffect(() => {
    const total = availableProducts
      .filter(product => selectedProducts.includes(product.id))
      .reduce((sum, product) => {
        const price = product.variants[0]?.prices[0]?.amount || 0
        return sum + price
      }, 0) / 100

    setRegularPrice(total)
    
    // If no custom price is set, default to 10% off
    if (!watchPrice) {
      setValue('price', Math.round(total * 0.9 * 100) / 100)
    }
  }, [selectedProducts, availableProducts, setValue, watchPrice])

  const handleProductSelect = (productId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProducts(prev => [...prev, productId])
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId))
    }
  }

  const onSubmit = async (data: BundleFormData) => {
    if (selectedProducts.length < 2) {
      toast.error('Please select at least 2 products for the bundle')
      return
    }

    setIsSubmitting(true)

    try {
      // Create the bundle as a product in Medusa
      const { product } = await sdk.admin.products.create({
        title: data.title,
        description: data.description,
        type: { id: 'bundle' },
        variants: [
          {
            title: data.title,
            prices: [{ amount: data.price * 100, currency_code: 'usd' }],
            inventory_quantity: 9999, // Digital bundles have unlimited inventory
          },
        ],
        status: 'published',
        metadata: {
          isBundle: true,
          bundledProducts: selectedProducts,
          regularPrice: regularPrice,
          discount: Math.round((regularPrice - data.price) * 100) / 100,
          discountPercentage: Math.round((1 - data.price / regularPrice) * 100),
        },
      })

      // Upload thumbnail if provided
      if (data.thumbnail?.length) {
        const thumbnailFormData = new FormData()
        thumbnailFormData.append('file', data.thumbnail[0])
        thumbnailFormData.append('productId', product.id)

        await fetch('/api/product-images/upload', {
          method: 'POST',
          body: thumbnailFormData,
        })
      }

      toast.success('Bundle created successfully')
      router.push('/account/seller/bundles')
    } catch (error) {
      console.error('Error creating bundle:', error)
      toast.error('Failed to create bundle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const discountPercentage = regularPrice > 0 
    ? Math.round((1 - (watchPrice || 0) / regularPrice) * 100) 
    : 0

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Asset Bundle</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Bundle Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter bundle title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe what's included in this bundle"
              rows={5}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="thumbnail">Bundle Thumbnail</Label>
            <Input
              id="thumbnail"
              type="file"
              accept="image/*"
              {...register('thumbnail')}
            />
            <p className="text-gray-500 text-sm mt-1">
              Upload an image to represent this bundle
            </p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Select Assets for Bundle</h2>
          <p className="text-gray-500 mb-4">
            Select at least 2 assets to include in this bundle. The regular price will be calculated automatically.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {availableProducts.map((product) => {
              const price = product.variants[0]?.prices[0]?.amount || 0
              const isSelected = selectedProducts.includes(product.id)
              
              return (
                <Card key={product.id} className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="flex">
                    {product.thumbnail && (
                      <div className="w-24 h-24 relative flex-shrink-0">
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <CardContent className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{product.title}</h3>
                          <p className="text-sm text-gray-500">${(price / 100).toFixed(2)}</p>
                        </div>
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => handleProductSelect(product.id, checked as boolean)}
                        />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )
            })}
          </div>
          
          {selectedProducts.length === 0 && (
            <p className="text-amber-500 mb-4">Please select at least 2 assets for your bundle</p>
          )}
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <span>Regular Price:</span>
              <span>${regularPrice.toFixed(2)}</span>
            </div>
            
            <div>
              <Label htmlFor="price">Bundle Price (USD)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  placeholder="0.00"
                  className={errors.price ? 'border-red-500' : ''}
                />
                <div className="text-sm">
                  {discountPercentage > 0 ? (
                    <span className="text-green-600 font-medium">{discountPercentage}% off</span>
                  ) : (
                    <span className="text-gray-500">No discount</span>
                  )}
                </div>
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting || selectedProducts.length < 2}>
          {isSubmitting ? 'Creating Bundle...' : 'Create Bundle'}
        </Button>
      </form>
    </div>
  )
}
