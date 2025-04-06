import React from 'react'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Import the RefreshRouteOnSave component dynamically to avoid SSR issues
const RefreshRouteOnSave = dynamic(
  () => import("@/components/payload/RefreshRouteOnSave"),
  { ssr: false }
)

// Import the ContentRenderer component
const ContentRenderer = dynamic(
  () => import("@/components/payload/ContentRenderer"),
  { ssr: true }
)

// Function to fetch page data from Payload CMS
async function getPage(slug: string) {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'
    const response = await fetch(`${payloadUrl}/api/pages?where[slug][equals]=${slug}&depth=2`, {
      next: { revalidate: 10 }, // Cache for 10 seconds
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await getPage(params.slug)

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description,
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug)

  if (!page) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      
      {/* Render hero section if it exists */}
      {page.hero && (
        <ContentRenderer content={page.hero} type="hero" />
      )}
      
      {/* Render content sections */}
      {page.sections && page.sections.map((section: any, index: number) => (
        <ContentRenderer 
          key={index} 
          content={section} 
          type={section.blockType} 
        />
      ))}
      
      {/* Add RefreshRouteOnSave for live preview */}
      <RefreshRouteOnSave />
    </div>
  )
}
