import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ContentService } from '@/lib/services/content-service'
import { LandingPageRenderer } from '@/modules/content/components/landing-page-renderer'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await ContentService.getLandingPage(params.slug)

  if (!page) {
    return {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist.',
    }
  }

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || '',
    openGraph: page.seo?.image
      ? {
          images: [{ url: page.seo.image.url, width: 1200, height: 630, alt: page.seo.title || page.title }],
        }
      : undefined,
  }
}

export default async function LandingPage({ params }: { params: { slug: string } }) {
  const page = await ContentService.getLandingPage(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div>
      <LandingPageRenderer page={page} />
    </div>
  )
}

export async function generateStaticParams() {
  const pages = await ContentService.getAllLandingPages()

  return pages.map((page) => ({
    slug: page.slug,
  }))
}
