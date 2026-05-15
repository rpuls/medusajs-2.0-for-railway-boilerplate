import { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { getGraphSummary } from "@lib/data/graph"
import { buildAbsoluteUrl, SEO } from "@lib/util/seo"
import { ExploreTemplate } from "@modules/graph/templates/explore-template"
import type { GraphPayload } from "../../../../types/graph"

type MetadataProps = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { countryCode } = await params
  const canonicalPath = `/${countryCode}/explore`
  const description =
    "Explore our catalog as an interactive graph of brands, categories, and products — discover related items visually."

  return {
    title: "Explore the catalog",
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: buildAbsoluteUrl(canonicalPath),
      title: `Explore the catalog | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
    twitter: {
      title: `Explore the catalog | ${SEO.siteName}`,
      description,
      images: [SEO.ogImage],
    },
  }
}

type PageProps = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * Async server component that fetches the graph summary and renders the graph.
 * Lives inside a Suspense boundary so the page shell streams immediately while
 * the summary is being fetched — eliminating the blank-screen wait on cache miss.
 */
async function ExploreGraphData({
  countryCode,
  search,
}: {
  countryCode: string
  search: Record<string, string | string[] | undefined>
}) {
  const summaryResult = await getGraphSummary()
    .then((payload): { ok: true; payload: GraphPayload } => ({ ok: true, payload }))
    .catch(
      (error: unknown): { ok: false; error: string } => ({
        ok: false,
        error: error instanceof Error ? error.message : "unknown error",
      })
    )

  if (!summaryResult.ok) {
    return (
      <div className="content-container py-16 flex flex-col items-start gap-4">
        <h1 className="text-2xl font-semibold text-ui-fg-base">
          Explore the catalog
        </h1>
        <p className="text-ui-fg-subtle max-w-prose">
          The interactive graph can&rsquo;t reach the catalog service right now.
          This usually means the Medusa backend hasn&rsquo;t finished redeploying
          with the new <code>/store/graph</code> route, or the storefront
          environment is pointing at a different backend.
        </p>
        <details className="text-xs text-ui-fg-muted max-w-prose">
          <summary className="cursor-pointer">Technical details</summary>
          <pre className="whitespace-pre-wrap mt-2">{summaryResult.error}</pre>
        </details>
        <Link
          href={`/${countryCode}/brands`}
          className="text-ui-fg-interactive hover:underline"
        >
          Browse brands instead
        </Link>
      </div>
    )
  }

  const focusRaw = search?.focus
  const focus = Array.isArray(focusRaw) ? focusRaw[0] : focusRaw
  const initialFocus = typeof focus === "string" && focus.length ? focus : null

  return (
    <ExploreTemplate
      initialPayload={summaryResult.payload}
      initialFocus={initialFocus}
    />
  )
}

function GraphLoadingShell() {
  return (
    <section className="relative h-[calc(100vh-var(--nav-height,72px))] w-full overflow-hidden bg-ui-bg-base flex items-center justify-center">
      <p className="text-ui-fg-subtle text-small-regular animate-pulse">
        Loading catalog&hellip;
      </p>
    </section>
  )
}

export default async function ExplorePage({ params, searchParams }: PageProps) {
  const [{ countryCode }, search] = await Promise.all([params, searchParams])

  return (
    <Suspense fallback={<GraphLoadingShell />}>
      <ExploreGraphData countryCode={countryCode} search={search} />
    </Suspense>
  )
}
