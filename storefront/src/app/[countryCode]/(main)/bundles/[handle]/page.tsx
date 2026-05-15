import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBundleByHandle } from "@lib/data/bundles"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import BundleDetail from "@modules/bundles/templates/bundle-detail"

type Params = {
  params: Promise<{ countryCode: string; handle: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { countryCode, handle } = await params
  const bundle = await getBundleByHandle(handle)
  if (!bundle) return { title: "Bundle" }

  const canonicalPath = `/${countryCode}/bundles/${handle}`
  const description =
    bundle.subtitle ??
    `${bundle.title} — a curated uniform pack for tradies and crews.`

  return {
    title: bundle.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `${bundle.title} | ${SEO.siteName}`,
      description,
      images: bundle.thumbnail_url
        ? [{ url: bundle.thumbnail_url }]
        : [SEO.ogImage],
    },
  }
}

export default async function BundlePage({ params }: Params) {
  const { handle } = await params
  const bundle = await getBundleByHandle(handle)
  if (!bundle) notFound()

  return <BundleDetail bundle={bundle} />
}
