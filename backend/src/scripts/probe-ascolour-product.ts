import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASCOLOUR_MODULE } from "../modules/ascolour"
import AsColourService from "../modules/ascolour/service"

/**
 * One-shot diagnostic: fetches AS Colour data for a single style code so
 * we can see the exact shape — what fields exist on images, what URLs
 * come back, etc. Helps debug why our import isn't picking up images.
 *
 * Usage:
 *   IMPORT_STYLE=1000 npx medusa exec ./src/scripts/probe-ascolour-product.js
 */
export default async function probeAsColourProduct({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const ascolour = container.resolve(ASCOLOUR_MODULE) as AsColourService
  const client = ascolour.getClient()

  const styleCode = process.env.IMPORT_STYLE || "1000"
  logger.info(`Probing AS Colour style ${styleCode}…`)

  try {
    const product = await client.getProduct(styleCode)
    logger.info(`Product top-level keys: ${Object.keys(product).join(", ")}`)
    logger.info(`Product (first 800 chars): ${JSON.stringify(product).slice(0, 800)}`)
  } catch (e: any) {
    logger.warn(`getProduct failed: ${e?.message ?? e}`)
  }

  try {
    const images = await client.getProductImages(styleCode)
    logger.info(`getProductImages raw (first 800 chars): ${JSON.stringify(images).slice(0, 800)}`)
    const arr = Array.isArray(images) ? images : (images as any)?.items ?? (images as any)?.data ?? []
    if (arr.length) {
      logger.info(`First image keys: ${Object.keys(arr[0]).join(", ")}`)
      logger.info(`First image: ${JSON.stringify(arr[0])}`)
    } else {
      logger.warn("No images returned.")
    }
  } catch (e: any) {
    logger.warn(`getProductImages failed: ${e?.message ?? e}`)
  }

  try {
    const variants = await client.getProductVariants(styleCode)
    const arr = Array.isArray(variants) ? variants : (variants as any)?.items ?? (variants as any)?.data ?? []
    logger.info(`getProductVariants count: ${arr.length}`)
    if (arr.length) {
      logger.info(`First variant keys: ${Object.keys(arr[0]).join(", ")}`)
    }
  } catch (e: any) {
    logger.warn(`getProductVariants failed: ${e?.message ?? e}`)
  }
}
