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

  server.registerTool(
    'propose_store_setup',
    {
      title: 'Propose store setup',
      description:
        'Proposes changes to regions, shipping, tax and warehouses: new regions, countries added to regions, the standard tax rate of a country, new warehouses, new shipping zones with their options, countries added to shipping zones, new shipping options, new shipping profiles, products moved into a profile, and stock levels. Nothing changes in the store. The proposal is checked against the current setup and saved, and an admin applies or discards it on the AI assistants page in the dashboard. Put everything for one goal, such as "start selling to the Netherlands", in one proposal. Call get_store_setup first for the ids.',
      inputSchema: {
        summary: z.string().trim().min(1).max(500).describe('One or two sentences for the admin: what this sets up and why'),
        ...setupShape,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    safely(ctx, async ({ summary, ...changes }) => {
      return propose(summary, changes as SetupChanges)
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
        stock_levels: setupShape.stock_levels.unwrap().min(1),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    safely(ctx, async ({ summary, stock_levels }) => propose(summary, { stock_levels }))
  )

  /** Checks a proposal against the store, saves it for an admin, and says what it will do */
  async function propose(summary: string, changes: SetupChanges) {
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
    return ok({
      proposal_id: proposal.id,
      status: 'pending',
      will_do: plan.steps.map((step) => step.line),
      warnings: plan.warnings,
      review_url: REVIEW_URL,
      next_step:
        'Nothing has changed yet. Tell the admin what it will do and any warnings, and that they apply it on the AI assistants page in the dashboard (review_url).',
    })
  }
}
