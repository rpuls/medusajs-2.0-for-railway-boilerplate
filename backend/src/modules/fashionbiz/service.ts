import { Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { FashionBizClient } from "./client"
import {
  FashionBizBrandSlug,
  FashionBizOptions,
  FashionBizProduct,
  FashionBizProductStub,
  FashionBizStockResponse,
} from "./types"

type InjectedDependencies = {
  logger: Logger
}

export default class FashionBizService {
  static identifier = "fashionbiz"
  protected options_: FashionBizOptions
  protected client_: FashionBizClient
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: FashionBizOptions) {
    this.options_ = options
    this.client_ = new FashionBizClient(options)
    this.logger_ = logger
  }

  static validateOptions(options: Record<string, any>) {
    const required = ["token", "branch", "base_url"]
    for (const key of required) {
      if (!options?.[key]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `FashionBiz module is missing required option: ${key}`
        )
      }
    }
  }

  getClient(): FashionBizClient {
    return this.client_
  }

  getOptions(): FashionBizOptions {
    return this.options_
  }

  async fetchAllProductsForBrand(brand: FashionBizBrandSlug): Promise<FashionBizProductStub[]> {
    const resp = await this.client_.getSimpleProductList(brand)
    return resp.products ?? []
  }

  async fetchProductDetail(
    brand: FashionBizBrandSlug,
    slug: string
  ): Promise<FashionBizProduct> {
    return this.client_.getProductDetail(brand, slug)
  }

  async fetchStock(
    brand: FashionBizBrandSlug,
    slug: string,
    colour: string
  ): Promise<FashionBizStockResponse> {
    return this.client_.getStock(brand, slug, colour)
  }
}
