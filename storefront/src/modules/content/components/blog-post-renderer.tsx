'use client'

import React from 'react'
import Image from 'next/image'
import { formatDistance } from 'date-fns'

interface BlogPostProps {
  post: any // Type this properly based on your Payload schema
}

export const BlogPostRenderer: React.FC<BlogPostProps> = ({ post }) => {
  if (!post) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
        
        {post.publishedAt && (
          <div className="text-gray-500 mb-6">
            Published {formatDistance(new Date(post.publishedAt), new Date(), { addSuffix: true })}
          </div>
        )}
        
        {post.featuredImage && (
          <div className="relative w-full h-[400px] mb-8">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
              priority
            />
          </div>
        )}
        
        {post.content && (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
        )}
        
        {post.author && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center">
              {post.author.photo ? (
                <div className="relative w-12 h-12 mr-4">
                  <Image
                    src={post.author.photo.url}
                    alt={post.author.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-full"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              )}
              <div>
                <div className="font-medium">{post.author.name}</div>
                {post.author.bio && <div className="text-gray-500 text-sm">{post.author.bio}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
