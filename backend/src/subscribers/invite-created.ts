import { INotificationModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL, RESEND_FROM_EMAIL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

export default async function userInviteHandler({
    event: { data },
    container,
  }: SubscriberArgs<any>) {

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  const invite = await userModuleService.retrieveInvite(data.id)

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: EmailTemplates.INVITE_USER,
      data: {
        emailOptions: {
          // RESEND_FROM_EMAIL comes from lib/constants, which falls back to
          // RESEND_FROM. Reading process.env directly here missed that
          // fallback, so the reply-to was empty on every deploy configured
          // with RESEND_FROM, which is what the Railway template sets.
          replyTo: process.env.ORDER_REPLY_TO_EMAIL || RESEND_FROM_EMAIL,
          subject: `You've been invited to ${process.env.STORE_NAME || 'your store'}!`
        },
        inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
        preview: 'The administration dashboard awaits...'
      }
    })
  } catch (error) {
    console.error(error)
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
