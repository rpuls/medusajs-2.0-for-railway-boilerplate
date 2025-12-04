import { revalidateTag, revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/revalidate
 * Force revalidation of Next.js ISR cache
 * 
 * Usage:
 *   POST /api/revalidate?tag=products&secret=YOUR_SECRET
 *   POST /api/revalidate?path=/&secret=YOUR_SECRET
 * 
 * Query params:
 *   - tag: Cache tag to revalidate (e.g., "products")
 *   - path: Path to revalidate (e.g., "/" or "/us/store")
 *   - secret: Secret token to prevent unauthorized access
 */
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get("secret")
  const tag = searchParams.get("tag")
  const path = searchParams.get("path")

  // Check for secret token to prevent unauthorized access
  const expectedSecret = process.env.REVALIDATE_SECRET || "your-secret-token"
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { message: "Invalid secret token" },
      { status: 401 }
    )
  }

  try {
    if (tag) {
      // Revalidate by cache tag
      revalidateTag(tag)
      return NextResponse.json({
        revalidated: true,
        tag,
        now: Date.now(),
      })
    }

    if (path) {
      // Revalidate by path
      revalidatePath(path)
      return NextResponse.json({
        revalidated: true,
        path,
        now: Date.now(),
      })
    }

    // If neither tag nor path specified, revalidate common tags
    revalidateTag("products")
    revalidateTag("regions")
    revalidatePath("/")
    
    return NextResponse.json({
      revalidated: true,
      message: "Revalidated products, regions, and homepage",
      now: Date.now(),
    })
  } catch (err) {
    return NextResponse.json(
      { message: "Error revalidating cache", error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}















