import { MedusaError } from "@medusajs/framework/utils"
import {
  AsColourAuthResponse,
  AsColourCreateOrderRequest,
  AsColourImage,
  AsColourInventoryItem,
  AsColourOptions,
  AsColourOrder,
  AsColourPaginationParams,
  AsColourPriceListEntry,
  AsColourProduct,
  AsColourShipment,
  AsColourShippingMethod,
  AsColourVariant,
  PaginatedResponse,
} from "./types"

const TOKEN_TTL_MS = 23 * 60 * 60 * 1000 // refresh shortly before 24h

export class AsColourClient {
  private options: AsColourOptions
  private cachedToken: string | null = null
  private tokenExpiresAt = 0

  constructor(options: AsColourOptions) {
    this.options = options
  }

  private buildQuery(params?: Record<string, string | number | undefined>) {
    if (!params) return ""
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== ""
    )
    if (!entries.length) return ""
    return (
      "?" +
      entries
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    )
  }

  private async sendRequest<T = any>(
    path: string,
    init: RequestInit & { authBearer?: boolean } = {},
    attempt = 0
  ): Promise<T> {
    const { authBearer, ...rest } = init
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Subscription-Key": this.options.subscription_key,
      ...((rest.headers as Record<string, string>) ?? {}),
    }

    if (authBearer) {
      const token = await this.getBearerToken()
      headers["Authorization"] = `Bearer ${token}`
    }

    const url = `${this.options.base_url}${path}`
    const resp = await fetch(url, { ...rest, headers })

    // AS Colour rate-limits aggressively (HTTP 429 with a Retry-After in
    // seconds). Sleep for the suggested duration and retry; without this,
    // bulk imports and the inventory cron will partial-fail under load.
    if (resp.status === 429 && attempt < 5) {
      const retryHeader = resp.headers.get("retry-after")
      const seconds = Math.max(1, Math.min(120, Number.parseInt(retryHeader ?? "30", 10) || 30))
      await new Promise((r) => setTimeout(r, (seconds + 1) * 1000))
      return this.sendRequest<T>(path, init, attempt + 1)
    }

    const contentType = resp.headers.get("content-type") ?? ""
    const body = contentType.includes("application/json")
      ? await resp.json().catch(() => null)
      : await resp.text().catch(() => null)

    if (!resp.ok) {
      const message =
        (body && typeof body === "object" && (body.message || body.error)) ||
        (typeof body === "string" && body) ||
        `${resp.status} ${resp.statusText}`
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `AS Colour API ${resp.status} on ${path}: ${message}`
      )
    }

    return body as T
  }

  async authenticate(): Promise<string> {
    const resp = await this.sendRequest<AsColourAuthResponse | string>(
      "/api/authentication",
      {
        method: "POST",
        body: JSON.stringify({
          email: this.options.email,
          password: this.options.password,
        }),
      }
    )
    const token =
      typeof resp === "string"
        ? resp
        : resp?.token ?? (resp as any)?.access_token ?? (resp as any)?.bearer
    if (!token) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "AS Colour authentication did not return a token"
      )
    }
    this.cachedToken = token
    this.tokenExpiresAt = Date.now() + TOKEN_TTL_MS
    return token
  }

  async getBearerToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken
    }
    return await this.authenticate()
  }

  // Catalog
  async getColours(filter?: string) {
    return this.sendRequest(
      `/catalog/colours${this.buildQuery({ ColourFilter: filter })}`
    )
  }

  async getProducts(params: AsColourPaginationParams = {}) {
    return this.sendRequest<PaginatedResponse<AsColourProduct>>(
      `/catalog/products${this.buildQuery({
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        "updatedAt:min": params.updatedAtMin,
      })}`
    )
  }

  async getProduct(styleCode: string) {
    return this.sendRequest<AsColourProduct>(
      `/catalog/products/${encodeURIComponent(styleCode)}`
    )
  }

  async getProductVariants(styleCode: string) {
    return this.sendRequest<AsColourVariant[] | PaginatedResponse<AsColourVariant>>(
      `/catalog/products/${encodeURIComponent(styleCode)}/variants`
    )
  }

  async getProductVariant(styleCode: string, sku: string) {
    return this.sendRequest<AsColourVariant>(
      `/catalog/products/${encodeURIComponent(styleCode)}/variants/${encodeURIComponent(sku)}`
    )
  }

  async getProductVariantInventory(styleCode: string, sku: string) {
    return this.sendRequest<AsColourInventoryItem>(
      `/catalog/products/${encodeURIComponent(styleCode)}/variants/${encodeURIComponent(sku)}/inventory`
    )
  }

  async getProductImages(styleCode: string) {
    return this.sendRequest<AsColourImage[] | PaginatedResponse<AsColourImage>>(
      `/catalog/products/${encodeURIComponent(styleCode)}/images`
    )
  }

  // Inventory
  async getInventoryItems(params: AsColourPaginationParams & { skuFilter?: string } = {}) {
    return this.sendRequest<PaginatedResponse<AsColourInventoryItem>>(
      `/inventory/items${this.buildQuery({
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        "updatedAt:min": params.updatedAtMin,
        skuFilter: params.skuFilter,
      })}`
    )
  }

  async getInventoryItem(sku: string) {
    return this.sendRequest<AsColourInventoryItem>(
      `/inventory/items/${encodeURIComponent(sku)}`
    )
  }

  // Price list (requires Bearer)
  async getPriceList(params: AsColourPaginationParams = {}) {
    return this.sendRequest<PaginatedResponse<AsColourPriceListEntry>>(
      `/catalog/pricelist${this.buildQuery({
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      })}`,
      { authBearer: true }
    )
  }

  // Orders (require Bearer)
  async getShippingMethods() {
    return this.sendRequest<AsColourShippingMethod[]>(
      `/orders/shippingmethods`,
      { authBearer: true }
    )
  }

  async createOrder(payload: AsColourCreateOrderRequest) {
    return this.sendRequest<AsColourOrder | string>(`/orders`, {
      method: "POST",
      body: JSON.stringify(payload),
      authBearer: true,
    })
  }

  async getOrders(params: AsColourPaginationParams = {}) {
    return this.sendRequest<PaginatedResponse<AsColourOrder>>(
      `/orders${this.buildQuery({
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
      })}`,
      { authBearer: true }
    )
  }

  async getOrder(id: string) {
    return this.sendRequest<AsColourOrder>(
      `/orders/${encodeURIComponent(id)}`,
      { authBearer: true }
    )
  }

  async getOrderItems(id: string) {
    return this.sendRequest(
      `/orders/${encodeURIComponent(id)}/items`,
      { authBearer: true }
    )
  }

  async getOrderShipments(id: string) {
    return this.sendRequest<AsColourShipment[]>(
      `/orders/${encodeURIComponent(id)}/shipments`,
      { authBearer: true }
    )
  }
}
