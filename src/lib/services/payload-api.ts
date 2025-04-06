/**
 * Service for interacting with the Payload CMS API
 */

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001'

/**
 * Fetch a page by slug
 */
export async function getPageBySlug(slug: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/pages?where[slug][equals]=${slug}&depth=2`,
      { next: { revalidate: 10 } }
    )
    
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

/**
 * Fetch a post by slug
 */
export async function getPostBySlug(slug: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/posts?where[slug][equals]=${slug}&depth=2`,
      { next: { revalidate: 10 } }
    )
    
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

/**
 * Fetch posts with pagination
 */
export async function getPosts(page = 1, limit = 10, options: any = {}) {
  const { sort = '-publishedAt', where = {} } = options
  
  // Ensure we only get published posts by default
  const whereQuery = {
    ...where,
    _status: { equals: 'published' },
  }
  
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      sort,
      depth: '1',
      where: JSON.stringify(whereQuery),
    })
    
    const response = await fetch(
      `${PAYLOAD_URL}/api/posts?${queryParams.toString()}`,
      { next: { revalidate: 10 } }
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

/**
 * Fetch a seller by slug
 */
export async function getSellerBySlug(slug: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/sellers?where[slug][equals]=${slug}&depth=2`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching seller:', error)
    return null
  }
}

/**
 * Fetch categories
 */
export async function getCategories(limit = 100, options: any = {}) {
  const { sort = 'displayOrder', where = {} } = options
  
  try {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      sort,
      depth: '1',
      where: JSON.stringify(where),
    })
    
    const response = await fetch(
      `${PAYLOAD_URL}/api/asset-categories?${queryParams.toString()}`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Fetch a category by slug
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/asset-categories?where[slug][equals]=${slug}&depth=2`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

/**
 * Fetch tags
 */
export async function getTags(limit = 100) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/tags?limit=${limit}&depth=1`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.docs || []
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

/**
 * Fetch a tag by slug
 */
export async function getTagBySlug(slug: string) {
  try {
    const response = await fetch(
      `${PAYLOAD_URL}/api/tags?where[slug][equals]=${slug}&depth=1`,
      { next: { revalidate: 10 } }
    )
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.docs[0] || null
  } catch (error) {
    console.error('Error fetching tag:', error)
    return null
  }
}
