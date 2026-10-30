import { z } from '@medusajs/framework/zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { STORE_MCP_MODULE } from '../../modules/store-mcp'
import type StoreMcpModuleService from '../../modules/store-mcp/service'
import { ISSUER } from '../config'
import { loadSetupState, planSetup, setupShape, stockedVariantIds, type SetupChanges } from '../setup'
import { fail, MAX_ROWS, ok, safely, type ToolContext } from './helpers'

/**
 * Regions, shipping, tax, warehouses and the stock of published products. Read freely; changed
 * only through a proposal an admin applies, because none of it has a draft state. See ../setup.ts.
 */

const REVIEW_URL = `${ISSUER}/app/ai-assistants`

export const registerSetupTools = (server: McpServer, ctx: ToolContext) => {
  const store = ctx.scope.resolve<StoreMcpModuleService>(STORE_MCP_MODULE)

  server.registerTool(
    'get_store_setup',
    {
      title: 'Store setup',
      description:
        'How the store sells: its currencies, its regions with their countries and payment methods, its warehouses (stock locations), where it ships from, its shipping zones and their options with prices, its shipping profiles, the tax rate of each country, and the proposals made through this connection. Read this before propose_store_setup or propose_stock_changes.',
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    safely(ctx, async () => {
      const state = await loadSetupState(ctx.scope)
      const proposals = await store.listMcpSetupProposals({ grant_id: ctx.auth.grantId }, { take: 10, order: { created_at: 'DESC' } })
      const country = (code: string) => ({ code, name: state.countryNames.get(code) ?? code })
      const profileName = new Map(state.profiles.map((p) => [p.id, p.name]))
      const productsIn = (profileId: string) => [...state.products.values()].filter((p) => p.shipping_profile_id === profileId).length
      return ok({
        currencies: state.currencies,
        products_priced_in: Object.fromEntries(state.pricedIn),
        published_products: state.publishedProducts,
        regions: state.regions.slice(0, MAX_ROWS).map((r) => ({
          id: r.id,
          name: r.name,
          currency: r.currency_code,
          countries: r.countries.map(country),
          payment_providers: r.payment_providers,
        })),
        ships_from: state.fulfillmentSets.slice(0, MAX_ROWS).map((set) => ({
          fulfillment_set_id: set.id,
          name: set.name,
          location: set.location,
          zones: state.zones
            .filter((zone) => zone.fulfillment_set_id === set.id)
            .map((zone) => ({
              id: zone.id,
              name: zone.name,
              countries: zone.geo_zones.filter((g) => g.type === 'country').map((g) => g.country_code),
              options: state.options
                .filter((o) => o.service_zone_id === zone.id)
                .map((o) => ({ id: o.id, name: o.name, priced_in: o.currencies, shipping_profile: profileName.get(o.shipping_profile_id) ?? null })),
            })),
        })),
        stock_locations: state.locations.slice(0, MAX_ROWS).map((l) => ({
          id: l.id,
          name: l.name,
          city: l.city,
          country: l.country_code,
          default: l.id === state.defaultLocationId,
          sells_through_default_channel: Boolean(state.defaultSalesChannelId && l.sales_channel_ids.includes(state.defaultSalesChannelId)),
          ships: l.ships,
        })),
        shipping_profiles: state.profiles.slice(0, MAX_ROWS).map((p) => ({ ...p, products: productsIn(p.id) })),
        tax_rates: state.taxRegions.slice(0, MAX_ROWS).map((t) => ({
          country: t.country_code,
          rate_percent: t.rate?.rate ?? null,
          name: t.rate?.name ?? null,
        })),
        your_proposals: proposals.map((p) => ({
          id: p.id,
          summary: p.summary,
          status: p.status,
          created_at: p.created_at,
          error: (p.result as { error?: string } | null)?.error ?? null,
        })),
        note: 'A tax rate of null means none is set: orders there are charged no tax. To change any of this, use propose_store_setup; nothing changes until an admin applies it.',
      })
    })
  )

  // Asked to add something to a proposal it just made, an assistant sends a complete new one and
  // tells the admin to discard the old one. Two near-identical proposals on the page invite
  // applying both, so it can withdraw its own pending proposal instead.
  const replaces = z
    .string()
    .optional()
    .describe('The id of a pending proposal from this connection that this one replaces. It is discarded when this one is saved, so the admin only sees the new one.')

  server.registerTool(
    'propose_store_setup',
    {
      title: 'Propose store setup',
      description:
        'Proposes changes to regions, shipping, tax and warehouses: new regions, countries added to regions, the standard tax rate of a country, new warehouses, new shipping zones with their options, countries added to shipping zones, new shipping options, new shipping profiles, products moved into a profile, and stock levels. Nothing changes in the store. The proposal is checked against the current setup and saved, and an admin applies or discards it on the AI assistants page in the dashboard. Put everything for one goal, such as "start selling to the Netherlands", in one proposal; a new warehouse sells nothing until it has stock, so include stock_levels for it. To add to a proposal that is still pending, send the complete proposal again with replaces_proposal_id. Call get_store_setup first for the ids.',
      inputSchema: {
        summary: z.string().trim().min(1).max(500).describe('One or two sentences for the admin: what this sets up and why'),
        replaces_proposal_id: replaces,
        ...setupShape,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    safely(ctx, async ({ summary, replaces_proposal_id, ...changes }) => {
      return propose(summary, changes as SetupChanges, replaces_proposal_id)
    })
  )

  server.registerTool(
    'propose_stock_changes',
    {
      title: 'Propose stock changes',
      description:
        "Proposes stock for products, published or not: a stock count (set_to) or a delivery (add), per variant and warehouse. Nothing changes until an admin applies it on the AI assistants page. Use add for deliveries, so units sold before it is applied are not counted twice. get_product shows each variant's stock per warehouse; for drafts, update_product_draft sets stock directly.",
      inputSchema: {
        summary: z.string().trim().min(1).max(500).describe('One or two sentences for the admin, e.g. "Delivery from the supplier on 30 October"'),
        replaces_proposal_id: replaces,
        stock_levels: setupShape.stock_levels.unwrap().min(1),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    safely(ctx, async ({ summary, replaces_proposal_id, stock_levels }) => propose(summary, { stock_levels }, replaces_proposal_id))
  )

  /** Checks a proposal against the store, saves it for an admin, and says what it will do */
  async function propose(summary: string, changes: SetupChanges, replacesId?: string) {
    if (replacesId) {
      const [old] = await store.listMcpSetupProposals({ id: replacesId, grant_id: ctx.auth.grantId }, { take: 1 })
      if (!old) return fail('Nothing was saved. replaces_proposal_id is not a proposal made through this connection.')
      if (old.status !== 'pending') {
        return fail(`Nothing was saved. Proposal ${replacesId} is ${old.status}, so it can no longer be replaced. Call get_store_setup and propose only what is still missing.`)
      }
    }
    const plan = planSetup(await loadSetupState(ctx.scope, stockedVariantIds(changes)), changes)
    if (plan.errors.length) {
      return fail(`Nothing was saved. Fix these and propose again:\n- ${plan.errors.join('\n- ')}`)
    }
    const proposal = await store.createMcpSetupProposals({
      grant_id: ctx.auth.grantId,
      user_id: ctx.auth.userId,
      app_name: ctx.auth.appName,
      summary,
      changes: changes as Record<string, unknown>,
    })
    // An admin may have applied the old one since the check above; then both stay, and we say so
    const replaced = replacesId ? await store.withdrawSetupProposal(replacesId, ctx.auth.grantId, proposal.id) : null
    return ok({
      proposal_id: proposal.id,
      status: 'pending',
      ...(replacesId ? { replaced: replaced ? replacesId : null } : {}),
      will_do: plan.steps.map((step) => step.line),
      warnings: [
        ...(replaced === false
          ? [`Proposal ${replacesId} was applied or discarded while this one was saved, so it was not replaced. Check get_store_setup before the admin applies this one.`]
          : []),
        ...plan.warnings,
      ],
      review_url: REVIEW_URL,
      next_step:
        'Nothing has changed yet. Tell the admin what it will do and any warnings, and that they apply it on the AI assistants page in the dashboard (review_url).',
    })
  }
}
