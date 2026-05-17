import { Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { AussiePacificClient, extractProducts } from "./client"
import {
  AussiePacificCreateOrderRequest,
  AussiePacificOptions,
  AussiePacificOrder,
  AussiePacificProduct,
  AussiePacificVariant,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

const PAGE_SIZE = 250

export default class AussiePacificService {
  static identifier = "aussiepacific"
  protected options_: AussiePacificOptions
  protected client_: AussiePacificClient
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: AussiePacificOptions) {
    this.options_ = options
    this.client_ = new AussiePacificClient(options)
    this.logger_ = logger
  }

  static validateOptions(options: Record<string, any>) {
    const required = ["token", "base_url"]
    for (const key of required) {
      if (!options?.[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Aussie Pacific module is missing required option: ${key}`
        )
      }
    }
  }

  getClient(): AussiePacificClient {
    return this.client_
  }

  getOptions(): AussiePacificOptions {
    return this.options_
  }

  /**
   * Effective cost multiplier — clamped to a positive finite number to
   * defend against env-var typos that would otherwise zero out every price.
   */
  getCostAdjustment(): number {
    const raw = this.options_.cost_adjustment
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return 1.0
    return raw
  }

  /**
   * Walk every page of `GET /api/v1/products` until a page returns fewer
   * than `PAGE_SIZE` items.
   */
  async fetchAllProducts(): Promise<AussiePacificProduct[]> {
    const all: AussiePacificProduct[] = []
    let page = 1
    while (true) {
      const resp = await this.client_.getProducts({
        page,
        limit: PAGE_SIZE,
        include: "variants,images",
      })
      const batch = extractProducts(resp)
      all.push(...batch)
      if (batch.length < PAGE_SIZE) break
      page += 1
    }
    return all
  }

  /**
   * Lightweight variant of `fetchAllProducts` that omits variants/images
   * for fast catalog browsing in the admin UI. Returns only top-level
   * product fields (name, style_code, main_category, sub_category,
   * style, run_out, brand, description). ~10x faster than fetchAllProducts.
   */
  async fetchAllProductStubs(): Promise<AussiePacificProduct[]> {
    const all: AussiePacificProduct[] = []
    let page = 1
    while (true) {
      // Empty `include` skips the heavy nested data. AP defaults to
      // returning variants if include is omitted, so we pass an explicit
      // empty string.
      const resp = await this.client_.getProducts({
        page,
        limit: PAGE_SIZE,
        include: "",
      })
      const batch = extractProducts(resp)
      all.push(...batch)
      if (batch.length < PAGE_SIZE) break
      page += 1
    }
    return all
  }

  async fetchProductByStyleCode(
    styleCode: string
  ): Promise<AussiePacificProduct | null> {
    return this.client_.getProductByStyleCode(styleCode)
  }

  async fetchVariantBySku(sku: string): Promise<AussiePacificVariant | null> {
    return this.client_.getVariantBySku(sku)
  }

  async createDropshipOrder(
    payload: AussiePacificCreateOrderRequest
  ): Promise<AussiePacificOrder> {
    return this.client_.createOrder(payload)
  }
}
