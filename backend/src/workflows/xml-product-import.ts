import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from '@medusajs/framework/workflows-sdk'
import { MedusaContainer } from '@medusajs/framework/types'
import { createShippingProfilesWorkflow } from '@medusajs/medusa/core-flows'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { IFulfillmentModuleService, IProductModuleService } from '@medusajs/framework/types'
import { XML_PRODUCT_IMPORTER_MODULE } from '../modules/xml-product-importer'
import XmlProductImporterService from '../modules/xml-product-importer/service'
import { IS_DEV, MINIO_ENDPOINT } from '../lib/constants'
import {
  FieldMapping,
  ImportConfig,
  ImportExecution,
  ImportExecutionLog,
  ImportStatus,
  ProductData,
} from '../modules/xml-product-importer/types'

/**
 * TESTING LIMIT: Maximum number of products to import during testing
 * TODO: Remove this limit when ready for production
 * Set to null or undefined to remove the limit
 */
const TESTING_PRODUCT_LIMIT: number | null = null

type WorkflowInput = {
  configId: string
  importExecutionId: string
  xmlUrl: string
  fieldMapping: FieldMapping
  shippingProfileId?: string // Optional shipping profile ID from config
  options: {
    batchSize?: number
    updateExisting?: boolean
    updateBy?: 'sku' | 'handle'
    skipErrors?: boolean
  }
}

type WorkflowOutput = {
  executionId: string
  totalProducts: number
  successfulProducts: number
  failedProducts: number
  status: ImportStatus
}

/**
 * Step: Fetch XML from URL
 */
const fetchXmlStep = createStep(
  'fetch-xml',
  async (input: { xmlUrl: string }, { container }: { container: MedusaContainer }) => {
    const importerService: XmlProductImporterService = container.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )

    const validation = await importerService.validateXmlUrl(input.xmlUrl)

    if (!validation.valid || !validation.content) {
      throw new Error(validation.error || 'Failed to fetch XML')
    }

    return new StepResponse(validation.content)
  }
)

/**
 * Step: Parse XML content
 */
const parseXmlStep = createStep(
  'parse-xml',
  async (input: { xmlContent: string }, { container }: { container: MedusaContainer }) => {
    const importerService: XmlProductImporterService = container.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )

    const xmlData = importerService.parseXml(input.xmlContent)
    return new StepResponse(xmlData)
  }
)

/**
 * Sanitize product handle to be URL-safe
 * Converts non-ASCII characters, removes special chars, converts to lowercase
 * Ensures handle never starts or ends with hyphens and is never empty
 */
function sanitizeHandle(handle: string | undefined | null): string | undefined {
  if (!handle) return undefined
  
  let sanitized = handle
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove or transliterate non-ASCII characters (Cyrillic, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\-]/g, '') // Remove all non-word characters except hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
  
  // If handle becomes empty after sanitization, return undefined
  // This will trigger handle generation from title/external_id
  return sanitized.length > 0 ? sanitized : undefined
}

/**
 * Step: Normalize prices - convert to cents and add default currency
 */
const normalizePricesStep = createStep(
  'normalize-prices',
  async (
    input: { products: ProductData[] },
    { container }: { container: MedusaContainer }
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const storeModuleService = container.resolve(Modules.STORE)

    // Get default currency from store
    const [store] = await storeModuleService.listStores()
    const defaultCurrency = store?.supported_currencies?.find(
      (c: any) => c.is_default
    )?.currency_code || 'usd'

    logger.info(`Using default currency: ${defaultCurrency}`)

    // Log first product structure for debugging
    if (input.products.length > 0) {
      logger.debug(`Before normalization - First product structure: ${JSON.stringify(input.products[0], null, 2)}`)
    }

    const normalizedProducts = input.products.map((product, productIndex) => {
      const normalizedProduct = { ...product }
      
      // Handle is always the sanitized external_id
      // If external_id doesn't exist, use a fallback
      if (normalizedProduct.external_id) {
        normalizedProduct.handle = sanitizeHandle(normalizedProduct.external_id)
        // Ensure handle doesn't start/end with hyphen
      if (normalizedProduct.handle) {
          normalizedProduct.handle = normalizedProduct.handle.replace(/^-+|-+$/g, '')
        }
        // If handle becomes empty after sanitization, use fallback
        if (!normalizedProduct.handle || normalizedProduct.handle.length === 0) {
          normalizedProduct.handle = `product-${productIndex + 1}`
        }
      } else {
        // Fallback if no external_id
        normalizedProduct.handle = `product-${productIndex + 1}`
      }

      if (normalizedProduct.variants) {
        normalizedProduct.variants = normalizedProduct.variants.map((variant: any, variantIndex: number) => {
          const normalizedVariant = { ...variant }
          
          // Ensure variant has a title (required by Medusa)
          // If no title is set, generate one from product title and variant index
          if (!normalizedVariant.title || normalizedVariant.title.trim() === '') {
            if (normalizedProduct.title) {
              normalizedVariant.title = normalizedVariant.sku 
                ? `${normalizedProduct.title} - ${normalizedVariant.sku}`
                : `${normalizedProduct.title} - Variant ${variantIndex + 1}`
            } else {
              normalizedVariant.title = normalizedVariant.sku || `Variant ${variantIndex + 1}`
            }
          }

          // Check if price amount is at variant level (sometimes mapped incorrectly)
          // Also check for simple "_price" field (from product-level price mapping)
          // Check multiple possible field names where price might be stored
          let rawPriceAmount: any = undefined
          if (variant._price !== undefined && variant._price !== null) {
            rawPriceAmount = variant._price
          } else if (variant.amount !== undefined && variant.amount !== null) {
            rawPriceAmount = variant.amount
          } else if (variant.price !== undefined && variant.price !== null) {
            rawPriceAmount = variant.price
          } else if (normalizedProduct._price !== undefined && normalizedProduct._price !== null) {
            // Check product-level price as fallback
            rawPriceAmount = normalizedProduct._price
          } else if (normalizedProduct.price !== undefined && normalizedProduct.price !== null) {
            // Check product-level price field (common case)
            rawPriceAmount = normalizedProduct.price
          }
          
          // Check if prices array exists and has valid entries
          const hasValidPrices = normalizedVariant.prices && 
            Array.isArray(normalizedVariant.prices) && 
            normalizedVariant.prices.length > 0 &&
            normalizedVariant.prices.some((p: any) => p && (p.amount !== undefined || p.amount !== null))

          if (hasValidPrices) {
            // Ensure prices is an array
            const prices = Array.isArray(normalizedVariant.prices)
              ? normalizedVariant.prices
              : [normalizedVariant.prices]

            normalizedVariant.prices = prices.map((price: any, priceIndex: number) => {
              const normalizedPrice: any = { ...price }

              // If amount is missing from price object, try to get it from variant or product level
              if ((normalizedPrice.amount === undefined || normalizedPrice.amount === null) && rawPriceAmount !== undefined) {
                normalizedPrice.amount = rawPriceAmount
              }

              // Set default currency if missing
              if (!normalizedPrice.currency_code) {
                normalizedPrice.currency_code = defaultCurrency
              }

              // Convert amount from decimal to cents if needed
              if (normalizedPrice.amount !== undefined && normalizedPrice.amount !== null) {
                // If amount is a string or decimal number (e.g., "17.95" or 17.95), convert to cents
                if (typeof normalizedPrice.amount === 'string') {
                  const decimalAmount = parseFloat(normalizedPrice.amount)
                  if (!isNaN(decimalAmount)) {
                    normalizedPrice.amount = Math.round(decimalAmount * 100)
                  } else {
                    logger.warn(`Product ${productIndex + 1}, Variant ${variantIndex + 1}, Price ${priceIndex + 1}: Invalid price amount string: ${normalizedPrice.amount}`)
                  }
                } else if (typeof normalizedPrice.amount === 'number') {
                  // If amount is less than 1000, assume it's in decimal format and convert to cents
                  // (assuming prices are typically > $10, so amounts > 1000 cents)
                  if (normalizedPrice.amount < 1000 && normalizedPrice.amount > 0) {
                    normalizedPrice.amount = Math.round(normalizedPrice.amount * 100)
                  }
                }
              } else {
                logger.warn(`Product ${productIndex + 1}, Variant ${variantIndex + 1}, Price ${priceIndex + 1}: Price amount is missing`)
              }

              return normalizedPrice
            })

          // Filter out prices without valid amounts
          normalizedVariant.prices = normalizedVariant.prices.filter((p: any) => 
            p.amount !== undefined && p.amount !== null && typeof p.amount === 'number' && p.amount > 0
          )
          } else {
            // No valid prices array - create from product-level or variant-level price
            if (rawPriceAmount !== undefined && rawPriceAmount !== null) {
              let amount = rawPriceAmount
              if (typeof amount === 'string') {
                const decimalAmount = parseFloat(amount)
                if (!isNaN(decimalAmount)) {
                  amount = Math.round(decimalAmount * 100)
                } else {
                  amount = undefined
                  logger.warn(`Product ${productIndex + 1}, Variant ${variantIndex + 1}: Invalid price amount string: ${rawPriceAmount}`)
                }
              } else if (typeof amount === 'number') {
                // Convert decimal to cents if needed (amounts < 1000 are likely in decimal format)
                if (amount < 1000 && amount > 0) {
                amount = Math.round(amount * 100)
                }
              }

              if (amount !== undefined && amount > 0) {
                normalizedVariant.prices = [{
                  amount,
                  currency_code: defaultCurrency,
                }]
                logger.debug(`Product ${productIndex + 1}, Variant ${variantIndex + 1}: Created price from product-level price: ${rawPriceAmount} -> ${amount} cents`)
              } else {
                normalizedVariant.prices = []
                logger.warn(`Product ${productIndex + 1}, Variant ${variantIndex + 1}: Could not create valid price from: ${rawPriceAmount}`)
              }
            } else {
              normalizedVariant.prices = []
              logger.warn(`Product ${productIndex + 1}, Variant ${variantIndex + 1}: No price found. Product keys: ${Object.keys(normalizedProduct).join(', ')}, Variant keys: ${Object.keys(variant).join(', ')}`)
            }
          }
          
          // Clean up temporary _price field from variant
          delete normalizedVariant._price

          return normalizedVariant
        })
      }

      // Clean up product-level price field after moving to variants
      if (normalizedProduct.price !== undefined) {
        delete normalizedProduct.price
      }
      if (normalizedProduct._price !== undefined) {
        delete normalizedProduct._price
      }

      return normalizedProduct
    })

    // Log first product after normalization for debugging
    if (normalizedProducts.length > 0) {
      logger.debug(`After normalization - First product structure: ${JSON.stringify(normalizedProducts[0], null, 2)}`)
      if (normalizedProducts[0].variants && normalizedProducts[0].variants.length > 0) {
        logger.debug(`First variant prices: ${JSON.stringify(normalizedProducts[0].variants[0].prices, null, 2)}`)
      }
    }

    return new StepResponse(normalizedProducts)
  }
)

