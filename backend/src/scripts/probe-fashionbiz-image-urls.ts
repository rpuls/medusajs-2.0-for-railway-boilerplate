/**
 * Probe: compare FashionBiz `https_attachment_url` (the field the importer
 * currently uses) with the unused `https_attachment_url_product` field on
 * the same image record, so we can decide whether to swap to the latter.
 *
 * The hypothesis is that `_product` may be a higher-resolution variant —
 * the field-name suffix suggests "product detail page" sizing, which is
 * typically larger than the generic attachment. The API docs don't say.
 *
 * For one sample product per brand, this script:
 *   1. Fetches the product detail
 *   2. Pulls the first image record from product.images and from each colour
 *   3. Logs both URLs side-by-side
 *   4. Issues a HEAD request to each URL and logs `Content-Length` + final
 *      URL (after redirects). A larger byte size strongly correlates with
 *      higher pixel resolution for JPEG/PNG assets of the same subject.
 *
 * Decision rubric for the caller:
 *   - If `_product` is consistently larger (>1.3× bytes) across brands →
 *     update FashionBiz importer + write a remediation script mirroring
 *     upgrade-ascolour-images-to-zoom.ts.
 *   - If `_product` is missing or smaller → no action, document the finding.
 *
 * Usage:
 *   cd backend && npx medusa exec src/scripts/probe-fashionbiz-image-urls.ts
 *
 * Env vars:
 *   PROBE_BRANDS=biz-collection,syzmik  — limit which brands to probe
 *   PROBE_SAMPLES=3                     — products per brand (default 1)
 */

import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { FASHIONBIZ_MODULE } from "../modules/fashionbiz"
import FashionBizService from "../modules/fashionbiz/service"
import { FashionBizBrandSlug, FashionBizImage } from "../modules/fashionbiz/types"

const DEFAULT_BRANDS: FashionBizBrandSlug[] = [
  "biz-collection",
  "biz-care",
  "biz-corporates",
  "syzmik",
]

const VALID_BRANDS = new Set<FashionBizBrandSlug>([
  "biz-collection",
  "biz-care",
  "biz-corporates",
  "syzmik",
  "good-mates",
])

function parseBrands(value: string | undefined): FashionBizBrandSlug[] {
  if (!value) return DEFAULT_BRANDS
  const requested = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as FashionBizBrandSlug[]
  const filtered = requested.filter((b) => VALID_BRANDS.has(b))
  return filtered.length ? filtered : DEFAULT_BRANDS
}

type ProbeResult = {
  label: string
  url: string | undefined
  status?: number
  bytes?: number
  finalUrl?: string
  error?: string
}

async function probeUrl(label: string, url: string | undefined): Promise<ProbeResult> {
  if (!url) return { label, url }
  try {
    // HEAD first — some CDNs respond with Content-Length on HEAD only.
    let resp = await fetch(url, { method: "HEAD", redirect: "follow" })
    let len = resp.headers.get("content-length")
    // Fall back to a ranged GET if HEAD didn't return a length.
    if (!len) {
      resp = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { Range: "bytes=0-0" },
      })
      // Content-Range looks like "bytes 0-0/123456" — extract the total.
      const range = resp.headers.get("content-range")
      if (range) {
        const match = range.match(/\/(\d+)$/)
        if (match) len = match[1]
      }
    }
    return {
      label,
      url,
      status: resp.status,
      bytes: len ? Number.parseInt(len, 10) : undefined,
      finalUrl: resp.url,
    }
  } catch (err: any) {
    return { label, url, error: String(err?.message ?? err) }
  }
}

function formatBytes(b: number | undefined): string {
  if (b === undefined) return "?"
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} kB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
}

function ratio(a: number | undefined, b: number | undefined): string {
  if (!a || !b) return "?"
  return `${(a / b).toFixed(2)}×`
}

