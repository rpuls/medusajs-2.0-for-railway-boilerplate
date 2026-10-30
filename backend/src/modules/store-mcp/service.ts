import { InjectManager, MedusaContext, MedusaService } from '@medusajs/framework/utils'
import type { Context } from '@medusajs/framework/types'
import type { EntityManager } from '@medusajs/framework/mikro-orm/knex'
import { McpAuthorizationCode } from './models/authorization-code'
import { McpClient } from './models/client'
import { McpGrant } from './models/grant'
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
}

export default StoreMcpModuleService
