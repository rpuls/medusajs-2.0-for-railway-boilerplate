import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/utils'
import * as React from 'react'
import InviteUserEmail, { INVITE_USER_TEMPLATE_KEY, isInviteUserData } from './invite-user'

/**
 * Enum for the different email templates that can be used.
 */
export enum EmailTemplates {
  INVITE_USER = INVITE_USER_TEMPLATE_KEY,
  // ORDER_CREATED = ORDER_CREATED_TEMPLATE_KEY, // Uncomment this line if you decide to use react-email with the order created event
}

/**
 * Function to generate the correct email template based on the template key and data provided.
 */
export function generateEmailTemplate(templateKey: string, data: unknown): ReactNode {
  switch (templateKey) {
    case EmailTemplates.INVITE_USER:
      if (!isInviteUserData(data)) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Invalid data for template "${EmailTemplates.INVITE_USER}"`,
        )
      }
      return <InviteUserEmail {...data} />

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`,
      )
  }
}
