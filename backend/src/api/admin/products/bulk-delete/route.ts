import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { IProductModuleService } from "@medusajs/framework/types"
import { Client } from "minio"

/**
 * POST /admin/products/bulk-delete
 * Delete multiple products and their associated images from MinIO
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { productIds } = req.body as { productIds: string[] }

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    res.status(400).json({
      message: "productIds array is required and must not be empty",
    })
    return
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const productService: IProductModuleService = req.scope.resolve(Modules.PRODUCT)

  try {
    logger.info(`🗑️  Starting bulk delete for ${productIds.length} product(s)`)

    // Fetch products with their images
    const products = await Promise.all(
      productIds.map((id) =>
        productService.retrieveProduct(id, {
          relations: ["images", "thumbnail"],
        }).catch((error) => {
          logger.warn(`Failed to retrieve product ${id}: ${error instanceof Error ? error.message : "Unknown error"}`)
          return null
        })
      )
    )

    // Filter out null products
    const validProducts = products.filter((p) => p !== null)

    // Collect all image URLs from products
    const imageUrls: string[] = []
    validProducts.forEach((product) => {
      if (product?.images) {
        product.images.forEach((img: any) => {
          if (img?.url) {
            imageUrls.push(img.url)
          }
        })
      }
      if (product?.thumbnail) {
        imageUrls.push(product.thumbnail)
      }
    })

    logger.info(`📸 Found ${imageUrls.length} image(s) to potentially delete`)

    // Delete files from MinIO if configured
    const minioEndpoint = process.env.MINIO_ENDPOINT
    const minioBucket = process.env.MINIO_BUCKET || "medusa"
    const minioAccessKey = process.env.MINIO_ACCESS_KEY
    const minioSecretKey = process.env.MINIO_SECRET_KEY

    if (minioEndpoint && minioAccessKey && minioSecretKey && imageUrls.length > 0) {
      const fileKeysToDelete: string[] = []

      imageUrls.forEach((url) => {
        try {
          // Check if URL is a MinIO URL
          // Format: https://${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileKey}
          const urlObj = new URL(url)
          
          // Check if this is our MinIO endpoint
          if (urlObj.hostname === minioEndpoint || urlObj.hostname.includes(minioEndpoint)) {
            // Extract file key from path: /bucket-name/file-key
            const pathParts = urlObj.pathname.split("/").filter(Boolean)
            
            // Find bucket in path and get file key after it
            const bucketIndex = pathParts.findIndex((part) => part === minioBucket)
            if (bucketIndex >= 0 && bucketIndex < pathParts.length - 1) {
              // File key is everything after the bucket name
              const fileKey = pathParts.slice(bucketIndex + 1).join("/")
              if (fileKey) {
                fileKeysToDelete.push(fileKey)
              }
            } else if (pathParts.length > 0) {
              // Fallback: assume last part is file key
              const fileKey = pathParts[pathParts.length - 1]
              if (fileKey) {
                fileKeysToDelete.push(fileKey)
              }
            }
          }
        } catch (error) {
          logger.warn(`Failed to parse image URL ${url}: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      })

      // Delete files from MinIO using MinIO client directly
      if (fileKeysToDelete.length > 0) {
        logger.info(`🗑️  Deleting ${fileKeysToDelete.length} file(s) from MinIO`)
        
        try {
          const minioClient = new Client({
            endPoint: minioEndpoint,
            port: 443,
            useSSL: true,
            accessKey: minioAccessKey,
            secretKey: minioSecretKey,
          })

          const deletePromises = fileKeysToDelete.map(async (fileKey) => {
            try {
              await minioClient.removeObject(minioBucket, fileKey)
              logger.debug(`Deleted file ${fileKey} from MinIO`)
            } catch (error) {
              logger.warn(`Failed to delete file ${fileKey} from MinIO: ${error instanceof Error ? error.message : "Unknown error"}`)
            }
          })

          await Promise.allSettled(deletePromises)
          logger.info(`✅ Deleted ${fileKeysToDelete.length} file(s) from MinIO`)
        } catch (error) {
          logger.warn(`Failed to delete some files from MinIO: ${error instanceof Error ? error.message : "Unknown error"}`)
          // Don't fail the entire operation if file deletion fails
        }
      } else {
        logger.info("ℹ️  No MinIO files found to delete (images may be external URLs)")
      }
    } else {
      logger.info("ℹ️  MinIO not configured or no images found, skipping file deletion")
    }

    // Delete products
    logger.info(`🗑️  Deleting ${productIds.length} product(s)...`)
    await productService.deleteProducts(productIds)

    logger.info(`✅ Successfully deleted ${productIds.length} product(s)`)

    res.status(200).json({
      message: `Successfully deleted ${productIds.length} product(s)`,
      deletedCount: productIds.length,
      deletedProductIds: productIds,
    })
  } catch (error) {
    logger.error(`❌ Error during bulk delete: ${error instanceof Error ? error.message : "Unknown error"}`)
    if (error instanceof Error && error.stack) {
      logger.error(`Stack trace: ${error.stack}`)
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to delete products",
    })
  }
}

