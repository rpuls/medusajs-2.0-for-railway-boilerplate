import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { draftMode } from "next/headers"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

// Import the components dynamically to avoid SSR issues
const RefreshRouteOnSave = dynamic(
  () => import("@/components/payload/RefreshRouteOnSave"),
  { ssr: false }
)

const PreviewBanner = dynamic(
  () => import("@/components/payload/PreviewBanner"),
  { ssr: false }
)

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <html lang="en" data-mode="light">
      <body>
        <main className="relative">
          {props.children}
          {isDraftMode && (
            <>
              <RefreshRouteOnSave />
              <PreviewBanner />
            </>
          )}
        </main>
      </body>
    </html>
  )
}
