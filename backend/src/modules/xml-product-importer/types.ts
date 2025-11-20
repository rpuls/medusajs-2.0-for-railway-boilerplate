/**
 * Type definitions for XML Product Importer module
 */

export interface FieldMapping {
  id?: string
  name: string
  description?: string
  xmlUrl?: string // XML URL used to create this mapping
  mappings: FieldMappingRule[]
  created_at?: Date
  updated_at?: Date
}

export interface FieldMappingRule {
  xmlPath: string // Path to XML field (e.g., "product.title", "product.variants[0].price")
  medusaField: string // Medusa field name (e.g., "title", "variants.0.price")
  transform?: (value: any) => any // Optional transformation function
  required?: boolean
  defaultValue?: any
  // Image collection specific options
  isImageCollection?: boolean // If true, this field contains multiple images separated by delimiter
  imageDelimiter?: string // Delimiter for splitting image URLs (default: ", ")
  uploadToMinIO?: boolean // Whether to upload images to MinIO (default: false in dev, true in production)
  // Category hierarchy specific options
  categoryDelimiter?: string // Delimiter for splitting category hierarchy (default: ">")
}

export interface ImportConfig {
  id?: string
  name: string
  description?: string
  xmlUrl: string
  mappingId: string // Reference to saved mapping
  options: ImportOptions
  recurring?: RecurringImportConfig
  enabled?: boolean
  created_at?: Date
  updated_at?: Date
}

export interface ImportOptions {
  updateExisting?: boolean // Update existing products (by SKU or handle)
  updateBy?: 'sku' | 'handle' // How to match existing products
  skipErrors?: boolean // Continue on errors
  batchSize?: number // Products per batch (default: 100)
  updateFields?: UpdateFieldsConfig // Which fields to update for recurring imports
}

export interface UpdateFieldsConfig {
  prices?: boolean
  stock?: boolean
  fullProduct?: boolean // Update all product data
}

export interface RecurringImportConfig {
  enabled: boolean
  schedule: string // Cron expression
  timezone?: string
}

export interface ImportExecution {
  id: string
  configId: string
  status: ImportStatus
  startedAt: Date
  completedAt?: Date
  totalProducts?: number
  processedProducts?: number
  successfulProducts?: number
  failedProducts?: number
  error?: string
  logs?: ImportExecutionLog[]
}

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface ImportExecutionLog {
  id: string
  executionId: string
  level: 'info' | 'warning' | 'error'
  message: string
  productIndex?: number
  productData?: any
  error?: any
  timestamp: Date
}

export interface PreviewRequest {
  xmlUrl: string
  mapping: FieldMapping
  sampleSize?: number // Number of products to preview (default: 3)
}

export interface PreviewResponse {
  sampleProducts: PreviewProduct[]
  totalProducts?: number
  errors?: string[]
}

export interface PreviewProduct {
  original: any // Original XML data
  mapped: any // Mapped Medusa product structure
  errors?: string[]
}

export interface ListOptions {
  limit?: number
  offset?: number
  status?: ImportStatus
  configId?: string
}

export interface ProductData {
  title: string
  description?: string
  handle?: string
  status?: 'draft' | 'published'
  images?: Array<{ url: string }>
  variants: Array<{
    title?: string
    sku?: string
    prices: Array<{
      amount: number
      currency_code: string
    }>
    inventory_quantity?: number
    manage_inventory?: boolean
  }>
  metadata?: Record<string, any>
  [key: string]: any
}

