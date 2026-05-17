import { INotificationModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL, SUPPORT_REPLY_TO_EMAIL } from '../lib/constants'
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

  await notificationModuleService.createNotifications({
    to: invite.email,
    channel: 'email',
    template: EmailTemplates.INVITE_USER,
    data: {
      emailOptions: {
        replyTo: SUPPORT_REPLY_TO_EMAIL,
        subject: "You've been invited to SC Prints Admin"
      },
      inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
      preview: 'The SC Prints admin dashboard awaits...'
    }
  })
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
