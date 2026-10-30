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
        `Find every variant with ${Number(threshold || 10)} or fewer in stock. For each, check how many sold in the last 30 days and estimate how many days of stock are left. Rank them by urgency and tell me what to reorder first. When I tell you a delivery has arrived, propose it with propose_stock_changes, using add.`
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
        `Draft a new product from this: ${idea}\nCheck the store overview first for currencies and categories. Write a title, subtitle and description, pick a category, and set up options and variants with prices in every store currency and the stock I gave you (ask me if I did not). Create it with create_product_draft, then tell me what to check before I publish it.`
      )
  )

  server.registerPrompt(
    'sell_to_country',
    {
      title: 'Start selling to a country',
      description: 'Region, shipping and tax for a new country, as one proposal for review',
      argsSchema: { country: z.string().min(1).describe('The country, by name or code') },
    },
    ({ country }) =>
      ask(
        `I want to start selling to ${country}. Read get_store_setup first. If a region already uses that country's currency, add the country to it; otherwise propose a new region, but only in a currency the store already sells in. Make sure it can ship there, priced like the existing shipping options and in the region's currency, and set its standard tax rate. Send it all as one propose_store_setup. Then tell me what it will do, the tax rate you used and where it comes from, any warnings, and that I apply it on the AI assistants page.`
      )
  )

  server.registerPrompt(
    'ship_separately',
    {
      title: 'Ship some products separately',
      description: 'A shipping profile with its own shipping options, for products that ship differently, as one proposal',
      argsSchema: {
        products: z.string().min(1).describe('Which products, e.g. "the sofas" or "everything in Furniture"'),
        shipping: z.string().min(1).describe('How they ship and what it costs, e.g. "freight, 49 EUR, 5 to 10 days"'),
      },
    },
    ({ products, shipping }) =>
      ask(
        `These products ship differently from the rest: ${products}. How they ship: ${shipping}. Find the products, then read get_store_setup. In one propose_store_setup, propose a new shipping profile for them, its shipping options in every shipping zone the store ships to, priced in the currencies of the regions those zones serve, and the products moved into it. Then tell me what it will do, any warnings, and that I apply it on the AI assistants page. Shoppers will choose delivery for these products separately at checkout.`
      )
  )
}
