'use client'

import dynamic from 'next/dynamic'

// Client Component wrapper for newsletter (ssr: false)
const NewsletterLazy = dynamic(
  () => import('@modules/home/components/newsletter'),
  {
    ssr: false,
  }
)

export default function NewsletterWrapper() {
  return <NewsletterLazy />
}

