import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { SUPPORT_REPLY_TO_EMAIL } from "../lib/constants"
import { tagUrl } from "../lib/email-utm"
import { orderInboxAddress } from "../lib/order-inbox-alias"
import { readWatchers } from "../lib/order-watchers"
import { EmailTemplates } from "../modules/email-notifications/templates"
import {
  PRODUCTION_STAGE_EVENT,
  isProductionStage,
  shouldEmailForStageTransition,
  type ProductionStageChangedEvent,
} from "../lib/production-stage"
import { subjectForStage } from "../modules/email-notifications/templates/order-production-stage"

const STOREFRONT_URL = process.env.STOREFRONT_URL?.replace(/\/$/, "")
const STOREFRONT_DEFAULT_COUNTRY_CODE =
  process.env.STOREFRONT_DEFAULT_COUNTRY_CODE?.toLowerCase()

function buildPortalUrl(orderId: string): string | null {
  if (!STOREFRONT_URL) return null
  const prefix = STOREFRONT_DEFAULT_COUNTRY_CODE
    ? `/${STOREFRONT_DEFAULT_COUNTRY_CODE}`
    : ""
  return `${STOREFRONT_URL}${prefix}/account/orders/details/${orderId}`
}

/**
 * Sends a customer email when an order's production stage transitions into
 * one of the milestones flagged in `STAGES_THAT_EMAIL`. Other transitions are
 * tracked in metadata + visible in the customer portal stepper but stay quiet
 * in the inbox.
 */
export default async function orderProductionStageChangedHandler({
  event: { data },
  container,
}: SubscriberArgs<ProductionStageChangedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!data?.order_id || !isProductionStage(data.to_stage)) {
    logger.warn(
      `${PRODUCTION_STAGE_EVENT}: malformed event payload, skipping (order_id=${data?.order_id})`
    )
    return
  }

  if (!shouldEmailForStageTransition(data.from_stage, data.to_stage)) {
    return
  }

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  let order: any
  try {
    order = await orderModuleService.retrieveOrder(data.order_id, {
      relations: ["shipping_address"],
    })
  } catch (error) {
    logger.error(
      `${PRODUCTION_STAGE_EVENT}: failed to retrieve order ${data.order_id}: ${
        (error as Error).message
      }`
    )
    return
  }

  if (!order.email) {
    logger.warn(
      `${PRODUCTION_STAGE_EVENT}: order ${data.order_id} has no customer email; skipping ${data.to_stage} notification.`
    )
    return
  }

  const displayId = (order as { display_id?: string | number }).display_id ?? data.order_id
  const firstName = order.shipping_address?.first_name ?? null

  // If staff have uploaded production photos, surface the most recent
  // one in the email — turns the stage-change update into a "here's
  // what your gear looks like" moment. Photos are optional; emails
  // still go out fine without them.
  const orderMeta = (order.metadata ?? {}) as Record<string, unknown>
  const photos = Array.isArray(orderMeta.production_photos)
    ? (orderMeta.production_photos as Array<{
        url?: string
        caption?: string | null
        uploaded_at?: string
      }>)
    : []
  const latestPhoto = photos
    .filter((p) => typeof p?.url === "string" && p.url.length > 0)
    .sort((a, b) =>
      (a.uploaded_at ?? "") < (b.uploaded_at ?? "") ? 1 : -1
    )[0]
  const productionPhoto = latestPhoto
    ? { url: latestPhoto.url as string, caption: latestPhoto.caption ?? null }
    : null

  const emailPortalUrl = tagUrl(buildPortalUrl(data.order_id), {
    medium: "transactional",
    campaign: `production_stage_${data.to_stage}`,
    content: "view_order",
  })

  const watchers = readWatchers(orderMeta).filter(
    (w) => w.toLowerCase() !== String(order.email).toLowerCase()
  )
  const recipients = [order.email, ...watchers]

  try {
    for (const recipient of recipients) {
      await notificationModuleService.createNotifications({
        to: recipient,
        channel: "email",
        template: EmailTemplates.ORDER_PRODUCTION_STAGE,
        data: {
          emailOptions: {
            replyTo: orderInboxAddress(data.order_id) ?? SUPPORT_REPLY_TO_EMAIL,
            subject: subjectForStage(data.to_stage, displayId),
          },
          order,
          stage: data.to_stage,
          customerFirstName: firstName,
          productionPhoto,
          portalUrl: emailPortalUrl,
        },
      })
    }
  } catch (error) {
    logger.error(
      `${PRODUCTION_STAGE_EVENT}: failed to send stage email (${data.to_stage}) for order ${data.order_id}: ${
        (error as Error).message
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: PRODUCTION_STAGE_EVENT,
}
