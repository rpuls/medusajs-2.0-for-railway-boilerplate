import { z } from '@medusajs/framework/zod'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

/**
 * Ready-made tasks an MCP client can offer the admin, for example as slash commands. Each one
 * is only a prompt: it runs through the same tools, with the same limits, as anything typed.
 */
const ask = (text: string) => ({ messages: [{ role: 'user' as const, content: { type: 'text' as const, text } }] })

export const registerPrompts = (server: McpServer) => {
  server.registerPrompt(
    'store_report',
    {
      title: 'Store report',
      description: 'Sales, best sellers and low stock for a recent period, with suggestions',
      argsSchema: { days: z.string().regex(/^\d{1,3}$/).optional().describe('How many days back, default 7') },
    },
    ({ days }) => {
      const period = Number(days || 7)
      return ask(
        `Give me a report on my store for the last ${period} days. Compare revenue, order count and average order value with the ${period} days before that, per currency. List the best sellers, and every variant with 10 or fewer in stock. End with three concrete things I could do this week, based only on what the data shows.`
      )
    }
  )

  server.registerPrompt(
    'restock_check',
    {
      title: 'Restock check',
      description: 'What is about to run out, ranked by how fast it sells',
      argsSchema: { threshold: z.string().regex(/^\d{1,6}$/).optional().describe('Stock level to flag, default 10') },
    },
    ({ threshold }) =>
      ask(
        `Find every variant with ${Number(threshold || 10)} or fewer in stock. For each, check how many sold in the last 30 days and estimate how many days of stock are left. Rank them by urgency and tell me what to reorder first. You cannot change stock; I will do that in the dashboard.`
      )
  )

  server.registerPrompt(
    'improve_product',
    {
      title: 'Improve a product page',
      description: 'Rewrite the title, subtitle and description of a product, as a suggestion for review',
      argsSchema: { product: z.string().min(1).describe('The product handle, id or name') },
    },
    ({ product }) =>
      ask(
        `Look up the product "${product}" (search for it if this is a name). Read it in full, then write a clearer title, a short subtitle and a description that would help a shopper decide. Save them with suggest_product_changes, with a one-line note on why, and show me what you changed. I will apply it from the product page.`
      )
  )

  server.registerPrompt(
    'draft_product',
    {
      title: 'Draft a new product',
      description: 'Turn a rough description into a complete product draft',
      argsSchema: { idea: z.string().min(1).describe('What the product is, its sizes or colours, and its price') },
    },
    ({ idea }) =>
      ask(
        `Draft a new product from this: ${idea}\nCheck the store overview first for currencies and categories. Write a title, subtitle and description, pick a category, and set up options and variants with prices in every store currency. Create it with create_product_draft, then tell me what to check before I publish it.`
      )
  )
}
