import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

import { generateMockupPdf, type MockupOrder } from "../../../../../services/mockup-pdf/service"

const paramsSchema = z.object({ id: z.string().min(1) })

/**
 * GET /admin/orders/:id/mockup-pdf
 *
 * Generates and returns an artwork approval PDF for the order.
 * Each product in the order gets one page showing front/back mockups,
 * print dimensions, disclaimer, and size quantities.
 *
 * Query params:
 *   job_number  — optional override for the Job # shown in the header
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const parsedParams = paramsSchema.safeParse(req.params ?? {})
  if (!parsedParams.success) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid order id: ${parsedParams.error.message}`
    )
  }

  const orderId = parsedParams.data.id
  const jobNumberOverride =
    typeof req.query?.job_number === "string" && req.query.job_number.trim()
      ? req.query.job_number.trim()
      : undefined

  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)

  let order: MockupOrder
  try {
    const raw = await orderModuleService.retrieveOrder(orderId, {
      relations: ["items", "shipping_address"],
    })
    order = raw as unknown as MockupOrder
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Order "${orderId}" was not found.`)
  }

  const pdfBuffer = await generateMockupPdf(order, { jobNumberOverride })

  const displayId = order.display_id ?? orderId
  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="artwork-approval-${displayId}.pdf"`
  )
  res.setHeader("Content-Length", pdfBuffer.length)
  res.status(200).send(pdfBuffer)
}
