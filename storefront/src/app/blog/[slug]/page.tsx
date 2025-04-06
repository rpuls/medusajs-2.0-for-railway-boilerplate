import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ContentService } from '@/lib/services/content-service'
import { BlogPostRenderer } from '@/modules/content/components/blog-post-renderer'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await ContentService.getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The blog post you are looking for does not exist.',
    }
  }

  return {
    title: post.meta?.title || post.title,
    description: post.meta?.description || '',
    openGraph: post.featuredImage
      ? {
          images: [{ url: post.featuredImage.url, width: 1200, height: 630, alt: post.title }],
        }
      : undefined,
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await ContentService.getBlogPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div>
      <BlogPostRenderer post={post} />
    </div>
  )
}

export async function generateStaticParams() {
  const posts = await ContentService.getAllBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
