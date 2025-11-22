import { MedusaService } from "@medusajs/framework/utils"
import { Logger, MedusaContainer } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { XMLParser } from "fast-xml-parser"
import { IProductModuleService } from "@medusajs/framework/types"
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

type InjectedDependencies = {
  logger: Logger
  // Repositories are automatically injected by MedusaService
  // Names are based on TABLE NAMES (first param of model.define), not model constant names
  // xml_import_mapping -> xmlImportMappingRepository
  // xml_import_config -> xmlImportConfigRepository
  // xml_import_execution -> xmlImportExecutionRepository
  // xml_import_execution_log -> xmlImportExecutionLogRepository
  xmlImportMappingRepository: DAL.RepositoryService<any>
  xmlImportConfigRepository: DAL.RepositoryService<any>
  xmlImportExecutionRepository: DAL.RepositoryService<any>
  xmlImportExecutionLogRepository: DAL.RepositoryService<any>
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
  protected readonly fieldMappingRepository_: DAL.RepositoryService<any>
  protected readonly importConfigRepository_: DAL.RepositoryService<any>
  protected readonly importExecutionRepository_: DAL.RepositoryService<any>
  protected readonly importExecutionLogRepository_: DAL.RepositoryService<any>

  constructor(deps: InjectedDependencies) {
    // @ts-ignore - MedusaService constructor
    super(...arguments)
    this.logger_ = deps.logger
    // Repositories are automatically injected by MedusaService based on TABLE NAMES
    // Table name: xml_import_mapping -> Repository: xmlImportMappingRepository
    // Table name: xml_import_config -> Repository: xmlImportConfigRepository
    // Table name: xml_import_execution -> Repository: xmlImportExecutionRepository
    // Table name: xml_import_execution_log -> Repository: xmlImportExecutionLogRepository
    this.fieldMappingRepository_ = deps.xmlImportMappingRepository
    this.importConfigRepository_ = deps.xmlImportConfigRepository
    this.importExecutionRepository_ = deps.xmlImportExecutionRepository
    this.importExecutionLogRepository_ = deps.xmlImportExecutionLogRepository
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
   * List all field mappings with count
   */
  async listAllFieldMappings(): Promise<{ mappings: any[]; count: number }> {
    try {
      // Explicitly filter out soft-deleted records (deleted_at IS NULL)
      const [mappings, count] = await this.fieldMappingRepository_.findAndCount({
        where: {
          deleted_at: null,
        },
      } as any)
      const mappingsArray = Array.isArray(mappings) ? mappings : []
      this.logger_.debug(`Found ${mappingsArray.length} mappings, count: ${count}`)
      return {
        mappings: mappingsArray,
        count: typeof count === 'number' ? count : mappingsArray.length,
      }
    } catch (error) {
      this.logger_.error(`Error listing field mappings: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  /**
   * Find a single field mapping by ID
   */
  async findFieldMappingById(id: string): Promise<any | null> {
    try {
      const mappings = await this.fieldMappingRepository_.find({
        where: { id, deleted_at: null },
      } as any)
      const mapping = Array.isArray(mappings) && mappings.length > 0 ? mappings[0] : null
      if (mapping) {
        this.logger_.debug(`Found mapping with ${mapping?.mappings?.length || 0} mappings`)
        if (mapping?.mappings) {
          this.logger_.debug(`Found mapping mappings: ${JSON.stringify(mapping.mappings, null, 2)}`)
        }
      }
      return mapping
    } catch (error) {
      this.logger_.error(`Error finding field mapping: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  /**
   * List all import configs with count
   */
  async listAllImportConfigs(): Promise<{ configs: any[]; count: number }> {
    try {
      // Explicitly filter out soft-deleted records (deleted_at IS NULL)
      const [configs, count] = await this.importConfigRepository_.findAndCount({
        where: {
          deleted_at: null,
        },
      } as any)
      const configsArray = Array.isArray(configs) ? configs : []
      this.logger_.debug(`Found ${configsArray.length} import configs, count: ${count}`)
      return {
        configs: configsArray,
        count: typeof count === 'number' ? count : configsArray.length,
      }
    } catch (error) {
      this.logger_.error(`Error listing import configs: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  /**
   * Find a single import config by ID
   */
  async findImportConfigById(id: string): Promise<any | null> {
    try {
      const configs = await this.importConfigRepository_.find({
        where: { id, deleted_at: null },
      } as any)
      return Array.isArray(configs) && configs.length > 0 ? configs[0] : null
    } catch (error) {
      this.logger_.error(`Error finding import config: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  /**
   * Create a new import config
   */
  async createNewImportConfig(data: {
    name: string
    description?: string | null
    xml_url: string
    mapping_id: string
    options?: any
    recurring?: any | null
    enabled?: boolean
  }): Promise<any> {
    try {
      this.logger_.debug(`Creating import config: ${data.name}`)
      // Use MedusaService's auto-generated createImportConfigs method
      // @ts-ignore - Auto-generated method from MedusaService
      const result = await this.createImportConfigs([data])
      const config = Array.isArray(result) && result.length > 0 ? result[0] : result
      
      this.logger_.debug(`Created import config with ID: ${(config as any)?.id || 'unknown'}`)
      
      if (!(config as any)?.id) {
        this.logger_.warn(`Created config but no ID returned`)
      }
      
      return config
    } catch (error) {
      this.logger_.error(`Error creating import config: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Update an import config
   */
  async updateImportConfig(id: string, data: Partial<{
    name?: string
    description?: string | null
    xml_url?: string
    mapping_id?: string
    options?: any
    recurring?: any | null
    enabled?: boolean
  }>): Promise<any> {
    try {
      this.logger_.debug(`Updating import config: ${id}`)
      
      // First verify the config exists
      const existing = await this.findImportConfigById(id)
      if (!existing) {
        this.logger_.error(`Cannot update import config ${id}: config not found`)
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `XmlImportConfig with id "${id}" not found`
        )
      }
      
      // Use MedusaService's auto-generated updateImportConfigs method
      // @ts-ignore - Auto-generated method from MedusaService
      const result = await this.updateImportConfigs({ id }, data)
      const updated = Array.isArray(result) && result.length > 0 ? result[0] : result
      
      this.logger_.debug(`Updated import config ${id} successfully`)
      return updated
    } catch (error) {
      this.logger_.error(`Error updating import config: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Delete an import config
   */
  async deleteImportConfig(id: string): Promise<void> {
    try {
      this.logger_.debug(`Deleting import config: ${id}`)
      
      // First verify the config exists
      const existing = await this.findImportConfigById(id)
      if (!existing) {
        this.logger_.error(`Cannot delete import config ${id}: config not found`)
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `XmlImportConfig with id "${id}" not found`
        )
      }
      
      // Use MedusaService's auto-generated deleteImportConfigs method
      // @ts-ignore - Auto-generated method from MedusaService
      await this.deleteImportConfigs({ id })
      
      this.logger_.debug(`Deleted import config ${id} successfully`)
    } catch (error) {
      this.logger_.error(`Error deleting import config: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Get import execution logs for a specific execution
   */
  async getImportExecutionLogs(executionId: string): Promise<any[]> {
    try {
      const logs = await this.importExecutionLogRepository_.find({
        where: { execution_id: executionId },
      } as any)
      
      const logsArray = Array.isArray(logs) ? logs : []
      // Sort by timestamp ascending
      logsArray.sort((a: any, b: any) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0
        return aTime - bTime
      })
      
      return logsArray
    } catch (error) {
      this.logger_.error(`Error listing import execution logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return []
    }
  }

  /**
   * Find a single import execution by ID
   */
  async findImportExecutionById(id: string): Promise<any | null> {
    try {
      const executions = await this.importExecutionRepository_.find({
        where: { id, deleted_at: null },
      } as any)
      return Array.isArray(executions) && executions.length > 0 ? executions[0] : null
    } catch (error) {
      this.logger_.error(`Error finding import execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return null
    }
  }

  /**
   * Update a field mapping
   */
  async updateFieldMapping(id: string, data: Partial<{
    name: string
    description?: string | null
    xml_url?: string | null
    mappings: any[]
  }>): Promise<any> {
    try {
      this.logger_.debug(`Updating field mapping: ${id}`)
      this.logger_.debug(`Update data mappings count: ${data.mappings?.length || 0}`)
      if (data.mappings) {
        this.logger_.debug(`Update data mappings: ${JSON.stringify(data.mappings, null, 2)}`)
      }
      
      // Verify the mapping exists first
      const existing = await this.findFieldMappingById(id)
      if (!existing) {
        throw new Error(`Field mapping with id ${id} not found`)
      }
      
      this.logger_.debug(`Existing mapping has ${existing.mappings?.length || 0} mappings before update`)
      
      // Use MedusaService's auto-generated updateFieldMappings method
      // @ts-ignore - Auto-generated method from MedusaService
      const result = await this.updateFieldMappings({ id }, data)
      const updated = Array.isArray(result) && result.length > 0 ? result[0] : result
      
      // Use the response from updateFieldMappings if it's valid
      if (updated && updated.mappings) {
        this.logger_.debug(`Updated mapping has ${updated.mappings.length} mappings`)
        
        // Compare counts to detect if mappings were lost
        if (data.mappings && data.mappings.length !== updated.mappings.length) {
          this.logger_.warn(`⚠️ Mappings count mismatch! Sent ${data.mappings.length}, returned ${updated.mappings.length}`)
          this.logger_.warn(`Sent mappings: ${JSON.stringify(data.mappings.map(m => ({ xmlPath: m.xmlPath, medusaField: m.medusaField, categoryDelimiter: m.categoryDelimiter })), null, 2)}`)
          this.logger_.warn(`Returned mappings: ${JSON.stringify(updated.mappings.map((m: any) => ({ xmlPath: m.xmlPath, medusaField: m.medusaField, categoryDelimiter: m.categoryDelimiter })), null, 2)}`)
        }
        
        return updated
      }
      
      // Fallback: fetch from database if updateFieldMappings didn't return the entity
      this.logger_.debug(`UpdateFieldMappings didn't return entity, fetching from database`)
      const fetched = await this.findFieldMappingById(id)
      if (!fetched) {
        throw new Error(`Field mapping with id ${id} not found after update`)
      }
      
      this.logger_.debug(`Fetched mapping has ${fetched.mappings?.length || 0} mappings after update`)
      
      // Compare counts to detect if mappings were lost
      if (data.mappings && fetched.mappings && data.mappings.length !== fetched.mappings.length) {
        this.logger_.warn(`⚠️ Mappings count mismatch! Sent ${data.mappings.length}, saved ${fetched.mappings.length}`)
        this.logger_.warn(`Sent mappings: ${JSON.stringify(data.mappings.map(m => ({ xmlPath: m.xmlPath, medusaField: m.medusaField, categoryDelimiter: m.categoryDelimiter })), null, 2)}`)
        this.logger_.warn(`Saved mappings: ${JSON.stringify(fetched.mappings.map((m: any) => ({ xmlPath: m.xmlPath, medusaField: m.medusaField, categoryDelimiter: m.categoryDelimiter })), null, 2)}`)
      }
      
      return fetched
    } catch (error) {
      this.logger_.error(`Error updating field mapping: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Delete a field mapping
   */
  async deleteFieldMapping(id: string): Promise<void> {
    try {
      this.logger_.debug(`Deleting field mapping: ${id}`)
      // Use MedusaService's auto-generated deleteFieldMappings method
      // @ts-ignore - Auto-generated method from MedusaService
      await this.deleteFieldMappings({ id })
    } catch (error) {
      this.logger_.error(`Error deleting field mapping: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  /**
   * Create a new import execution
   */
  async createImportExecution(data: {
    id: string
    config_id: string
    status: string
    started_at: Date
    total_products?: number | null
    processed_products?: number
    successful_products?: number
    failed_products?: number
  }): Promise<any> {
    try {
      this.logger_.debug(`Creating import execution: ${data.id}`)
      // Use MedusaService's auto-generated createImportExecutions method
      // @ts-ignore - Auto-generated method from MedusaService
      const result = await this.createImportExecutions([data])
      const execution = Array.isArray(result) && result.length > 0 ? result[0] : result
      this.logger_.debug(`Created import execution with ID: ${(execution as any)?.id || 'unknown'}`)
      
      if (!(execution as any)?.id) {
        this.logger_.warn(`Created execution but no ID returned`)
      }
      
      return execution
    } catch (error) {
      this.logger_.error(`Error creating import execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Update an import execution
   */
  async updateImportExecution(id: string, data: Partial<{
    status: string
    completed_at?: Date | null
    total_products?: number | null
    processed_products?: number
    successful_products?: number
    failed_products?: number
    error?: string | null
  }>): Promise<any> {
    try {
      this.logger_.debug(`Updating import execution: ${id} with data: ${JSON.stringify(data, null, 2)}`)
      
      // First verify the execution exists
      const existing = await this.findImportExecutionById(id)
      if (!existing) {
        this.logger_.error(`Cannot update import execution ${id}: execution not found`)
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          `XmlImportExecution with id "${id}" not found`
        )
      }
      
      // Build update payload with snake_case field names (matching the model)
      const updatePayload: any = {}
      if (data.status !== undefined) updatePayload.status = data.status
      if (data.completed_at !== undefined) updatePayload.completed_at = data.completed_at
      if (data.total_products !== undefined) updatePayload.total_products = data.total_products
      if (data.processed_products !== undefined) updatePayload.processed_products = data.processed_products
      if (data.successful_products !== undefined) updatePayload.successful_products = data.successful_products
      if (data.failed_products !== undefined) updatePayload.failed_products = data.failed_products
      if (data.error !== undefined) updatePayload.error = data.error
      
      this.logger_.debug(`Update payload: ${JSON.stringify(updatePayload, null, 2)}`)
      
      // Use MedusaService's auto-generated updateImportExecutions method
      // @ts-ignore - Auto-generated method from MedusaService
      const result = await this.updateImportExecutions({ id }, updatePayload)
      const updated = Array.isArray(result) && result.length > 0 ? result[0] : result
      
      this.logger_.debug(`Updated import execution ${id} successfully. Status: ${updated?.status || 'N/A'}`)
      
      // Fetch from database to ensure we have the latest data
      const refreshed = await this.findImportExecutionById(id)
      this.logger_.debug(`Refreshed execution status: ${refreshed?.status || 'N/A'}`)
      
      return refreshed || updated
    } catch (error) {
      this.logger_.error(`Error updating import execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Create a new field mapping
   */
  async createNewFieldMapping(data: {
    name: string
    description?: string | null
    xml_url?: string | null
    mappings: any[]
  }): Promise<any> {
    try {
      this.logger_.debug(`Creating field mapping: ${data.name}`)
      // Use MedusaService's auto-generated createFieldMappings method
      // @ts-ignore - Auto-generated method from MedusaService
      const result = await this.createFieldMappings([data])
      const mapping = Array.isArray(result) && result.length > 0 ? result[0] : result
      
      this.logger_.debug(`Created field mapping with ID: ${(mapping as any)?.id || 'unknown'}`)
      
      if (!(mapping as any)?.id) {
        this.logger_.warn(`Created mapping but no ID returned`)
      }
      
      return mapping
    } catch (error) {
      this.logger_.error(`Error creating field mapping: ${error instanceof Error ? error.message : 'Unknown error'}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      throw error
    }
  }

  /**
   * Validate XML URL and fetch content
   */
  async validateXmlUrl(url: string): Promise<{ valid: boolean; content?: string; error?: string }> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
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
          error: `Invalid XML format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching XML',
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
        `Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  /**
   * Extract products from parsed XML
   * Supports common XML structures (items array, products array, etc.)
   */
  extractProducts(xmlData: any): any[] {
    // Try common product container names
    const possibleContainers = ['products', 'items', 'product', 'item', 'catalog', 'data']
    
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

    // If root is an array, return it
    if (Array.isArray(xmlData)) {
      return xmlData
    }

    // Try to find any array in the object
    for (const key in xmlData) {
      if (Array.isArray(xmlData[key])) {
        return xmlData[key]
      }
    }

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      'Could not find product array in XML. Expected structure: { products: [...] } or { items: [...] }'
    )
  }

  /**
   * Get value from nested object using dot notation path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.')
    let current = obj

    for (const part of parts) {
      // Handle array indices like "variants[0]"
      const arrayMatch = part.match(/^(.+)\[(\d+)\]$/)
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch
        if (current && typeof current === 'object' && arrayKey in current) {
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
        if (current && typeof current === 'object' && part in current) {
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
  mapFields(xmlData: any, fieldMapping: any): ProductData[] {
    const products = this.extractProducts(xmlData)
    
    return products.map((xmlProduct, index) => {
      const mappedProduct: any = {
        variants: [],
      }

      // Apply each mapping rule
      for (const rule of fieldMapping.mappings) {
        try {
          let value = this.getNestedValue(xmlProduct, rule.xmlPath)

          // Apply default value if not found
          if (value === undefined || value === null) {
            if (rule.defaultValue !== undefined) {
              value = rule.defaultValue
            } else if (rule.required) {
              throw new Error(`Required field ${rule.xmlPath} is missing`)
            } else {
              continue
            }
          }

          // Handle image collections
          if (rule.isImageCollection && typeof value === 'string') {
            const delimiter = rule.imageDelimiter || ', '
            const imageUrls = value
              .split(delimiter)
              .map((url: string) => url.trim())
              .filter((url: string) => url.length > 0)
            
            // Convert to Medusa image format: [{ url: string }]
            value = imageUrls.map((url: string) => ({ url }))
          }

          // Apply transformation if provided
          if (rule.transform && typeof rule.transform === 'function') {
            value = rule.transform(value)
          }

          // Set value in mapped product using dot notation
          const medusaParts = rule.medusaField.split('.')
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
          this.logger_.warn(`Error mapping field ${rule.xmlPath} for product ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          if (rule.required) {
            throw error
          }
        }
      }

      // Handle simple "price" field - move it to variant level
      if (mappedProduct.price !== undefined && mappedProduct.price !== null) {
        // Store price at product level temporarily, will be moved to variant in normalization step
        // Keep it here for now
      }

      // Ensure variants array exists and has at least one variant
      if (!mappedProduct.variants || mappedProduct.variants.length === 0) {
        mappedProduct.variants = [{}]
      }

      // If product has a simple price field, copy it to the first variant
      if (mappedProduct.price !== undefined && mappedProduct.price !== null) {
        if (mappedProduct.variants.length > 0) {
          // Store price in variant for normalization step to pick up
          mappedProduct.variants[0]._price = mappedProduct.price
        }
      }

      // Ensure each variant has required structure
      mappedProduct.variants.forEach((variant: any) => {
        // Ensure prices is an array
        if (!variant.prices) {
          variant.prices = []
        } else if (!Array.isArray(variant.prices)) {
          // If prices is not an array (e.g., a single object), convert it to an array
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
      errors.push('Product title is required')
    }

    // Description is optional - allow empty string or missing
    // If missing, set to empty string to prevent validation errors
    if (productData.description === undefined || productData.description === null) {
      productData.description = ''
    }

    // Validate images (required for product display)
    if (!productData.images || !Array.isArray(productData.images) || productData.images.length === 0) {
      errors.push('Product images are required')
    }

    // Validate price (required - should be converted to variant prices)
    // Check if price exists at product level or variant level
    const hasProductPrice = productData.price !== undefined && productData.price !== null
    const hasVariantPrices = productData.variants && productData.variants.some(
      (v: any) => v.prices && Array.isArray(v.prices) && v.prices.length > 0
    )
    
    if (!hasProductPrice && !hasVariantPrices) {
      errors.push('Product price is required (should be mapped to price field or variant prices)')
    }

    // Validate external_id (required for tracking and updates)
    if (!productData.external_id) {
      errors.push('Product external_id is required for tracking and updates')
    }

    if (!productData.variants || productData.variants.length === 0) {
      errors.push('At least one variant is required')
    } else {
      productData.variants.forEach((variant, index) => {
        // Validate variant title (required by Medusa)
        if (!variant.title || variant.title.trim() === '') {
          errors.push(`Variant ${index + 1}: Title is required`)
        }
        
        // Handle case where prices might not be an array
        let prices = variant.prices
        if (!prices) {
          errors.push(`Variant ${index + 1}: At least one price is required`)
          return
        }

        // If prices is not an array, convert it to an array
        if (!Array.isArray(prices)) {
          prices = [prices]
        }

        if (prices.length === 0) {
          errors.push(`Variant ${index + 1}: At least one price is required`)
        } else {
          prices.forEach((price, priceIndex) => {
            if (!price || typeof price !== 'object') {
              errors.push(`Variant ${index + 1}, Price ${priceIndex + 1}: Invalid price object`)
              return
            }
            if (!price.currency_code) {
              errors.push(`Variant ${index + 1}, Price ${priceIndex + 1}: Currency code is required`)
            }
            if (typeof price.amount !== 'number' || price.amount < 0) {
              errors.push(`Variant ${index + 1}, Price ${priceIndex + 1}: Valid amount is required (got ${typeof price.amount}: ${price.amount})`)
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
      // Fetch and parse XML
      const validation = await this.validateXmlUrl(xmlUrl)
      if (!validation.valid || !validation.content) {
        return {
          sampleProducts: [],
          errors: [validation.error || 'Invalid XML URL'],
        }
      }

      const xmlData = this.parseXml(validation.content)
      const allProducts = this.extractProducts(xmlData)
      const sampleProducts = allProducts.slice(0, sampleSize)

      const previewProducts: PreviewResponse['sampleProducts'] = []

      for (const xmlProduct of sampleProducts) {
        try {
          // Create a single-item array to use mapFields
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
            errors: [error instanceof Error ? error.message : 'Unknown error'],
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
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      }
    }
  }

  /**
   * Get import status using MedusaJS repository
   */
  async getImportStatus(importId: string): Promise<any | null> {
    try {
      const executions = await this.importExecutionRepository_.find({
        where: { id: importId },
      })
      
      const execution = Array.isArray(executions) && executions.length > 0 ? executions[0] : null
      
      if (!execution) {
        return null
      }
      
      // Fetch logs separately
      const logs = await this.importExecutionLogRepository_.find({
        where: { execution_id: importId },
      })
      
      // Ensure logs is always an array and sort by timestamp
      const logsArray = Array.isArray(logs) ? logs : []
      logsArray.sort((a: any, b: any) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0
        return aTime - bTime
      })
      
      return {
        ...execution,
        logs: logsArray,
      }
    } catch (error) {
      this.logger_.error(`Error fetching import status: ${error instanceof Error ? error.message : "Unknown error"}`)
      return null
    }
  }

  /**
   * List imports using MedusaJS repository
   */
  async listImports(options: ListOptions = {}): Promise<{ imports: any[]; count: number }> {
    try {
      const where: any = {
        deleted_at: null, // Only show non-deleted executions
      }
      if (options.status) {
        where.status = options.status
      }
      if (options.configId) {
        where.config_id = options.configId
      }

      this.logger_.debug(`Listing imports with options: ${JSON.stringify(options)}`)

      // Get all imports first, then manually paginate and sort
      const allImports = await this.importExecutionRepository_.find({
        where,
      } as any)

      // Ensure imports is always an array
      const importsArray = Array.isArray(allImports) ? allImports : []
      
      // Sort by started_at descending (most recent first)
      importsArray.sort((a: any, b: any) => {
        const aTime = a.started_at ? new Date(a.started_at).getTime() : 0
        const bTime = b.started_at ? new Date(b.started_at).getTime() : 0
        return bTime - aTime // Descending order
      })

      // Apply pagination
      const offset = options.offset || 0
      const limit = options.limit || 50
      const paginatedImports = importsArray.slice(offset, offset + limit)

      this.logger_.debug(`Found ${importsArray.length} total imports, returning ${paginatedImports.length} (offset: ${offset}, limit: ${limit})`)

      return { 
        imports: paginatedImports, 
        count: importsArray.length
      }
    } catch (error) {
      this.logger_.error(`Error listing imports: ${error instanceof Error ? error.message : "Unknown error"}`)
      if (error instanceof Error && error.stack) {
        this.logger_.error(`Stack trace: ${error.stack}`)
      }
      return { imports: [], count: 0 }
    }
  }

  /**
   * Get or create category hierarchy from a delimited category path
   * Creates categories level by level if they don't exist
   * Returns the ID of the leaf (last) category
   */
  async getOrCreateCategoryHierarchy(
    categoryPath: string,
    delimiter: string,
    container: MedusaContainer,
    categoryCache?: Map<string, string>
  ): Promise<string> {
    this.logger_.info(`Processing category hierarchy: "${categoryPath}" with delimiter: "${delimiter}"`)
    
    // Normalize delimiter by removing spaces (e.g., " > " → ">")
    const normalizedDelimiter = delimiter.replace(/\s+/g, '')
    this.logger_.debug(`Normalized delimiter: "${normalizedDelimiter}"`)
    
    // Split category path by normalized delimiter
    const categoryNames = categoryPath
      .split(normalizedDelimiter)
      .map(name => name.trim())
      .filter(name => name.length > 0)
    
    this.logger_.info(`Split into ${categoryNames.length} category levels: ${categoryNames.join(' -> ')}`)
    
    if (categoryNames.length === 0) {
      throw new Error(`Invalid category path: "${categoryPath}"`)
    }

    // Initialize cache if not provided
    const cache = categoryCache || new Map<string, string>()
    
    // Resolve Product Module Service
    const productService: IProductModuleService = container.resolve(Modules.PRODUCT)
    
    let parentCategoryId: string | null = null
    
    // Process each level of the hierarchy
    for (let i = 0; i < categoryNames.length; i++) {
      const categoryName = categoryNames[i]
      const cacheKey = `${categoryName}|${parentCategoryId || 'null'}`
      
      // Check cache first
      if (cache.has(cacheKey)) {
        parentCategoryId = cache.get(cacheKey)!
        this.logger_.debug(`Found category "${categoryName}" in cache with parent ${parentCategoryId || 'null'}`)
        continue
      }
      
      // Query existing category by name and parent
      try {
        const queryParams: any = { name: categoryName }
        if (parentCategoryId !== null) {
          queryParams.parent_category_id = parentCategoryId
        } else {
          // For root categories, explicitly set parent_category_id to null
          queryParams.parent_category_id = null
        }
        const existingCategories = await productService.listProductCategories(queryParams)
        
        if (existingCategories && existingCategories.length > 0) {
          // Category exists, use its ID
          const categoryId = existingCategories[0].id
          cache.set(cacheKey, categoryId)
          parentCategoryId = categoryId
          this.logger_.debug(`Found existing category "${categoryName}" with ID ${categoryId}`)
          continue
        }
      } catch (error) {
        this.logger_.warn(`Error querying category "${categoryName}": ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      
      // Category doesn't exist, create it using Product Module Service directly
      try {
        const createdCategories = await productService.createProductCategories([
          {
            name: categoryName,
            parent_category_id: parentCategoryId,
            is_active: true,
          },
        ])
        
        if (createdCategories && createdCategories.length > 0) {
          const categoryId = createdCategories[0].id
          cache.set(cacheKey, categoryId)
          parentCategoryId = categoryId
          this.logger_.info(`Created category "${categoryName}" with ID ${categoryId} (parent: ${parentCategoryId || 'null'})`)
        } else {
          throw new Error(`Failed to create category "${categoryName}"`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // If category already exists (handle conflict), try to find it and use it
        if (errorMessage.includes('already exists') || errorMessage.includes('handle')) {
          this.logger_.debug(`Category "${categoryName}" already exists, attempting to find it`)
          
          try {
            // Try to find the existing category by name and parent
            const queryParams: any = { name: categoryName }
            if (parentCategoryId !== null) {
              queryParams.parent_category_id = parentCategoryId
            } else {
              queryParams.parent_category_id = null
            }
            
            const existingCategories = await productService.listProductCategories(queryParams)
            
            if (existingCategories && existingCategories.length > 0) {
              const categoryId = existingCategories[0].id
              cache.set(cacheKey, categoryId)
              parentCategoryId = categoryId
              this.logger_.info(`Found existing category "${categoryName}" with ID ${categoryId} (parent: ${parentCategoryId || 'null'})`)
              continue
            }
            
            // If we still can't find it, try a broader search by name only
            const allCategories = await productService.listProductCategories({ name: categoryName })
            if (allCategories && allCategories.length > 0) {
              // Find the one with matching parent (or null parent if we're looking for root)
              const matchingCategory = allCategories.find((cat: any) => 
                parentCategoryId === null 
                  ? !cat.parent_category_id 
                  : cat.parent_category_id === parentCategoryId
              )
              
              if (matchingCategory) {
                const categoryId = matchingCategory.id
                cache.set(cacheKey, categoryId)
                parentCategoryId = categoryId
                this.logger_.info(`Found existing category "${categoryName}" with ID ${categoryId} (parent: ${parentCategoryId || 'null'}) via broader search`)
                continue
              }
            }
          } catch (findError) {
            this.logger_.warn(`Error finding existing category "${categoryName}": ${findError instanceof Error ? findError.message : 'Unknown error'}`)
          }
        }
        
        // If we couldn't recover from the error, throw it
        this.logger_.error(`Error creating category "${categoryName}": ${errorMessage}`)
        throw new Error(`Failed to create category "${categoryName}": ${errorMessage}`)
      }
    }
    
    // Return the leaf category ID
    if (!parentCategoryId) {
      throw new Error(`Failed to get category ID for path: "${categoryPath}"`)
    }
    
    return parentCategoryId
  }
}

export default XmlProductImporterService

