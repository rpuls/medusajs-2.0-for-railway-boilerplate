import { Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { AsColourClient } from "./client"
import {
  AsColourCreateOrderRequest,
  AsColourInventoryItem,
  AsColourOptions,
  AsColourOrder,
  AsColourPriceListEntry,
  AsColourProduct,
  PaginatedResponse,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

const PAGE_SIZE = 250

function extractItems<T>(resp: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!resp) return []
  if (Array.isArray(resp)) return resp
  return resp.items ?? resp.data ?? resp.results ?? []
}

export default class AsColourService {
  static identifier = "ascolour"
  protected options_: AsColourOptions
  protected client_: AsColourClient
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: AsColourOptions) {
    this.options_ = options
    this.client_ = new AsColourClient(options)
    this.logger_ = logger
  }

  static validateOptions(options: Record<string, any>) {
    const required = ["subscription_key", "email", "password", "base_url"]
    for (const key of required) {
      if (!options?.[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `AS Colour module is missing required option: ${key}`
        )
      }
    }
    if (!options.workshop_address?.address1) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "AS Colour module is missing workshop_address (set ASCOLOUR_WORKSHOP_* env vars)"
      )
    }
  }

  getClient(): AsColourClient {
    return this.client_
  }

  getOptions(): AsColourOptions {
    return this.options_
  }

  /**
   * Walk every page of /catalog/products. Caller can stream-process if catalogue gets big.
   */
  async fetchAllProducts(updatedAtMin?: string): Promise<AsColourProduct[]> {
    const all: AsColourProduct[] = []
    let pageNumber = 1
    while (true) {
      const resp = await this.client_.getProducts({
        pageNumber,
        pageSize: PAGE_SIZE,
        updatedAtMin,
      })
      const batch = extractItems<AsColourProduct>(resp)
      if (!batch.length) break
      all.push(...batch)
      if (batch.length < PAGE_SIZE) break
      pageNumber += 1
    }
    return all
  }

  async fetchAllPriceList(): Promise<AsColourPriceListEntry[]> {
    const all: AsColourPriceListEntry[] = []
    let pageNumber = 1
    while (true) {
      const resp = await this.client_.getPriceList({
        pageNumber,
        pageSize: PAGE_SIZE,
      })
      const batch = extractItems<AsColourPriceListEntry>(resp)
      if (!batch.length) break
      all.push(...batch)
      if (batch.length < PAGE_SIZE) break
      pageNumber += 1
    }
    return all
  }

  async fetchInventoryDelta(updatedAtMin?: string): Promise<AsColourInventoryItem[]> {
    const all: AsColourInventoryItem[] = []
    let pageNumber = 1
    while (true) {
      const resp = await this.client_.getInventoryItems({
        pageNumber,
        pageSize: PAGE_SIZE,
        updatedAtMin,
      })
      const batch = extractItems<AsColourInventoryItem>(resp)
      if (!batch.length) break
      all.push(...batch)
      if (batch.length < PAGE_SIZE) break
      pageNumber += 1
    }
    return all
  }

  /**
   * Pick the warehouse with the highest available stock for a SKU. Used when building order payloads.
   *
   * Handles the real flat AS Colour shape ({sku, location, quantity, ...}),
   * the legacy nested shape ({sku, warehouses: [...]}), and the older
   * top-level {sku, warehouse, available} shape.
   */
  pickWarehouseForSku(item: AsColourInventoryItem | undefined): string | null {
    if (!item) return null
    if (item.warehouses?.length) {
      const sorted = [...item.warehouses].sort(
        (a, b) => (b.available ?? 0) - (a.available ?? 0)
      )
      const best = sorted[0]
      if (best && (best.available ?? 0) > 0) return best.warehouse
      return sorted[0]?.warehouse ?? null
    }
    return item.location ?? item.warehouse ?? null
  }

  /**
   * Pick the best warehouse from multiple inventory rows for a single SKU.
   *
   * The real AS Colour /inventory/items list endpoint returns one row per
   * (sku, location) with qty in `quantity`. This method aggregates those rows
   * and returns the location with the highest stock, falling back gracefully to
   * the legacy nested and flat shapes.
   */
  pickWarehouseFromInventoryList(items: AsColourInventoryItem[]): string | null {
    if (!items.length) return null
    // Real API shape: {sku, location, quantity} — one row per location.
    const withLocation = items.filter((i) => i.location)
    if (withLocation.length) {
      const best = [...withLocation].sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0))[0]
      return best.location!
    }
    // Legacy nested shape: {sku, warehouses: [{warehouse, available}]}
    if (items[0].warehouses?.length) {
      return this.pickWarehouseForSku(items[0])
    }
    // Oldest flat shape: {sku, warehouse, available}
    return items[0].warehouse ?? null
  }

  async createDropshipOrder(payload: AsColourCreateOrderRequest): Promise<AsColourOrder> {
    const resp = await this.client_.createOrder(payload)
    if (typeof resp === "string") {
      // API may return order id as plain text; wrap so callers always get an object.
      return { id: resp.trim() }
    }
    return resp
  }
}
