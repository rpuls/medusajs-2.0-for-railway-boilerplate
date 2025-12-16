/**
 * Strips HTML tags from a string and converts it to plain text
 * Handles common HTML elements like lists, paragraphs, etc.
 * 
 * @param html - HTML string to convert to plain text
 * @returns Plain text string without HTML tags
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return ""
  }

  // Convert HTML lists to readable text format
  // Replace <ul><li>...</li></ul> with bullet points
  let text = html
    // Replace <ul> and </ul> tags
    .replace(/<\/?ul[^>]*>/gi, "")
    // Replace <ol> and </ol> tags
    .replace(/<\/?ol[^>]*>/gi, "")
    // Replace <li> with " • " and </li> with newline
    .replace(/<li[^>]*>/gi, " • ")
    .replace(/<\/li>/gi, "\n")
    // Replace <p> tags with double newline
    .replace(/<p[^>]*>/gi, "\n\n")
    .replace(/<\/p>/gi, "")
    // Replace <br> and <br/> with newline
    .replace(/<br\s*\/?>/gi, "\n")
    // Replace <div> tags with newline
    .replace(/<div[^>]*>/gi, "\n")
    .replace(/<\/div>/gi, "")
    // Replace <span> tags (remove them)
    .replace(/<\/?span[^>]*>/gi, "")
    // Replace other common block elements
    .replace(/<\/?h[1-6][^>]*>/gi, "\n")
    .replace(/<\/?strong[^>]*>/gi, "")
    .replace(/<\/?b[^>]*>/gi, "")
    .replace(/<\/?em[^>]*>/gi, "")
    .replace(/<\/?i[^>]*>/gi, "")
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Clean up multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Clean up multiple spaces
    .replace(/[ \t]{2,}/g, " ")
    // Trim whitespace
    .trim()

  return text
}

/**
 * Converts HTML description to a plain text meta description
 * Optimized for SEO (120-160 characters recommended)
 * 
 * @param html - HTML string to convert
 * @param maxLength - Maximum length for the description (default: 160)
 * @returns Plain text description optimized for meta tags
 */
export function htmlToMetaDescription(
  html: string | null | undefined,
  maxLength: number = 160
): string {
  const plainText = stripHtml(html)
  
  if (!plainText) {
    return ""
  }

  // If text is within limit, return as-is
  if (plainText.length <= maxLength) {
    return plainText
  }

  // Truncate at word boundary
  const truncated = plainText.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(" ")
  
  if (lastSpace > maxLength * 0.7) {
    // If we found a space reasonably close to the end, cut there
    return truncated.substring(0, lastSpace) + "..."
  }
  
  // Otherwise, just cut at maxLength
  return truncated + "..."
}

