import { MedusaService } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { XMLParser } from "fast-xml-parser"
import { FieldMapping } from "./models/field-mapping"
import { ImportConfig } from "./models/import-config"
import { ImportExecution } from "./models/import-execution"
import { ImportExecutionLog } from "./models/import-execution-log"
import {
  FieldMappingRule,
  ImportOptions,
  ImportStatus,
  ListOptions,
  PreviewRequest,
  PreviewResponse,
  ProductData,
} from "./types"
import { DAL } from "@medusajs/framework/types"

type FieldMappingData = {
  id?: string
  name: string
  description?: string | null
  xml_url?: string | null
  mappings: FieldMappingRule[]
  created_at?: Date
  updated_at?: Date
}

type ImportConfigData = {
  id?: string
  name: string
  description?: string | null
  xml_url: string
  mapping_id: string
  options: ImportOptions
  recurring?: any | null
  enabled?: boolean
  created_at?: Date
  updated_at?: Date
}

type ImportExecutionData = {
  id?: string
  config_id: string
  status: ImportStatus
  started_at?: Date
  completed_at?: Date | null
  total_products?: number | null
  processed_products?: number
  successful_products?: number
  failed_products?: number
  error?: string | null
}

type ImportExecutionLogData = {
  id?: string
  execution_id: string
  level: "info" | "warning" | "error"
  message: string
  product_index?: number | null
  product_data?: any | null
  error?: any | null
  timestamp?: Date
}

type InjectedDependencies = {
  logger: Logger
  fieldMappingRepository: DAL.RepositoryService<FieldMappingData>
  importConfigRepository: DAL.RepositoryService<ImportConfigData>
  importExecutionRepository: DAL.RepositoryService<ImportExecutionData>
  importExecutionLogRepository: DAL.RepositoryService<ImportExecutionLogData>
}

/**
 * Service for importing products from XML files
 * Uses MedusaJS model system for data persistence
 */
