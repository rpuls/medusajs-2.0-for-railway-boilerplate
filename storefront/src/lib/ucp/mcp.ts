import "server-only"

import { getStoreName } from "@lib/util/env"
import {
  cancelCart,
  cancelCheckout,
  completeCheckout,
  createCart,
  createCheckout,
  getCart,
  getCheckout,
  lookupCatalog,
  searchCatalog,
  updateCart,
  updateCheckout,
} from "./operations"
import { UcpResult } from "./ucp"

/**
 * The shopper MCP server at /ucp/mcp: the UCP operations as MCP tools, for
 * ChatGPT, Claude and other assistants added as a custom connector. Ported
 * from upstream's dtc-starter.
 *
 * Not the backend's /mcp, which is the store owner's admin server behind
 * OAuth. This one has no sign-in because it can do no more than an anonymous
 * visitor: read the published catalogue and build guest carts.
 *
 * Stateless Streamable HTTP with JSON responses rather than SSE, which the
 * spec allows, so it needs no session store and no dependency. Single
 * messages only: a JSON-RPC batch would let one request fan out into dozens of
 * Store API writes.
 */

const SUPPORTED_PROTOCOL_VERSIONS = ["2025-11-25", "2025-06-18", "2025-03-26"]

type Args = Record<string, unknown>
type JsonRpcId = string | number | null

const object = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: "object",
  properties,
  required,
})

const meta = object({
  "ucp-agent": object({ profile: { type: "string" } }),
  "idempotency-key": { type: "string" },
})
const id = { type: "string", description: "Cart or checkout session ID" }
const context = object({
  address_country: { type: "string", description: "ISO 3166-1 alpha-2 country code" },
})
const lineItems = {
  type: "array",
  items: object(
    {
      item: object({ id: { type: "string", description: "Variant ID" } }, ["id"]),
      quantity: { type: "integer", minimum: 1, maximum: 100 },
    },
    ["item", "quantity"]
  ),
}
const checkoutInput = object({
  cart_id: { type: "string" },
  line_items: lineItems,
  buyer: object({
    email: { type: "string" },
    first_name: { type: "string" },
    last_name: { type: "string" },
  }),
  fulfillment: object({
    methods: {
      type: "array",
      items: object({
        type: { type: "string", enum: ["shipping"] },
        destinations: {
          type: "array",
          items: object({
            first_name: { type: "string" },
            last_name: { type: "string" },
            street_address: { type: "string" },
            extended_address: { type: "string" },
            address_locality: { type: "string" },
            address_region: { type: "string" },
            postal_code: { type: "string" },
            address_country: { type: "string" },
          }),
        },
      }),
    },
  }),
  context,
})

const idempotencyKey = (args: Args) => {
  const key = (args.meta as Args | undefined)?.["idempotency-key"]
  return typeof key === "string" ? key : null
}
const nested = (args: Args, key: string) => (args[key] ?? {}) as Args
const idArg = (args: Args) => (typeof args.id === "string" ? args.id : "")

/**
 * MCP tool annotations, not in upstream. ChatGPT asks the user to confirm
 * every call to a tool not marked read-only, so without these a shopper would
 * click "confirm" on each catalogue search. None of them is destructive in
 * MCP's sense: canceling only marks the cart, and nothing reaches the world
 * outside this store.
 */
const READ = { readOnlyHint: true, openWorldHint: false }
const WRITE = { readOnlyHint: false, destructiveHint: false, openWorldHint: false }

type Tool = {
  description: string
  inputSchema: Record<string, unknown>
  annotations: Record<string, boolean>
  run: (request: Request, args: Args) => Promise<UcpResult>
}

