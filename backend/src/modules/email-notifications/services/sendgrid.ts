import { Logger, NotificationTypes } from '@medusajs/framework/types'
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils'
import { ReactNode } from 'react'
import { render } from '@react-email/render'
import sgMail from '@sendgrid/mail'
import { generateEmailTemplate } from '../templates'

type InjectedDependencies = {
  logger: Logger
}

interface SendGridServiceConfig {
  apiKey: string
  from: string
}

export interface SendGridNotificationServiceOptions {
  api_key: string
  from: string
}

type NotificationEmailOptions = {
  replyTo?: string
  subject?: string
  headers?: Record<string, string>
  cc?: string[]
  bcc?: string[]
  tags?: string[]
  text?: string
}

/**
 * Service to handle email notifications using SendGrid API.
 * Renders React email templates to HTML and sends via SendGrid.
 */
export class SendGridNotificationService extends AbstractNotificationProviderService {
  static identifier = "sendgrid"
  protected config_: SendGridServiceConfig
  protected logger_: Logger

  constructor({ logger }: InjectedDependencies, options: SendGridNotificationServiceOptions) {
    super()
    this.config_ = {
      apiKey: options.api_key,
      from: options.from
    }
    this.logger_ = logger
    sgMail.setApiKey(this.config_.apiKey)
  }

  async send(
    notification: NotificationTypes.ProviderSendNotificationDTO
  ): Promise<NotificationTypes.ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `No notification information provided`)
    }
    if (notification.channel === 'sms') {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, `SMS notification not supported`)
    }

    // Generate the email content using the template
    let emailContent: ReactNode
    const templateKey = (notification.data?.template as string) || notification.template

    try {
      emailContent = generateEmailTemplate(templateKey, notification.data)
    } catch (error) {
      if (error instanceof MedusaError) {
        throw error
      }
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to generate email content for template: ${templateKey}`
      )
    }

    // Render React component to HTML
    const html = await render(emailContent)
    
    // Generate plain text version (optional, but recommended)
    const text = await render(emailContent, { plainText: true })

    const emailOptions = notification.data?.emailOptions as NotificationEmailOptions

    // Compose the message for SendGrid
    const msg = {
      to: notification.to,
      from: notification.from?.trim() ?? this.config_.from,
      subject: emailOptions?.subject ?? 'You have a new notification',
      html,
      text,
      replyTo: emailOptions?.replyTo,
      headers: emailOptions?.headers,
      cc: emailOptions?.cc,
      bcc: emailOptions?.bcc,
      categories: emailOptions?.tags,
      attachments: Array.isArray(notification.attachments)
        ? notification.attachments.map((attachment) => ({
            content: attachment.content,
            filename: attachment.filename,
            type: attachment.content_type,
            disposition: attachment.disposition ?? 'attachment',
            contentId: attachment.id ?? undefined
          }))
        : undefined,
    }

    // Send the email via SendGrid
    try {
      await sgMail.send(msg)
      this.logger_.log(
        `Successfully sent "${templateKey}" email to ${notification.to} via SendGrid`
      )
      return {}
    } catch (error: any) {
      const errorMessage = error.response?.body?.errors?.[0]?.message ?? error.message ?? 'unknown error'
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send "${templateKey}" email to ${notification.to} via SendGrid: ${errorMessage}`
      )
    }
  }
}