class XmlProductImporterService extends MedusaService({
  FieldMapping,
  ImportConfig,
  ImportExecution,
  ImportExecutionLog,
}) {
  protected readonly logger_: Logger
  protected readonly xmlParser_: XMLParser
  protected readonly fieldMappingRepository_: DAL.RepositoryService<FieldMappingData>
  protected readonly importConfigRepository_: DAL.RepositoryService<ImportConfigData>
  protected readonly importExecutionRepository_: DAL.RepositoryService<ImportExecutionData>
  protected readonly importExecutionLogRepository_: DAL.RepositoryService<ImportExecutionLogData>

  constructor({
    logger,
    fieldMappingRepository,
    importConfigRepository,
    importExecutionRepository,
    importExecutionLogRepository,
  }: InjectedDependencies) {
    // @ts-ignore - MedusaService constructor
    super(...arguments)
    this.logger_ = logger
    this.fieldMappingRepository_ = fieldMappingRepository
    this.importConfigRepository_ = importConfigRepository
    this.importExecutionRepository_ = importExecutionRepository
    this.importExecutionLogRepository_ = importExecutionLogRepository
    this.xmlParser_ = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
    })
  }

  /**
   * Field Mapping CRUD Operations (automatically available via MedusaService)
   * You can also use: createFieldMappings, updateFieldMappings, deleteFieldMappings, listFieldMappings, retrieveFieldMapping
   */

  /**
   * Import Config CRUD Operations (automatically available via MedusaService)
   */

  /**
   * Import Execution CRUD Operations (automatically available via MedusaService)
   */

  /**
   * Import Execution Log CRUD Operations (automatically available via MedusaService)
   */

  /**
   * Validate XML URL and fetch content
   */
  async validateXmlUrl(url: string): Promise<{ valid: boolean; content?: string; error?: string }> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/xml, text/xml, */*",
        },
      })

      if (!response.ok) {
        return {
          valid: false,
          error: `Failed to fetch XML: ${response.status} ${response.statusText}`,
        }
      }

      const content = await response.text()

      // Try to parse to validate it's valid XML
      try {
        this.xmlParser_.parse(content)
        return { valid: true, content }
      } catch (parseError) {
        return {
          valid: false,
          error: `Invalid XML format: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Unknown error fetching XML",
      }
    }
  }

  /**
   * Parse XML content into JavaScript object
   */
  parseXml(xmlContent: string): any {
    try {
      return this.xmlParser_.parse(xmlContent)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Failed to parse XML: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }
  }

  /**
   * Extract products from parsed XML
   */
  extractProducts(xmlData: any): any[] {
    const possibleContainers = ["products", "items", "product", "item", "catalog", "data"]

    for (const container of possibleContainers) {
      if (Array.isArray(xmlData[container])) {
        return xmlData[container]
      }
      if (xmlData[container] && Array.isArray(xmlData[container].product)) {
        return xmlData[container].product
      }
      if (xmlData[container] && Array.isArray(xmlData[container].item)) {
        return xmlData[container].item
      }
    }

    if (Array.isArray(xmlData)) {
      return xmlData
    }

    for (const key in xmlData) {
      if (Array.isArray(xmlData[key])) {
        return xmlData[key]
      }
    }

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Could not find product array in XML. Expected structure: { products: [...] } or { items: [...] }"
    )
  }

  /**
   * Get value from nested object using dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split(".")
    let current = obj

    for (const part of parts) {
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch
        if (current && typeof current === "object" && arrayKey in current) {
          const array = current[arrayKey]
          if (Array.isArray(array) && array[parseInt(index)]) {
            current = array[parseInt(index)]
          } else {
            return undefined
          }
        } else {
          return undefined
        }
      } else {
        if (current && typeof current === "object" && part in current) {
          current = current[part]
        } else {
          return undefined
        }
      }
    }

    return current
  }

  /**
   * Map XML fields to Medusa product structure
   */
  mapFields(xmlData: any, fieldMapping: FieldMappingData): ProductData[] {
    const products = this.extractProducts(xmlData)

    return products.map((xmlProduct, index) => {
      const mappedProduct: any = {
        variants: [],
      }

      for (const rule of fieldMapping.mappings) {
        try {
          let value = this.getNestedValue(xmlProduct, rule.xmlPath)

          if (value === undefined || value === null) {
            if (rule.defaultValue !== undefined) {
              value = rule.defaultValue
            } else if (rule.required) {
              throw new Error(`Required field ${rule.xmlPath} is missing`)
            } else {
              continue
            }
          }

          if (rule.isImageCollection && typeof value === "string") {
            const delimiter = rule.imageDelimiter || ", "
            const imageUrls = value
              .split(delimiter)
              .map((url: string) => url.trim())
              .filter((url: string) => url.length > 0)

            value = imageUrls.map((url: string) => ({ url }))
          }

          if (rule.transform && typeof rule.transform === "function") {
            value = rule.transform(value)
          }

          const medusaParts = rule.medusaField.split(".")
          let current = mappedProduct

          for (let i = 0; i < medusaParts.length - 1; i++) {
            const part = medusaParts[i]
            const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)

            if (arrayMatch) {
              const [, arrayKey, index] = arrayMatch
              if (!current[arrayKey]) {
                current[arrayKey] = []
              }
              if (!current[arrayKey][parseInt(index)]) {
                current[arrayKey][parseInt(index)] = {}
              }
              current = current[arrayKey][parseInt(index)]
            } else {
              if (!current[part]) {
                current[part] = {}
              }
              current = current[part]
            }
          }

          const lastPart = medusaParts[medusaParts.length - 1]
          const lastArrayMatch = lastPart.match(/^(.+)\[(\d+)\]$/)

          if (lastArrayMatch) {
            const [, arrayKey, index] = lastArrayMatch
            if (!current[arrayKey]) {
              current[arrayKey] = []
            }
            current[arrayKey][parseInt(index)] = value
          } else {
            current[lastPart] = value
          }
        } catch (error) {
          this.logger_.warn(
            `Error mapping field ${rule.xmlPath} for product ${index}: ${error instanceof Error ? error.message : "Unknown error"}`
          )
          if (rule.required) {
            throw error
          }
        }
      }

      if (mappedProduct.price !== undefined && mappedProduct.price !== null) {
        if (mappedProduct.variants.length > 0) {
          mappedProduct.variants[0]._price = mappedProduct.price
        }
      }

      if (!mappedProduct.variants || mappedProduct.variants.length === 0) {
        mappedProduct.variants = [{}]
      }

      mappedProduct.variants.forEach((variant: any) => {
        if (!variant.prices) {
          variant.prices = []
        } else if (!Array.isArray(variant.prices)) {
          variant.prices = [variant.prices]
        }
      })

      return mappedProduct as ProductData
    })
  }

  /**
   * Validate mapped product data
   */
  validateProductData(productData: ProductData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!productData.title) {
      errors.push("Product title is required")
    }

    if (!productData.description) {
      errors.push("Product description is required")
    }

    if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
      errors.push("Product images are required")
    }

    const hasProductPrice = productData.price !== undefined && productData.price !== null
    const hasVariantPrices =
      productData.variants &&
      productData.variants.some((v: any) => v.prices && Array.isArray(v.prices) && v.prices.length > 0)

    if (!hasProductPrice && !hasVariantPrices) {
      errors.push("Product price is required (should be mapped to price field or variant prices)")
    }

    if (!productData.external_id) {
      errors.push("Product external_id is required for tracking and updates")
    }

    if (!productData.variants || productData.variants.length === 0) {
      errors.push("At least one variant is required")
    } else {
      productData.variants.forEach((variant, index) => {
        if (!variant.title || variant.title.trim() === "") {
          errors.push(`Variant ${index + 1}: Title is required`)
        }

        let prices = variant.prices
        if (!prices) {
          errors.push(`Variant ${index + 1}: At least one price is required`)
          return
        }

        if (!Array.isArray(prices)) {
          prices = [prices]
        }

        if (prices.length === 0) {
          errors.push(`Variant ${index + 1}: At least one price is required`)
        } else {
          prices.forEach((price, priceIndex) => {
            if (!price || typeof price !== "object") {
              errors.push(`Variant ${index + 1}, Price ${priceIndex + 1}: Invalid price object`)
              return
            }
            if (!price.currency_code) {
              errors.push(`Variant ${index + 1}, Price ${priceIndex + 1}: Currency code is required`)
            }
            if (typeof price.amount !== "number" || price.amount < 0) {
              errors.push(
                `Variant ${index + 1}, Price ${priceIndex + 1}: Valid amount is required (got ${typeof price.amount}: ${price.amount})`
              )
            }
          })
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Preview mapping with sample data
   */
  async previewMapping(request: PreviewRequest): Promise<PreviewResponse> {
    const { xmlUrl, mapping, sampleSize = 3 } = request

    try {
      const validation = await this.validateXmlUrl(xmlUrl)
      if (!validation.valid || !validation.content) {
        return {
          sampleProducts: [],
          errors: [validation.error || "Invalid XML URL"],
        }
      }

      const xmlData = this.parseXml(validation.content)
      const allProducts = this.extractProducts(xmlData)
      const sampleProducts = allProducts.slice(0, sampleSize)

      const previewProducts: PreviewResponse["sampleProducts"] = []

      for (const xmlProduct of sampleProducts) {
        try {
          const mapped = this.mapFields({ products: [xmlProduct] }, mapping)
          const validation = this.validateProductData(mapped[0])

          previewProducts.push({
            original: xmlProduct,
            mapped: mapped[0],
            errors: validation.errors,
          })
        } catch (error) {
          previewProducts.push({
            original: xmlProduct,
            mapped: {},
            errors: [error instanceof Error ? error.message : "Unknown error"],
          })
        }
      }

      return {
        sampleProducts: previewProducts,
        totalProducts: allProducts.length,
      }
    } catch (error) {
      return {
        sampleProducts: [],
        errors: [error instanceof Error ? error.message : "Unknown error"],
      }
    }
  }
}

export default XmlProductImporterService




