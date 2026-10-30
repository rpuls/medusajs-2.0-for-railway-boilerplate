import { z } from '@medusajs/framework/zod'
import {
  createProductsWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
} from '@medusajs/medusa/core-flows'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { STORE_MCP_MODULE } from '../../modules/store-mcp'
import type StoreMcpModuleService from '../../modules/store-mcp/service'
import { BACKEND_URL, S3_FILE_URL } from '../../lib/constants'
import { fail, ok, queryOf, safely, type ToolContext } from './helpers'

/**
 * The only tools that write. What they may touch is the point of the whole design:
 *
 * - Drafts are free to create and edit, because a draft is invisible to shoppers until an
 *   admin publishes it, and publishing is not a tool.
 * - A published product is never written. A change to one is saved as a suggestion, which an
 *   admin applies or discards on the product page in the dashboard.
 * - Prices change only on drafts, stock never, and nothing is deleted.
 */

const WRITES = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } as const

const price = z.object({
  currency_code: z.string().length(3).describe('ISO 4217, lowercase, e.g. "eur". Must be one of the store currencies.'),
  amount: z.number().positive().max(1_000_000).describe('Major units: 19.99 means 19.99'),
})

const text = (max: number, what: string) => z.string().trim().min(1).max(max).describe(what)

/**
 * Images must already be in the store's own file storage. An arbitrary URL would be a way out
 * for data: a customer can put instructions in their name, an assistant that reads it may
 * follow them and set a thumbnail like https://elsewhere/?d=<emails>, and the dashboard then
 * loads that URL the moment an admin opens the product list.
 */
const STORE_FILE_PREFIXES = [S3_FILE_URL, `${BACKEND_URL}/static`]
  .filter((prefix): prefix is string => Boolean(prefix))
  .map((prefix) => `${prefix.replace(/\/+$/, '')}/`)
const imageUrl = z
  .string()
  .url()
  .refine(
    (value) => STORE_FILE_PREFIXES.some((prefix) => value.startsWith(prefix)),
    `Images must already be uploaded to the store, under ${STORE_FILE_PREFIXES.join(' or ')}. The admin adds other images in the dashboard.`
  )

/** Fields an admin can apply from a suggestion. Deliberately texts and categories only. */
const suggestionChanges = z
  .object({
    title: text(200, 'New title').optional(),
    subtitle: text(200, 'New subtitle').optional(),
    description: text(10_000, 'New description, plain text').optional(),
    category_ids: z.array(z.string()).max(20).optional().describe('Replaces the product categories'),
  })
  .refine((changes) => Object.keys(changes).length > 0, 'Suggest at least one change')

export type SuggestionChanges = z.infer<typeof suggestionChanges>
export const parseSuggestionChanges = (value: unknown) => suggestionChanges.safeParse(value)

const loadProduct = async (ctx: ToolContext, id: string) => {
  const { data } = await queryOf(ctx.scope).graph({
    entity: 'product',
    fields: ['id', 'title', 'status', 'variants.id'],
    filters: { id },
  })
  return (data[0] as { id: string; title: string; status: string; variants?: Array<{ id: string }> }) ?? null
}

const storeDefaults = async (ctx: ToolContext) => {
  const query = queryOf(ctx.scope)
  const [{ data: stores }, { data: profiles }] = await Promise.all([
    query.graph({ entity: 'store', fields: ['default_sales_channel_id', 'supported_currencies.currency_code'] }),
    query.graph({ entity: 'shipping_profile', fields: ['id', 'type'] }),
  ])
  const store = stores[0] as any
  return {
    salesChannelId: store?.default_sales_channel_id as string | undefined,
    currencies: new Set<string>((store?.supported_currencies ?? []).map((c: any) => c.currency_code)),
    shippingProfileId: ((profiles as any[]).find((p) => p.type === 'default') ?? profiles[0])?.id as string | undefined,
  }
}

const unsupportedCurrency = (prices: Array<{ currency_code: string }>, currencies: Set<string>) =>
  prices.map((p) => p.currency_code.toLowerCase()).find((code) => !currencies.has(code))

