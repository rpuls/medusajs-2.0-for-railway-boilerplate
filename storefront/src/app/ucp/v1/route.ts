import { handleMcpRequest } from "@lib/ucp/mcp"
import { UCP_MCP_PATH, UCP_REST_BASE_PATH, UCP_VERSION } from "@lib/ucp/ucp"
import { getRequestOrigin } from "@lib/util/env"

export const GET = (request: Request) => {
  const origin = getRequestOrigin(request)
  const base = `${origin}${UCP_REST_BASE_PATH}`
  return Response.json({
    ucp: { version: UCP_VERSION },
    profile: `${origin}/.well-known/ucp`,
    mcp: `${origin}${UCP_MCP_PATH}`,
    operations: [
      `POST ${base}/catalog/search`,
      `POST ${base}/catalog/lookup`,
      `POST ${base}/cart`,
      `GET|PUT|DELETE ${base}/cart/{id}`,
      `POST ${base}/checkout-sessions`,
      `GET|PUT ${base}/checkout-sessions/{id}`,
      `POST ${base}/checkout-sessions/{id}/complete`,
      `POST ${base}/checkout-sessions/{id}/cancel`,
    ],
  })
}

// Agents that only know the service URL may probe it with MCP JSON-RPC.
export const POST = (request: Request) => handleMcpRequest(request)
