import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/framework/types"
import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import {
  CONTACT_NOTIFICATION_EMAIL,
  ORDER_NOTIFICATION_EMAIL,
  SUPPORT_REPLY_TO_EMAIL,
} from "../lib/constants"
import { parseNotificationEmailList } from "../lib/notification-recipients"
import { getPostHog } from "../lib/posthog"
import { EmailTemplates } from "../modules/email-notifications/templates"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "summary", "shipping_address"],
  })

  const shippingAddress = order.shipping_address
  if (!shippingAddress) {
    logger.warn(
      `order.placed: order ${data.id} has no shipping_address; skipping order emails.`
    )
    return
  }

  // Identify the customer and track the order placement
  const distinctId = (order as any).customer_id ?? order.email ?? data.id
  const posthog = getPostHog()
  if (posthog && order.email) {
    posthog.identify({
      distinctId,
      properties: {
        email: order.email,
        $set: { email: order.email },
        $set_once: { first_order_id: data.id },
      },
    })
  }
  posthog?.capture({
    distinctId,
    event: "order placed",
    properties: {
      order_id: data.id,
      display_id: (order as any).display_id ?? null,
      item_count: (order.items ?? []).length,
      currency_code: order.currency_code ?? null,
      total: (order as any).summary?.current_order_total ?? null,
      email: order.email ?? null,
      country_code: shippingAddress.country_code ?? null,
    },
  })

  const displayId = (order as { display_id?: string | number }).display_id ?? data.id
  const replyToSupport = SUPPORT_REPLY_TO_EMAIL

  const merchantInboxes = parseNotificationEmailList(
    ORDER_NOTIFICATION_EMAIL || CONTACT_NOTIFICATION_EMAIL
  )

  if (order.email) {
    try {
      await notificationModuleService.createNotifications({
        to: order.email,
        channel: "email",
        template: EmailTemplates.ORDER_PLACED,
        data: {
          emailOptions: {
            replyTo: replyToSupport,
            subject: "Your order has been placed",
          },
          order,
          shippingAddress,
          audience: "customer",
          preview: "Thank you for your order!",
        },
      })
    } catch (error) {
      logger.error(
        `order.placed: customer confirmation failed for order ${data.id}: ${
          (error as Error).message
        }`
      )
    }
  } else {
    logger.warn(
      `order.placed: order ${data.id} has no customer email; skipping customer confirmation.`
    )
  }

  for (const inbox of merchantInboxes) {
    try {
      await notificationModuleService.createNotifications({
        to: inbox,
        channel: "email",
        template: EmailTemplates.ORDER_PLACED,
        data: {
          emailOptions: {
            replyTo: order.email ?? replyToSupport,
            subject: `New order #${displayId}`,
          },
          order,
          shippingAddress,
          audience: "merchant",
          preview: `New order #${displayId}`,
        },
      })
    } catch (error) {
      logger.error(
        `order.placed: merchant notification to ${inbox} failed: ${(error as Error).message}`
      )
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
