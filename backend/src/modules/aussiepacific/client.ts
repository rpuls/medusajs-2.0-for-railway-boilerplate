import { MedusaError } from "@medusajs/framework/utils"
import {
  AussiePacificCreateOrderRequest,
  AussiePacificListResponse,
  AussiePacificOptions,
  AussiePacificOrder,
  AussiePacificProduct,
  AussiePacificVariant,
} from "./types"

/**
 * Aussie Pacific API v1 client.
 *
 * Auth: `Authorization: Bearer <token>` on every request.
 * Pagination: `?page=N&limit=250` (250 is the documented max).
 *
 * The API documents only a handful of endpoints, none of which support
 * delta/updated_at filtering — the inventory sync therefore performs a
 * full sweep on every run.
 */
export class AussiePacificClient {
  private options: AussiePacificOptions

  constructor(options: AussiePacificOptions) {
    this.options = options
  }

  private async sendRequest<T>(
    path: string,
    init: RequestInit = {},
    attempt = 0
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.options.token}`,
      ...(init.headers as Record<string, string> | undefined),
    }

    const url = `${this.options.base_url}${path}`
    const resp = await fetch(url, { ...init, headers })

    // AP publishes no rate-limit spec, but defend against 429s anyway:
    // sleep on Retry-After (capped) and retry up to 5 times.
    if (resp.status === 429 && attempt < 5) {
      const retryHeader = resp.headers.get("retry-after")
      const seconds = Math.max(
        1,
        Math.min(120, Number.parseInt(retryHeader ?? "30", 10) || 30)
      )
      await new Promise((r) => setTimeout(r, (seconds + 1) * 1000))
      return this.sendRequest<T>(path, init, attempt + 1)
    }

    const contentType = resp.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? await resp.json().catch(() => null)
      : await resp.text().catch(() => null)

    if (!resp.ok) {
      const message =
        (body &&
          typeof body === "object" &&
          (body.detail || body.message || body.error)) ||
        (typeof body === "string" && body.slice(0, 500)) ||
        `${resp.status} ${resp.statusText}`
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Aussie Pacific API ${resp.status} on ${path}: ${message}`
      )
    }

    return body as T
  }

  /** Health/auth check. */
  async check(): Promise<unknown> {
    return this.sendRequest("/api/v1/check")
  }

  /**
   * Paginated product list. `include=variants,images` returns nested
   * variants + their stock_level + images in one round-trip.
   *
   * Returns the raw response — callers should pull products out of
   * `.data` / `.products` / bare array via the helper below.
   */
  async getProducts(params: {
    page?: number
    limit?: number
    include?: string
  }): Promise<AussiePacificListResponse> {
    const search = new URLSearchParams()
    search.set("page", String(params.page ?? 1))
    search.set("limit", String(params.limit ?? 250))
    search.set("include", params.include ?? "variants,images")
    return this.sendRequest<AussiePacificListResponse>(
      `/api/v1/products?${search.toString()}`
    )
  }

  /** Single product by style code. */
  async getProductByStyleCode(
    styleCode: string
  ): Promise<AussiePacificProduct | null> {
    try {
      const resp = await this.sendRequest<
        AussiePacificProduct | { data?: AussiePacificProduct }
      >(`/api/v1/products/style-code/${encodeURIComponent(styleCode)}`)
      // Tolerate either a bare product or a `{ data: product }` wrapper.
      return (resp as any)?.data ?? (resp as AussiePacificProduct)
    } catch (err: any) {
      // 404 → null. Anything else surfaces.
      if (err?.message?.includes("404")) return null
      throw err
    }
  }

  /** Single variant by SKU. */
  async getVariantBySku(sku: string): Promise<AussiePacificVariant | null> {
    try {
      const resp = await this.sendRequest<
        AussiePacificVariant | { data?: AussiePacificVariant }
      >(`/api/v1/variants/${encodeURIComponent(sku)}`)
      return (resp as any)?.data ?? (resp as AussiePacificVariant)
    } catch (err: any) {
      if (err?.message?.includes("404")) return null
      throw err
    }
  }

  /** Dropship PO creation. */
  async createOrder(
    payload: AussiePacificCreateOrderRequest
  ): Promise<AussiePacificOrder> {
    const resp = await this.sendRequest<AussiePacificOrder | string>(
      `/api/v1/order`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
    // AP docs hint the response may be a bare string. Normalise both shapes.
    if (typeof resp === "string") {
      return { id: resp, reference: resp, status: "Submitted" }
    }
    return resp
  }
}

/**
 * Extract the products array from a list response regardless of which
 * wrapper shape AP chooses to return. Tolerant of `{data}`, `{products}`,
 * or a bare array.
 */
export function extractProducts(
  resp: AussiePacificListResponse | AussiePacificProduct[] | undefined
): AussiePacificProduct[] {
  if (!resp) return []
  if (Array.isArray(resp)) return resp
  if (Array.isArray(resp.data)) return resp.data
  if (Array.isArray(resp.products)) return resp.products
  return []
}
