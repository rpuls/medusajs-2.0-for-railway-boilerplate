'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { ContentService } from '@/lib/services/content-service'
import { sdk } from '@/lib/config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

// Define the form data type
type AssetFormData = {
  title: string
  description: string
  price: number
  engineType: 'unity' | 'godot' | 'unreal' | 'other'
  assetType: '3d' | 'audio' | 'brushes' | 'sprites' | 'materials' | 'addons' | 'templates' | 'other'
  pricingType: 'free' | 'paid' | 'demo'
  categoryId: string
  tags: string
  mainFile: FileList
  previewImages: FileList
  version: string
  changelog: string
  allowBundling: boolean
  externalLink?: string
}

export default function AssetUploadForm() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState('basic')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AssetFormData>()

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await ContentService.getAllCategories()
        setCategories(fetchedCategories)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true)

    try {
      // 1. Create the product in Medusa
      const { product } = await sdk.admin.products.create({
        title: data.title,
        description: data.description,
        categories: [data.categoryId],
        tags: data.tags.split(',').map(tag => tag.trim()),
        type: { id: data.assetType },
        options: [{ title: 'Engine' }],
        variants: [
          {
            title: `${data.title} - ${data.engineType}`,
            prices: [{ amount: data.price * 100, currency_code: 'usd' }],
            options: [{ value: data.engineType }],
            inventory_quantity: 9999, // Digital assets have unlimited inventory
          },
        ],
        status: 'draft', // Start as draft until approved
        metadata: {
          engineType: data.engineType,
          assetType: data.assetType,
          pricingType: data.pricingType,
          version: data.version,
          allowBundling: data.allowBundling,
          externalLink: data.externalLink,
        },
      })

      // 2. Upload the main file
      const mainFileFormData = new FormData()
      mainFileFormData.append('file', data.mainFile[0])
      mainFileFormData.append('productId', product.id)

      const assetResponse = await fetch('/api/assets/upload', {
        method: 'POST',
        body: mainFileFormData,
      })

      if (!assetResponse.ok) {
        throw new Error('Failed to upload main asset file')
      }

      // 3. Upload preview images
      const imagePromises = Array.from(data.previewImages).map(async (image) => {
        const imageFormData = new FormData()
        imageFormData.append('file', image)
        imageFormData.append('productId', product.id)

        return fetch('/api/product-images/upload', {
          method: 'POST',
          body: imageFormData,
        })
      })

      await Promise.all(imagePromises)

      // 4. Create changelog entry
      if (data.version && data.changelog) {
        await fetch('/api/changelogs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
            version: data.version,
            changes: data.changelog,
          }),
        })
      }

      toast.success('Asset submitted for review')
      router.push('/account/seller/assets')
    } catch (error) {
      console.error('Error submitting asset:', error)
      toast.error('Failed to submit asset')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload New Asset</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="files">Files & Images</TabsTrigger>
            <TabsTrigger value="categorization">Categorization</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter asset title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                placeholder="Describe your asset in detail"
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { required: 'Price is required', min: 0 })}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="pricingType">Pricing Type</Label>
              <Controller
                name="pricingType"
                control={control}
                defaultValue="paid"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="demo">Demo Available</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <Button type="button" onClick={() => setCurrentTab('files')}>
              Next: Files & Images
            </Button>
          </TabsContent>
          
          <TabsContent value="files" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="mainFile">Main Asset File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Drag and drop your file here, or click to browse</p>
                <Input
                  id="mainFile"
                  type="file"
                  {...register('mainFile', { required: 'Main file is required' })}
                  className={errors.mainFile ? 'border-red-500' : ''}
                />
              </div>
              {errors.mainFile && <p className="text-red-500 text-sm mt-1">{errors.mainFile.message}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Max file size: 1GB. Supported formats depend on asset type.
              </p>
            </div>
            
            <div>
              <Label htmlFor="previewImages">Preview Images</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">Drag and drop your images here, or click to browse</p>
                <Input
                  id="previewImages"
                  type="file"
                  multiple
                  accept="image/*"
                  {...register('previewImages', { required: 'Preview images are required' })}
                  className={errors.previewImages ? 'border-red-500' : ''}
                />
              </div>
              {errors.previewImages && <p className="text-red-500 text-sm mt-1">{errors.previewImages.message}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Upload at least one preview image. Max 5 images. JPG, PNG formats.
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentTab('basic')}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentTab('categorization')}>
                Next: Categorization
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="categorization" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="engineType">Engine Type</Label>
              <Controller
                name="engineType"
                control={control}
                defaultValue="unity"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unity">Unity</SelectItem>
                      <SelectItem value="godot">Godot</SelectItem>
                      <SelectItem value="unreal">Unreal Engine</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="assetType">Asset Type</Label>
              <Controller
                name="assetType"
                control={control}
                defaultValue="3d"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3d">3D Models</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="brushes">Brushes</SelectItem>
                      <SelectItem value="sprites">Sprites</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="addons">Addons</SelectItem>
                      <SelectItem value="templates">Templates</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div>
              <Label htmlFor="categoryId">Category</Label>
              <Controller
                name="categoryId"
                control={control}
                defaultValue=""
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="e.g. fantasy, medieval, low-poly"
              />
              <p className="text-gray-500 text-sm mt-1">
                Add relevant tags to help users find your asset
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentTab('files')}>
                Back
              </Button>
              <Button type="button" onClick={() => setCurrentTab('additional')}>
                Next: Additional Info
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="additional" className="space-y-4 pt-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                {...register('version')}
                placeholder="e.g. 1.0"
              />
            </div>
            
            <div>
              <Label htmlFor="changelog">Changelog</Label>
              <Textarea
                id="changelog"
                {...register('changelog')}
                placeholder="Initial release"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Controller
                name="allowBundling"
                control={control}
                defaultValue={true}
                render={({ field }) => (
                  <Checkbox
                    id="allowBundling"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="allowBundling">
                Allow this asset to be included in bundles
              </Label>
            </div>
            
            <div>
              <Label htmlFor="externalLink">External Link (optional)</Label>
              <Input
                id="externalLink"
                {...register('externalLink')}
                placeholder="e.g. GitHub repository URL"
              />
              <p className="text-gray-500 text-sm mt-1">
                Link to external resources like GitHub for open source assets
              </p>
            </div>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setCurrentTab('categorization')}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
