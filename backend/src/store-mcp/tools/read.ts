import { z } from '@medusajs/framework/zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { STORE_MCP_MODULE } from '../../modules/store-mcp'
import type StoreMcpModuleService from '../../modules/store-mcp/service'
import { daysAgo, fail, fullName, isSale, MAX_ROWS, ok, queryOf, round, safely, type ToolContext } from './helpers'

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const

const limitArg = z.number().int().min(1).max(MAX_ROWS).optional().describe(`At most ${MAX_ROWS}, default 20`)
const offsetArg = z.number().int().min(0).optional().describe('Rows to skip, for paging')
const dateArg = (what: string) => z.string().datetime({ offset: true }).optional().describe(`${what}, ISO 8601`)

type Price = { amount: number; currency_code: string }
type Level = { stocked_quantity?: number | null; reserved_quantity?: number | null; available_quantity?: number | null }

const priceRange = (variants: Array<{ prices?: Price[] | null }> = []) => {
  const byCurrency: Record<string, { min: number; max: number }> = {}
  for (const price of variants.flatMap((variant) => variant.prices ?? [])) {
    const range = (byCurrency[price.currency_code] ??= { min: price.amount, max: price.amount })
    range.min = Math.min(range.min, price.amount)
    range.max = Math.max(range.max, price.amount)
  }
  return byCurrency
}

const available = (levels: Level[] = []) =>
  levels.reduce(
    (sum, level) => sum + (level.available_quantity ?? (level.stocked_quantity ?? 0) - (level.reserved_quantity ?? 0)),
    0
  )

/** Customer data the tools may show: name, email, country, order history. Never addresses or phone numbers. */
const ORDER_LIST_FIELDS = [
  'id',
  'display_id',
  'status',
  'created_at',
  'total',
  'currency_code',
  'email',
  'is_draft_order',
  'customer.first_name',
  'customer.last_name',
  'shipping_address.country_code',
  'items.quantity',
]

const orderRow = (order: any) => ({
  id: order.id,
  number: order.display_id,
  status: order.status,
  created_at: order.created_at,
  total: order.total,
  currency: order.currency_code,
  items: (order.items ?? []).reduce((sum: number, item: any) => sum + (item.quantity ?? 0), 0),
  customer: { name: fullName(order.customer), email: order.email },
  country: order.shipping_address?.country_code ?? null,
})