export const registerWriteTools = (server: McpServer, ctx: ToolContext) => {
  const store = ctx.scope.resolve<StoreMcpModuleService>(STORE_MCP_MODULE)

  server.registerTool(
    'create_product_draft',
    {
      title: 'Create product draft',
      description:
        'Creates a new product as a DRAFT. Drafts are not visible in the store; an admin reviews and publishes them in the dashboard. Give options (e.g. Size: S, M, L) and one variant per combination, each with prices in the store currencies. Stock is set by the admin.',
      inputSchema: {
        title: text(200, 'Product title'),
        subtitle: text(200, 'Short subtitle').optional(),
        description: text(10_000, 'Product description, plain text').optional(),
        handle: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100).optional().describe('URL slug, lowercase with dashes. Derived from the title when left out.'),
        material: text(100, 'Material').optional(),
        category_ids: z.array(z.string()).max(20).optional().describe('Ids from get_store_overview'),
        collection_id: z.string().optional(),
        thumbnail: imageUrl.optional().describe('Main image, a URL of a file already in the store, e.g. one used by another product'),
        image_urls: z.array(imageUrl).max(10).optional().describe('URLs of files already in the store'),
        options: z
          .array(z.object({ title: text(60, 'Option name, e.g. Size'), values: z.array(text(60, 'Value')).min(1).max(30) }))
          .max(3)
          .optional()
          .describe('Leave out for a product with a single variant'),
        variants: z
          .array(
            z.object({
              title: text(200, 'Variant title, e.g. "Large / Blue"'),
              sku: z.string().trim().max(100).optional(),
              options: z.record(z.string(), z.string()).optional().describe('Option name to value, e.g. {"Size": "L"}'),
              prices: z.array(price).min(1).max(20),
              manage_inventory: z.boolean().optional().describe('Track stock for this variant. Default true; the admin then sets stock before publishing.'),
            })
          )
          .min(1)
          .max(100),
      },
      annotations: WRITES,
    },
    safely(ctx, async (input) => {
      const defaults = await storeDefaults(ctx)
      const bad = unsupportedCurrency(input.variants.flatMap((v) => v.prices), defaults.currencies)
      if (bad) return fail(`The store does not sell in "${bad}". Store currencies: ${[...defaults.currencies].join(', ')}`)

      const options = input.options?.length ? input.options : [{ title: 'Default option', values: ['Default option value'] }]
      if (!input.options?.length && input.variants.length > 1) {
        return fail('Several variants need options that tell them apart, e.g. options: [{ title: "Size", values: ["S", "M"] }].')
      }

      const { result } = await createProductsWorkflow(ctx.scope).run({
        input: {
          products: [
            {
              title: input.title,
              subtitle: input.subtitle,
              description: input.description,
              handle: input.handle,
              material: input.material,
              status: 'draft',
              thumbnail: input.thumbnail ?? input.image_urls?.[0],
              images: (input.image_urls ?? []).map((url) => ({ url })),
              category_ids: input.category_ids,
              collection_id: input.collection_id,
              options,
              variants: input.variants.map((variant) => ({
                title: variant.title,
                sku: variant.sku || undefined,
                options: input.options?.length ? variant.options : { 'Default option': 'Default option value' },
                prices: variant.prices.map((p) => ({ amount: p.amount, currency_code: p.currency_code.toLowerCase() })),
                manage_inventory: variant.manage_inventory ?? true,
              })),
              sales_channels: defaults.salesChannelId ? [{ id: defaults.salesChannelId }] : undefined,
              shipping_profile_id: defaults.shippingProfileId,
              metadata: { store_mcp_app: ctx.auth.appName, store_mcp_admin: ctx.auth.userEmail },
            },
          ],
        },
      })
      const product = result[0]
      return ok({
        id: product.id,
        handle: product.handle,
        status: product.status,
        variants: (product.variants ?? []).map((v: any) => ({ id: v.id, title: v.title, sku: v.sku })),
        next_step: 'Tell the admin to review and publish it in the dashboard under Products. Stock is set there too.',
      })
    })
  )

  server.registerTool(
    'update_product_draft',
    {
      title: 'Update product draft',
      description:
        'Edits a product that is still a DRAFT: texts, images, categories, collection, and variant prices. Refused for published products; use suggest_product_changes for those.',
      inputSchema: {
        id: z.string().describe('Product id (prod_...)'),
        title: text(200, 'Product title').optional(),
        subtitle: text(200, 'Short subtitle').optional(),
        description: text(10_000, 'Product description, plain text').optional(),
        handle: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100).optional(),
        material: text(100, 'Material').optional(),
        category_ids: z.array(z.string()).max(20).optional().describe('Replaces the categories'),
        collection_id: z.string().nullable().optional(),
        thumbnail: imageUrl.optional(),
        image_urls: z.array(imageUrl).max(10).optional().describe('Replaces the images'),
        variant_prices: z
          .array(z.object({ variant_id: z.string(), prices: z.array(price).min(1).max(20) }))
          .max(100)
          .optional()
          .describe('Replaces the prices of the listed variants'),
      },
      annotations: WRITES,
    },
    safely(ctx, async ({ id, variant_prices, image_urls, ...fields }) => {
      const product = await loadProduct(ctx, id)
      if (!product) return fail('No product with that id.')
      if (product.status !== 'draft') {
        return fail(`"${product.title}" is ${product.status}, not a draft. Use suggest_product_changes and an admin will review it.`)
      }

      const update = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined))
      if (image_urls) Object.assign(update, { images: image_urls.map((url) => ({ url })) })
      if (Object.keys(update).length) {
        // The status is in the selector too, so an admin publishing it a moment ago wins
        await updateProductsWorkflow(ctx.scope).run({ input: { selector: { id, status: 'draft' }, update } })
      }

      if (variant_prices?.length) {
        const known = new Set((product.variants ?? []).map((v) => v.id))
        const stranger = variant_prices.find((entry) => !known.has(entry.variant_id))
        if (stranger) return fail(`Variant ${stranger.variant_id} does not belong to this product.`)
        const { currencies } = await storeDefaults(ctx)
        const bad = unsupportedCurrency(variant_prices.flatMap((entry) => entry.prices), currencies)
        if (bad) return fail(`The store does not sell in "${bad}". Store currencies: ${[...currencies].join(', ')}`)
        // One variant at a time: passing variants to updateProductsWorkflow replaces the whole list
        for (const entry of variant_prices) {
          // Checked again before every write, so a product published halfway through stops here
          if ((await loadProduct(ctx, id))?.status !== 'draft') {
            return fail('The product was published while its prices were being updated. The remaining prices were not changed.')
          }
          await updateProductVariantsWorkflow(ctx.scope).run({
            input: {
              selector: { id: entry.variant_id, product_id: id },
              update: { prices: entry.prices.map((p) => ({ amount: p.amount, currency_code: p.currency_code.toLowerCase() })) },
            },
          })
        }
      }

      return ok({ id, status: 'draft', updated: [...Object.keys(update), ...(variant_prices?.length ? ['variant_prices'] : [])] })
    })
  )

  server.registerTool(
    'suggest_product_changes',
    {
      title: 'Suggest product changes',
      description:
        'Proposes new texts or categories for any product, including published ones. Nothing changes in the store: the suggestion waits on the product page in the dashboard until an admin applies or discards it.',
      inputSchema: {
        product_id: z.string().describe('Product id (prod_...)'),
        changes: suggestionChanges,
        note: z.string().trim().max(1000).optional().describe('Why, in a sentence or two, for the admin who reviews it'),
      },
      annotations: WRITES,
    },
    safely(ctx, async ({ product_id, changes, note }) => {
      const product = await loadProduct(ctx, product_id)
      if (!product) return fail('No product with that id.')
      const suggestion = await store.createMcpSuggestions({
        product_id,
        grant_id: ctx.auth.grantId,
        user_id: ctx.auth.userId,
        app_name: ctx.auth.appName,
        changes: changes as Record<string, unknown>,
        note: note ?? null,
      })
      return ok({
        suggestion_id: suggestion.id,
        product: product.title,
        status: 'pending',
        next_step: 'An admin applies or discards it on the product page in the dashboard.',
      })
    })
  )

  server.registerTool(
    'list_product_suggestions',
    {
      title: 'List product suggestions',
      description: 'Suggestions made through this connection and what happened to them: pending, applied or discarded.',
      inputSchema: {
        status: z.enum(['pending', 'applied', 'discarded']).optional(),
        product_id: z.string().optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    safely(ctx, async ({ status, product_id }) => {
      const suggestions = await store.listMcpSuggestions(
        { grant_id: ctx.auth.grantId, ...(status ? { status } : {}), ...(product_id ? { product_id } : {}) },
        { take: 50, order: { created_at: 'DESC' } }
      )
      return ok(
        suggestions.map((s) => ({
          id: s.id,
          product_id: s.product_id,
          status: s.status,
          changes: s.changes,
          note: s.note,
          created_at: s.created_at,
          resolved_at: s.resolved_at,
        }))
      )
    })
  )
}
