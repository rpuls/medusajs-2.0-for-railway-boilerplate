'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ContentService } from '@/lib/services/content-service'

type SellerProfileData = {
  name: string
  biography: string
  email: string
  website?: string
  twitter?: string
  instagram?: string
  github?: string
  allowCommissions: boolean
  commissionInfo?: string
}

export function SellerProfileEditor() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SellerProfileData>()

  const watchAllowCommissions = watch('allowCommissions')

  // Fetch seller profile data on component mount
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        // In a real implementation, you would fetch the seller's profile
        // const sellerProfile = await ContentService.getSellerProfile(sellerId)
        
        // For now, we'll use mock data
        const mockProfile = {
          name: 'Creative Digital Studio',
          biography: 'We create high-quality digital assets for game developers, designers, and creative professionals. Our team has over 10 years of experience in the industry.',
          email: 'contact@creativedigitalstudio.com',
          website: 'https://creativedigitalstudio.com',
          twitter: 'creativedigital',
          instagram: 'creativedigitalstudio',
          github: 'creativedigital',
          allowCommissions: true,
          commissionInfo: 'We accept commissions for custom 3D models and game assets. Please contact us with your requirements.',
          profileImageUrl: 'https://via.placeholder.com/150',
          bannerImageUrl: 'https://via.placeholder.com/1200x300',
        }
        
        // Set form values
        Object.entries(mockProfile).forEach(([key, value]) => {
          if (key !== 'profileImageUrl' && key !== 'bannerImageUrl') {
            setValue(key as keyof SellerProfileData, value)
          }
        })
        
        // Set image previews
        setProfileImagePreview(mockProfile.profileImageUrl)
        setBannerImagePreview(mockProfile.bannerImageUrl)
      } catch (error) {
        console.error('Error fetching seller profile:', error)
        toast.error('Failed to load seller profile')
      }
    }

    fetchSellerProfile()
  }, [setValue])

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setProfileImagePreview(URL.createObjectURL(file))
    }
  }

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setBannerImage(file)
      setBannerImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (data: SellerProfileData) => {
    setIsSubmitting(true)

    try {
      // Create FormData for image uploads
      const formData = new FormData()
      
      // Append profile data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value?.toString() || '')
      })
      
      // Append images if they exist
      if (profileImage) {
        formData.append('profileImage', profileImage)
      }
      
      if (bannerImage) {
        formData.append('bannerImage', bannerImage)
      }
      
      // In a real implementation, you would send this to your API
      // await fetch('/api/seller/profile', {
      //   method: 'PUT',
      //   body: formData,
      // })
      
      // For now, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating seller profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Images</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="profileImage" className="block mb-2">Profile Image</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                    {profileImagePreview && (
                      <Image
                        src={profileImagePreview}
                        alt="Profile"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Recommended: 500x500px, max 2MB
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bannerImage" className="block mb-2">Banner Image</Label>
                <div className="space-y-2">
                  <div className="relative w-full h-32 rounded-md overflow-hidden bg-gray-200">
                    {bannerImagePreview && (
                      <Image
                        src={bannerImagePreview}
                        alt="Banner"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </div>
                  <Input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerImageChange}
                  />
                  <p className="text-gray-500 text-sm">
                    Recommended: 1200x300px, max 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="block mb-2">Store Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Store name is required' })}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="email" className="block mb-2">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="biography" className="block mb-2">Biography</Label>
              <Textarea
                id="biography"
                {...register('biography', { required: 'Biography is required' })}
                rows={5}
                className={errors.biography ? 'border-red-500' : ''}
              />
              {errors.biography && <p className="text-red-500 text-sm mt-1">{errors.biography.message}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Tell customers about yourself and your work. This will appear on your seller profile page.
              </p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Social Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website" className="block mb-2">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://"
                  {...register('website')}
                />
              </div>
              
              <div>
                <Label htmlFor="twitter" className="block mb-2">Twitter</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    @
                  </span>
                  <Input
                    id="twitter"
                    className="rounded-l-none"
                    placeholder="username"
                    {...register('twitter')}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="instagram" className="block mb-2">Instagram</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    @
                  </span>
                  <Input
                    id="instagram"
                    className="rounded-l-none"
                    placeholder="username"
                    {...register('instagram')}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="github" className="block mb-2">GitHub</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    @
                  </span>
                  <Input
                    id="github"
                    className="rounded-l-none"
                    placeholder="username"
                    {...register('github')}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Commissions</h2>
            
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="allowCommissions"
                checked={watchAllowCommissions}
                onCheckedChange={(checked) => setValue('allowCommissions', checked)}
              />
              <Label htmlFor="allowCommissions">Accept commission requests</Label>
            </div>
            
            {watchAllowCommissions && (
              <div>
                <Label htmlFor="commissionInfo" className="block mb-2">Commission Information</Label>
                <Textarea
                  id="commissionInfo"
                  {...register('commissionInfo')}
                  rows={3}
                  placeholder="Describe what types of commissions you accept, pricing, timeline, etc."
                />
                <p className="text-gray-500 text-sm mt-1">
                  This information will be visible to customers who want to request custom work.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
