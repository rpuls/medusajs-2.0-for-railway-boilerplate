import { MedusaService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { Brand } from "./models/brand"

type InjectedDependencies = {
  logger: Logger
}

class BrandModuleService extends MedusaService({
  Brand,
}) {
  protected readonly logger_: Logger

  constructor(container: InjectedDependencies) {
    // @ts-ignore - MedusaService constructor
    super(...arguments)
    this.logger_ = container.logger
  }

  // MedusaService automatically generates:
  // - listBrands(selector, config)
  // - retrieveBrand(id, config)
  // - createBrands(data[])
  // - updateBrands(selector, data)
  // - deleteBrands(selector)
  // These methods are available via the base class
}

export default BrandModuleService

