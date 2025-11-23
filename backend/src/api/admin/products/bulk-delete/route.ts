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
    const defaultBucket = process.env.MINIO_BUCKET || "medusa-media" // Use correct default
    const minioAccessKey = process.env.MINIO_ACCESS_KEY
    const minioSecretKey = process.env.MINIO_SECRET_KEY

    if (minioEndpoint && minioAccessKey && minioSecretKey && imageUrls.length > 0) {
      // Map of bucket -> file keys to delete
      const filesByBucket = new Map<string, string[]>()

      imageUrls.forEach((url) => {
        try {
          // Check if URL is a MinIO URL
          // Format: https://${MINIO_ENDPOINT}/${BUCKET_NAME}/${fileKey}
          const urlObj = new URL(url)
          
          // Check if this is our MinIO endpoint
          if (urlObj.hostname === minioEndpoint || urlObj.hostname.includes(minioEndpoint)) {
            // Extract bucket and file key from path: /bucket-name/file-key
            const pathParts = urlObj.pathname.split("/").filter(Boolean)
            
            if (pathParts.length >= 2) {
              // First part is bucket, rest is file key
              const bucket = pathParts[0]
              const fileKey = pathParts.slice(1).join("/")
              
              if (bucket && fileKey) {
                if (!filesByBucket.has(bucket)) {
                  filesByBucket.set(bucket, [])
                }
                filesByBucket.get(bucket)!.push(fileKey)
              }
            } else if (pathParts.length === 1) {
              // Only one part - assume it's a file key in the default bucket
              const fileKey = pathParts[0]
              if (fileKey) {
                if (!filesByBucket.has(defaultBucket)) {
                  filesByBucket.set(defaultBucket, [])
                }
                filesByBucket.get(defaultBucket)!.push(fileKey)
              }
            }
          }
        } catch (error) {
          logger.warn(`Failed to parse image URL ${url}: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      })

      // Delete files from MinIO using MinIO client directly
      if (filesByBucket.size > 0) {
        const totalFiles = Array.from(filesByBucket.values()).reduce((sum, files) => sum + files.length, 0)
        logger.info(`🗑️  Deleting ${totalFiles} file(s) from MinIO across ${filesByBucket.size} bucket(s)`)
        
        try {
          const minioClient = new Client({
            endPoint: minioEndpoint,
            port: 443,
            useSSL: true,
            accessKey: minioAccessKey,
            secretKey: minioSecretKey,
          })

          // Delete files from each bucket
          const deletePromises: Promise<void>[] = []
          
          for (const [bucket, fileKeys] of filesByBucket.entries()) {
            // Check if bucket exists before trying to delete
            const bucketExists = await minioClient.bucketExists(bucket).catch(() => false)
            
            if (!bucketExists) {
              logger.warn(`Bucket ${bucket} does not exist, skipping ${fileKeys.length} file(s)`)
              continue
            }
            
            for (const fileKey of fileKeys) {
              deletePromises.push(
                minioClient.removeObject(bucket, fileKey)
                  .then(() => {
                    logger.debug(`Deleted file ${fileKey} from bucket ${bucket}`)
                  })
                  .catch((error) => {
                    logger.warn(`Failed to delete file ${fileKey} from bucket ${bucket}: ${error instanceof Error ? error.message : "Unknown error"}`)
                  })
              )
            }
          }

          await Promise.allSettled(deletePromises)
          const deletedCount = deletePromises.length
          logger.info(`✅ Completed deletion attempt for ${deletedCount} file(s) from MinIO`)
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

