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

// Function to fetch post data from Payload CMS
async function getPost(slug: string) {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'
    const response = await fetch(`${payloadUrl}/api/posts?where[slug][equals]=${slug}&depth=2`, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.meta?.title || post.title,
    description: post.meta?.description,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  // Format the date
  const publishDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          {publishDate && (
            <div className="text-gray-600 mb-4">
              Published on {publishDate}
            </div>
          )}
          
          {post.authors && post.authors.length > 0 && (
            <div className="flex items-center mb-6">
              <div className="mr-4">By</div>
              <div className="flex">
                {post.authors.map((author: any, index: number) => (
                  <div key={author.id} className="flex items-center mr-4">
                    {author.photo && author.photo.url && (
                      <div className="relative w-10 h-10 mr-2">
                        <Image 
                          src={author.photo.url} 
                          alt={author.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <span>{author.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {post.meta?.image && post.meta.image.url && (
            <div className="relative w-full h-96 mb-8">
              <Image 
                src={post.meta.image.url} 
                alt={post.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
          )}
        </header>
        
        <div className="prose max-w-none">
          {post.content && <RichText content={post.content} />}
        </div>
        
        {post.categories && post.categories.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {post.categories.map((category: any) => (
                <a 
                  key={category.id}
                  href={`/blog/category/${category.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {post.relatedPosts.map((relatedPost: any) => (
                <a 
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {relatedPost.meta?.image && relatedPost.meta.image.url && (
                    <div className="relative w-full h-48">
                      <Image 
                        src={relatedPost.meta.image.url} 
                        alt={relatedPost.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{relatedPost.title}</h3>
                    {relatedPost.publishedAt && (
                      <p className="text-gray-600 text-sm mt-1">
                        {new Date(relatedPost.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
      
      {/* Add RefreshRouteOnSave for live preview */}
      <RefreshRouteOnSave />
    </div>
  )
}
