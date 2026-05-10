import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { IOrderModuleService } from "@medusajs/framework/types"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"

const paramsSchema = z.object({ id: z.string().min(1) })

const bodySchema = z.object({
  due_date: z.string().nullable().default(null),
})

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const params = paramsSchema.safeParse(req.params ?? {})
  if (!params.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, params.error.message)
  }
  const body = bodySchema.parse(req.body ?? {})
  const dueDate = body.due_date ?? null

  const orderModuleService = req.scope.resolve<IOrderModuleService>(Modules.ORDER)
  let order: any
  try {
    order = await orderModuleService.retrieveOrder(params.data.id)
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Order "${params.data.id}" was not found.`
    )
  }

  const meta = (order.metadata ?? {}) as Record<string, unknown>
  await orderModuleService.updateOrders(order.id, {
    metadata: {
      ...meta,
      production_due_date: dueDate,
    },
  })

  return res.json({ ok: true, production_due_date: dueDate })
}