const TOOLS: Record<string, Tool> = {
  search_catalog: {
    description:
      "Search the store's products by keyword, or list them with no query. Returns products with variants, prices in minor units and availability.",
    inputSchema: object({
      meta,
      catalog: object({
        query: { type: "string" },
        pagination: object({ limit: { type: "integer" }, cursor: { type: "string" } }),
        context,
      }),
    }),
    annotations: READ,
    run: (request, args) => searchCatalog(request, nested(args, "catalog")),
  },
  lookup_catalog: {
    description: "Look up products by product ID, variant ID or product handle.",
    inputSchema: object(
      { meta, catalog: object({ ids: { type: "array", items: { type: "string" } }, context }, ["ids"]) },
      ["catalog"]
    ),
    annotations: READ,
    run: (request, args) => lookupCatalog(request, nested(args, "catalog")),
  },
  get_product: {
    description: "Get one product by product ID, variant ID or handle.",
    inputSchema: object({ meta, catalog: object({ id: { type: "string" }, context }, ["id"]) }, ["catalog"]),
    annotations: READ,
    run: (request, args) => {
      const catalog = nested(args, "catalog")
      return lookupCatalog(request, { ...catalog, ids: [catalog.id] })
    },
  },
  create_cart: {
    description:
      "Create a cart with line items (variant IDs and quantities). Returns a continue_url where the buyer opens the cart on the store's website.",
    inputSchema: object({ meta, cart: object({ line_items: lineItems, context }, ["line_items"]) }, ["cart"]),
    annotations: WRITE,
    run: (request, args) => createCart(request, nested(args, "cart"), idempotencyKey(args)),
  },
  get_cart: {
    description: "Get a cart by ID.",
    inputSchema: object({ meta, id }, ["id"]),
    annotations: READ,
    run: (request, args) => getCart(request, idArg(args)),
  },
  update_cart: {
    description: "Replace a cart's line items.",
    inputSchema: object({ meta, id, cart: object({ line_items: lineItems }, ["line_items"]) }, ["id", "cart"]),
    annotations: WRITE,
    run: (request, args) => updateCart(request, idArg(args), nested(args, "cart")),
  },
  cancel_cart: {
    description: "Cancel a cart.",
    inputSchema: object({ meta, id }, ["id"]),
    annotations: WRITE,
    run: (request, args) => cancelCart(request, idArg(args)),
  },
  create_checkout: {
    description:
      "Start a checkout from line items or an existing cart_id, with the buyer's email and shipping address if known. The buyer chooses delivery and pays at the returned continue_url: always give them that link.",
    inputSchema: object({ meta, checkout: checkoutInput }, ["checkout"]),
    annotations: WRITE,
    run: (request, args) => createCheckout(request, nested(args, "checkout"), idempotencyKey(args)),
  },
  get_checkout: {
    description: "Get a checkout session by ID, including the order once the buyer has paid.",
    inputSchema: object({ meta, id }, ["id"]),
    annotations: READ,
    run: (request, args) => getCheckout(request, idArg(args)),
  },
  update_checkout: {
    description: "Update a checkout session's line items, buyer or shipping address.",
    inputSchema: object({ meta, id, checkout: checkoutInput }, ["id", "checkout"]),
    annotations: WRITE,
    run: (request, args) => updateCheckout(request, idArg(args), nested(args, "checkout")),
  },
  complete_checkout: {
    description:
      "Request completion. This store requires the buyer to pay at continue_url, so open sessions return requires_escalation.",
    inputSchema: object({ meta, id, checkout: { type: "object" } }, ["id"]),
    annotations: READ,
    run: (request, args) => completeCheckout(request, idArg(args)),
  },
  cancel_checkout: {
    description: "Cancel a checkout session.",
    inputSchema: object({ meta, id }, ["id"]),
    annotations: WRITE,
    run: (request, args) => cancelCheckout(request, idArg(args)),
  },
}

const rpcResult = (id: JsonRpcId, result: unknown) =>
  Response.json({ jsonrpc: "2.0", id, result }, { headers: { "Cache-Control": "no-store" } })

const rpcError = (id: JsonRpcId, code: number, message: string, status = 200) =>
  Response.json(
    { jsonrpc: "2.0", id, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } }
  )

/** Handles a stateless MCP Streamable HTTP POST with JSON (not SSE) responses. */
export const handleMcpRequest = async (request: Request): Promise<Response> => {
  let message: Record<string, unknown>
  try {
    message = await request.json()
  } catch {
    return rpcError(null, -32700, "Parse error", 400)
  }
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return rpcError(null, -32600, "Invalid request: send a single JSON-RPC message", 400)
  }

  const rpcId = (message.id ?? null) as JsonRpcId
  if (message.id === undefined) {
    return new Response(null, { status: 202 })
  }

  const params = (message.params ?? {}) as Args

  switch (message.method) {
    case "initialize": {
      const requested = params.protocolVersion
      return rpcResult(rpcId, {
        protocolVersion:
          typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.includes(requested)
            ? requested
            : SUPPORTED_PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: `${getStoreName()} UCP`, version: "1.0.0" },
        instructions:
          "Universal Commerce Protocol shopping tools for this store. Find products with search_catalog, then call create_checkout with the variant IDs and quantities, plus the buyer's email and shipping address when you have them. Prices are in minor currency units (cents). The store takes no payment through these tools: the buyer chooses delivery and pays on the store's website at the continue_url the checkout returns, so always give them that link.",
      })
    }
    case "ping":
      return rpcResult(rpcId, {})
    case "tools/list":
      return rpcResult(rpcId, {
        tools: Object.entries(TOOLS).map(([name, { description, inputSchema, annotations }]) => ({
          name,
          description,
          inputSchema,
          annotations,
        })),
      })
    case "tools/call": {
      const tool = typeof params.name === "string" ? TOOLS[params.name] : undefined
      if (!tool) return rpcError(rpcId, -32602, `Unknown tool: ${String(params.name)}`)

      // A Store API failure (backend down, a region gone) would otherwise
      // escape as an HTML 500 the client cannot parse. Reported as a tool
      // error instead, so the assistant can tell the shopper and retry.
      let result: UcpResult
      try {
        result = await tool.run(request, (params.arguments ?? {}) as Args)
      } catch {
        return rpcResult(rpcId, {
          content: [{ type: "text", text: "The store could not be reached. Try again in a minute." }],
          isError: true,
        })
      }

      const { status, body } = result
      return rpcResult(rpcId, {
        content: [{ type: "text", text: JSON.stringify(body) }],
        structuredContent: body,
        isError: status >= 400,
      })
    }
    default:
      return rpcError(rpcId, -32601, `Method not found: ${String(message.method)}`)
  }
}
