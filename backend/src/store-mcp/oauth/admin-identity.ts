import type { MedusaRequest } from '@medusajs/framework/http'
import type { IAuthModuleService, IUserModuleService } from '@medusajs/framework/types'
import { Modules } from '@medusajs/framework/utils'

export type Admin = { id: string; email: string; name: string | null }

type SessionAuthContext = {
  actor_id?: string
  actor_type?: string
  mfa_enabled?: boolean
  mfa_challenge_completed_at?: string | null
}

const loadAdmin = async (req: MedusaRequest, userId: string): Promise<Admin | null> => {
  const users = req.scope.resolve<IUserModuleService>(Modules.USER)
  const [user] = await users.listUsers({ id: userId }, { take: 1 })
  if (!user) return null
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
  return { id: user.id, email: user.email, name: name || null }
}

/**
 * The admin signed in to the dashboard in this browser, if any. Medusa keeps the dashboard's
 * login in its session cookie, which is SameSite=Lax and so arrives on the top-level
 * navigation from an AI app to this page. A session whose two-step verification was never
 * completed does not count, exactly as Medusa's own admin routes treat it.
 */
export const getSessionAdmin = async (req: MedusaRequest): Promise<Admin | null> => {
  const context = (req.session as { auth_context?: SessionAuthContext } | undefined)?.auth_context
  if (!context || context.actor_type !== 'user' || typeof context.actor_id !== 'string') return null
  if (context.mfa_enabled && !context.mfa_challenge_completed_at) return null
  return loadAdmin(req, context.actor_id)
}

export type PasswordCheck =
  | { ok: true; admin: Admin }
  | { ok: false; reason: 'invalid' | 'mfa' }

/**
 * Checks an admin email and password with Medusa's own emailpass provider, the same check the
 * dashboard login runs. An account with two-step verification is refused here: a password
 * alone must not get further than it would on the dashboard. Such an admin signs in to the
 * dashboard first and then gets the session path above.
 */
export const checkAdminPassword = async (
  req: MedusaRequest,
  email: string,
  password: string
): Promise<PasswordCheck> => {
  const auth = req.scope.resolve<IAuthModuleService>(Modules.AUTH)
  const { success, authIdentity, mfaChallenge } = await auth.authenticate('emailpass', {
    url: req.url,
    headers: {},
    query: {},
    body: { email, password },
    protocol: req.protocol,
  })
  const userId = authIdentity?.app_metadata?.user_id
  if (!success || !authIdentity || typeof userId !== 'string') return { ok: false, reason: 'invalid' }

  if (mfaChallenge) return { ok: false, reason: 'mfa' }
  const factors = await auth.listAuthMfa({ auth_identity_id: authIdentity.id, status: 'enabled' }, { select: ['id'] })
  if (factors.length > 0) return { ok: false, reason: 'mfa' }

  const admin = await loadAdmin(req, userId)
  return admin ? { ok: true, admin } : { ok: false, reason: 'invalid' }
}