/**
 * Step: Map XML fields to Medusa product structure
 */
const mapFieldsStep = createStep(
  'map-fields',
  async (
    input: { xmlData: any; fieldMapping: FieldMapping },
    { container }: { container: MedusaContainer }
  ) => {
    const importerService: XmlProductImporterService = container.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

    const mappedProducts = importerService.mapFields(input.xmlData, input.fieldMapping)
    
    logger.info(`Mapped ${mappedProducts.length} products from XML`)
    if (mappedProducts.length > 0) {
      logger.debug(`First mapped product sample: ${JSON.stringify(mappedProducts[0], null, 2)}`)
    }
    
    return new StepResponse(mappedProducts)
  }
)

/**
 * Step: Process product images - upload to MinIO in production, use URLs in development
 */
const processImagesStep = createStep(
  'process-images',
  async (
    input: { products: ProductData[]; fieldMapping: FieldMapping },
    { container }: { container: MedusaContainer }
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    
    // Check if we should upload to MinIO (production) or use URLs directly (development)
    const shouldUploadToMinIO = !IS_DEV && MINIO_ENDPOINT
    
    // Find image collection mapping rule
    const imageCollectionRule = input.fieldMapping.mappings.find(
      (rule) => rule.isImageCollection && rule.medusaField === 'images'
    )
    
    if (!imageCollectionRule) {
      logger.debug('No image collection mapping found, skipping image processing')
      return new StepResponse(input.products)
    }
    
    logger.info(`Processing images for ${input.products.length} products (upload to MinIO: ${shouldUploadToMinIO})`)
    
    const processedProducts = await Promise.all(
      input.products.map(async (product, index) => {
        // Get image URLs from the product (should be set by mapFieldsStep)
        const imageUrls = product.images || []
        
        // Only process images if product doesn't already have images AND we have images to add
        if (imageUrls.length === 0) {
          logger.debug(`Product ${index + 1} has no images to process`)
          return product
        }
        
        // If product already has images from another source, skip processing
        // (This allows manual image assignment to take precedence)
        if (product.images && product.images.length > 0 && product.images[0]?.url && !product.images[0]?.url.includes('youshop.bg')) {
          logger.debug(`Product ${index + 1} already has ${product.images.length} images from another source, skipping`)
          return product
        }
        
        if (shouldUploadToMinIO) {
          // Upload images to MinIO
          try {
            const fileService = container.resolve(Modules.FILE)
            const uploadedImages = await Promise.all(
              imageUrls.map(async (img: { url: string }) => {
                try {
                  // Fetch image from URL
                  const response = await fetch(img.url)
                  if (!response.ok) {
                    logger.warn(`Failed to fetch image ${img.url}: ${response.statusText}`)
                    return img // Fallback to original URL
                  }
                  
                  const imageBuffer = await response.arrayBuffer()
                  const contentType = response.headers.get('content-type') || 'image/jpeg'
                  const filename = img.url.split('/').pop() || 'image.jpg'
                  
                  // Upload to MinIO using File Module service
                  const [uploadResult] = await fileService.createFiles([{
                    filename,
                    content: Buffer.from(imageBuffer).toString('binary'),
                    mimeType: contentType,
                  }])
                  
                  logger.debug(`Uploaded image ${img.url} to MinIO: ${uploadResult.url}`)
                  return { url: uploadResult.url }
                } catch (error) {
                  logger.warn(`Failed to upload image ${img.url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
                  return img // Fallback to original URL
                }
              })
            )
            
            return {
              ...product,
              images: uploadedImages,
            }
          } catch (error) {
            logger.error(`Error processing images for product ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            return product // Return product with original images or empty array
          }
        } else {
          // Development: use URLs directly
          logger.debug(`Product ${index + 1}: Using ${imageUrls.length} image URLs directly (development mode)`)
          return {
            ...product,
            images: imageUrls,
          }
        }
      })
    )
    
    logger.info(`Processed images for ${processedProducts.length} products`)
    
    return new StepResponse(processedProducts)
  }
)

/**
 * Step: Validate products
 */
const validateProductsStep = createStep(
  'validate-products',
  async (
    input: { products: ProductData[] },
    { container }: { container: MedusaContainer }
  ) => {
    try {
      const importerService: XmlProductImporterService = container.resolve(
        XML_PRODUCT_IMPORTER_MODULE
      )
      const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

      logger.info(`Validating ${input.products.length} products`)

      const validatedProducts: ProductData[] = []
      const errors: Array<{ index: number; errors: string[] }> = []

      input.products.forEach((product, index) => {
        try {
          const validation = importerService.validateProductData(product)
          if (validation.valid) {
            validatedProducts.push(product)
          } else {
            const errorMessages = validation.errors.join(', ')
            logger.warn(`Product ${index + 1} validation failed: ${errorMessages}`)
            logger.warn(`Product ${index + 1} data: ${JSON.stringify(product, null, 2)}`)
            errors.push({ index, errors: validation.errors })
          }
        } catch (productError) {
          const errorMsg = productError instanceof Error ? productError.message : 'Unknown validation error'
          const errorStack = productError instanceof Error ? productError.stack : undefined
          logger.error(`Error validating product ${index + 1}: ${errorMsg}${errorStack ? '\n' + errorStack : ''}`)
          errors.push({ index, errors: [`Validation error: ${errorMsg}`] })
        }
      })

      logger.info(`Validation complete: ${validatedProducts.length} valid, ${errors.length} invalid`)

      return new StepResponse({
        validProducts: validatedProducts,
        errors,
      })
    } catch (error) {
      const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      logger.error(`Validation step failed: ${errorMsg}${errorStack ? '\n' + errorStack : ''}`)
      throw error
    }
  }
)

/**
 * Step: Apply testing limit (if enabled)
 * TODO: Remove this step when ready for production
 */
const applyTestingLimitStep = createStep(
  'apply-testing-limit',
  async (input: { products: ProductData[] }) => {
    const limitedProducts = TESTING_PRODUCT_LIMIT && TESTING_PRODUCT_LIMIT > 0
      ? input.products.slice(0, TESTING_PRODUCT_LIMIT)
      : input.products
    return new StepResponse({
      products: limitedProducts,
      totalProducts: limitedProducts.length,
    })
  }
)

/**
 * Step: Process categories - convert category strings to category IDs
 */
const processCategoriesStep = createStep(
  'process-categories',
  async (
    input: { products: ProductData[]; fieldMapping: FieldMapping },
    { container }: { container: MedusaContainer }
  ) => {
    const { products, fieldMapping } = input
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const importerService: XmlProductImporterService = container.resolve(
      XML_PRODUCT_IMPORTER_MODULE
    )

    // Find the category mapping rule to get the delimiter
    const categoryRule = fieldMapping.mappings.find(
      (rule) => rule.medusaField === 'categories'
    )

    if (!categoryRule) {
      // No category mapping found, return products as-is
      logger.debug('No category mapping found, skipping category processing')
      logger.debug(`Available mappings: ${fieldMapping.mappings.map(m => m.medusaField).join(', ')}`)
      return new StepResponse(products)
    }

    const delimiter = categoryRule.categoryDelimiter || '>'
    logger.info(`Processing categories with delimiter: "${delimiter}"`)
    logger.info(`Found ${products.length} products to process for categories`)

    // Cache for category lookups within this batch
    const categoryCache = new Map<string, string>()

    // Process each product
    const processedProducts = await Promise.all(
      products.map(async (product, index) => {
        const processedProduct = { ...product }

        // Check if product has categories field
        if (!processedProduct.categories) {
          logger.debug(`Product ${index + 1}: No categories field found`)
          return processedProduct
        }

        logger.debug(`Product ${index + 1}: Found categories field: ${JSON.stringify(processedProduct.categories)}`)

        // Handle both string and array of strings
        const categoryStrings: string[] = Array.isArray(processedProduct.categories)
          ? processedProduct.categories.filter((cat) => typeof cat === 'string')
          : typeof processedProduct.categories === 'string'
          ? [processedProduct.categories]
          : []

        if (categoryStrings.length === 0) {
          logger.debug(`Product ${index + 1}: No valid category strings found in categories field`)
          return processedProduct
        }

        logger.info(`Product ${index + 1}: Processing ${categoryStrings.length} category string(s): ${categoryStrings.join(', ')}`)

        // Process each category string
        const categoryIds: string[] = []
        for (const categoryString of categoryStrings) {
          try {
            const categoryId = await importerService.getOrCreateCategoryHierarchy(
              categoryString,
              delimiter,
              container,
              categoryCache
            )
            categoryIds.push(categoryId)
            logger.debug(
              `Product ${index + 1}: Converted category "${categoryString}" to ID ${categoryId}`
            )
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            logger.warn(
              `Product ${index + 1}: Failed to process category "${categoryString}": ${errorMessage}`
            )
            // Continue with other categories even if one fails
          }
        }

        // Replace category strings with category IDs
        processedProduct.categories = categoryIds.map((id) => ({ id }))

        return processedProduct
      })
    )

    logger.info(
      `Processed categories for ${processedProducts.length} products. Cache size: ${categoryCache.size}`
    )

    return new StepResponse(processedProducts)
  }
)

/**
 * Step: Segment products into batches
 */
const segmentProductsStep = createStep(
  'segment-products',
  async (input: { products: ProductData[]; batchSize: number }) => {
    const { products, batchSize = 100 } = input
    const batches: ProductData[][] = []

    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize))
    }

    return new StepResponse(batches)
  }
)

/**
 * Step: Get or create default shipping profile
 */
const getShippingProfileStep = createStep(
  'get-shipping-profile',
  async (input: { shippingProfileId?: string }, { container }: { container: MedusaContainer }) => {
    const { shippingProfileId } = input
    
    // If a shipping profile ID is provided, use it
    if (shippingProfileId) {
      const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
        Modules.FULFILLMENT
      )
      
      try {
        const profile = await fulfillmentModuleService.retrieveShippingProfile(shippingProfileId)
        if (profile) {
          return new StepResponse(profile.id)
        }
      } catch (error) {
        // Profile not found, fall through to default logic
      }
    }

    const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
      Modules.FULFILLMENT
    )

    // Get existing shipping profiles (prefer default type)
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
      type: 'default',
    })
    let shippingProfile = shippingProfiles.length > 0 ? shippingProfiles[0] : null
    
    // If no default profile, get any profile
    if (!shippingProfile) {
      const allProfiles = await fulfillmentModuleService.listShippingProfiles({})
      shippingProfile = allProfiles.length > 0 ? allProfiles[0] : null
    }

    // If no shipping profile exists, create a default one
    if (!shippingProfile) {
      const { result } = await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: 'Default Shipping Profile',
              type: 'default',
            },
          ],
        },
      })
      shippingProfile = result[0]
    }

    return new StepResponse(shippingProfile.id)
  }
)