export const registerReadTools = (server: McpServer, ctx: ToolContext) => {
  const query = queryOf(ctx.scope)

  server.registerTool(
    'get_store_overview',
    {
      title: 'Store overview',
      description:
        'Start here. The store name, currencies, regions and their countries, sales channels, product categories and collections, product counts by status, and orders in the last 30 days. Use the ids from here when drafting products.',
      inputSchema: {},
      annotations: READ_ONLY,
    },
    safely(ctx, async () => {
      const [{ data: stores }, { data: regions }, { data: channels }, { data: categories }, { data: collections }] =
        await Promise.all([
          query.graph({ entity: 'store', fields: ['name', 'supported_currencies.currency_code', 'supported_currencies.is_default'] }),
          query.graph({ entity: 'region', fields: ['id', 'name', 'currency_code', 'countries.iso_2'] }),
          query.graph({ entity: 'sales_channel', fields: ['id', 'name', 'is_disabled'] }),
          query.graph({ entity: 'product_category', fields: ['id', 'name', 'handle', 'parent_category_id'], pagination: { take: 200 } }),
          query.graph({ entity: 'product_collection', fields: ['id', 'title', 'handle'], pagination: { take: 200 } }),
        ])
      const counts: Record<string, number> = {}
      for (const status of ['published', 'draft', 'proposed', 'rejected']) {
        const { metadata } = await query.graph({ entity: 'product', fields: ['id'], filters: { status: status as any }, pagination: { take: 1, skip: 0 } })
        counts[status] = metadata?.count ?? 0
      }
      const { data: recent } = await query.graph({
        entity: 'order',
        fields: ['id', 'status', 'is_draft_order'],
        filters: { created_at: { $gte: daysAgo(30) } } as any,
        pagination: { take: 5000 },
      })
      const store = stores[0] as any
      return ok({
        store: store?.name ?? null,
        currencies: (store?.supported_currencies ?? []).map((c: any) => ({ code: c.currency_code, default: c.is_default })),
        regions: regions.map((r: any) => ({ id: r.id, name: r.name, currency: r.currency_code, countries: (r.countries ?? []).map((c: any) => c.iso_2) })),
        sales_channels: channels.map((c: any) => ({ id: c.id, name: c.name, disabled: c.is_disabled })),
        categories: categories.map((c: any) => ({ id: c.id, name: c.name, handle: c.handle, parent_id: c.parent_category_id })),
        collections: collections.map((c: any) => ({ id: c.id, title: c.title, handle: c.handle })),
        products_by_status: counts,
        orders_last_30_days: recent.filter(isSale).length,
        acting_as: ctx.auth.userEmail,
        note: 'Prices and totals are in major currency units (19.99 means 19.99, not cents).',
      })
    })
  )

  server.registerTool(
    'search_products',
    {
      title: 'Search products',
      description: 'Lists products, optionally matching a search text, status or category. Returns ids, handles, status and price ranges.',
      inputSchema: {
        query: z.string().max(200).optional().describe('Text to match in title, handle, description and SKUs'),
        status: z.enum(['published', 'draft', 'proposed', 'rejected']).optional(),
        category_id: z.string().optional(),
        limit: limitArg,
        offset: offsetArg,
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ query: text, status, category_id, limit, offset }) => {
      const { data, metadata } = await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'handle', 'status', 'updated_at', 'variants.id', 'variants.prices.amount', 'variants.prices.currency_code'],
        filters: {
          ...(text ? { q: text } : {}),
          ...(status ? { status } : {}),
          ...(category_id ? { categories: { id: category_id } } : {}),
        } as any,
        pagination: { take: limit ?? 20, skip: offset ?? 0, order: { updated_at: 'DESC' } },
      })
      return ok({
        total: metadata?.count ?? data.length,
        products: data.map((p: any) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          status: p.status,
          variants: p.variants?.length ?? 0,
          price_range: priceRange(p.variants),
          updated_at: p.updated_at,
        })),
      })
    })
  )

  server.registerTool(
    'get_product',
    {
      title: 'Get product',
      description:
        'One product in full: texts, images, categories, options, and every variant with its SKU, prices and available stock. Also says whether AI suggestions are waiting for review on it.',
      inputSchema: {
        id: z.string().optional().describe('Product id (prod_...)'),
        handle: z.string().optional().describe('Product handle, as in the store URL'),
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ id, handle }) => {
      if (!id && !handle) return fail('Pass either id or handle.')
      const { data } = await query.graph({
        entity: 'product',
        fields: [
          'id', 'title', 'subtitle', 'description', 'handle', 'status', 'thumbnail', 'material', 'created_at', 'updated_at', 'metadata',
          'images.url', 'categories.id', 'categories.name', 'collection.id', 'collection.title', 'tags.value',
          'options.title', 'options.values.value',
          'variants.id', 'variants.title', 'variants.sku', 'variants.manage_inventory', 'variants.allow_backorder',
          'variants.prices.amount', 'variants.prices.currency_code', 'variants.options.value',
          'variants.inventory_items.inventory.location_levels.stocked_quantity',
          'variants.inventory_items.inventory.location_levels.reserved_quantity',
          'variants.inventory_items.inventory.location_levels.available_quantity',
        ],
        filters: id ? { id } : { handle },
      })
      const product = data[0] as any
      if (!product) return fail('No product with that id or handle.')
      const pending = await ctx.scope
        .resolve<StoreMcpModuleService>(STORE_MCP_MODULE)
        .listMcpSuggestions({ product_id: product.id, status: 'pending' }, { select: ['id'] })
      return ok({
        id: product.id,
        title: product.title,
        subtitle: product.subtitle,
        description: product.description,
        handle: product.handle,
        status: product.status,
        material: product.material,
        thumbnail: product.thumbnail,
        images: (product.images ?? []).map((image: any) => image.url),
        categories: (product.categories ?? []).map((c: any) => ({ id: c.id, name: c.name })),
        collection: product.collection ? { id: product.collection.id, title: product.collection.title } : null,
        tags: (product.tags ?? []).map((t: any) => t.value),
        options: (product.options ?? []).map((o: any) => ({ title: o.title, values: (o.values ?? []).map((v: any) => v.value) })),
        variants: (product.variants ?? []).map((v: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          options: (v.options ?? []).map((o: any) => o.value),
          prices: (v.prices ?? []).map((p: any) => ({ amount: p.amount, currency: p.currency_code })),
          stock: v.manage_inventory
            ? available((v.inventory_items ?? []).flatMap((link: any) => link.inventory?.location_levels ?? []))
            : 'not tracked',
          allow_backorder: v.allow_backorder,
        })),
        created_by_app: product.metadata?.store_mcp_app ?? null,
        pending_suggestions: pending.length,
        editable_by_you: product.status === 'draft' ? 'yes, it is a draft' : 'no, use suggest_product_changes',
        created_at: product.created_at,
        updated_at: product.updated_at,
      })
    })
  )

  server.registerTool(
    'list_low_stock',
    {
      title: 'Low stock',
      description: 'Variants whose available stock (stocked minus reserved, summed over all locations) is at or below a threshold. Only tracked inventory.',
      inputSchema: {
        threshold: z.number().int().min(0).max(100000).optional().describe('Default 10'),
        limit: limitArg,
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ threshold, limit }) => {
      const max = threshold ?? 10
      const low: any[] = []
      // Walk the inventory in pages; stock is summed in code because it spans locations
      for (let skip = 0; skip < 5000 && low.length < (limit ?? 20); skip += 500) {
        const { data } = await query.graph({
          entity: 'inventory_item',
          fields: [
            'id', 'sku', 'title',
            'location_levels.stocked_quantity', 'location_levels.reserved_quantity', 'location_levels.available_quantity',
            'variants.id', 'variants.title', 'variants.product.id', 'variants.product.title', 'variants.product.status',
          ],
          pagination: { take: 500, skip },
        })
        for (const item of data as any[]) {
          const stock = available(item.location_levels)
          if (stock <= max) {
            const variant = item.variants?.[0]
            low.push({
              sku: item.sku,
              variant: variant ? { id: variant.id, title: variant.title } : null,
              product: variant?.product ? { id: variant.product.id, title: variant.product.title, status: variant.product.status } : null,
              available: stock,
            })
          }
        }
        if (data.length < 500) break
      }
      low.sort((a, b) => a.available - b.available)
      return ok({ threshold: max, variants: low.slice(0, limit ?? 20) })
    })
  )

  server.registerTool(
    'list_orders',
    {
      title: 'List orders',
      description: 'Recent orders, newest first, with totals, status, customer name and email, and shipping country.',
      inputSchema: {
        since: dateArg('Only orders placed at or after this time'),
        until: dateArg('Only orders placed before this time'),
        status: z.enum(['pending', 'completed', 'archived', 'canceled', 'requires_action']).optional(),
        customer_email: z.string().email().optional(),
        limit: limitArg,
        offset: offsetArg,
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ since, until, status, customer_email, limit, offset }) => {
      const created: Record<string, Date> = {}
      if (since) created.$gte = new Date(since)
      if (until) created.$lt = new Date(until)
      const { data, metadata } = await query.graph({
        entity: 'order',
        fields: ORDER_LIST_FIELDS,
        filters: {
          is_draft_order: false,
          ...(Object.keys(created).length ? { created_at: created } : {}),
          ...(status ? { status } : {}),
          ...(customer_email ? { email: customer_email.toLowerCase() } : {}),
        } as any,
        pagination: { take: limit ?? 20, skip: offset ?? 0, order: { created_at: 'DESC' } },
      })
      return ok({ total: metadata?.count ?? data.length, orders: data.map(orderRow) })
    })
  )

  server.registerTool(
    'get_order',
    {
      title: 'Get order',
      description: 'One order with its line items, totals, shipping method and status. The shipping address is reduced to its country.',
      inputSchema: {
        id: z.string().optional().describe('Order id (order_...)'),
        number: z.number().int().optional().describe('The order number customers see, e.g. 1042'),
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ id, number }) => {
      if (!id && number === undefined) return fail('Pass either id or number.')
      const { data } = await query.graph({
        entity: 'order',
        fields: [
          ...ORDER_LIST_FIELDS,
          'subtotal', 'shipping_total', 'tax_total', 'discount_total', 'region.name', 'sales_channel.name',
          'shipping_methods.name', 'shipping_methods.amount',
          'items.title', 'items.variant_title', 'items.variant_sku', 'items.product_id', 'items.unit_price', 'items.total',
        ],
        filters: id ? { id } : ({ display_id: number } as any),
      })
      const order = data[0] as any
      if (!order) return fail('No order with that id or number.')
      return ok({
        ...orderRow(order),
        region: order.region?.name ?? null,
        sales_channel: order.sales_channel?.name ?? null,
        line_items: (order.items ?? []).map((item: any) => ({
          title: item.title,
          variant: item.variant_title,
          sku: item.variant_sku,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
        })),
        shipping: (order.shipping_methods ?? []).map((m: any) => ({ name: m.name, amount: m.amount })),
        totals: {
          subtotal: order.subtotal,
          shipping: order.shipping_total,
          tax: order.tax_total,
          discount: order.discount_total,
          total: order.total,
        },
      })
    })
  )

  server.registerTool(
    'get_sales_summary',
    {
      title: 'Sales summary',
      description:
        'Revenue, order count and average order value per currency for a period, plus the best-selling products and orders per day. Canceled and draft orders are left out. Defaults to the last 30 days.',
      inputSchema: {
        since: dateArg('Start of the period, default 30 days ago'),
        until: dateArg('End of the period, default now'),
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ since, until }) => {
      const from = since ? new Date(since) : daysAgo(30)
      const to = until ? new Date(until) : new Date()
      const orders: any[] = []
      const CAP = 5000
      for (let skip = 0; skip < CAP; skip += 500) {
        const { data } = await query.graph({
          entity: 'order',
          fields: ['id', 'status', 'is_draft_order', 'created_at', 'total', 'currency_code', 'items.title', 'items.product_id', 'items.quantity', 'items.total'],
          filters: { created_at: { $gte: from, $lt: to } } as any,
          pagination: { take: 500, skip, order: { created_at: 'ASC' } },
        })
        orders.push(...data)
        if (data.length < 500) break
      }
      const sales = orders.filter(isSale)
      const byCurrency: Record<string, { orders: number; revenue: number }> = {}
      const byProduct: Record<string, { title: string; units: number; revenue: Record<string, number> }> = {}
      const byDay: Record<string, number> = {}
      for (const order of sales) {
        const bucket = (byCurrency[order.currency_code] ??= { orders: 0, revenue: 0 })
        bucket.orders += 1
        bucket.revenue += Number(order.total ?? 0)
        const day = new Date(order.created_at).toISOString().slice(0, 10)
        byDay[day] = (byDay[day] ?? 0) + 1
        for (const item of order.items ?? []) {
          const key = item.product_id ?? item.title
          const product = (byProduct[key] ??= { title: item.title, units: 0, revenue: {} })
          product.units += item.quantity ?? 0
          product.revenue[order.currency_code] = round((product.revenue[order.currency_code] ?? 0) + Number(item.total ?? 0))
        }
      }
      return ok({
        period: { since: from.toISOString(), until: to.toISOString() },
        orders_counted: sales.length,
        capped: orders.length >= CAP ? `Only the first ${CAP} orders in the period were read` : undefined,
        by_currency: Object.fromEntries(
          Object.entries(byCurrency).map(([currency, { orders: count, revenue }]) => [
            currency,
            { orders: count, revenue: round(revenue), average_order_value: round(revenue / count) },
          ])
        ),
        top_products: Object.entries(byProduct)
          .map(([product_id, value]) => ({ product_id, ...value }))
          .sort((a, b) => b.units - a.units)
          .slice(0, 10),
        orders_per_day: byDay,
      })
    })
  )

  server.registerTool(
    'search_customers',
    {
      title: 'Search customers',
      description: 'Customers matching a name or email. Returns name, email, whether they have an account, country and number of orders.',
      inputSchema: {
        query: z.string().max(200).optional().describe('Text to match in name or email'),
        limit: limitArg,
        offset: offsetArg,
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ query: text, limit, offset }) => {
      const { data, metadata } = await query.graph({
        entity: 'customer',
        fields: ['id', 'email', 'first_name', 'last_name', 'has_account', 'created_at', 'orders.id', 'orders.created_at', 'orders.shipping_address.country_code'],
        filters: (text ? { q: text } : {}) as any,
        pagination: { take: limit ?? 20, skip: offset ?? 0, order: { created_at: 'DESC' } },
      })
      return ok({
        total: metadata?.count ?? data.length,
        customers: data.map((c: any) => {
          const latest = [...(c.orders ?? [])].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0]
          return {
            id: c.id,
            name: fullName(c),
            email: c.email,
            has_account: c.has_account,
            country: latest?.shipping_address?.country_code ?? null,
            orders: c.orders?.length ?? 0,
            customer_since: c.created_at,
          }
        }),
      })
    })
  )

  server.registerTool(
    'get_customer',
    {
      title: 'Get customer',
      description: 'One customer: name, email, country, total spent and their latest orders. No addresses, phone numbers or payment details.',
      inputSchema: {
        id: z.string().optional().describe('Customer id (cus_...)'),
        email: z.string().email().optional(),
      },
      annotations: READ_ONLY,
    },
    safely(ctx, async ({ id, email }) => {
      if (!id && !email) return fail('Pass either id or email.')
      const { data } = await query.graph({
        entity: 'customer',
        fields: ['id', 'email', 'first_name', 'last_name', 'has_account', 'created_at'],
        filters: id ? { id } : { email: email!.toLowerCase() },
      })
      const customer = data[0] as any
      if (!customer) return fail('No customer with that id or email.')
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: ['id', 'display_id', 'status', 'is_draft_order', 'created_at', 'total', 'currency_code', 'shipping_address.country_code', 'items.quantity'],
        filters: { customer_id: customer.id, is_draft_order: false } as any,
        pagination: { take: MAX_ROWS, order: { created_at: 'DESC' } },
      })
      const spent: Record<string, number> = {}
      for (const order of (orders as any[]).filter(isSale)) {
        spent[order.currency_code] = round((spent[order.currency_code] ?? 0) + Number(order.total ?? 0))
      }
      return ok({
        id: customer.id,
        name: fullName(customer),
        email: customer.email,
        has_account: customer.has_account,
        customer_since: customer.created_at,
        country: (orders[0] as any)?.shipping_address?.country_code ?? null,
        total_spent: spent,
        orders: (orders as any[]).map((order) => ({
          id: order.id,
          number: order.display_id,
          status: order.status,
          created_at: order.created_at,
          total: order.total,
          currency: order.currency_code,
        })),
      })
    })
  )
}
