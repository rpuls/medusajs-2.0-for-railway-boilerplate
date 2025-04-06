/**
 * Generates a preview path for Payload CMS content
 */
export const generatePreviewPath = ({ 
  collection, 
  slug 
}: { 
  collection: string
  slug: string 
}) => {
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    secret: process.env.PAYLOAD_PREVIEW_SECRET || 'your-preview-secret-key',
  })

  return `/api/payload/preview?${encodedParams.toString()}`
}
