'use client'

import React from 'react'

interface RichTextProps {
  content: any
}

export const RichText: React.FC<RichTextProps> = ({ content }) => {
  if (!content) return null

  // Simple implementation - in a real app, you'd want to properly parse the rich text
  // and render it with appropriate components
  return (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
  )
}

export default RichText
