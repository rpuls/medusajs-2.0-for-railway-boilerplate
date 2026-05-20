import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { Client } from "pg"

/**
 * Repairs admin login when `user` rows exist but `auth_identity` /
 * `provider_identity` were wiped (e.g. after wipe-test-data.sql).
 *
 * Usage:
 *   npx medusa exec ./src/scripts/reset-admin-auth.ts
 */
export default async function resetAdminAuth({
  container,
}: {
  container: any
}) {
  const email = process.env.MEDUSA_ADMIN_EMAIL?.trim()
  const password = process.env.MEDUSA_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      "Set MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD in backend/.env"
    )
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const auth = container.resolve(Modules.AUTH)

  const { data: users } = await query.graph({
    entity: "user",
    fields: ["id", "email"],
    filters: { email },
  })

  const user = users?.[0]
  if (!user) {
    throw new Error(`No user row found for ${email}. Run: npx medusa user -e ...`)
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  const existing = await client.query(
    `SELECT pi.auth_identity_id, ai.app_metadata
     FROM provider_identity pi
     JOIN auth_identity ai ON ai.id = pi.auth_identity_id
     WHERE pi.entity_id = $1 AND pi.provider = 'emailpass'`,
    [email]
  )
  await client.end()

  let authIdentityId: string

  if (existing.rows.length > 0) {
    authIdentityId = existing.rows[0].auth_identity_id
    const linkedUserId = existing.rows[0].app_metadata?.user_id
    if (linkedUserId === user.id) {
      console.log(`Auth already linked for ${email} → ${user.id}`)
      return
    }
    console.log(`Linking existing auth identity to ${user.id}`)
  } else {
    const { success, authIdentity, error } = await auth.register("emailpass", {
      body: { email, password },
    })
    if (!success || !authIdentity) {
      throw new Error(
        `Failed to register auth for ${email}: ${error ?? "unknown"}`
      )
    }
    authIdentityId = authIdentity.id
    console.log(`Registered new auth identity for ${email}`)
  }

  const authIdentity = await auth.retrieveAuthIdentity(authIdentityId)
  const appMetadata = { ...(authIdentity.app_metadata ?? {}), user_id: user.id }
  await auth.updateAuthIdentities({
    id: authIdentityId,
    app_metadata: appMetadata,
  })

  console.log(`Done — ${email} can log in as user ${user.id}`)
}
