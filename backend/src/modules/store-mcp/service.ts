import { InjectManager, MedusaContext, MedusaService } from '@medusajs/framework/utils'
import type { Context } from '@medusajs/framework/types'
import type { EntityManager } from '@medusajs/framework/mikro-orm/knex'
import { McpAuthorizationCode } from './models/authorization-code'
import { McpClient } from './models/client'
import { McpGrant } from './models/grant'
import { McpSetupProposal } from './models/setup-proposal'
import { McpSuggestion } from './models/suggestion'
import { McpToken } from './models/token'

const SINGLE_USE_TABLES = {
  authorization_code: 'store_mcp_authorization_code',
  token: 'store_mcp_token',
} as const

class StoreMcpModuleService extends MedusaService({
  McpClient,
  McpGrant,
  McpAuthorizationCode,
  McpToken,
  McpSuggestion,
  McpSetupProposal,
}) {
  /**
   * Marks a code or refresh token as used, but only if nothing did so first.
   * One conditional UPDATE, so two exchanges racing for the same code cannot
   * both win: the loser gets false and issues nothing.
   */
  @InjectManager()
  async claimSingleUse(
    kind: keyof typeof SINGLE_USE_TABLES,
    id: string,
    @MedusaContext() sharedContext: Context<EntityManager> = {}
  ): Promise<boolean> {
    const rows = await sharedContext.manager!.execute(
      `update "${SINGLE_USE_TABLES[kind]}" set used_at = now() where id = ? and used_at is null and deleted_at is null returning id`,
      [id]
    )
    return Array.isArray(rows) && rows.length > 0
  }

  /**
   * Moves a setup proposal from pending to applying, but only if it is still pending. Two
   * admins clicking Apply at once would otherwise both create the same region and shipping
   * options.
   */
  @InjectManager()
  async claimSetupProposal(id: string, @MedusaContext() sharedContext: Context<EntityManager> = {}): Promise<boolean> {
    const rows = await sharedContext.manager!.execute(
      `update "store_mcp_setup_proposal" set status = 'applying', updated_at = now() where id = ? and status = 'pending' and deleted_at is null returning id`,
      [id]
    )
    return Array.isArray(rows) && rows.length > 0
  }

  /**
   * Discards a pending proposal that the same connection replaces with a new one. Conditional
   * like the claim above, so a proposal an admin is applying at that moment is left alone.
   */
  @InjectManager()
  async withdrawSetupProposal(
    id: string,
    grantId: string,
    replacedBy: string,
    @MedusaContext() sharedContext: Context<EntityManager> = {}
  ): Promise<boolean> {
    const rows = await sharedContext.manager!.execute(
      `update "store_mcp_setup_proposal" set status = 'discarded', resolved_at = now(), result = ?::jsonb, updated_at = now() where id = ? and grant_id = ? and status = 'pending' and deleted_at is null returning id`,
      [JSON.stringify({ replaced_by: replacedBy }), id, grantId]
    )
    return Array.isArray(rows) && rows.length > 0
  }
}

export default StoreMcpModuleService
