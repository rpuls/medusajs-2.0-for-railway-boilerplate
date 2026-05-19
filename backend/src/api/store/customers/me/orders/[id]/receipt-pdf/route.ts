import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"

import {
  generateReceiptPdf,
  type ReceiptOrder,
} from "../../../../../../../services/order-receipt-pdf/service"

/**
 * GET /store/customers/me/orders/:id/receipt-pdf
 *
 * Returns a server-rendered PDF tax invoice for the order. Auth-gated to the
 * order's customer — same shape as the existing /invoice route, but generates
 * a real PDF via pdfkit instead of print-stylesheet HTML.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Not authenticated.")
  }

  const orderId = req.params.id
  if (!orderId) {
    return res.status(400).json({ error: "id required" })
  }

  const orderModuleService: IOrderModuleService = req.scope.resolve(
    Modules.ORDER
  )

  let order: ReceiptOrder
  try {
    const raw = await orderModuleService.retrieveOrder(orderId, {
      relations: [
        "items",
        "shipping_address",
        "billing_address",
        "shipping_methods",
      ],
    })
    order = raw as unknown as ReceiptOrder
  } catch {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.")
  }

  if ((order as unknown as { customer_id?: string })?.customer_id !== customerId) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found.")
  }

  const pdfBuffer = await generateReceiptPdf(order)
  const displayId = order.display_id ?? orderId

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="receipt-${displayId}.pdf"`
  )
  res.setHeader("Content-Length", pdfBuffer.length)
  res.status(200).send(pdfBuffer)
}
