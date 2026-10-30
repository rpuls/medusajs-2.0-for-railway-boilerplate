import type { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import type { McpAuthContext } from '../oauth/tokens'

export type ToolContext = {
  scope: MedusaContainer
  auth: McpAuthContext
}

/** No tool returns more than this many rows, so none of them works as a bulk export */
export const MAX_ROWS = 50

export const queryOf = (scope: MedusaContainer) => scope.resolve(ContainerRegistrationKeys.QUERY)

export const ok = (data: unknown): CallToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
})

export const fail = (message: string): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text: message }],
})

/** Runs a tool body, turning thrown errors into a tool error the model can read and recover from */
export const safely =
  <A>(ctx: ToolContext, body: (args: A) => Promise<CallToolResult>) =>
  async (args: A): Promise<CallToolResult> => {
    try {
      return await body(args)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      ctx.scope.resolve(ContainerRegistrationKeys.LOGGER).warn(`Store MCP: tool failed for ${ctx.auth.appName}: ${message}`)
      return fail(message)
    }
  }

export const fullName = (person?: { first_name?: string | null; last_name?: string | null } | null): string | null => {
  const name = [person?.first_name, person?.last_name].filter(Boolean).join(' ').trim()
  return name || null
}

export const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

/** Orders that count as sales: not drafts and not canceled */
export const isSale = (order: { status?: string | null; is_draft_order?: boolean | null }): boolean =>
  order.status !== 'draft' && order.status !== 'canceled' && !order.is_draft_order

export const round = (value: number): number => Math.round(value * 100) / 100
