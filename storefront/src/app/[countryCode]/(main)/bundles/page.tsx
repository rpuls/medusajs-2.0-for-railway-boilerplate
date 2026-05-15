import { Metadata } from "next"
import { listBundles } from "@lib/data/bundles"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import BundleIndex from "@modules/bundles/templates/bundle-index"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/bundles`
  const description =
    "Pre-configured uniform packs for tradies, crews, and businesses — everything you need, sorted in one order."

  return {
    title: "Uniform Bundles",
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Uniform Bundles | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

export default async function BundlesPage() {
  const bundles = await listBundles()
  return <BundleIndex bundles={bundles} />
}
