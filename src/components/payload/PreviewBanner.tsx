'use client'

import React from 'react'
import Link from 'next/link'

interface PreviewBannerProps {
  redirectPath?: string
}

export const PreviewBanner: React.FC<PreviewBannerProps> = ({ 
  redirectPath = '/' 
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-white py-2 px-4 z-50 flex justify-between items-center">
      <div className="flex items-center">
        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
        <span>Preview Mode</span>
      </div>
      <Link 
        href={`/api/payload/exit-preview?redirect=${encodeURIComponent(redirectPath)}`}
        className="bg-white text-black px-3 py-1 rounded text-sm hover:bg-gray-200 transition-colors"
      >
        Exit Preview
      </Link>
    </div>
  )
}

export default PreviewBanner
