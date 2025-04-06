import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ContentService } from '@/lib/services/content-service'
import { formatDistance } from 'date-fns'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read the latest news and updates from our team.',
}

export default async function BlogIndex() {
  const posts = await ContentService.getAllBlogPosts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {post.featuredImage && (
                <div className="relative w-full h-48">
                  <Image
                    src={post.featuredImage.url}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                {post.publishedAt && (
                  <div className="text-gray-500 text-sm mb-2">
                    {formatDistance(new Date(post.publishedAt), new Date(), { addSuffix: true })}
                  </div>
                )}
                {post.excerpt && <p className="text-gray-700">{post.excerpt}</p>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts found.</p>
        </div>
      )}
    </div>
  )
}
