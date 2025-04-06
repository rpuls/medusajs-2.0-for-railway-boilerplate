import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Parse query string parameters
  const searchParams = request.nextUrl.searchParams
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')
  const collection = searchParams.get('collection')

  // Check the secret and slug
  if (secret !== process.env.PAYLOAD_PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  if (!slug) {
    return NextResponse.json({ message: 'Missing slug parameter' }, { status: 400 })
  }

  // Enable Draft Mode
  draftMode().enable()

  // Determine the redirect URL based on the collection
  let redirectUrl = '/'
  
  if (collection === 'pages') {
    redirectUrl = `/${slug}`
  } else if (collection === 'posts') {
    redirectUrl = `/blog/${slug}`
  } else if (collection === 'sellers') {
    redirectUrl = `/sellers/${slug}`
  } else if (collection === 'assets') {
    redirectUrl = `/marketplace/${slug}`
  }

  // Redirect to the path
  redirect(redirectUrl)
}
