import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { SUPPORT_REPLY_TO_EMAIL } from "../lib/constants"
import { tagUrl } from "../lib/email-utm"
import { buildLineCustomizerExport } from "../lib/customizer-order-artifacts"
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
      relations: toStage === "awaiting_approval"
        ? ["shipping_address", "items"]
        : ["shipping_address"],
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

  const orderMeta = (order.metadata ?? {}) as Record<string, unknown>

  // Dedup via Medusa's built-in idempotency_key on the notification table.
  // A UNIQUE index on (idempotency_key WHERE deleted_at IS NULL) means two
  // parallel createNotifications calls race at the DB level — exactly one
  // INSERT wins, the other hits the unique constraint and the notification
  // module silently skips it. No locks, no metadata stamps, no race window.
  // Key is per-(order, stage, channel) so a future legit re-send (e.g. on a
  // manual rewind) needs the prior notification row removed first.
  const idempotencyKey = `artwork-email:${data.order_id}:${toStage}`

  // Staff-uploaded revised proof takes priority over everything else.
  const revisedProofs = Array.isArray(orderMeta.revised_proofs)
    ? (orderMeta.revised_proofs as Array<{ url?: string; uploaded_at?: string }>)
    : []
  const latestRevisedProofUrl =
    revisedProofs
      .filter((p) => typeof p?.url === "string" && (p.url as string).length > 0)
      .sort((a, b) => ((a.uploaded_at ?? "") < (b.uploaded_at ?? "") ? 1 : -1))[0]?.url ?? null

  const photos = Array.isArray(orderMeta.production_photos)
    ? (orderMeta.production_photos as Array<{ url?: string; uploaded_at?: string }>)
    : []
  const latestPhotoUrl =
    photos
      .filter((p) => typeof p?.url === "string" && (p.url as string).length > 0)
      .sort((a, b) =>
        (a.uploaded_at ?? "") < (b.uploaded_at ?? "") ? 1 : -1
      )[0]?.url ?? null

  // Revised proof wins; if none, fall back to auto-generated mockups from line items.
  // mockupImages is only populated for awaiting_approval (and only when no revised proof exists).
  const mockupImages =
    toStage === "awaiting_approval" && !latestRevisedProofUrl
      ? (() => {
          const imgs = (order.items ?? [])
            .flatMap((line: any) => {
              const exp = buildLineCustomizerExport(line)
              return (exp?.artifacts ?? []).filter(
                (a: any) => a.mockup_url && !a.mockup_url_inline_omitted
              )
            })
            .map((a: any) => ({
              url: a.mockup_url as string,
              side: a.side,
              sideLabel: a.side_label ?? null,
            }))
          return imgs.length > 0 ? imgs : null
        })()
      : null

  // Inline helper for the generic stage-update fallback. Used directly for
  // non-approval stages, and as a backstop when the awaiting_approval flow
  // can't build a signed approval URL (e.g. STOREFRONT_URL unset on Railway).
  const sendGenericStageEmail = async () => {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER_PRODUCTION_STAGE,
      idempotency_key: idempotencyKey,
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

  try {
    if (toStage === "awaiting_approval") {
      // Preferred path: dedicated approval template with a signed
      // one-click "Approve" button and mockup images.
      let approvalUrl: string | null = null
      try {
        approvalUrl = buildApprovalUrl(data.order_id)
      } catch (signError) {
        logger.warn(
          `${ARTWORK_STAGE_EVENT}: failed to sign approval URL for ${data.order_id} (${
            (signError as Error).message
          }); falling back to generic stage email.`
        )
      }

      if (approvalUrl) {
        await notificationModuleService.createNotifications({
          to: order.email,
          channel: "email",
          template: EmailTemplates.ARTWORK_APPROVAL,
          idempotency_key: idempotencyKey,
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
              mockupImages,
              proofImageUrl: latestRevisedProofUrl ?? (mockupImages ? null : latestPhotoUrl),
              staffNote: null,
            },
            preview: `Your proof is ready for sign-off — order #${displayId}.`,
          },
        })
      } else {
        // Fallback: STOREFRONT_URL is unset (or signing failed). Send the
        // generic stage-update email so the customer still gets notified
        // their artwork is ready, even if they have to click through to
        // the portal manually instead of using a one-click approve link.
        logger.warn(
          `${ARTWORK_STAGE_EVENT}: cannot build approval URL (STOREFRONT_URL unset?); sending generic stage email for ${data.order_id} instead. Fix env to restore one-click approve.`
        )
        await sendGenericStageEmail()
      }
    } else {
      await sendGenericStageEmail()
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
