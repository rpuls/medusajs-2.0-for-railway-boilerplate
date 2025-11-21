import { INotificationModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { ADMIN_UI_URL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'
import { PLACEHOLDER_TEMPLATE_ID } from '../lib/notification-templates'

export default async function userInviteHandler({
    event: { data },
    container,
  }: SubscriberArgs<any>) {
  
  // Debug: Log that subscriber was triggered - THIS SHOULD APPEAR IMMEDIATELY
  console.error('\n\n')
  console.error('═══════════════════════════════════════════════════════')
  console.error('🔔🔔🔔 INVITE SUBSCRIBER TRIGGERED! 🔔🔔🔔')
  console.error('═══════════════════════════════════════════════════════')
  console.error('Event data:', JSON.stringify(data, null, 2))
  console.error('Timestamp:', new Date().toISOString())

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  
  console.error('📧 Retrieving invite with ID:', data.id)
  const invite = await userModuleService.retrieveInvite(data.id)

  // Debug: Log invite object
  console.error('=== INVITE DEBUG INFO ===')
  console.error('Invite ID:', invite.id)
  console.error('Invite Email:', invite.email)
  console.error('Invite Token:', invite.token)
  console.error('Full Invite Object:', JSON.stringify(invite, null, 2))
  console.error('ADMIN_UI_URL:', ADMIN_UI_URL)
  console.error('Generated Invite Link:', `${ADMIN_UI_URL}/app/invite?token=${invite.token}`)
  console.error('========================')

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: PLACEHOLDER_TEMPLATE_ID, // Placeholder GUID - actual template handled in custom provider
      data: {
        template: EmailTemplates.INVITE_USER,
        emailOptions: {
          replyTo: 'info@example.com',
          subject: "You've been invited to Medusa!"
        },
        inviteLink: `${ADMIN_UI_URL}/app/invite?token=${invite.token}`,
        preview: 'The administration dashboard awaits...'
      }
    })
  } catch (error) {
    console.error('❌ ERROR sending invite notification:', error)
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
