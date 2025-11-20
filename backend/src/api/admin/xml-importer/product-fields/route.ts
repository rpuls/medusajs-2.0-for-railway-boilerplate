import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { Modules } from '@medusajs/framework/utils'
import { IProductModuleService } from '@medusajs/framework/types'

/**
 * GET /admin/xml-importer/product-fields
 * Get all available Medusa product fields from CreateProductDTO
 * Only returns fields that are valid according to the Product Module's CreateProductDTO interface
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Fields from CreateProductDTO - only valid fields according to MedusaJS documentation
    // Reference: https://docs.medusajs.com/resources/references/product/interfaces/product.CreateProductDTO
    const createProductDTOFields = [
      // Product level fields (from CreateProductDTO)
      'title',
      'subtitle',
      'description',
      'handle',
      'is_giftcard',
      'discountable',
      'thumbnail',
      'status',
      'external_id',
      'type_id',
      'collection_id',
      'weight',
      'length',
      'height',
      'width',
      'hs_code',
      'origin_country',
      'mid_code',
      'material',
      'metadata',
      
      
      // Product images (from UpsertProductImageDTO)
      'images', // Array of images - use this for image collections
      
      // Categories (array of category IDs)
      'categories',
      
      // Tags (array of tag IDs or objects)
      'tags',
      
      // Sales channels (array of sales channel objects)
      'sales_channels',
      
      // Shipping profile
      'shipping_profile_id',
      
      // Special helper field for simple price mapping (will be converted to proper structure)
      'price', // Simple price field - auto converts to variants.0.prices structure
    ]

    // Get existing products to extract metadata keys (for metadata.* fields)
    let metadataKeys: string[] = []
    try {
      const productModuleService: IProductModuleService = req.scope.resolve(
        Modules.PRODUCT
      )
      
      // Try to get a sample product to see what metadata keys exist
      const products = await productModuleService.listProducts({})
      
      // Extract unique metadata keys from products
      const metadataKeySet = new Set<string>()
      products.forEach((product: any) => {
        if (product.metadata) {
          Object.keys(product.metadata).forEach(key => {
            metadataKeySet.add(`metadata.${key}`)
          })
        }
        
        // Extract variant metadata
        if (product.variants) {
          product.variants.forEach((variant: any) => {
            if (variant.metadata) {
              Object.keys(variant.metadata).forEach(key => {
                metadataKeySet.add(`variants.0.metadata.${key}`)
              })
            }
          })
        }
      })
      
      metadataKeys = Array.from(metadataKeySet)
    } catch (error) {
      // If we can't fetch products, just return CreateProductDTO fields
      // This might happen if there are no products yet
    }

    // Combine CreateProductDTO fields with metadata keys
    const allFields = [
      ...createProductDTOFields,
      ...metadataKeys,
    ].sort()

    res.json({
      fields: allFields,
      createProductDTOFields,
      metadataKeys,
    })
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

