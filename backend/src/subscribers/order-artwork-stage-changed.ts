import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { SUPPORT_REPLY_TO_EMAIL } from "../lib/constants"
import { tagUrl } from "../lib/email-utm"
import { EmailTemplates } from "../modules/email-notifications/templates"
import {
  ARTWORK_STAGE_EVENT,
  isArtworkStage,
  shouldEmailForArtworkTransition,
  type ArtworkStage,
  type ProductionStageChangedEvent,
} from "../lib/production-stage"
import { subjectForStage } from "../modules/email-notifications/templates/order-production-stage"
import { signArtworkApproval } from "../services/artwork-approval/sign"

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

function buildApprovalUrl(orderId: string): string | null {
  if (!STOREFRONT_URL) return null
  const prefix = STOREFRONT_DEFAULT_COUNTRY_CODE
    ? `/${STOREFRONT_DEFAULT_COUNTRY_CODE}`
    : ""
  const sig = signArtworkApproval(orderId)
  return `${STOREFRONT_URL}${prefix}/artwork-approval/${encodeURIComponent(orderId)}?sig=${sig}`
}

/**
 * Fires a customer email when artwork transitions to a milestone in
 * `ARTWORK_STAGES_THAT_EMAIL` (currently just `awaiting_approval`). The
 * blanks track is internal-only — customers don't get notified about PO
 * state, so there's no sibling for it.
 */
export default async function orderArtworkStageChangedHandler({
  event: { data },
  container,
}: SubscriberArgs<ProductionStageChangedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  if (!data?.order_id || !isArtworkStage(data.to_stage)) {
    logger.warn(
      `${ARTWORK_STAGE_EVENT}: malformed event payload, skipping (order_id=${data?.order_id})`
    )
    return
  }

  const fromStage = isArtworkStage(data.from_stage) ? (data.from_stage as ArtworkStage) : null
  const toStage = data.to_stage as ArtworkStage
  if (!shouldEmailForArtworkTransition(fromStage, toStage)) {
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
      `${ARTWORK_STAGE_EVENT}: failed to retrieve order ${data.order_id}: ${
        (error as Error).message
      }`
    )
    return
  }

  if (!order.email) {
    logger.warn(
      `${ARTWORK_STAGE_EVENT}: order ${data.order_id} has no customer email; skipping ${toStage} notification.`
    )
    return
  }

  const displayId = (order as { display_id?: string | number }).display_id ?? data.order_id
  const firstName = order.shipping_address?.first_name ?? null

  // Surface the latest production photo as the proof preview if one
  // was uploaded. Falls back to no preview when staff haven't snapped
  // anything yet.
  const orderMeta = (order.metadata ?? {}) as Record<string, unknown>
  const photos = Array.isArray(orderMeta.production_photos)
    ? (orderMeta.production_photos as Array<{
        url?: string
        uploaded_at?: string
      }>)
    : []
  const latestPhotoUrl =
    photos
      .filter((p) => typeof p?.url === "string" && (p.url as string).length > 0)
      .sort((a, b) =>
        (a.uploaded_at ?? "") < (b.uploaded_at ?? "") ? 1 : -1
      )[0]?.url ?? null

  try {
    if (toStage === "awaiting_approval") {
      // Use the dedicated approval template — gives the customer a
      // signed one-click "Approve" button instead of the generic
      // production-stage update.
      const approvalUrl = buildApprovalUrl(data.order_id)
      if (!approvalUrl) {
        logger.warn(
          `${ARTWORK_STAGE_EVENT}: cannot build approval URL (STOREFRONT_URL unset?); skipping artwork approval email for ${data.order_id}.`
        )
      } else {
        await notificationModuleService.createNotifications({
          to: order.email,
          channel: "email",
          template: EmailTemplates.ARTWORK_APPROVAL,
          data: {
            emailOptions: {
              replyTo: SUPPORT_REPLY_TO_EMAIL,
              subject: `Your artwork proof for order #${displayId}`,
            },
            approval: {
              firstName,
              orderDisplayId: displayId,
              approvalUrl: tagUrl(approvalUrl, {
                medium: "transactional",
                campaign: "artwork_approval",
                content: "approve_button",
              }) ?? approvalUrl,
              proofImageUrl: latestPhotoUrl,
              staffNote: null,
            },
            preview: `Your proof is ready for sign-off — order #${displayId}.`,
          },
        })
      }
    } else {
      await notificationModuleService.createNotifications({
        to: order.email,
        channel: "email",
        template: EmailTemplates.ORDER_PRODUCTION_STAGE,
        data: {
          emailOptions: {
            replyTo: SUPPORT_REPLY_TO_EMAIL,
            subject: subjectForStage(toStage, displayId),
          },
          order,
          stage: toStage,
          customerFirstName: firstName,
          portalUrl: tagUrl(buildPortalUrl(data.order_id), {
            medium: "transactional",
            campaign: `artwork_stage_${toStage}`,
            content: "view_order",
          }),
        },
      })
    }
  } catch (error) {
    logger.error(
      `${ARTWORK_STAGE_EVENT}: failed to send artwork email (${toStage}) for order ${data.order_id}: ${
        (error as Error).message
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: ARTWORK_STAGE_EVENT,
}
