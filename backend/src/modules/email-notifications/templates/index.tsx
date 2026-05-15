import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/framework/utils'
import { InviteUserEmail, INVITE_USER, isInviteUserData } from './invite-user'
import { OrderPlacedTemplate, ORDER_PLACED, isOrderPlacedTemplateData } from './order-placed'
import {
  OrderShippedTemplate,
  ORDER_SHIPPED,
  isOrderShippedTemplateData,
} from './order-shipped'
import {
  ContactSubmissionEmail,
  CONTACT_SUBMISSION,
  isContactSubmissionData,
} from './contact-submission'
import {
  CART_REMINDER,
  CartReminderEmail,
  isCartReminderData,
} from './cart-reminder'
import {
  ORDER_PRODUCTION_STAGE,
  OrderProductionStageTemplate,
  isOrderProductionStageData,
} from './order-production-stage'
import {
  MONTHLY_DIGEST,
  MonthlyDigestEmail,
  isMonthlyDigestData,
} from './monthly-digest'
import {
  REORDER_REMINDER,
  ReorderReminderEmail,
  isReorderReminderData,
} from './reorder-reminder'
import {
  WINBACK,
  WinbackEmail,
  isWinbackData,
} from './winback'
import {
  THRESHOLD_ALERT,
  ThresholdAlertEmail,
  isThresholdAlertData,
} from './threshold-alert'
import {
  NPS_REQUEST,
  NpsRequestEmail,
  isNpsRequestData,
} from './nps-request'

export const EmailTemplates = {
  INVITE_USER,
  ORDER_PLACED,
  ORDER_SHIPPED,
  CONTACT_SUBMISSION,
  CART_REMINDER,
  ORDER_PRODUCTION_STAGE,
  MONTHLY_DIGEST,
  REORDER_REMINDER,
  WINBACK,
  THRESHOLD_ALERT,
  NPS_REQUEST,
} as const

export type EmailTemplateType = keyof typeof EmailTemplates

export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`
        )
      }
      return <InviteUserEmail {...data} />

    case EmailTemplates.ORDER_PLACED:
      if (!isOrderPlacedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PLACED}"`
        )
      }
      return <OrderPlacedTemplate {...data} />

    case EmailTemplates.ORDER_SHIPPED:
      if (!isOrderShippedTemplateData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_SHIPPED}"`
        )
      }
      return <OrderShippedTemplate {...data} />

    case EmailTemplates.CONTACT_SUBMISSION:
      if (!isContactSubmissionData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.CONTACT_SUBMISSION}"`
        )
      }
      return <ContactSubmissionEmail {...data} />

    case EmailTemplates.CART_REMINDER:
      if (!isCartReminderData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.CART_REMINDER}"`
        )
      }
      return <CartReminderEmail {...data} />

    case EmailTemplates.ORDER_PRODUCTION_STAGE:
      if (!isOrderProductionStageData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.ORDER_PRODUCTION_STAGE}"`
        )
      }
      return <OrderProductionStageTemplate {...data} />

    case EmailTemplates.MONTHLY_DIGEST:
      if (!isMonthlyDigestData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.MONTHLY_DIGEST}"`
        )
      }
      return <MonthlyDigestEmail {...data} />

    case EmailTemplates.REORDER_REMINDER:
      if (!isReorderReminderData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.REORDER_REMINDER}"`
        )
      }
      return <ReorderReminderEmail {...data} />

    case EmailTemplates.WINBACK:
      if (!isWinbackData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.WINBACK}"`
        )
      }
      return <WinbackEmail {...data} />

    case EmailTemplates.THRESHOLD_ALERT:
      if (!isThresholdAlertData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.THRESHOLD_ALERT}"`
        )
      }
      return <ThresholdAlertEmail {...data} />

    case EmailTemplates.NPS_REQUEST:
      if (!isNpsRequestData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.NPS_REQUEST}"`
        )
      }
      return <NpsRequestEmail {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export {
  InviteUserEmail,
  OrderPlacedTemplate,
  OrderShippedTemplate,
  OrderProductionStageTemplate,
  MonthlyDigestEmail,
  ReorderReminderEmail,
  WinbackEmail,
  ThresholdAlertEmail,
  NpsRequestEmail,
}
