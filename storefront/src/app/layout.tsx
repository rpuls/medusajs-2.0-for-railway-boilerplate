import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import "styles/globals.css"
import { MuiProviders } from "./mui-providers"

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""
  const backendHost = backendUrl ? new URL(backendUrl).origin : ""
  
  return (
    <html lang="en" data-mode="light" className={inter.variable}>
      <head>
        {/* Resource hints for faster connections */}
        {backendHost && (
          <>
            <link rel="preconnect" href={backendHost} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={backendHost} />
          </>
        )}
        {/* Preconnect to common CDNs */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for image CDNs */}
        <link rel="dns-prefetch" href="https://medusa-public-images.s3.eu-west-1.amazonaws.com" />
        <link rel="dns-prefetch" href="https://bucket-production-a1ba.up.railway.app" />
        {process.env.NEXT_PUBLIC_MINIO_ENDPOINT && (
          <link rel="dns-prefetch" href={`https://${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}`} />
        )}
      </head>
      <body>
        <MuiProviders>
          <main className="relative">{props.children}</main>
        </MuiProviders>
      </body>
    </html>
  )
}
