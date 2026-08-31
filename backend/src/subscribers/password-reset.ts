import { INotificationModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL, IS_DEV, RESEND_FROM_EMAIL, STOREFRONT_URL } from '../lib/constants'
import { EmailTemplates } from '../modules/email-notifications/templates'

/**
 * Sends the password reset email.
 *
 * Without this subscriber the whole reset flow is a dead end, and silently so.
 * `POST /auth/{actor}/emailpass/reset-password` answers 201 whether or not the
 * identity exists (deliberately, so it cannot be used to enumerate accounts),
 * and `generateResetPasswordTokenWorkflow` emits `auth.password_reset` with the
 * token. If nothing is listening, the token is generated, the caller is told
 * everything went fine, and no one ever receives it. The admin dashboard's
 * "Forgot password?" link has behaved exactly that way on every deploy of this
 * template.
 *
 * Payload shape, read from core-flows rather than the docs:
 *   { entity_id, actor_type, token, metadata }
 * `entity_id` is the identifier the reset was requested for, which for the
 * emailpass provider is the email address.
 */

/** Medusa issues these with a 15 minute TTL (RESET_PASSWORD_TOKEN_TTL_SECONDS). */
const TOKEN_TTL_MINUTES = 15

type PasswordResetEvent = {
  entity_id: string
  actor_type: string
  token: string
}

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetEvent>) {
  const { entity_id: email, actor_type: actorType, token } = data

  if (!email || !token) {
    console.error('auth.password_reset fired without an identifier or a token; nothing to send.')
    return
  }

  // "user" is an admin. Their reset page is served by this same service, so it
  // needs no configuration at all. Anything else is treated as a shopper.
  const isAdmin = actorType === 'user'

  /*
   * The admin dashboard reads only `token` from the query string and decodes
   * the identity out of the JWT itself, verified against the bundled
   * dashboard's reset-password chunk rather than assumed.
   *
   * The storefront link carries `email` as well, purely so the form can say
   * which account is being reset. It is display-only and must never be used to
   * decide whose password changes: `POST /auth/{actor}/{provider}/update` takes
   * the identity from the validated token, not from the request body.
   *
   * No region prefix on the storefront URL on purpose. The storefront's
   * middleware adds one and preserves the query string, so it resolves to the
   * visitor's own region rather than one guessed here.
   */
  const resetLink = isAdmin
    ? `${BACKEND_URL}/app/reset-password?token=${token}`
    : `${STOREFRONT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

  /*
   * Local development has no mail provider, so without this the only way to
   * exercise the flow is to add one. Gated on NODE_ENV === 'development'
   * specifically, not on "not production": an unset NODE_ENV is the common
   * shape of a misconfigured production box, and printing a live reset token
   * into its logs would be a real problem.
   */
  if (IS_DEV) {
    console.info(`[dev] password reset link for ${email}: ${resetLink}`)
  }

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )

  try {
    await notificationModuleService.createNotifications({
      to: email,
      channel: 'email',
      template: EmailTemplates.RESET_PASSWORD,
      data: {
        emailOptions: {
          replyTo: process.env.ORDER_REPLY_TO_EMAIL || RESEND_FROM_EMAIL,
          subject: `Reset your ${process.env.STORE_NAME || 'store'} password`,
        },
        resetLink,
        email,
        isAdmin,
        expiresInMinutes: TOKEN_TTL_MINUTES,
        preview: 'Set a new password',
      },
    })
  } catch (error) {
    // Same shape as the other subscribers: a failed send must not take down the
    // workflow that emitted the event. The provider itself throws with the
    // reason attached, so this line is where a misconfigured Resend key shows
    // up in the deploy log.
    console.error('Error sending password reset notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
}
