import { Metadata } from "next"
import { draftMode } from "next/headers"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import { getBaseURL } from "@lib/util/env"

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

export default async function PageLayout(props: { children: React.ReactNode }) {
  const { isEnabled: isDraftMode } = await draftMode()

  return (
    <>
      <Nav />
      {props.children}
      {isDraftMode && (
        <>
          <RefreshRouteOnSave />
          <PreviewBanner />
        </>
      )}
      <Footer />
    </>
  )
}
