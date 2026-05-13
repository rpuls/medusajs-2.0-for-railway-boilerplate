import { MedusaError } from "@medusajs/framework/utils"
import {
  FashionBizBrandSlug,
  FashionBizOptions,
  FashionBizProduct,
  FashionBizSimpleList,
  FashionBizStockResponse,
} from "./types"

/**
 * FashionBiz Public API v3 client.
 *
 * Auth: `Authorization: Token <token>` + `Content-Type: application/json`.
 * Trailing slash on product/stock paths is mandatory — the server 301s
 * without it and curl/fetch redirect handling drops the auth header on the
 * redirect, so we always send the canonical form.
 */
export class FashionBizClient {
  private options: FashionBizOptions

  constructor(options: FashionBizOptions) {
    this.options = options
  }

  private async sendRequest<T>(path: string, attempt = 0): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Token ${this.options.token}`,
    }

    const url = `${this.options.base_url}${path}`
    const resp = await fetch(url, { headers, redirect: "manual" })

    // FashionBiz publishes no rate-limit spec, but defend against 429s anyway:
    // sleep on Retry-After (capped) and retry up to 5 times.
    if (resp.status === 429 && attempt < 5) {
      const retryHeader = resp.headers.get("retry-after")
      const seconds = Math.max(1, Math.min(120, Number.parseInt(retryHeader ?? "30", 10) || 30))
      await new Promise((r) => setTimeout(r, (seconds + 1) * 1000))
      return this.sendRequest<T>(path, attempt + 1)
    }

    // If a path was passed without a trailing slash and FashionBiz redirects,
    // surface a clear error instead of silently dropping headers.
    if (resp.status === 301 || resp.status === 302) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `FashionBiz redirected ${resp.status} on ${path} (caller must include trailing slash)`
      )
    }

    const contentType = resp.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? await resp.json().catch(() => null)
      : await resp.text().catch(() => null)

    if (!resp.ok) {
      const message =
        (body && typeof body === "object" && (body.detail || body.message || body.error)) ||
        (typeof body === "string" && body) ||
        `${resp.status} ${resp.statusText}`
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `FashionBiz API ${resp.status} on ${path}: ${message}`
      )
    }

    return body as T
  }

  /**
   * Encode a colour name for the stock endpoint. Per docs:
   * - spaces stay as spaces (URL-encoded to %20 by encodeURIComponent)
   * - slashes are replaced with dashes ("Magenta/Black/Silver" -> "Magenta-Black-Silver")
   */
  static encodeColourForStock(name: string): string {
    return encodeURIComponent(name.replace(/\//g, "-"))
  }

  /** Full product list for a brand, no pagination. Prefer this over the paginated endpoint for full imports. */
  async getSimpleProductList(brand: FashionBizBrandSlug): Promise<FashionBizSimpleList> {
    return this.sendRequest<FashionBizSimpleList>(
      `/simple/products/${brand}/${this.options.branch}/`
    )
  }

  /** Single product detail. Returns the full payload — prices, colours, sizes, images, tags. */
  async getProductDetail(
    brand: FashionBizBrandSlug,
    slug: string
  ): Promise<FashionBizProduct> {
    return this.sendRequest<FashionBizProduct>(
      `/products/${brand}/${this.options.branch}/${encodeURIComponent(slug)}/`
    )
  }

  /** Live stock for a single product+colour. */
  async getStock(
    brand: FashionBizBrandSlug,
    slug: string,
    colour: string
  ): Promise<FashionBizStockResponse> {
    const encodedColour = FashionBizClient.encodeColourForStock(colour)
    return this.sendRequest<FashionBizStockResponse>(
      `/products/${brand}/${this.options.branch}/${encodeURIComponent(slug)}/${encodedColour}/`
    )
  }
}