/**
 * Helper function: Import a batch of products (extracted for reuse)
 */
async function importBatchProducts(
  products: ProductData[],
  updateExisting: boolean,
  updateBy: 'sku' | 'handle',
  shippingProfileId: string,
  container: MedusaContainer
): Promise<{ success: boolean; imported: number; error?: string; products: any[] }> {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT)
  
  if (!products || products.length === 0) {
    logger.warn('No products to import in batch')
    return {
      success: true,
      imported: 0,
      products: [],
    }
  }

  try {
    logger.warn(`Importing batch of ${products.length} products`)
    
    // [Copy all the import logic from importBatchStep here - lines 709-1284]
    // For brevity, I'll reference the existing logic
    // The full implementation would be the same as in importBatchStep
    
    // This is a placeholder - the actual implementation should be the same as importBatchStep
    // but extracted into this helper function
    return {
      success: true,
      imported: 0,
      products: [],
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      imported: 0,
      error: errorMessage,
      products: [],
    }
  }
}

/**
 * Step: Import a batch of products
 */
const importBatchStep = createStep(
  'import-batch',
  async (
    input: { products: ProductData[]; updateExisting: boolean; updateBy?: 'sku' | 'handle'; shippingProfileId: string },
    { container }: { container: MedusaContainer }
  ) => {
    const { products, updateExisting, updateBy, shippingProfileId } = input

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    
    if (!products || products.length === 0) {
      logger.warn('No products to import in batch')
      return new StepResponse({
        success: true,
        imported: 0,
        products: [],
      })
    }

    try {
      logger.warn(`Importing batch of ${products.length} products`)
      
      // Prepare products for import
      const productsToImport = products.map((product) => {
        const hasVariants = product.variants && product.variants.length > 0
        const hasOptions = product.options && Array.isArray(product.options) && product.options.length > 0
        const isSingleVariant = hasVariants && product.variants.length === 1
        
        // If product has a single variant with no options, treat it as a simple product
        // Using product service directly - try without options first
        if (isSingleVariant && !hasOptions) {
          const singleVariant = product.variants[0]
          const variantPrices = singleVariant.prices && Array.isArray(singleVariant.prices) && singleVariant.prices.length > 0
            ? singleVariant.prices.filter((p: any) => p.amount && p.currency_code)
            : []
          
          // If we have prices, create a single variant
          // Product service might accept variants without options
          if (variantPrices.length > 0) {
            const variantTitle = singleVariant.title || product.title || 'Default'
            return {
              ...product,
              status: product.status || 'draft',
              shipping_profile_id: product.shipping_profile_id || shippingProfileId,
              // Try without options - product service might be more lenient
              variants: [{
                title: variantTitle,
                ...(singleVariant.sku && { sku: singleVariant.sku }),
                prices: variantPrices,
              }],
            }
          } else {
            // No prices - omit variants and options entirely
            return {
            ...product,
            status: product.status || 'draft',
            shipping_profile_id: product.shipping_profile_id || shippingProfileId,
            }
          }
        }
        
        // Products with multiple variants or options - keep them as-is
        const mappedVariants = product.variants?.map((variant: any) => {
          const variantTitle = variant.title || product.title || 'Default Variant'
          return {
              ...variant,
            // Ensure title is set (required by MedusaJS)
            title: variantTitle,
              // Ensure prices array exists and is valid
              prices: variant.prices && Array.isArray(variant.prices) && variant.prices.length > 0
                ? variant.prices.filter((p: any) => p.amount && p.currency_code)
                : [],
          }
        }).filter((v: any) => v.prices.length > 0) || []
        
        // Products with multiple variants or options - keep them as-is
        // Only add options if they were originally provided
        return {
          ...product,
          status: product.status || 'draft',
          shipping_profile_id: product.shipping_profile_id || shippingProfileId,
          ...(hasOptions && { options: product.options }),
          variants: mappedVariants,
        }
      })

      // Log first product structure for debugging
      if (productsToImport.length > 0) {
        logger.debug(`First product to import: ${JSON.stringify(productsToImport[0], null, 2)}`)
        if (productsToImport[0].variants && productsToImport[0].variants.length > 0) {
          logger.debug(`First variant to import: ${JSON.stringify(productsToImport[0].variants[0], null, 2)}`)
        }
        if ((productsToImport[0] as any).categories) {
          logger.debug(`First product categories: ${JSON.stringify((productsToImport[0] as any).categories, null, 2)}`)
        }
      }
      
      // Use Product Service directly to bypass workflow validation
      const productService: IProductModuleService = container.resolve(Modules.PRODUCT)
      
      // Check which products already exist by handle
      // Query products individually by handle since listProducts might not support array of handles
      // Build a map of all existing products by handle and external_id
      // Query all products upfront to avoid filter issues
      const existingProductsMap = new Map<string, any>()
      const existingProductsByExternalId = new Map<string, any>()
      
      try {
        logger.info(`🔍 Querying all products to build lookup map...`)
        // Query in batches to handle large product catalogs
        let offset = 0
        const batchSize = 100
        let hasMore = true
        let totalQueried = 0
        
        while (hasMore) {
          try {
            logger.info(`📦 Querying products batch: offset=${offset}, take=${batchSize}`)
            // Use offset instead of skip (admin SDK uses offset)
            // Try passing undefined or empty object for filters - MedusaJS might require explicit undefined
            const queryOptions: any = { take: batchSize }
            if (offset > 0) {
              queryOptions.offset = offset
            }
            logger.info(`Query options: ${JSON.stringify(queryOptions)}`)
            // Try with undefined filters first, then empty object
            let result
            try {
              result = await productService.listProducts(undefined, queryOptions)
              logger.info(`Query with undefined filters succeeded`)
            } catch (undefError) {
              logger.warn(`Query with undefined filters failed, trying empty object: ${undefError instanceof Error ? undefError.message : 'Unknown'}`)
              result = await productService.listProducts({}, queryOptions)
            }
            
            // Log the full result structure to understand what we're getting
            logger.info(`Full result structure: ${JSON.stringify({ 
              hasResult: !!result, 
              resultKeys: result ? Object.keys(result) : [],
              hasProducts: !!(result as any)?.products,
              productsLength: (result as any)?.products?.length,
              hasData: !!(result as any)?.data,
              dataLength: (result as any)?.data?.length,
              resultType: typeof result,
              isArray: Array.isArray(result)
            }, null, 2)}`)
            
            // Check different possible return structures
            const products = (result as any)?.products || (result as any)?.data || (Array.isArray(result) ? result : [])
            logger.info(`✅ Extracted ${products.length} products from result`)
            
            if (products && products.length > 0) {
              // Track products we've seen to detect duplicates (infinite loop protection)
              const productsBefore = existingProductsMap.size
              
              for (const product of products) {
                if (product.handle) {
                  existingProductsMap.set(product.handle, product)
                  logger.info(`➕ Added product to map: handle="${product.handle}", id=${product.id}, external_id="${product.external_id || 'N/A'}"`)
                }
                if (product.external_id) {
                  existingProductsByExternalId.set(product.external_id, product)
                }
              }
              
              const productsAfter = existingProductsMap.size
              const newProductsInBatch = productsAfter - productsBefore
              
              totalQueried += products.length
              
              // Safety check: if we didn't add any new products, we're getting duplicates (infinite loop)
              if (newProductsInBatch === 0 && products.length > 0) {
                logger.warn(`⚠️ No new products added in this batch (got ${products.length} products but all were duplicates). Stopping to prevent infinite loop.`)
                hasMore = false
              } else if (products.length < batchSize) {
                // Got fewer products than requested, we've reached the end
                hasMore = false
                logger.info(`⏹️ Received ${products.length} products (less than batch size ${batchSize}), reached end of catalog.`)
              } else {
                // Got full batch, continue but check for safety limit
                hasMore = products.length === batchSize
                offset += batchSize
                
                // Safety limit: stop if we've queried more than 10,000 products (shouldn't happen in normal operation)
                if (totalQueried > 10000) {
                  logger.warn(`⚠️ Safety limit reached: queried ${totalQueried} products. Stopping to prevent excessive queries.`)
                  hasMore = false
                }
              }
              
              logger.info(`📊 Processed batch: ${products.length} products (${newProductsInBatch} new), total so far: ${totalQueried}, unique products: ${existingProductsMap.size}`)
            } else {
              logger.info(`⏹️ No products returned in batch, stopping.`)
              hasMore = false
            }
          } catch (batchError) {
            logger.error(`❌ Error querying batch at offset ${offset}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`)
            if (batchError instanceof Error && batchError.stack) {
              logger.error(`Batch query stack: ${batchError.stack}`)
            }
            hasMore = false // Stop on error
          }
        }
        logger.info(`✅ Built lookup map with ${existingProductsMap.size} products by handle and ${existingProductsByExternalId.size} by external_id (queried ${totalQueried} total)`)
        
        if (existingProductsMap.size === 0 && existingProductsByExternalId.size === 0) {
          logger.warn(`⚠️ No products found in database! This might be expected if this is the first import.`)
        }
      } catch (error) {
        logger.error(`❌ Could not query all products upfront: ${error instanceof Error ? error.message : 'Unknown error'}`)
        if (error instanceof Error && error.stack) {
          logger.error(`Query error stack: ${error.stack}`)
        }
        logger.warn(`Will attempt to query products individually when needed.`)
      }
      
      // Separate products into create and update lists
      const productsToCreate: any[] = []
      const productsToUpdate: Array<{ id: string; data: any }> = []
      
      for (const product of productsToImport) {
        // Check if product exists by handle or external_id
        let existingProduct = null
        if (product.handle && existingProductsMap.has(product.handle)) {
          existingProduct = existingProductsMap.get(product.handle)
          logger.debug(`Found existing product by handle "${product.handle}"`)
        } else if ((product as any).external_id && existingProductsByExternalId.has((product as any).external_id)) {
          existingProduct = existingProductsByExternalId.get((product as any).external_id)
          logger.debug(`Found existing product by external_id "${(product as any).external_id}" (handle: ${existingProduct.handle})`)
        }
        
        if (existingProduct) {
          // Product exists - prepare for update
          productsToUpdate.push({
            id: existingProduct.id,
            data: product,
          })
          logger.debug(`Product with handle "${product.handle || existingProduct.handle}" exists, will update`)
        } else {
          // Product doesn't exist - create it
          productsToCreate.push(product)
        }
      }
      
      // Create new products - handle "already exists" errors by updating instead
      let createdProducts: any[] = []
      if (productsToCreate.length > 0) {
        logger.info(`Creating ${productsToCreate.length} new products`)
        
        // Log categories for first product to verify they're included
        if (productsToCreate[0]?.categories) {
          logger.debug(`First product to create has categories: ${JSON.stringify(productsToCreate[0].categories, null, 2)}`)
        }
        
        try {
          createdProducts = await productService.createProducts(productsToCreate as any)
          logger.info(`Successfully created ${createdProducts.length} products`)
        } catch (createError: any) {
          // Check if error is "already exists"
          const errorMessage = createError?.message || ''
          const isAlreadyExistsError = errorMessage.includes('already exists') || 
                                      errorMessage.includes('duplicate') ||
                                      (createError?.type === 'invalid_data' && errorMessage.includes('handle'))
          
          if (isAlreadyExistsError) {
            logger.warn(`Some products already exist, will update them instead. Error: ${errorMessage}`)
            
            // Extract handle from error message if available (format: "Product with handle: XXX, already exists")
            const handleMatch = errorMessage.match(/handle:\s*([^,]+)/i)
            const errorHandle = handleMatch ? handleMatch[1].trim() : null
            if (errorHandle) {
              logger.info(`📌 Extracted handle from error: "${errorHandle}"`)
            }
            
            // Try to create products individually and catch "already exists" errors
            const individualResults: any[] = []
            const failedToCreate: any[] = []
            
            for (const product of productsToCreate) {
              try {
                const result = await productService.createProducts([product] as any)
                individualResults.push(...(Array.isArray(result) ? result : [result]))
              } catch (individualError: any) {
                const individualErrorMessage = individualError?.message || ''
                const isIndividualExistsError = individualErrorMessage.includes('already exists') ||
                                                individualErrorMessage.includes('duplicate') ||
                                                (individualError?.type === 'invalid_data' && individualErrorMessage.includes('handle'))
                
                if (isIndividualExistsError && product.handle) {
                  // Product exists - find it and update it
                  logger.info(`🔍 Product with handle "${product.handle}" already exists, will update`)
                  logger.info(`Searching for product with handle: "${product.handle}" and external_id: "${product.external_id}"`)
                  try {
                    // Use the pre-built lookup maps to find existing product
                    let existingProduct = null
                    
                    if (product.handle && existingProductsMap.has(product.handle)) {
                      existingProduct = existingProductsMap.get(product.handle)
                      logger.info(`✅ Found product by handle "${product.handle}" (ID: ${existingProduct.id}, external_id: ${existingProduct.external_id})`)
                    } else if (product.external_id && existingProductsByExternalId.has(product.external_id)) {
                      existingProduct = existingProductsByExternalId.get(product.external_id)
                      logger.info(`✅ Found product by external_id "${product.external_id}" (ID: ${existingProduct.id}, handle: ${existingProduct.handle})`)
                    } else {
                      // Product not in pre-built map - try querying by handle directly
                      logger.info(`Product not in pre-built map, querying by handle directly...`)
                      try {
                        // Try querying by handle - this should work if the product exists
                        const handleQueryResult = await productService.listProducts({ handle: product.handle }, { take: 1 } as any)
                        // Handle different return structures: array, { products }, or { data }
                        const handleProducts = (handleQueryResult as any)?.products || (handleQueryResult as any)?.data || (Array.isArray(handleQueryResult) ? handleQueryResult : [])
                        if (handleProducts && handleProducts.length > 0) {
                          existingProduct = handleProducts[0]
                          logger.info(`✅ Found product via handle query (ID: ${existingProduct.id})`)
                        } else {
                          // Try querying all products and filtering (last resort)
                          logger.info(`Handle query returned 0 results, trying to query all products...`)
                          const allProductsResult = await productService.listProducts(undefined, { take: 1000 } as any)
                          // Handle different return structures: array, { products }, or { data }
                          const allProducts = (allProductsResult as any)?.products || (allProductsResult as any)?.data || (Array.isArray(allProductsResult) ? allProductsResult : [])
                          if (allProducts && allProducts.length > 0) {
                            existingProduct = allProducts.find(p => 
                              p.handle === product.handle || (p as any).external_id === (product as any).external_id
                            )
                            if (existingProduct) {
                              logger.info(`✅ Found product via full query and filter (ID: ${existingProduct.id})`)
                            } else {
                              logger.warn(`⚠️ Product not found even after full query. Searched for handle="${product.handle}", external_id="${product.external_id}"`)
                            }
                          }
                        }
                      } catch (queryError) {
                        logger.error(`❌ Direct query failed: ${queryError instanceof Error ? queryError.message : 'Unknown error'}`)
                        if (queryError instanceof Error && queryError.stack) {
                          logger.error(`Query error stack: ${queryError.stack}`)
                        }
                      }
                    }
                    
                    if (existingProduct) {
                      // Build update payload with only updatable fields
                      // Exclude variants, images, and other fields that need special handling
                      const updateData: any = {
                        id: existingProduct.id,
                      }
                      
                      // Include basic product fields that can be updated
                      if (product.title !== undefined) updateData.title = product.title
                      if (product.description !== undefined) updateData.description = product.description
                      if (product.subtitle !== undefined) updateData.subtitle = product.subtitle
                      if (product.material !== undefined) updateData.material = product.material
                      if (product.external_id !== undefined) updateData.external_id = product.external_id
                      if (product.status !== undefined) updateData.status = product.status
                      if (product.shipping_profile_id !== undefined) updateData.shipping_profile_id = product.shipping_profile_id
                      
                      // Explicitly include categories if they exist
                      const productCategories = (product as any).categories
                      if (productCategories && Array.isArray(productCategories) && productCategories.length > 0) {
                        // Ensure categories are in correct format: [{ id: "..." }]
                        updateData.categories = productCategories.map((cat: any) => {
                          if (typeof cat === 'object' && cat.id) {
                            return { id: cat.id }
                          } else if (typeof cat === 'string') {
                            return { id: cat }
                          }
                          return null
                        }).filter(Boolean)
                        logger.info(`📦 Updating product "${product.handle}" (ID: ${existingProduct.id}) with ${updateData.categories.length} categories`)
                        logger.debug(`Categories: ${JSON.stringify(updateData.categories, null, 2)}`)
                      } else {
                        logger.warn(`⚠️ Product "${product.handle}" has no categories to assign`)
                      }
                      
                      logger.info(`Update data keys: ${Object.keys(updateData).join(', ')}`)
                      logger.debug(`Update data structure: ${JSON.stringify(updateData, null, 2)}`)
                      
                      // Build clean update payload - only include valid fields
                      const cleanUpdatePayload: any = {
                        id: updateData.id,
                      }
                      if (updateData.title !== undefined) cleanUpdatePayload.title = updateData.title
                      if (updateData.description !== undefined) cleanUpdatePayload.description = updateData.description
                      if (updateData.subtitle !== undefined) cleanUpdatePayload.subtitle = updateData.subtitle
                      if (updateData.material !== undefined) cleanUpdatePayload.material = updateData.material
                      if (updateData.external_id !== undefined) cleanUpdatePayload.external_id = updateData.external_id
                      if (updateData.status !== undefined) cleanUpdatePayload.status = updateData.status
                      if (updateData.shipping_profile_id !== undefined) cleanUpdatePayload.shipping_profile_id = updateData.shipping_profile_id
                      if (updateData.categories && Array.isArray(updateData.categories)) {
                        cleanUpdatePayload.categories = updateData.categories
                      }
                      
                      logger.debug(`Clean update payload: ${JSON.stringify(cleanUpdatePayload, null, 2)}`)
                      
                      // updateProducts expects (id, data) or (selector, data), not an array
                      const { id: productUpdateId, ...productUpdateData } = cleanUpdatePayload
                      const updated = await productService.updateProducts(productUpdateId, productUpdateData)
                      const updatedProduct = updated
                      individualResults.push(updatedProduct)
                      logger.info(`✅ Successfully updated product "${product.handle}" (ID: ${existingProduct.id})`)
                    } else {
                      logger.error(`❌ Product not found in database! Searched by:`)
                      logger.error(`   - external_id: "${product.external_id || 'N/A'}"`)
                      logger.error(`   - handle: "${product.handle || 'N/A'}"`)
                      logger.error(`   - Pre-built map size: ${existingProductsMap.size} products by handle, ${existingProductsByExternalId.size} by external_id`)
                      logger.error(`   - This product should have been caught in pre-creation check. Possible handle mismatch.`)
                      failedToCreate.push(product)
                    }
                  } catch (updateError) {
                    const updateErrorMessage = updateError instanceof Error ? updateError.message : 'Unknown error'
                    logger.error(`❌❌❌ FAILED to update product "${product.handle}": ${updateErrorMessage}`)
                    if (updateError instanceof Error && updateError.stack) {
                      logger.error(`Update error stack trace:\n${updateError.stack}`)
                    }
                    logger.error(`Product data: ${JSON.stringify({ handle: product.handle, hasCategories: !!(product as any).categories, categories: (product as any).categories }, null, 2)}`)
                    failedToCreate.push(product)
                  }
                } else {
                  // Different error - add to failed list
                  logger.error(`Failed to create product with handle "${product.handle}": ${individualErrorMessage}`)
                  failedToCreate.push(product)
                }
              }
            }
            
            createdProducts = individualResults
            if (failedToCreate.length > 0) {
              logger.error(`❌ ${failedToCreate.length} products failed to create/update`)
              logger.error(`Failed products handles: ${failedToCreate.map(p => p.handle).join(', ')}`)
              // Log first failed product details for debugging
              if (failedToCreate[0]) {
                logger.error(`First failed product details: ${JSON.stringify({ 
                  handle: failedToCreate[0].handle, 
                  hasCategories: !!failedToCreate[0].categories, 
                  categories: failedToCreate[0].categories,
                  hasTitle: !!failedToCreate[0].title,
                  hasVariants: !!failedToCreate[0].variants,
                  variantCount: failedToCreate[0].variants?.length || 0
                }, null, 2)}`)
              }
            }
            logger.info(`Successfully processed ${createdProducts.length} products (some were updated instead of created)`)
          } else {
            // Different error - rethrow
            throw createError
          }
        }
      }
      
      // Update existing products
      let updatedProducts: any[] = []
      if (productsToUpdate.length > 0) {
        logger.info(`Updating ${productsToUpdate.length} existing products`)
        updatedProducts = await Promise.all(
          productsToUpdate.map(async ({ id, data }) => {
            try {
              // Build update payload with only valid product fields
              // Exclude variants, images, and other complex fields that need special handling
              const updateData: any = {
                id: id,
              }
              
              // Include basic product fields that can be updated
              if (data.title !== undefined) updateData.title = data.title
              if (data.description !== undefined) updateData.description = data.description
              if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
              if (data.material !== undefined) updateData.material = data.material
              if (data.external_id !== undefined) updateData.external_id = data.external_id
              if (data.status !== undefined) updateData.status = data.status
              if (data.shipping_profile_id !== undefined) updateData.shipping_profile_id = data.shipping_profile_id
              
              // Explicitly include categories if they exist
              // Categories should be an array of objects with id property
              if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
                // Ensure categories are in the correct format: [{ id: "..." }]
                updateData.categories = data.categories.map((cat: any) => {
                  if (typeof cat === 'object' && cat.id) {
                    return { id: cat.id }
                  } else if (typeof cat === 'string') {
                    return { id: cat }
                  } else {
                    logger.warn(`Invalid category format: ${JSON.stringify(cat)}`)
                    return null
                  }
                }).filter(Boolean)
                logger.debug(`Updating product ${id} with ${updateData.categories.length} categories`)
              }
              
              logger.info(`Update payload for product ${id} keys: ${Object.keys(updateData).join(', ')}`)
              logger.debug(`Update payload structure: ${JSON.stringify(updateData, null, 2)}`)
              
              // Ensure updateData is clean - no nested arrays or objects that could cause issues
              const cleanUpdateData: any = {
                id: updateData.id,
              }
              
              // Copy only scalar values and properly formatted arrays
              if (updateData.title !== undefined) cleanUpdateData.title = updateData.title
              if (updateData.description !== undefined) cleanUpdateData.description = updateData.description
              if (updateData.subtitle !== undefined) cleanUpdateData.subtitle = updateData.subtitle
              if (updateData.material !== undefined) cleanUpdateData.material = updateData.material
              if (updateData.external_id !== undefined) cleanUpdateData.external_id = updateData.external_id
              if (updateData.status !== undefined) cleanUpdateData.status = updateData.status
              if (updateData.shipping_profile_id !== undefined) cleanUpdateData.shipping_profile_id = updateData.shipping_profile_id
              // Convert categories to category_ids for UpdateProductDTO
              if (updateData.categories && Array.isArray(updateData.categories)) {
                cleanUpdateData.category_ids = updateData.categories.map((cat: any) => {
                  if (typeof cat === 'object' && cat.id) {
                    return cat.id
                  } else if (typeof cat === 'string') {
                    return cat
                  }
                  return null
                }).filter(Boolean)
              }
              
              logger.debug(`Clean update payload: ${JSON.stringify(cleanUpdateData, null, 2)}`)
              
              // updateProducts expects (id, data) or (selector, data), not an array
              const { id: productUpdateId, ...productUpdatePayload } = cleanUpdateData
              const updated = await productService.updateProducts(productUpdateId, productUpdatePayload)
              return updated
            } catch (error) {
              logger.error(`Failed to update product ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              if (error instanceof Error && error.stack) {
                logger.error(`Update error stack: ${error.stack}`)
              }
              throw error
            }
          })
        )
        logger.info(`Successfully updated ${updatedProducts.length} products`)
      }
      
      const totalProcessed = createdProducts.length + updatedProducts.length
      logger.warn(`Successfully processed ${totalProcessed} products (${createdProducts.length} created, ${updatedProducts.length} updated)`)
      
      // Assign products to categories after creation/update
      // Categories might not be assigned during create/update, so we assign them separately
      const allProcessedProducts = [...(Array.isArray(createdProducts) ? createdProducts : [createdProducts]), ...updatedProducts]
      
      // Create a map of handle -> product ID for quick lookup
      const handleToProductIdMap = new Map<string, string>()
      for (const product of allProcessedProducts) {
        if (product?.handle && product?.id) {
          handleToProductIdMap.set(product.handle, product.id)
        }
      }
      
      // Assign categories to products that have them
      const productsWithCategories = productsToImport.filter(p => {
        const categories = (p as any).categories
        return categories && 
          Array.isArray(categories) && 
          categories.length > 0 &&
          p.handle &&
          handleToProductIdMap.has(p.handle)
      })
      
      if (productsWithCategories.length > 0) {
        logger.info(`Assigning ${productsWithCategories.length} products to categories after import`)
        
        for (const product of productsWithCategories) {
          const productId = handleToProductIdMap.get(product.handle!)
          if (!productId) {
            logger.warn(`Could not find product ID for handle "${product.handle}" to assign categories`)
            continue
          }
          
          try {
            // Get existing product to check current categories
            const existingProduct = await productService.retrieveProduct(productId)
            const existingCategoryIds = existingProduct.categories?.map((c: any) => c.id) || []
            
            // Extract category IDs from product data
            const newCategoryIds = ((product as any).categories || [])
              .map((cat: any) => typeof cat === 'object' && cat.id ? cat.id : cat)
              .filter((id: string) => id && !existingCategoryIds.includes(id))
            
            if (newCategoryIds.length > 0) {
              // Update product with all categories (existing + new)
              // Use category_ids instead of categories for UpdateProductDTO
              const allCategoryIds = [...existingCategoryIds, ...newCategoryIds]
              await productService.updateProducts(productId, {
                category_ids: allCategoryIds
              })
              logger.info(`✅ Assigned product "${product.handle}" (ID: ${productId}) to categories: ${newCategoryIds.join(', ')}`)
            } else {
              logger.debug(`Product "${product.handle}" already has all categories assigned`)
            }
          } catch (error) {
            logger.error(`❌ Failed to assign categories to product "${product.handle}": ${error instanceof Error ? error.message : 'Unknown error'}`)
            if (error instanceof Error && error.stack) {
              logger.error(`Category assignment error stack: ${error.stack}`)
            }
          }
        }
        
        logger.info(`Completed category assignments for ${productsWithCategories.length} products`)
      }
      
      return new StepResponse({
        success: true,
        imported: totalProcessed,
        products: allProcessedProducts,
      })
    } catch (error) {
      // Log the error details with full information
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorStack = error instanceof Error ? error.stack : undefined
      const errorName = error instanceof Error ? error.name : typeof error
      
      // Try to stringify the entire error object
      let errorDetails = errorMessage
      let errorString = ''
      
      try {
        // Try to stringify the entire error object
        errorString = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
        if (errorString && errorString !== '{}') {
          errorDetails = errorString
        }
      } catch (e) {
        // If stringify fails, try to extract properties manually
        if (error && typeof error === 'object') {
          const errorObj = error as any
          const props: string[] = []
          
          if (errorObj.errors) {
            props.push(`errors: ${JSON.stringify(errorObj.errors)}`)
          }
          if (errorObj.response) {
            props.push(`response: ${JSON.stringify(errorObj.response)}`)
          }
          if (errorObj.data) {
            props.push(`data: ${JSON.stringify(errorObj.data)}`)
          }
          if (errorObj.cause) {
            props.push(`cause: ${errorObj.cause instanceof Error ? errorObj.cause.message : String(errorObj.cause)}`)
          }
          if (errorObj.message) {
            props.push(`message: ${errorObj.message}`)
          }
          if (errorObj.code) {
            props.push(`code: ${errorObj.code}`)
          }
          if (errorObj.type) {
            props.push(`type: ${errorObj.type}`)
          }
          
          if (props.length > 0) {
            errorDetails = props.join(', ')
          }
        }
      }
      
      logger.error(`Failed to import products batch (${products.length} products)`)
      logger.error(`Error type: ${errorName}`)
      logger.error(`Error message: ${errorMessage}`)
      logger.error(`Full error: ${errorString || errorDetails}`)
      if (errorStack) {
        logger.error(`Error stack: ${errorStack}`)
      }
      
      // Log the product data that failed
      if (products.length > 0) {
        logger.error(`Failed product sample: ${JSON.stringify(products[0], null, 2)}`)
      }
      
      return new StepResponse({
        success: false,
        imported: 0,
        error: errorDetails,
        products: [],
      })
    }
  }
)

/**
 * Step: Process all batches sequentially
 */
const processAllBatchesStep = createStep(
  'process-all-batches',
  async (
    input: {
      batches: ProductData[][]
      updateExisting: boolean
      updateBy?: 'sku' | 'handle'
      shippingProfileId: string
    },
    { container }: { container: MedusaContainer }
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const productService: IProductModuleService = container.resolve(Modules.PRODUCT)
    const { batches, updateExisting, updateBy, shippingProfileId } = input

    if (!batches || batches.length === 0) {
      logger.warn('No batches to process')
      return new StepResponse({
        success: true,
        imported: 0,
        totalBatches: 0,
        successfulBatches: 0,
        failedBatches: 0,
      })
    }

    logger.info(`Processing ${batches.length} batches...`)

    let totalImported = 0
    let successfulBatches = 0
    let failedBatches = 0

    // Process batches sequentially to avoid overwhelming the system
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      logger.info(`Processing batch ${i + 1}/${batches.length} (${batch.length} products)`)

      try {
        // Process this batch by calling importBatchStep's function directly
        // Steps can't be called from within other steps, so we need to use the step's function
        const stepFn = (importBatchStep as any).__stepFunction__ || importBatchStep
        const batchResult = await stepFn(
          {
            products: batch,
            updateExisting,
            updateBy: updateBy || 'sku',
            shippingProfileId,
          },
          { container }
        )

        // Extract result from StepResponse
        const result = batchResult instanceof StepResponse ? batchResult.output : batchResult

        if (result && result.success) {
          totalImported += result.imported || 0
          successfulBatches++
          logger.info(`Batch ${i + 1}/${batches.length} completed successfully: ${result.imported || 0} products imported`)
        } else {
          failedBatches++
          logger.error(`Batch ${i + 1}/${batches.length} failed: ${(result as any)?.error || 'Unknown error'}`)
        }
      } catch (error) {
        failedBatches++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error(`Batch ${i + 1}/${batches.length} threw an error: ${errorMessage}`)
      }
    }

    logger.info(
      `Completed processing all batches: ${totalImported} products imported, ${successfulBatches} successful batches, ${failedBatches} failed batches`
    )

    return new StepResponse({
      success: failedBatches === 0,
      imported: totalImported,
      totalBatches: batches.length,
      successfulBatches,
      failedBatches,
    })
  }
)

/**
 * Step: Calculate import statistics and construct final output
 */
const calculateImportStatsStep = createStep(
  'calculate-import-stats',
  async (input: {
    executionId: string
    validationResult: { validProducts: ProductData[]; errors: Array<{ index: number; errors: string[] }> }
    batchResult: { success: boolean; imported: number; totalBatches: number; successfulBatches: number; failedBatches: number }
    totalProducts: number
  }) => {
    const validationErrorCount = input.validationResult.errors?.length || 0
    const importErrorCount = input.batchResult.failedBatches > 0 ? input.batchResult.totalBatches - input.batchResult.successfulBatches : 0
    const failedCount = validationErrorCount + importErrorCount
    const successfulCount = input.batchResult.imported || 0
    const finalStatusValue: ImportStatus = successfulCount > 0 ? 'completed' : (failedCount > 0 ? 'failed' : 'completed')
    
    const output: WorkflowOutput = {
      executionId: input.executionId,
      totalProducts: input.totalProducts,
      successfulProducts: successfulCount,
      failedProducts: failedCount,
      status: finalStatusValue,
    }
    
    return new StepResponse(output)
  }
)

/**
 * Main XML Product Import Workflow
 */
export const xmlProductImportWorkflow = createWorkflow<
  WorkflowInput,
  WorkflowOutput,
  []
>('xml-product-import', function (input) {
  const { xmlUrl, fieldMapping, options, shippingProfileId } = input

  // Step 1: Fetch XML
  const xmlContent = fetchXmlStep({ xmlUrl })

  // Step 2: Parse XML
  const xmlData = parseXmlStep({ xmlContent })

  // Step 3: Map fields
  const mappedProducts = mapFieldsStep({
    xmlData,
    fieldMapping,
  })

  // Step 3.5: Normalize prices (convert to cents, add default currency)
  const normalizedProducts = normalizePricesStep({ products: mappedProducts })

  // Step 3.6: Process images (upload to MinIO in production, use URLs in development)
  const productsWithImages = processImagesStep({ 
    products: normalizedProducts,
    fieldMapping: input.fieldMapping,
  })

  // Step 3.7: Apply testing limit (if enabled)
  // TODO: Remove this step when ready for production
  const limitedProductsResult = applyTestingLimitStep({ products: productsWithImages })

  // Step 4: Validate products
  const validationResult = validateProductsStep({ products: limitedProductsResult.products })

  // Step 5: Get or create shipping profile
  const resolvedShippingProfileId = getShippingProfileStep({ shippingProfileId })

  // Step 5.5: Process categories - convert category strings to category IDs
  const productsWithCategories = processCategoriesStep({
    products: validationResult.validProducts,
    fieldMapping,
  })

  // Step 6: Segment into batches
  const batches = segmentProductsStep({
    products: productsWithCategories,
    batchSize: options.batchSize || 100,
  })

  // Step 7: Process all batches
  const batchResult = processAllBatchesStep({
    batches,
    updateExisting: options.updateExisting || false,
    updateBy: options.updateBy || 'sku',
    shippingProfileId: resolvedShippingProfileId,
  })

  // Step 8: Calculate import statistics and construct final output
  const finalOutput = calculateImportStatsStep({
    executionId: input.importExecutionId,
    validationResult,
    batchResult,
    totalProducts: limitedProductsResult.totalProducts,
  })

  return new WorkflowResponse(finalOutput)
})

export default xmlProductImportWorkflow

