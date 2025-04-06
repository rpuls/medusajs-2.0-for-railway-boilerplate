'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type ReviewFormProps = {
  productId: string
  orderId?: string // Optional: to verify purchase
}

type ReviewFormData = {
  rating: number
  content: string
}

export default function ReviewForm({ productId, orderId }: ReviewFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>()

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          content: data.content,
          order_id: orderId, // Include order ID if available to verify purchase
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      toast.success('Review submitted successfully')
      router.refresh() // Refresh the page to show the new review
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="rating" className="block mb-2">Rating</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="text-2xl focus:outline-none"
              >
                {star <= (hoveredRating || rating) ? '★' : '☆'}
              </button>
            ))}
          </div>
          {rating === 0 && <p className="text-red-500 text-sm mt-1">Please select a rating</p>}
        </div>
        
        <div>
          <Label htmlFor="content" className="block mb-2">Your Review</Label>
          <Textarea
            id="content"
            {...register('content', { required: 'Please write your review' })}
            placeholder="Share your experience with this asset..."
            rows={5}
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>
        
        {orderId && (
          <div className="bg-green-50 p-3 rounded-md text-sm text-green-700">
            <span className="font-medium">Verified Purchase</span> - Your review will be marked as a verified purchase.
          </div>
        )}
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  )
}
