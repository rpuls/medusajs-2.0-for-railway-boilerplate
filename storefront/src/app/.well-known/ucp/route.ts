import {
  UCP_CAPABILITIES,
  UCP_MCP_PATH,
  UCP_REST_BASE_PATH,
  UCP_VERSION,
} from "@lib/ucp/ucp"
import { getRequestOrigin } from "@lib/util/env"

/**
 * /.well-known/ucp, the UCP business profile: where an agent learns that this
 * store speaks UCP, over which transports, and with which capabilities. Every
 * page points here with a `Link: rel="ucp"` header (next.config.js) and a
 * <link rel="ucp"> (src/app/layout.tsx).
 *
 * Excluded from the middleware matcher, like llms.txt, or it would be
 * redirected to /gb/.well-known/ucp and a 404.
 */
export const GET = (request: Request) => {
  const origin = getRequestOrigin(request)
  const overview = `https://ucp.dev/${UCP_VERSION}/specification/overview/`

  const capabilities = Object.fromEntries(
    Object.entries(UCP_CAPABILITIES).map(([name, { spec, schema }]) => [
      name,
      [{ version: UCP_VERSION, spec, schema }],
    ])
  )

  return Response.json(
    {
      ucp: {
        version: UCP_VERSION,
        services: {
          "dev.ucp.shopping": [
            {
              version: UCP_VERSION,
              spec: overview,
              transport: "mcp",
              endpoint: `${origin}${UCP_MCP_PATH}`,
              schema: `https://ucp.dev/${UCP_VERSION}/services/shopping/mcp.openrpc.json`,
            },
            {
              version: UCP_VERSION,
              spec: overview,
              transport: "rest",
              endpoint: `${origin}${UCP_REST_BASE_PATH}`,
              schema: `https://ucp.dev/${UCP_VERSION}/services/shopping/rest.openapi.json`,
            },
          ],
        },
        capabilities: {
          ...capabilities,
          "dev.ucp.shopping.permalink": [
            {
              version: UCP_VERSION,
              spec: `https://ucp.dev/${UCP_VERSION}/specification/permalink`,
              schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/permalink.json`,
              config: { endpoint: `${origin}/buy` },
            },
          ],
        },
        payment_handlers: {},
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    }
  )
}
