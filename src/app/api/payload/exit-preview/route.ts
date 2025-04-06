import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  // Exit the draft mode
  draftMode().disable()

  // Get the redirect path from the query string
  const searchParams = request.nextUrl.searchParams
  const redirectPath = searchParams.get('redirect') || '/'

  // Redirect to the path
  redirect(redirectPath)
}
