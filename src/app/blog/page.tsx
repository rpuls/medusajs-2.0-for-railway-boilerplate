import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

// Function to fetch posts from Payload CMS
async function getPosts(page = 1, limit = 10) {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'
    const response = await fetch(
      `${payloadUrl}/api/posts?limit=${limit}&page=${page}&sort=-publishedAt&where[_status][equals]=published&depth=1`, 
      {
        next: { revalidate: 10 }, // Cache for 10 seconds
      }
    )

    if (!response.ok) {
      return { docs: [], totalPages: 0, page: 1 }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { docs: [], totalPages: 0, page: 1 }
  }
}

export const metadata: Metadata = {
  title: 'Blog | Marketplace',
  description: 'Latest news, updates, and articles from our marketplace',
}

export default async function BlogPage({ 
  searchParams 
}: { 
  searchParams: { page?: string } 
}) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  const { docs: posts, totalPages } = await getPosts(currentPage)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <Link 
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.meta?.image && post.meta.image.url && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={post.meta.image.url} 
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  {post.publishedAt && (
                    <p className="text-gray-600 text-sm mb-2">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  {post.meta?.description && (
                    <p className="text-gray-700">{post.meta.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {currentPage > 1 && (
                  <Link
                    href={`/blog?page=${currentPage - 1}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    href={`/blog?page=${page}`}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      currentPage === page
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    } text-sm font-medium`}
                  >
                    {page}
                  </Link>
                ))}
                
                {currentPage < totalPages && (
                  <Link
                    href={`/blog?page=${currentPage + 1}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </nav>
            </div>
          )}
        </>
      ) : (
        <p>No blog posts found.</p>
      )}
    </div>
  )
}