export default async function probeFashionBizImageUrls({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  let fashionbiz: FashionBizService
  try {
    fashionbiz = container.resolve(FASHIONBIZ_MODULE) as FashionBizService
  } catch {
    logger.error(
      "FashionBiz module not registered — set FASHIONBIZ_API_TOKEN and restart."
    )
    return
  }

  const brands = parseBrands(process.env.PROBE_BRANDS)
  const samplesPerBrand = process.env.PROBE_SAMPLES
    ? Math.max(1, Number.parseInt(process.env.PROBE_SAMPLES, 10))
    : 1

  logger.info(
    `probe-fashionbiz-image-urls: brands=[${brands.join(", ")}], samples=${samplesPerBrand}`
  )

  type Row = {
    brand: string
    slug: string
    source: string
    attachment: ProbeResult
    attachmentProduct: ProbeResult
  }
  const rows: Row[] = []

  for (const brand of brands) {
    let stubs
    try {
      stubs = await fashionbiz.fetchAllProductsForBrand(brand)
    } catch (err: any) {
      logger.warn(`  ${brand}: list failed — ${err?.message ?? err}`)
      continue
    }
    if (!stubs.length) {
      logger.warn(`  ${brand}: no products in list`)
      continue
    }

    const samples = stubs.slice(0, samplesPerBrand)
    for (const stub of samples) {
      let detail
      try {
        detail = await fashionbiz.fetchProductDetail(brand, stub.slug)
      } catch (err: any) {
        logger.warn(`  ${brand}/${stub.slug}: detail failed — ${err?.message ?? err}`)
        continue
      }

      // Probe the first product-level image (if any) and the first image
      // of the first colour — these are the two places the mapping helper
      // pulls URLs from.
      const productImage: FashionBizImage | undefined = detail.images?.[0]
      const colour = detail.colors?.[0]
      const colourImage: FashionBizImage | undefined = colour?.images?.[0]

      const probes: { source: string; img: FashionBizImage | undefined }[] = [
        { source: "product.images[0]", img: productImage },
        {
          source: `colors[0].images[0] (${colour?.name ?? "?"})`,
          img: colourImage,
        },
      ]

      for (const { source, img } of probes) {
        if (!img) continue
        const [a, b] = await Promise.all([
          probeUrl("attachment_url", img.https_attachment_url),
          probeUrl("attachment_url_product", img.https_attachment_url_product),
        ])
        rows.push({
          brand,
          slug: stub.slug,
          source,
          attachment: a,
          attachmentProduct: b,
        })
      }
    }
  }

  // Pretty print.
  logger.info("")
  logger.info("=== Results ===")
  for (const r of rows) {
    logger.info(`${r.brand}/${r.slug} — ${r.source}`)
    logger.info(`  attachment_url        : ${formatBytes(r.attachment.bytes)}  ${r.attachment.url ?? "(missing)"}`)
    logger.info(`  attachment_url_product: ${formatBytes(r.attachmentProduct.bytes)}  ${r.attachmentProduct.url ?? "(missing)"}`)
    if (r.attachment.bytes && r.attachmentProduct.bytes) {
      logger.info(
        `  ratio (_product / attachment): ${ratio(r.attachmentProduct.bytes, r.attachment.bytes)}`
      )
    }
    if (r.attachment.error) logger.warn(`  attachment_url ERROR: ${r.attachment.error}`)
    if (r.attachmentProduct.error) logger.warn(`  attachment_url_product ERROR: ${r.attachmentProduct.error}`)
  }

  // Summary
  const withBoth = rows.filter(
    (r) => r.attachment.bytes && r.attachmentProduct.bytes
  )
  if (withBoth.length) {
    const ratios = withBoth.map(
      (r) => r.attachmentProduct.bytes! / r.attachment.bytes!
    )
    const min = Math.min(...ratios)
    const max = Math.max(...ratios)
    const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length
    logger.info("")
    logger.info(
      `Across ${withBoth.length} pair(s): _product / attachment ratio min=${min.toFixed(2)}× avg=${avg.toFixed(2)}× max=${max.toFixed(2)}×`
    )
    if (avg > 1.3) {
      logger.info(
        "→ Recommendation: prefer `https_attachment_url_product` in mapping.ts (consistently larger)."
      )
    } else if (avg < 0.9) {
      logger.info(
        "→ Recommendation: keep `https_attachment_url` (the _product variant is smaller)."
      )
    } else {
      logger.info(
        "→ Recommendation: keep `https_attachment_url` (sizes within ~10% — likely the same asset)."
      )
    }
  }

  const onlyAttachment = rows.filter(
    (r) => r.attachment.url && !r.attachmentProduct.url
  ).length
  if (onlyAttachment) {
    logger.info(
      `Note: ${onlyAttachment} sample(s) had no _product URL — that field is optional in the API shape.`
    )
  }
}
